import { applyStreakEligibility } from "./dailyStreak";
import { touchNutritionPresetById, upsertNutritionPresetList } from "./nutritionTotals";
import type { AppState, MacroTotals, NutritionLoggedItem, NutritionPreset } from "./types";

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

export function buildNutritionLoggedItem(
  macros: MacroTotals,
  name = "",
  id = newNutritionItemId(),
): NutritionLoggedItem {
  return {
    id,
    name,
    cal: Number(macros.cal) || 0,
    p: Number(macros.p) || 0,
    c: Number(macros.c) || 0,
    f: Number(macros.f) || 0,
  };
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

/** Top saved foods with protein, sorted by recency — for Home quick-log favorites. */
export function topProteinPresetsForQuickLog(
  presets: NutritionPreset[],
  limit = 5,
): NutritionPreset[] {
  return presets.filter((p) => (Number(p.p) || 0) > 0).slice(0, limit);
}
