import { describe, expect, it } from "vitest";

import { darkThemeColors, lightThemeColors, themeColors } from "./tokens";

describe("tokens", () => {
  it("matches PWA theme.ts dark palette", () => {
    expect(darkThemeColors.background).toBe("#0a0a0a");
    expect(darkThemeColors.accent).toBe("#3B82F6");
    expect(darkThemeColors.textSecondary).toBe("#888888");
  });

  it("matches PWA theme.ts light palette", () => {
    expect(lightThemeColors.background).toBe("#ffffff");
    expect(lightThemeColors.textPrimary).toBe("#0a0a0a");
  });

  it("resolves theme via themeColors()", () => {
    expect(themeColors("dark").background).toBe(darkThemeColors.background);
    expect(themeColors("light").background).toBe(lightThemeColors.background);
  });
});
