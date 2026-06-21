import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { PURCHASE_CONFIRMING_MORPH_MS } from "@/lib/splashTiming";
const RING_SIZE = 56;
const STROKE = 2.5;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Props = {
  /** When true, morph the spinner into a checkmark. */
  confirmed: boolean;
  onMorphComplete?: () => void;
};

export function OnboardingPurchaseConfirmingScreen({ confirmed, onMorphComplete }: Props) {
  const { scheme, colors, ob } = useOnboardingTheme();
  const spin = useSharedValue(0);
  const morph = useSharedValue(0);
  const morphDoneRef = useRef(false);

  const isLight = scheme === "light";
  const trackColor = isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.1)";
  const titleColor = colors.textPrimary;
  const subtitleColor = colors.textSecondary;

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.linear }),
      -1,
      false,
    );
  }, [spin]);

  useEffect(() => {
    if (!confirmed || morphDoneRef.current) return;
    morphDoneRef.current = true;
    morph.value = withTiming(1, {
      duration: PURCHASE_CONFIRMING_MORPH_MS,
      easing: Easing.out(Easing.cubic),
    });
    const timer = setTimeout(() => onMorphComplete?.(), PURCHASE_CONFIRMING_MORPH_MS);
    return () => clearTimeout(timer);
  }, [confirmed, morph, onMorphComplete]);

  const spinnerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 0.55], [1, 0], "clamp"),
    transform: [
      { rotate: `${spin.value * 360}deg` },
      { scale: interpolate(morph.value, [0, 1], [1, 0.92], "clamp") },
    ],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0.35, 1], [0, 1], "clamp"),
    transform: [{ scale: interpolate(morph.value, [0.35, 1], [0.88, 1], "clamp") }],
  }));

  return (
    <View
      testID="onboarding-purchase-confirming"
      style={[styles.root, { backgroundColor: colors.background }]}
    >
      <View style={styles.indicatorWrap}>
        <Animated.View style={[styles.ringLayer, spinnerStyle]}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={trackColor}
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={ob.gold}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE * 0.28} ${CIRCUMFERENCE * 0.72}`}
              rotation={-90}
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          </Svg>
        </Animated.View>

        <Animated.View style={[styles.ringLayer, checkStyle]}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={ob.gold}
              strokeWidth={STROKE}
              fill="none"
            />
            <Path
              d="M22 29 L27 34 L36 23"
              stroke={ob.gold}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Animated.View>
      </View>

      <Text style={[styles.title, { color: titleColor }]}>
        {confirmed ? "Purchase confirmed" : "Confirming your purchase"}
      </Text>
      <Text style={[styles.subtitle, { color: subtitleColor }]}>
        {confirmed ? "Welcome to NewYouAI" : "Securing your membership…"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  indicatorWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    marginBottom: 28,
  },
  ringLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 20,
  },
});
