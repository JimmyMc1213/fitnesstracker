import { useEffect } from "react";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export const RING_DURATION_MS = 500;

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function macroRingTarget(value: number, target: number): number {
  return target > 0 ? Math.min(1, Math.max(0, value / target)) : 0;
}

/** Animates macro ring arc from prior fill over ~500ms ease-out. */
export function useAnimatedMacroProgress(value: number, target: number, enabled = true) {
  const ringTarget = macroRingTarget(value, target);
  const ringPct = useSharedValue(ringTarget);

  useEffect(() => {
    if (!enabled) {
      ringPct.value = ringTarget;
      return;
    }
    ringPct.value = withTiming(ringTarget, {
      duration: RING_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, target, ringTarget, enabled, ringPct]);

  const animatedRingPct = useDerivedValue(() => ringPct.value);

  return { ringPct: animatedRingPct, ringPctNumber: ringTarget };
}
