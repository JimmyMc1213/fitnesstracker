/** App typography is locked via `lockFontScaling.ts`; OS text size does not affect layout. */

export function getFontScale(): number {
  return 1;
}

export function isLargeTextEnabled(): boolean {
  return false;
}

export function useFontScale(): number {
  return 1;
}

export function useLargeTextEnabled(): boolean {
  return false;
}
