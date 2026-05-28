import { BOOT_FADE_OUT_MS } from "./splashTiming";

/** Instant HTML splash shown before React loads; dismissed once the app paints. */
export const BOOT_SPLASH_ID = "boot-splash";

/** Backdrop fade delay (180ms) + duration — keep in sync with index.html. */
const BOOT_SPLASH_REMOVE_MS = 180 + BOOT_FADE_OUT_MS + 80;

export function bootSplashPresent(): boolean {
  return typeof document !== "undefined" && document.getElementById(BOOT_SPLASH_ID) != null;
}

export function dismissBootSplash(): void {
  const el = document.getElementById(BOOT_SPLASH_ID);
  if (!el) return;
  el.classList.add("boot-splash--out");
  window.setTimeout(() => el.remove(), BOOT_SPLASH_REMOVE_MS);
}
