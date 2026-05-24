/** Shared typography & color tokens for workout UI (FTI-19, FTI-17). */
/** Primary CTA fill (see `--primary` in index.css). */
export const PRIMARY_FILL = "var(--primary)";
/** @deprecated use PRIMARY_FILL */
export const PRIMARY_GREEN = PRIMARY_FILL;
export const ACCENT_GREEN = PRIMARY_FILL;
export const COACH_BLUE = "#0A84FF";
export const PRESET_SELECTED_BORDER = "var(--border-strong)";
export const PRESET_SELECTED_BG = "var(--surface-3)";
export const PRESET_SELECTED_COLOR = "var(--text-primary)";
export const COACH_BLUE_LABEL = "var(--coach-blue-label)";
export const COACH_BLUE_MUTED = "rgba(10,132,255,0.65)";
export const COACH_CARD_BG = "var(--coach-card-bg)";
export const COACH_CARD_BORDER = "var(--coach-card-border)";

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

export const CARD_PADDING = 16;
export const EDITOR_LIST_GAP = 12;
