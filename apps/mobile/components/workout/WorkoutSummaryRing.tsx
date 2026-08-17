import { useEffect, type ReactNode } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { FUTURE_YOU_GOLD, FUTURE_YOU_GOLD_MID } from "@/lib/futureYouTokens";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SWEEP_MS = 900;
const GRADIENT_ID = "workoutSummaryRingGold";

type Props = {
  /** 0–1 completion. */
  progress: number;
  size?: number;
  stroke?: number;
  trackColor: string;
  children?: ReactNode;
};

/** Gold completion arc for the workout summary hero. Sweeps once on mount, on the UI thread. */
export function WorkoutSummaryRing({
  progress,
  size = 148,
  stroke = 9,
  trackColor,
  children,
}: Props) {
  const reduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  const sweep = useSharedValue(reduceMotion ? clamped : 0);

  useEffect(() => {
    if (reduceMotion) {
      sweep.value = clamped;
      return;
    }
    sweep.value = withTiming(clamped, { duration: SWEEP_MS, easing: Easing.out(Easing.cubic) });
  }, [clamped, reduceMotion, sweep]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - sweep.value),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={FUTURE_YOU_GOLD_MID} />
            <Stop offset="1" stopColor={FUTURE_YOU_GOLD} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${GRADIENT_ID})`}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute inset-0 items-center justify-center">{children}</View>
    </View>
  );
}
