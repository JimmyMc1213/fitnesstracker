/** Shared typography & color tokens for workout UI (FTI-19, FTI-17). */
/** Primary CTA fill, white on dark (see `--primary` in index.css). */
export const PRIMARY_FILL = "#ffffff";
/** @deprecated use PRIMARY_FILL */
export const PRIMARY_GREEN = PRIMARY_FILL;
export const ACCENT_GREEN = PRIMARY_FILL;
export const COACH_BLUE = "#0A84FF";
export const PRESET_SELECTED_BORDER = "rgba(255,255,255,0.35)";
export const PRESET_SELECTED_BG = "rgba(255,255,255,0.1)";
export const PRESET_SELECTED_COLOR = "#ffffff";
export const COACH_BLUE_LABEL = "rgba(10,132,255,0.75)";
export const COACH_BLUE_MUTED = "rgba(10,132,255,0.65)";
export const COACH_CARD_BG = "rgba(10,132,255,0.08)";
export const COACH_CARD_BORDER = "rgba(10,132,255,0.28)";

export const USER_NOTE_GRAY = "rgba(255,255,255,0.55)";
export const USER_NOTE_GRAY_MUTED = "rgba(255,255,255,0.45)";
export const SECONDARY_ACTION_COLOR = "rgba(255,255,255,0.45)";

export const TITLE_SIZE = 24;
export const LABEL_SIZE = 10;
export const METADATA_SIZE = 11;

export const labelStyle = {
  fontSize: LABEL_SIZE,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

export const CARD_PADDING = 16;
export const EDITOR_LIST_GAP = 12;
