/** Shared splash / boot timing — keep index.html inline CSS in sync with these values. */
export const BOOT_FADE_OUT_MS = 880;
export const BOOT_MARK_FADE_OUT_MS = 680;
export const BOOT_MIN_VISIBLE_MS = 1400;
export const WELCOME_SPLASH_HOLD_MS = 2000;
export const WELCOME_SPLASH_FADE_OUT_MS = 880;
export const WELCOME_LANDING_FADE_IN_MS = 880;
export const SPLASH_MARK_FADE_IN_MS = 880;

declare global {
  interface Window {
    __gymmyBootAt?: number;
  }
}

export function bootSplashElapsedMs(): number {
  if (typeof window === "undefined") return 0;
  const bootAt = window.__gymmyBootAt ?? Date.now();
  return Date.now() - bootAt;
}

export function bootSplashHoldRemainingMs(): number {
  return Math.max(0, BOOT_MIN_VISIBLE_MS - bootSplashElapsedMs());
}
