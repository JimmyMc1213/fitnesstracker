import type { AppTheme } from "@newyouai/types";

import { onboardingThemeFor } from "@/lib/onboardingTheme";

export type LogFoodAccentColors = {
  accent: string;
  accentText: string;
};

/** Brand gold accents for the log-food flow (scan, tabs, quick-add, barcode scanner). */
export function logFoodAccentColors(theme: AppTheme): LogFoodAccentColors {
  const ob = onboardingThemeFor(theme);
  return {
    accent: ob.gold,
    accentText: ob.goldOn,
  };
}
