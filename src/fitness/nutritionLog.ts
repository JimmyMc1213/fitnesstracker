import { applyStreakEligibility } from "./dailyStreak";
import { touchNutritionPresetById, upsertNutritionPresetList } from "./nutritionTotals";
import type { AppState, MacroTotals, NutritionLoggedItem, NutritionPreset, NutritionUserFood } from "./types";

export function newNutritionItemId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type NutritionQuickAddPreset = MacroTotals & {
  id: string;
  label: string;
};

export const QUICK_ADD_CHIP_STYLE = {
  padding: "10px 14px",
  borderRadius: 999,
  border: "0.5px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "-0.02em",
} as const;

/** Protein-first one-tap adds for Home quick-log (calories from 4 kcal/g protein). */
export const PROTEIN_QUICK_ADD_PRESETS: readonly NutritionQuickAddPreset[] = [
  { id: "p25", label: "+25g protein", cal: 100, p: 25, c: 0, f: 0 },
  { id: "p30", label: "+30g protein", cal: 120, p: 30, c: 0, f: 0 },
  { id: "p40", label: "+40g protein", cal: 160, p: 40, c: 0, f: 0 },
  { id: "p50", label: "+50g protein", cal: 200, p: 50, c: 0, f: 0 },
];

type BuildNutritionLoggedItemExtras = Partial<
  Pick<NutritionLoggedItem, "id" | "servingLabel" | "source" | "externalId" | "loggedAtMs">
>;

/**
 * Build a fuel row. Third argument may be a legacy string `id`, or an object with `id` and optional metadata.
 */
export function buildNutritionLoggedItem(
  macros: MacroTotals,
  name = "",
  idOrExtras?: string | BuildNutritionLoggedItemExtras,
): NutritionLoggedItem {
  const extras = typeof idOrExtras === "object" && idOrExtras !== null ? idOrExtras : undefined;
  const id = typeof idOrExtras === "string" ? idOrExtras : (extras?.id ?? newNutritionItemId());
  const loggedAtMs = extras?.loggedAtMs ?? Date.now();
  const base: NutritionLoggedItem = {
    id,
    name,
    cal: Number(macros.cal) || 0,
    p: Number(macros.p) || 0,
    c: Number(macros.c) || 0,
    f: Number(macros.f) || 0,
    loggedAtMs,
  };
  const sl =
    typeof extras?.servingLabel === "string" && extras.servingLabel.trim()
      ? extras.servingLabel.trim()
      : undefined;
  const src = typeof extras?.source === "string" && extras.source.trim() ? extras.source.trim() : undefined;
  const ext =
    typeof extras?.externalId === "string" && extras.externalId.trim() ? extras.externalId.trim() : undefined;
  return {
    ...base,
    ...(sl ? { servingLabel: sl } : {}),
    ...(src ? { source: src } : {}),
    ...(ext ? { externalId: ext } : {}),
  };
}

function normalizedLoggedFoodNameKey(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Recent unique foods across all logged days (normalized name dedupe; keep most recently logged variant).
 */
export function getRecentlyLoggedFoods(itemsByDay: Record<string, NutritionLoggedItem[]>): NutritionLoggedItem[] {
  const scored: { item: NutritionLoggedItem; loggedAtMs: number }[] = [];
  for (const [dateKey, rows] of Object.entries(itemsByDay ?? {})) {
    if (!rows?.length) continue;
    const dayAnchor = /^\d{4}-\d{2}-\d{2}$/.test(dateKey) ? Date.parse(`${dateKey}T12:00:00`) : NaN;
    const base = Number.isFinite(dayAnchor) ? dayAnchor : 0;
    rows.forEach((item, idx) => {
      const raw = item.loggedAtMs;
      const loggedAtMs =
        typeof raw === "number" && Number.isFinite(raw) && raw > 0 ? raw : base + idx;
      scored.push({ item, loggedAtMs });
    });
  }
  const byKey = new Map<string, { item: NutritionLoggedItem; loggedAtMs: number }>();
  for (const row of scored) {
    const nk = normalizedLoggedFoodNameKey(row.item.name);
    const dedupeKey = nk.length > 0 ? nk : `id:${row.item.id}`;
    const prev = byKey.get(dedupeKey);
    if (!prev || row.loggedAtMs >= prev.loggedAtMs) byKey.set(dedupeKey, row);
  }
  return [...byKey.values()].sort((a, b) => b.loggedAtMs - a.loggedAtMs).map((x) => x.item);
}

/** Append a fuel row for a calendar day and refresh saved presets. */
export function appendNutritionLoggedItem(
  state: AppState,
  dateKey: string,
  row: NutritionLoggedItem,
): AppState {
  const prev = state.nutritionItemsByDay[dateKey] ?? [];
  return applyStreakEligibility(
    {
      ...state,
      nutritionItemsByDay: { ...state.nutritionItemsByDay, [dateKey]: [...prev, row] },
      nutritionPresets: upsertNutritionPresetList(state.nutritionPresets, row),
    },
    dateKey,
  );
}

function nutritionItemsForDay(
  itemsByDay: Record<string, NutritionLoggedItem[]>,
  dateKey: string,
  rows: NutritionLoggedItem[],
): Record<string, NutritionLoggedItem[]> {
  const next = { ...itemsByDay };
  if (rows.length) next[dateKey] = rows;
  else delete next[dateKey];
  return next;
}

/** Remove one logged food row for a calendar day. */
export function removeNutritionLoggedItem(state: AppState, dateKey: string, itemId: string): AppState {
  const prev = state.nutritionItemsByDay[dateKey] ?? [];
  const filtered = prev.filter((row) => row.id !== itemId);
  if (filtered.length === prev.length) return state;
  return applyStreakEligibility(
    { ...state, nutritionItemsByDay: nutritionItemsForDay(state.nutritionItemsByDay, dateKey, filtered) },
    dateKey,
  );
}

/** Replace one logged food row (same id) for a calendar day. */
export function updateNutritionLoggedItem(
  state: AppState,
  dateKey: string,
  itemId: string,
  patch: NutritionLoggedItem,
): AppState {
  const prev = state.nutritionItemsByDay[dateKey] ?? [];
  const idx = prev.findIndex((row) => row.id === itemId);
  if (idx < 0) return state;
  const nextRows = [...prev];
  nextRows[idx] = { ...patch, id: itemId };
  return applyStreakEligibility(
    {
      ...state,
      nutritionItemsByDay: nutritionItemsForDay(state.nutritionItemsByDay, dateKey, nextRows),
      nutritionPresets: upsertNutritionPresetList(state.nutritionPresets, nextRows[idx]),
    },
    dateKey,
  );
}

/** Log a saved preset to today and bump its recency. */
export function appendNutritionPresetToDay(
  state: AppState,
  dateKey: string,
  preset: NutritionPreset,
): AppState {
  const row = buildNutritionLoggedItem(preset, preset.name, newNutritionItemId());
  const prev = state.nutritionItemsByDay[dateKey] ?? [];
  return applyStreakEligibility(
    {
      ...state,
      nutritionItemsByDay: { ...state.nutritionItemsByDay, [dateKey]: [...prev, row] },
      nutritionPresets: touchNutritionPresetById(state.nutritionPresets, preset.id),
    },
    dateKey,
  );
}

/** Top saved foods with protein, sorted by recency, for Home quick-log favorites. */
export function topProteinPresetsForQuickLog(
  presets: NutritionPreset[],
  limit = 5,
): NutritionPreset[] {
  return presets.filter((p) => (Number(p.p) || 0) > 0).slice(0, limit);
}

export function upsertNutritionUserFood(
  foods: NutritionUserFood[],
  input: Omit<NutritionUserFood, "savedAtMs" | "updatedAtMs"> & { id?: string },
): NutritionUserFood[] {
  const now = Date.now();
  const id = input.id ?? newNutritionItemId();
  const existing = foods.find((f) => f.id === id);
  const row: NutritionUserFood = {
    id,
    name: input.name.trim() || "Food",
    cal: Number(input.cal) || 0,
    p: Number(input.p) || 0,
    c: Number(input.c) || 0,
    f: Number(input.f) || 0,
    savedAtMs: existing?.savedAtMs ?? now,
    updatedAtMs: now,
    ...(input.servingLabel?.trim() ? { servingLabel: input.servingLabel.trim() } : {}),
    ...(input.source?.trim() ? { source: input.source.trim() } : {}),
    ...(input.externalId?.trim() ? { externalId: input.externalId.trim() } : {}),
  };
  const next = [row, ...foods.filter((f) => f.id !== id)];
  next.sort((a, b) => (b.updatedAtMs ?? b.savedAtMs) - (a.updatedAtMs ?? a.savedAtMs));
  return next.slice(0, 200);
}

export function removeNutritionUserFood(foods: NutritionUserFood[], foodId: string): NutritionUserFood[] {
  return foods.filter((f) => f.id !== foodId);
}

export function removeNutritionPreset(presets: NutritionPreset[], presetId: string): NutritionPreset[] {
  return presets.filter((p) => p.id !== presetId);
}

/** Save a logged or manual row to My foods without logging today. */
export function nutritionUserFoodFromLoggedItem(item: NutritionLoggedItem): Omit<NutritionUserFood, "savedAtMs"> {
  return {
    id: newNutritionItemId(),
    name: item.name.trim() || "Food",
    cal: Number(item.cal) || 0,
    p: Number(item.p) || 0,
    c: Number(item.c) || 0,
    f: Number(item.f) || 0,
    ...(item.servingLabel?.trim() ? { servingLabel: item.servingLabel.trim() } : {}),
    ...(item.source?.trim() ? { source: item.source.trim() } : {}),
    ...(item.externalId?.trim() ? { externalId: item.externalId.trim() } : {}),
  };
}

export function appendNutritionUserFoodToState(state: AppState, food: Omit<NutritionUserFood, "savedAtMs">): AppState {
  return {
    ...state,
    nutritionUserFoods: upsertNutritionUserFood(state.nutritionUserFoods ?? [], food),
  };
}

export function updateNutritionUserFoodInState(
  state: AppState,
  foodId: string,
  patch: Partial<Omit<NutritionUserFood, "id" | "savedAtMs">>,
): AppState {
  const existing = (state.nutritionUserFoods ?? []).find((f) => f.id === foodId);
  if (!existing) return state;
  return appendNutritionUserFoodToState(state, {
    ...existing,
    ...patch,
    id: foodId,
    name: typeof patch.name === "string" ? patch.name : existing.name,
  });
}

export function removeNutritionUserFoodFromState(state: AppState, foodId: string): AppState {
  return {
    ...state,
    nutritionUserFoods: removeNutritionUserFood(state.nutritionUserFoods ?? [], foodId),
  };
}

export function removeNutritionPresetFromState(state: AppState, presetId: string): AppState {
  return {
    ...state,
    nutritionPresets: removeNutritionPreset(state.nutritionPresets, presetId),
  };
}
