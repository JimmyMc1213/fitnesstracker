export const MOTION_DURATIONS = {
  tab: 150,
  onboarding: 250,
  push: 250,
  sheetExit: 200,
  sheetEnter: 300,
  backdrop: 220,
  dismiss: 320,
  fast: 180,
  panel: 250,
  stack: 250,
  sheet: 300,
} as const;

export type NavDirection = "forward" | "back";

export const TAB_PAGE_EASING = [0.25, 0.46, 0.45, 0.94] as const;
export const PAGE_LAYER_EASING = [0.22, 1, 0.36, 1] as const;
export const PUSH_ENTER_EASING = [0, 0, 0.2, 1] as const;
export const PUSH_EXIT_EASING = [0.4, 0, 1, 1] as const;
export const DISMISS_ENTER_EASING = [0.22, 1, 0.36, 1] as const;
export const DISMISS_EXIT_EASING = [0.4, 0, 0.2, 1] as const;
export const DIALOG_EASING = [0.22, 1, 0.36, 1] as const;
