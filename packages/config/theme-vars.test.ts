import { describe, expect, it } from "vitest";

import { darkThemeColors, lightThemeColors } from "./tokens";
import { hexToRgbTuple, themeCssVars } from "./theme-vars";

describe("theme-vars", () => {
  it("converts hex to rgb tuple", () => {
    expect(hexToRgbTuple("#0a0a0a")).toBe("10 10 10");
    expect(hexToRgbTuple("#ffffff")).toBe("255 255 255");
  });

  it("maps dark palette to css variables", () => {
    const vars = themeCssVars("dark");
    expect(vars["--color-background"]).toBe(hexToRgbTuple(darkThemeColors.background));
    expect(vars["--color-accent"]).toBe(hexToRgbTuple(darkThemeColors.accent));
  });

  it("maps light palette to css variables", () => {
    const vars = themeCssVars("light");
    expect(vars["--color-background"]).toBe(hexToRgbTuple(lightThemeColors.background));
    expect(vars["--color-foreground"]).toBe(hexToRgbTuple(lightThemeColors.textPrimary));
  });
});
