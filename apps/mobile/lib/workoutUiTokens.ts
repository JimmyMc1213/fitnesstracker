import type { AppTheme } from "@newyouai/types";

export const COACH_BLUE = "#0A84FF";
export const COACH_BLUE_LABEL = "#6EB7FF";

export const MOBILITY_ACCENT = "rgba(196,181,253,0.95)";
export const MOBILITY_BORDER = "rgba(196,181,253,0.32)";
export const MOBILITY_BG = "rgba(196,181,253,0.07)";

export function coachCardColors(theme: AppTheme) {
  if (theme === "light") {
    return {
      background: "rgba(10,132,255,0.06)",
      border: "rgba(10,132,255,0.28)",
      glow: "rgba(10,132,255,0.12)",
    };
  }
  return {
    background: "rgba(10,132,255,0.08)",
    border: "rgba(10,132,255,0.35)",
    glow: "rgba(10,132,255,0.18)",
  };
}
