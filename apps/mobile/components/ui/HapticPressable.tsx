import { forwardRef } from "react";
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type View,
} from "react-native";
import { cssInterop } from "nativewind";

import { hapticSelection } from "@/lib/haptics";

type Props = PressableProps & {
  /** Fire a subtle iOS selection haptic on press-in. Defaults to true. */
  haptic?: boolean;
};

const HapticPressableBase = forwardRef<View, Props>(function HapticPressable(
  { haptic = true, disabled, onPressIn, ...rest },
  ref,
) {
  function handlePressIn(event: GestureResponderEvent) {
    if (haptic && !disabled) hapticSelection();
    onPressIn?.(event);
  }

  return <Pressable ref={ref} {...rest} disabled={disabled} onPressIn={handlePressIn} />;
});

/** Drop-in Pressable replacement — selection tick on every tap by default. */
export const HapticPressable = cssInterop(
  // @ts-expect-error NativeWind cssInterop typings omit forwardRef components.
  HapticPressableBase,
  { className: "style" },
) as typeof HapticPressableBase;
