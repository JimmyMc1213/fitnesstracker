/**
 * Per-focus fade for tab screens.
 * Matches PWA TAB_PAGE_VARIANTS: opacity 0→1 + y 8→0.
 * Replays on every focus (not just first mount) so switching back to an
 * already-mounted tab still animates — tab screens stay mounted in expo-router.
 * Keep position:absolute FABs/fixed elements outside this wrapper so the
 * drift doesn't visibly move them.
 */

import { useFocusEffect } from "expo-router";
import { useCallback, type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { TAB_PAGE_EASING } from "./tokens";
import { useReducedMotion } from "./useReducedMotion";

const TAB_FADE_DURATION = 220;
const TAB_FADE_DRIFT = 8;

type TabScreenFadeProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function TabScreenFade({ children, style }: TabScreenFadeProps) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : TAB_FADE_DRIFT);

  useFocusEffect(
    useCallback(() => {
      if (reduceMotion) {
        opacity.value = 1;
        translateY.value = 0;
        return;
      }
      const easing = Easing.bezier(...TAB_PAGE_EASING);
      opacity.value = 0;
      translateY.value = TAB_FADE_DRIFT;
      opacity.value = withTiming(1, { duration: TAB_FADE_DURATION, easing });
      translateY.value = withTiming(0, { duration: TAB_FADE_DURATION, easing });
    }, [reduceMotion]), // eslint-disable-line react-hooks/exhaustive-deps
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
