/**
 * All native stack/tab animation is set to "none" — Reanimated (ScreenTransition)
 * owns 100% of the motion. Never let the native layer and our layer fight each other.
 */

/** Root stack + onboarding stack: invisible cut, ScreenTransition does the work. */
export const defaultStackScreenOptions = {
  headerShown: false,
  animation: "none" as const,
};

/**
 * Push routes (log-food, workout, progress) — native slide_from_right.
 * These screens don't use ScreenTransition; the native animation IS the transition.
 */
export const pushStackScreenOptions = {
  headerShown: false,
  animation: "slide_from_right" as const,
};

/**
 * Fade routes (log-food, workout history, progress gallery) — native crossfade.
 * Matches the PWA's `motionVariant="fade"` deep-flow presentations.
 */
export const fadeStackScreenOptions = {
  headerShown: false,
  animation: "fade" as const,
};

/** Modals — native sheet presentation. */
export const modalStackScreenOptions = {
  headerShown: false,
  presentation: "modal" as const,
};

/** Tabs — no native animation, TabScreenFade handles fade on each tab screen. */
export const tabScreenOptions = {
  headerShown: false,
  tabBarShowLabel: false,
  sceneStyle: { flex: 1, backgroundColor: "transparent" },
};
