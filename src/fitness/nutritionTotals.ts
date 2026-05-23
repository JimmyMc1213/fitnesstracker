import type { MacroTotals, NutritionLoggedItem, NutritionPreset, NutritionUserFood } from "./types";

export const ZERO_MACROS: MacroTotals = { cal: 0, p: 0, c: 0, f: 0 };

/** Deterministic timestamp for legacy rows missing `loggedAtMs` (same across reloads for a given day + index). */
export function stableLegacyNutritionLoggedAtMs(dayKey: string, indexWithinDay: number): number {
  const parts = dayKey.split("-").map((x) => Number(x));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return indexWithinDay;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d, 12, 0, 0, 0).getTime() + indexWithinDay;
}

/** Totals copied from an external tracker for a given local calendar day (YYYY-MM-DD). */
export function manualTotalsForDateKey(byDay: Record<string, MacroTotals> | undefined, dateKey: string): MacroTotals {
  const t = byDay?.[dateKey];
  if (!t) return { ...ZERO_MACROS };
  return {
    cal: Number(t.cal) || 0,
    p: Number(t.p) || 0,
    c: Number(t.c) || 0,
    f: Number(t.f) || 0,
  };
}

export function sumNutritionItems(items: NutritionLoggedItem[]): MacroTotals {
  return items.reduce(
    (a, x) => ({
      cal: a.cal + (Number(x.cal) || 0),
      p: a.p + (Number(x.p) || 0),
      c: a.c + (Number(x.c) || 0),
      f: a.f + (Number(x.f) || 0),
    }),
    { ...ZERO_MACROS },
  );
}

/** Effective logged macros for a day: sum of items when that day has rows, otherwise legacy manual totals. */
export function effectiveNutritionTotalsForDateKey(
  nutritionManualByDay: Record<string, MacroTotals> | undefined,
  nutritionItemsByDay: Record<string, NutritionLoggedItem[]> | undefined,
  dateKey: string,
): MacroTotals {
  const rows = nutritionItemsByDay?.[dateKey];
  if (rows && rows.length > 0) return sumNutritionItems(rows);
  return manualTotalsForDateKey(nutritionManualByDay, dateKey);
}

export function normalizeNutritionManualByDay(raw: unknown): Record<string, MacroTotals> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, MacroTotals> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    out[k] = {
      cal: Number(o.cal) || 0,
      p: Number(o.p) || 0,
      c: Number(o.c) || 0,
      f: Number(o.f) || 0,
    };
  }
  return out;
}

export function normalizeNutritionItemsByDay(raw: unknown): Record<string, NutritionLoggedItem[]> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, NutritionLoggedItem[]> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !Array.isArray(v)) continue;
    const rows: NutritionLoggedItem[] = [];
    for (let i = 0; i < v.length; i++) {
      const o = v[i];
      if (!o || typeof o !== "object") continue;
      const r = o as Record<string, unknown>;
      const loggedAtRaw = r.loggedAtMs;
      const loggedAtMs =
        typeof loggedAtRaw === "number" && Number.isFinite(loggedAtRaw)
          ? loggedAtRaw
          : stableLegacyNutritionLoggedAtMs(k, i);
      const servingLabel =
        typeof r.servingLabel === "string" && r.servingLabel.trim() ? r.servingLabel.trim() : undefined;
      const source = typeof r.source === "string" && r.source.trim() ? r.source.trim() : undefined;
      const externalId =
        typeof r.externalId === "string" && r.externalId.trim() ? r.externalId.trim() : undefined;
      const row: NutritionLoggedItem = {
        id: typeof r.id === "string" && r.id ? r.id : `${k}-row-${i}`,
        name: typeof r.name === "string" ? r.name : "",
        cal: Number(r.cal) || 0,
        p: Number(r.p) || 0,
        c: Number(r.c) || 0,
        f: Number(r.f) || 0,
        loggedAtMs,
        ...(servingLabel ? { servingLabel } : {}),
        ...(source ? { source } : {}),
        ...(externalId ? { externalId } : {}),
      };
      rows.push(row);
    }
    if (rows.length) out[k] = rows;
  }
  return out;
}

/**
 * Load persisted manual totals + item rows. Days that only had legacy manual totals become one item row
 * so totals stay the same and the Nutrition tab can grow by adding more rows.
 */
export function mergePersistedNutritionDays(
  manualRaw: unknown,
  itemsRaw: unknown,
): { nutritionManualByDay: Record<string, MacroTotals>; nutritionItemsByDay: Record<string, NutritionLoggedItem[]> } {
  const nutritionManualByDay = normalizeNutritionManualByDay(manualRaw);
  const nutritionItemsByDay = normalizeNutritionItemsByDay(itemsRaw);
  const nextManual: Record<string, MacroTotals> = { ...nutritionManualByDay };
  const nextItems: Record<string, NutritionLoggedItem[]> = { ...nutritionItemsByDay };

  for (const [k, t] of Object.entries(nutritionManualByDay)) {
    const hasManual =
      (Number(t.cal) || 0) > 0 ||
      (Number(t.p) || 0) > 0 ||
      (Number(t.c) || 0) > 0 ||
      (Number(t.f) || 0) > 0;
    const existing = nextItems[k];
    if (hasManual && (!existing || existing.length === 0)) {
      nextItems[k] = [
        {
          id: `imported-${k}`,
          name: "",
          cal: Number(t.cal) || 0,
          p: Number(t.p) || 0,
          c: Number(t.c) || 0,
          f: Number(t.f) || 0,
          loggedAtMs: stableLegacyNutritionLoggedAtMs(k, 0),
        },
      ];
      delete nextManual[k];
    }
  }
  for (const k of Object.keys(nextItems)) {
    if (nextItems[k]?.length) delete nextManual[k];
  }
  return { nutritionManualByDay: nextManual, nutritionItemsByDay: nextItems };
}

const MAX_NUTRITION_PRESETS = 150;

export function nutritionPresetFingerprint(name: string, m: MacroTotals): string {
  const n = name.trim().toLowerCase();
  return `${n}\t${Number(m.cal) || 0}\t${Number(m.p) || 0}\t${Number(m.c) || 0}\t${Number(m.f) || 0}`;
}

/** Remember or refresh a preset after logging an item on Today. */
export function addNutritionFavorite(
  presets: NutritionPreset[],
  input: MacroTotals & { name: string; servingLabel?: string },
): NutritionPreset[] {
  const fp = nutritionPresetFingerprint(input.name, input);
  const now = Date.now();
  const idx = presets.findIndex(
    (p) => p.favoritedAtMs != null && nutritionPresetFingerprint(p.name, p) === fp,
  );
  if (idx >= 0) {
    const next = [...presets];
    next[idx] = { ...next[idx], favoritedAtMs: next[idx].favoritedAtMs ?? now };
    next.sort((a, b) => (b.favoritedAtMs ?? 0) - (a.favoritedAtMs ?? 0));
    return next.slice(0, MAX_NUTRITION_PRESETS);
  }
  const row: NutritionPreset = {
    id: `fav-${now}-${Math.random().toString(36).slice(2, 9)}`,
    name: input.name.trim() || "Food",
    cal: Number(input.cal) || 0,
    p: Number(input.p) || 0,
    c: Number(input.c) || 0,
    f: Number(input.f) || 0,
    lastUsedAtMs: 0,
    favoritedAtMs: now,
    ...(input.servingLabel?.trim() ? { servingLabel: input.servingLabel.trim() } : {}),
  };
  const next = [
    row,
    ...presets.filter(
      (p) => !(p.favoritedAtMs != null && nutritionPresetFingerprint(p.name, p) === fp),
    ),
  ];
  next.sort((a, b) => (b.favoritedAtMs ?? 0) - (a.favoritedAtMs ?? 0));
  return next.slice(0, MAX_NUTRITION_PRESETS);
}

export function isNutritionFavorite(
  presets: NutritionPreset[],
  name: string,
  macros: MacroTotals,
): boolean {
  const fp = nutritionPresetFingerprint(name, macros);
  return presets.some(
    (p) => p.favoritedAtMs != null && nutritionPresetFingerprint(p.name, p) === fp,
  );
}

export function touchNutritionPresetById(presets: NutritionPreset[], presetId: string): NutritionPreset[] {
  const now = Date.now();
  const next = presets.map((p) => (p.id === presetId ? { ...p, lastUsedAtMs: now } : p));
  next.sort((a, b) => b.lastUsedAtMs - a.lastUsedAtMs);
  return next;
}

export function normalizeNutritionPresets(raw: unknown): NutritionPreset[] {
  if (!Array.isArray(raw)) return [];
  const byFp = new Map<string, NutritionPreset>();
  for (let i = 0; i < raw.length; i++) {
    const o = raw[i];
    if (!o || typeof o !== "object") continue;
    const r = o as Record<string, unknown>;
    const name = typeof r.name === "string" ? r.name : "";
    const cal = Number(r.cal) || 0;
    const p = Number(r.p) || 0;
    const c = Number(r.c) || 0;
    const f = Number(r.f) || 0;
    const id = typeof r.id === "string" && r.id ? r.id : `preset-${i}`;
    const lastUsedAtMs = typeof r.lastUsedAtMs === "number" ? r.lastUsedAtMs : 0;
    const favoritedAtMs = typeof r.favoritedAtMs === "number" ? r.favoritedAtMs : undefined;
    if (favoritedAtMs == null) continue;
    const notes = typeof r.notes === "string" && r.notes.trim() ? r.notes.trim() : undefined;
    const servingLabel =
      typeof r.servingLabel === "string" && r.servingLabel.trim() ? r.servingLabel.trim() : undefined;
    const preset: NutritionPreset = {
      id,
      name,
      cal,
      p,
      c,
      f,
      lastUsedAtMs,
      favoritedAtMs,
      ...(servingLabel ? { servingLabel } : {}),
      ...(notes ? { notes } : {}),
    };
    const fp = nutritionPresetFingerprint(name, preset);
    const prev = byFp.get(fp);
    if (!prev || preset.favoritedAtMs >= prev.favoritedAtMs) byFp.set(fp, preset);
  }
  const out = [...byFp.values()];
  out.sort((a, b) => b.favoritedAtMs - a.favoritedAtMs);
  return out.slice(0, MAX_NUTRITION_PRESETS);
}

const MAX_NUTRITION_USER_FOODS = 200;

export function normalizeNutritionUserFoods(raw: unknown): NutritionUserFood[] {
  if (!Array.isArray(raw)) return [];
  const byId = new Map<string, NutritionUserFood>();
  for (let i = 0; i < raw.length; i++) {
    const o = raw[i];
    if (!o || typeof o !== "object") continue;
    const r = o as Record<string, unknown>;
    const name = typeof r.name === "string" ? r.name.trim() : "";
    if (!name) continue;
    const id = typeof r.id === "string" && r.id ? r.id : `user-food-${i}`;
    const savedAtMs = typeof r.savedAtMs === "number" ? r.savedAtMs : Date.now() - i * 1000;
    const updatedAtMs = typeof r.updatedAtMs === "number" ? r.updatedAtMs : undefined;
    const servingLabel =
      typeof r.servingLabel === "string" && r.servingLabel.trim() ? r.servingLabel.trim() : undefined;
    const source = typeof r.source === "string" && r.source.trim() ? r.source.trim() : undefined;
    const externalId =
      typeof r.externalId === "string" && r.externalId.trim() ? r.externalId.trim() : undefined;
    const food: NutritionUserFood = {
      id,
      name,
      cal: Number(r.cal) || 0,
      p: Number(r.p) || 0,
      c: Number(r.c) || 0,
      f: Number(r.f) || 0,
      savedAtMs,
      ...(updatedAtMs ? { updatedAtMs } : {}),
      ...(servingLabel ? { servingLabel } : {}),
      ...(source ? { source } : {}),
      ...(externalId ? { externalId } : {}),
    };
    const prev = byId.get(id);
    if (!prev || food.savedAtMs >= prev.savedAtMs) byId.set(id, food);
  }
  const out = [...byId.values()];
  out.sort((a, b) => (b.updatedAtMs ?? b.savedAtMs) - (a.updatedAtMs ?? a.savedAtMs));
  return out.slice(0, MAX_NUTRITION_USER_FOODS);
}
