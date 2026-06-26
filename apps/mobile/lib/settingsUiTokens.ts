import type { AppTheme } from "@newyouai/types";

import {
  FUTURE_YOU_GOLD,
  FUTURE_YOU_GOLD_DEEP,
  FUTURE_YOU_GOLD_MID,
} from "@/lib/futureYouTokens";

export type SettingsGoldIconColors = {
  iconColor: string;
  iconBg: string;
};

/** Brand gold accent for highlighted settings rows (e.g. Request a feature). */
export function settingsGoldIconColors(theme: AppTheme): SettingsGoldIconColors {
  if (theme === "light") {
    return {
      iconColor: FUTURE_YOU_GOLD_DEEP,
      iconBg: "rgba(201, 168, 118, 0.14)",
    };
  }
  return {
    iconColor: FUTURE_YOU_GOLD_MID,
    iconBg: "rgba(201, 168, 118, 0.12)",
  };
}

export const SETTINGS_GOLD_ACCENT = FUTURE_YOU_GOLD;
