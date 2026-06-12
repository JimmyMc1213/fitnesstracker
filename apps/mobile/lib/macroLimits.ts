import type { MacroTotals } from "@newyouai/types";

export const MACRO_LIMITS: Record<keyof MacroTotals, number> = {
  cal: 20_000,
  p: 999,
  c: 999,
  f: 999,
};

export function clampMacroValue(key: keyof MacroTotals, value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(MACRO_LIMITS[key], Math.round(value));
}
