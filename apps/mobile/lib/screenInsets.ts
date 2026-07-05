import { initialWindowMetrics, useSafeAreaInsets } from "react-native-safe-area-context";

/** Extra spacing below the status bar / Dynamic Island. */
export const TOP_CHROME_EXTRA = 8;

/** Extra spacing below fixed bottom primary actions (above home indicator). */
export const BOTTOM_ACTION_EXTRA = 20;

/** RN Modal often reports 0 insets; fall back to the window metrics from app launch. */
function resolvedTopInset(top: number) {
  return top || initialWindowMetrics?.insets?.top || 0;
}

function resolvedBottomInset(bottom: number) {
  return bottom || initialWindowMetrics?.insets?.bottom || 0;
}

export function useTopChromePadding() {
  const insets = useSafeAreaInsets();
  return resolvedTopInset(insets.top) + TOP_CHROME_EXTRA;
}

export function useBottomActionPadding() {
  const insets = useSafeAreaInsets();
  return resolvedBottomInset(insets.bottom) + BOTTOM_ACTION_EXTRA;
}
