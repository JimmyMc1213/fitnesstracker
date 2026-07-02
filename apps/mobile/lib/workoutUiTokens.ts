import type { AppTheme } from "@newyouai/types";

import {
  FUTURE_YOU_GOLD,
  FUTURE_YOU_GOLD_DEEP,
  FUTURE_YOU_GOLD_MID,
} from "@/lib/futureYouTokens";

/** Primary coach accent — brand gold (legacy name kept for imports). */
export const COACH_BLUE = FUTURE_YOU_GOLD;
export const COACH_BLUE_LABEL = FUTURE_YOU_GOLD_MID;
export const COACH_GOLD_BG_SUBTLE = "rgba(201, 168, 118, 0.06)";
export const COACH_GOLD_BORDER_SOFT = "rgba(201, 168, 118, 0.22)";

/** Workout tab link/accent — matches routine editor links and in-session titles. */
export const WORKOUT_ACCENT = FUTURE_YOU_GOLD_MID;
export const WORKOUT_ACCENT_BG = "rgba(201, 168, 118, 0.12)";
export const WORKOUT_ACCENT_BORDER = "rgba(201, 168, 118, 0.28)";
export const WORKOUT_ACCENT_TRACK = "rgba(201, 168, 118, 0.22)";
export const WORKOUT_ACCENT_ON = "#14110c";

export function workoutAccentLabel(theme: AppTheme): string {
  return theme === "light" ? FUTURE_YOU_GOLD_DEEP : FUTURE_YOU_GOLD_MID;
}

export const MOBILITY_ACCENT = "rgba(196,181,253,0.95)";
export const MOBILITY_BORDER = "rgba(196,181,253,0.32)";
export const MOBILITY_BG = "rgba(196,181,253,0.07)";

export function mobilityColors(theme: AppTheme) {
  if (theme === "light") {
    return {
      accent: "#7C6AD2",
      border: "rgba(124, 106, 210, 0.28)",
      bg: "rgba(124, 106, 210, 0.07)",
      borderDone: "rgba(124, 106, 210, 0.38)",
      iconBorder: "rgba(124, 106, 210, 0.20)",
      iconBg: "rgba(124, 106, 210, 0.09)",
      iconBgDone: "rgba(124, 106, 210, 0.14)",
    };
  }
  return {
    accent: "rgba(196,181,253,0.95)",
    border: "rgba(196,181,253,0.32)",
    bg: "rgba(196,181,253,0.07)",
    borderDone: "rgba(196,181,253,0.42)",
    iconBorder: "rgba(196,181,253,0.22)",
    iconBg: "rgba(196,181,253,0.12)",
    iconBgDone: "rgba(196,181,253,0.18)",
  };
}

export function coachCardColors(theme: AppTheme) {
  if (theme === "light") {
    return {
      background: "rgba(201, 168, 118, 0.06)",
      border: "rgba(201, 168, 118, 0.28)",
      glow: "rgba(201, 168, 118, 0.12)",
    };
  }
  return {
    background: "rgba(201, 168, 118, 0.08)",
    border: "rgba(201, 168, 118, 0.35)",
    glow: "rgba(201, 168, 118, 0.18)",
  };
}

type GradientStop = { color: string; offset: number };

export function equipmentTypePillStyle(theme: AppTheme) {
  if (theme === "light") {
    return {
      border: "rgba(201, 168, 118, 0.28)",
      text: FUTURE_YOU_GOLD_DEEP,
      placeholderText: "rgba(138, 109, 47, 0.65)",
      topHighlight: "rgba(255,255,255,0.35)",
      gradientStops: [
        { color: "rgba(201, 168, 118, 0.14)", offset: 0 },
        { color: "rgba(212, 184, 138, 0.10)", offset: 0.55 },
        { color: "rgba(201, 168, 118, 0.06)", offset: 1 },
      ] satisfies GradientStop[],
    };
  }
  return {
    border: WORKOUT_ACCENT_BORDER,
    text: WORKOUT_ACCENT,
    placeholderText: "rgba(212, 184, 138, 0.65)",
    topHighlight: "rgba(255,255,255,0.08)",
    gradientStops: [
      { color: "rgba(201, 168, 118, 0.20)", offset: 0 },
      { color: "rgba(201, 168, 118, 0.12)", offset: 0.55 },
      { color: "rgba(201, 168, 118, 0.06)", offset: 1 },
    ] satisfies GradientStop[],
  };
}
