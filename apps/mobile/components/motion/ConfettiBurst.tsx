/**
 * One-shot confetti celebration. Pieces launch from the top, fall with a sideways
 * drift + tumble, then fade out near the end. Pure Reanimated (UI-thread) so it
 * stays smooth, non-interactive, and a no-op under Reduce Motion.
 */

import { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { useReducedMotion } from "./useReducedMotion";

/** Gold-forward festive palette to match the onboarding `--ob-gold` accent. */
const CONFETTI_COLORS = [
  "#c9a876",
  "#e3c997",
  "#f5ead2",
  "#ffffff",
  "#7fd1b9",
  "#f0846b",
];

type PieceConfig = {
  key: number;
  startX: number;
  startY: number;
  driftX: number;
  fallDistance: number;
  width: number;
  height: number;
  color: string;
  delay: number;
  duration: number;
  rotateFrom: number;
  rotateTo: number;
  borderRadius: number;
};

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function ConfettiPiece({ config }: { config: PieceConfig }) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    progress.value = withDelay(
      config.delay,
      withTiming(1, { duration: config.duration, easing: Easing.bezier(0.2, 0.5, 0.5, 1) }),
    );
    opacity.value = withDelay(
      config.delay + config.duration * 0.65,
      withTiming(0, { duration: config.duration * 0.35, easing: Easing.linear }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = config.startY + progress.value * config.fallDistance;
    const translateX = progress.value * config.driftX;
    const rotateZ = `${config.rotateFrom + progress.value * (config.rotateTo - config.rotateFrom)}deg`;
    return {
      opacity: opacity.value,
      transform: [{ translateX }, { translateY }, { rotateZ }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: config.startX,
          top: 0,
          width: config.width,
          height: config.height,
          backgroundColor: config.color,
          borderRadius: config.borderRadius,
        },
        animatedStyle,
      ]}
    />
  );
}

type ConfettiBurstProps = {
  /** Number of confetti pieces. */
  count?: number;
};

export function ConfettiBurst({ count = 80 }: ConfettiBurstProps) {
  const reduceMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();

  const pieces = useMemo<PieceConfig[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const w = randomBetween(7, 12);
      const startY = randomBetween(-40, -10);
      return {
        key: i,
        startX: randomBetween(0, width),
        startY,
        driftX: randomBetween(-width * 0.2, width * 0.2),
        fallDistance: height - startY + randomBetween(60, 200),
        width: w,
        height: w * randomBetween(0.45, 0.7),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: randomBetween(0, 450),
        duration: randomBetween(2200, 3600),
        rotateFrom: randomBetween(0, 360),
        rotateTo: randomBetween(360, 1080) * (Math.random() > 0.5 ? 1 : -1),
        borderRadius: Math.random() > 0.5 ? w / 2 : 1.5,
      };
    });
  }, [count, width, height]);

  if (reduceMotion) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.key} config={piece} />
      ))}
    </View>
  );
}
