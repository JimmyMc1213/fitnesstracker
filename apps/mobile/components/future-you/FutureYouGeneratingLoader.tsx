import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import {
  FUTURE_YOU_GOLD,
  FUTURE_YOU_GOLD_DEEP,
  FUTURE_YOU_GOLD_MID,
} from "@/lib/futureYouTokens";

const LABEL = "Generating";
const LETTERS = LABEL.split("");

/** Per-letter pulse window as a fraction of the full sweep (smaller = tighter wave). */
const LETTER_WINDOW = 0.16;

type Props = {
  /** Diameter of the glowing ring in px. */
  size?: number;
  /** Optional caption shown beneath the word. */
  caption?: string | null;
};

/**
 * Brand-gold animated generation loader: a rotating glowing ring with a
 * comet-style gradient arc and a wave of pulsing "Generating" letters.
 * React Native port of the web ai-loader (recolored to brand gold).
 */
export function FutureYouGeneratingLoader({ size = 76, caption = null }: Props) {
  const spin = useSharedValue(0);
  const wave = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.linear }),
      -1,
      false,
    );
    wave.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
    return () => {
      cancelAnimation(spin);
      cancelAnimation(wave);
    };
  }, [spin, wave]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  const stroke = Math.max(5, Math.round(size * 0.08));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // ~72% arc with a trailing gap so the gradient reads as a comet head.
  const dash = circumference * 0.72;
  const gap = circumference - dash;

  return (
    <View style={styles.root}>
      <View style={[styles.ringGlow, { width: size, height: size, borderRadius: size / 2 }]}>
        <Animated.View style={[{ width: size, height: size }, ringStyle]}>
          <Svg width={size} height={size}>
            <Defs>
              <LinearGradient id="fyGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={FUTURE_YOU_GOLD_MID} stopOpacity={1} />
                <Stop offset="55%" stopColor={FUTURE_YOU_GOLD} stopOpacity={0.85} />
                <Stop offset="100%" stopColor={FUTURE_YOU_GOLD_DEEP} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            {/* Faint full track */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={FUTURE_YOU_GOLD}
              strokeOpacity={0.14}
              strokeWidth={stroke}
              fill="none"
            />
            {/* Rotating comet arc */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#fyGold)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${gap}`}
              fill="none"
            />
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.word} accessibilityLabel={`${LABEL}…`} accessibilityRole="text">
        {LETTERS.map((letter, index) => (
          <Letter key={`${letter}-${index}`} char={letter} index={index} wave={wave} />
        ))}
      </View>

      {caption ? <Caption text={caption} /> : null}
    </View>
  );
}

function Letter({
  char,
  index,
  wave,
}: {
  char: string;
  index: number;
  wave: SharedValue<number>;
}) {
  const center = index / LETTERS.length;

  const style = useAnimatedStyle(() => {
    let distance = Math.abs(wave.value - center);
    distance = Math.min(distance, 1 - distance);
    const active = interpolate(
      distance,
      [0, LETTER_WINDOW],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return {
      opacity: 0.4 + active * 0.6,
      transform: [
        { scale: 1 + active * 0.15 },
        { translateY: -active * 2 },
      ],
    };
  });

  return (
    <Animated.Text allowFontScaling={false} style={[styles.letter, style]}>
      {char}
    </Animated.Text>
  );
}

function Caption({ text }: { text: string }) {
  return (
    <Animated.Text allowFontScaling={false} style={styles.caption}>
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  ringGlow: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: FUTURE_YOU_GOLD,
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  word: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  letter: {
    color: FUTURE_YOU_GOLD,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  caption: {
    color: "rgba(212, 184, 138, 0.78)",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});
