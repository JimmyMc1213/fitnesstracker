import type { MacroTotals, NutritionLoggedItem } from "@newyouai/types";

export const ZERO_MACROS: MacroTotals = { cal: 0, p: 0, c: 0, f: 0 };

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

export function nutritionPresetFingerprint(name: string, m: MacroTotals): string {
  const n = name.trim().toLowerCase();
  return `${n}\t${Number(m.cal) || 0}\t${Number(m.p) || 0}\t${Number(m.c) || 0}\t${Number(m.f) || 0}`;
}
