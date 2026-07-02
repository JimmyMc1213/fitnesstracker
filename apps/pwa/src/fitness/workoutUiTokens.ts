/** Shared typography & color tokens for workout UI (FTI-19, FTI-17). */
import type { CSSProperties } from "react";
import type { AppTheme } from "@newyouai/types";

/** Primary CTA fill (see `--primary` in index.css). */
export const PRIMARY_FILL = "var(--primary)";
/** @deprecated use PRIMARY_FILL */
export const PRIMARY_GREEN = PRIMARY_FILL;
export const ACCENT_GREEN = PRIMARY_FILL;
/** Primary coach accent — brand gold (legacy name kept for imports). */
export const COACH_BLUE = "#c9a876";
export const PRESET_SELECTED_BORDER = "var(--border-strong)";
export const PRESET_SELECTED_BG = "var(--surface-3)";
export const PRESET_SELECTED_COLOR = "var(--text-primary)";
export const COACH_BLUE_LABEL = "var(--coach-blue-label)";
export const COACH_BLUE_MUTED = "rgba(201, 168, 118, 0.65)";
export const COACH_GOLD_BG_SUBTLE = "rgba(201, 168, 118, 0.06)";
export const COACH_GOLD_BG_SOFT = "rgba(201, 168, 118, 0.08)";
export const COACH_GOLD_BORDER_SOFT = "rgba(201, 168, 118, 0.22)";
export const COACH_GOLD_TRACK = "rgba(201, 168, 118, 0.22)";
export const COACH_GOLD_GLOW =
  "0 0 0 1px rgba(201, 168, 118, 0.2), 0 0 18px rgba(201, 168, 118, 0.35), 0 0 36px rgba(201, 168, 118, 0.12)";
export const COACH_CARD_BG = "var(--coach-card-bg)";
export const COACH_CARD_BORDER = "var(--coach-card-border)";

export const MOBILITY_ACCENT = "rgba(196,181,253,0.95)";
export const MOBILITY_BORDER = "rgba(196,181,253,0.32)";
export const MOBILITY_BG = "rgba(196,181,253,0.07)";

export function mobilityColors(theme: AppTheme) {
  if (theme === "light") {
    return { accent: "#7C6AD2" };
  }
  return { accent: MOBILITY_ACCENT };
}

export const USER_NOTE_GRAY = "var(--text-muted-soft)";
export const USER_NOTE_GRAY_MUTED = "var(--text-faint-soft)";
export const SECONDARY_ACTION_COLOR = "var(--text-faint-soft)";

export const TITLE_SIZE = 24;
export const LABEL_SIZE = 10;
export const METADATA_SIZE = 11;

export const labelStyle = {
  fontSize: LABEL_SIZE,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

/** Primary in-card section titles (Coach header, Warm-up block). */
export const coachMajorTitleStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
  color: "var(--text-primary)",
};

/** Secondary labels inside the coach card (Coach note, muscle groups). */
export const coachSubsectionLabelStyle: CSSProperties = {
  fontSize: LABEL_SIZE,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--text-ghost)",
};

export const CARD_PADDING = 16;
export const EDITOR_LIST_GAP = 12;

/** Theme-aware field inputs for routine editor and workout sheets. */
export const workoutFieldInputStyle: CSSProperties = {
  background: "var(--card-2)",
  border: "0.5px solid var(--border)",
  borderRadius: 10,
  padding: "10px 12px",
  color: "var(--text-primary)",
  fontFamily: "var(--ui)",
  fontSize: 14,
  fontWeight: 500,
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

/** Compact numeric inputs on in-session set rows. */
export const workoutSetInputStyle: CSSProperties = {
  background: "var(--card-2)",
  border: "0.5px solid var(--border)",
  borderRadius: 8,
  padding: "8px 10px",
  color: "var(--text-primary)",
  fontFamily: "var(--ui)",
  fontSize: 16,
  fontWeight: 500,
  width: "100%",
  outline: "none",
  textAlign: "center",
  fontVariantNumeric: "tabular-nums",
};
