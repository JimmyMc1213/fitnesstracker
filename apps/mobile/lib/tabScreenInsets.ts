import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Matches PWA `--tabbar-scroll-clearance` (float offset + pill + extra). */
export const TAB_BAR_SCROLL_CLEARANCE = 120;

const TOP_CHROME_EXTRA = 8;

export function useTabScreenInsets() {
  const insets = useSafeAreaInsets();
  const paddingBottom = insets.bottom + TAB_BAR_SCROLL_CLEARANCE;

  return {
    insets,
    paddingTop: insets.top + TOP_CHROME_EXTRA,
    paddingBottom,
    contentPaddingBottom: paddingBottom,
  };
}
