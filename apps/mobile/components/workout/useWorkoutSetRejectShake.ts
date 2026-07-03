import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useReducedMotion } from "@/components/motion/useReducedMotion";

export const WORKOUT_SET_REJECT_COLOR = "#FF453A";

export function useWorkoutSetRejectShake(rejecting: boolean) {
  const reducedMotion = useReducedMotion();
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (!rejecting) return;
    if (reducedMotion) return;
    translateX.value = withSequence(
      withTiming(-5, { duration: 90 }),
      withTiming(5, { duration: 90 }),
      withTiming(-3, { duration: 90 }),
      withTiming(3, { duration: 90 }),
      withTiming(0, { duration: 90 }),
    );
  }, [rejecting, reducedMotion, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { animatedStyle, rejecting };
}
