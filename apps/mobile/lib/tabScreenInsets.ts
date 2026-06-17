import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TAB_BAR_FLOAT_OFFSET } from "@/lib/futureYouTokens";

/** Matches PWA `--tabbar-pill-height`. */
export const TAB_BAR_PILL_HEIGHT = 66;

/** Matches PWA `--tabbar-scroll-extra`. */
export const TAB_BAR_SCROLL_EXTRA = 28;

/** Matches PWA `--tabbar-scroll-clearance` (float offset + pill + extra). */
export const TAB_BAR_SCROLL_CLEARANCE =
  TAB_BAR_FLOAT_OFFSET + TAB_BAR_PILL_HEIGHT + TAB_BAR_SCROLL_EXTRA;

/** Bottom inset when the floating tab dock is hidden (sub-flows, editors). */
export const TAB_BAR_HIDDEN_SCROLL_CLEARANCE = 24;

const TOP_CHROME_EXTRA = 8;

export function useTabScreenInsets(options?: { tabBarHidden?: boolean }) {
  const insets = useSafeAreaInsets();
  const tabBarHidden = options?.tabBarHidden ?? false;
  const paddingBottom =
    insets.bottom +
    (tabBarHidden ? TAB_BAR_HIDDEN_SCROLL_CLEARANCE : TAB_BAR_SCROLL_CLEARANCE);

  return {
    insets,
    paddingTop: insets.top + TOP_CHROME_EXTRA,
    paddingBottom,
    contentPaddingBottom: paddingBottom,
  };
}
