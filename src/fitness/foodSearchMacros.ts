import type { MacroTotals } from "./types";

export function scaleMacros(base: MacroTotals, multiplier: number): MacroTotals {
  const m = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
  return {
    cal: Math.round((Number(base.cal) || 0) * m),
    p: Math.round(((Number(base.p) || 0) * m) * 10) / 10,
    c: Math.round(((Number(base.c) || 0) * m) * 10) / 10,
    f: Math.round(((Number(base.f) || 0) * m) * 10) / 10,
  };
}
