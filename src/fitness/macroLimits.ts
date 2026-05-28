import type { MacroTotals } from "./types";

/** Upper bounds for user-entered calories and macros (per food row or daily target). */
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

export function clampMacroTotals(macros: MacroTotals): MacroTotals {
  return {
    cal: clampMacroValue("cal", macros.cal),
    p: clampMacroValue("p", macros.p),
    c: clampMacroValue("c", macros.c),
    f: clampMacroValue("f", macros.f),
  };
}

export function parseBoundedMacro(raw: string, key: keyof MacroTotals): number {
  return clampMacroValue(key, parseFloat(raw));
}

/** Snap a free-form input string to the allowed macro range (for blur handlers). */
export function clampMacroInputString(raw: string, key: keyof MacroTotals): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return String(parseBoundedMacro(trimmed, key));
}
