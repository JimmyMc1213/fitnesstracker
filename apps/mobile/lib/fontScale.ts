import { useEffect, useState } from "react";
import { PixelRatio } from "react-native";

/** iOS/Android default; above this we switch to scroll-friendly onboarding layouts. */
export const LARGE_TEXT_FONT_SCALE_THRESHOLD = 1.15;

export function getFontScale(): number {
  return PixelRatio.getFontScale();
}

export function isLargeTextEnabled(fontScale = getFontScale()): boolean {
  return fontScale >= LARGE_TEXT_FONT_SCALE_THRESHOLD;
}

/** Re-reads when the OS font scale changes (e.g. user adjusts text size in Settings). */
export function useFontScale(): number {
  const [fontScale, setFontScale] = useState(getFontScale);

  useEffect(() => {
    const pixelRatio = PixelRatio as typeof PixelRatio & {
      addEventListener?: (
        type: "change",
        listener: () => void,
      ) => { remove: () => void } | undefined;
    };
    const id = pixelRatio.addEventListener?.("change", () => {
      setFontScale(getFontScale());
    });
    return () => id?.remove?.();
  }, []);

  return fontScale;
}

export function useLargeTextEnabled(): boolean {
  return isLargeTextEnabled(useFontScale());
}
