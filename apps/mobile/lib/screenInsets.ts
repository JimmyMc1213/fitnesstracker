import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Extra spacing below fixed bottom primary actions (above home indicator). */
export const BOTTOM_ACTION_EXTRA = 20;

export function useBottomActionPadding() {
  const insets = useSafeAreaInsets();
  return insets.bottom + BOTTOM_ACTION_EXTRA;
}
