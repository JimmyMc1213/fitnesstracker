import { type ReactNode } from "react";
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { hapticSelection } from "@/lib/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESS_DURATION = 150;

type Props = Omit<PressableProps, "style"> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Scale at full press. Matches PWA `.tap:active` (0.985). */
  activeScale?: number;
  /** Opacity at full press. Matches PWA `.tap:active` (0.7). */
  activeOpacity?: number;
  /** Fire a subtle iOS selection haptic on press-in. Defaults to true. */
  haptic?: boolean;
};

/** Shared button wrapper with PWA-matching press feedback (scale + opacity, reduced-motion aware). */
export function PressableScale({
  children,
  style,
  disabled,
  onPressIn,
  onPressOut,
  activeScale = 0.985,
  activeOpacity = 0.7,
  haptic = true,
  ...rest
}: Props) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const scaleDelta = 1 - activeScale;
  const opacityDelta = 1 - activeOpacity;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - scaleDelta * progress.value }],
    opacity: 1 - opacityDelta * progress.value,
  }));

  function handlePressIn(event: GestureResponderEvent) {
    if (!disabled) {
      if (haptic) hapticSelection();
      if (!reduceMotion) {
        progress.value = withTiming(1, { duration: PRESS_DURATION });
      }
    }
    onPressIn?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    progress.value = withTiming(0, { duration: PRESS_DURATION });
    onPressOut?.(event);
  }

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, reduceMotion ? null : animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
