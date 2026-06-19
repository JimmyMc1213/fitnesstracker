/**
 * Mount-only opacity fade for tab screens.
 * Matches PWA .motion-screen: opacity 0→1, no y shift.
 * No y shift keeps position:absolute FABs viewport-anchored.
 */

import { useEffect, type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { TAB_PAGE_EASING } from "./tokens";
import { useReducedMotion } from "./useReducedMotion";

type TabScreenFadeProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function TabScreenFade({ children, style }: TabScreenFadeProps) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      return;
    }
    opacity.value = withTiming(1, {
      duration: 180,
      easing: Easing.bezier(...TAB_PAGE_EASING),
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
