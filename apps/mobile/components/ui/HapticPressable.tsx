import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
} from "react-native";

import { hapticSelection } from "@/lib/haptics";

type Props = PressableProps & {
  /** Fire a subtle iOS selection haptic on press-in. Defaults to true. */
  haptic?: boolean;
};

/** Drop-in Pressable replacement — selection tick on every tap by default. */
export function HapticPressable({
  haptic = true,
  disabled,
  onPressIn,
  ...rest
}: Props) {
  function handlePressIn(event: GestureResponderEvent) {
    if (haptic && !disabled) hapticSelection();
    onPressIn?.(event);
  }

  return <Pressable {...rest} disabled={disabled} onPressIn={handlePressIn} />;
}
