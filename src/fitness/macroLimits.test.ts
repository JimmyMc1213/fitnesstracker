import { describe, expect, it } from "vitest";

import {
  MACRO_LIMITS,
  clampMacroInputString,
  clampMacroTotals,
  clampMacroValue,
  parseBoundedMacro,
} from "./macroLimits";

describe("macroLimits", () => {
  it("clamps absurd calorie and macro values", () => {
    expect(clampMacroValue("cal", 200_000)).toBe(MACRO_LIMITS.cal);
    expect(clampMacroValue("p", 50_000)).toBe(MACRO_LIMITS.p);
    expect(clampMacroValue("c", -10)).toBe(0);
    expect(clampMacroValue("f", Number.NaN)).toBe(0);
  });

  it("clampMacroTotals applies per-field limits", () => {
    expect(
      clampMacroTotals({ cal: 200_000, p: 1_200, c: 40, f: 80 }),
    ).toEqual({
      cal: MACRO_LIMITS.cal,
      p: MACRO_LIMITS.p,
      c: 40,
      f: 80,
    });
  });

  it("parseBoundedMacro and clampMacroInputString respect limits", () => {
    expect(parseBoundedMacro("200000", "cal")).toBe(MACRO_LIMITS.cal);
    expect(clampMacroInputString("200000", "cal")).toBe(String(MACRO_LIMITS.cal));
    expect(clampMacroInputString("", "cal")).toBe("");
    expect(clampMacroInputString("abc", "p")).toBe("0");
  });
});
