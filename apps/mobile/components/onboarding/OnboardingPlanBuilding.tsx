import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  cancelAnimation,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { OnboardingContentReveal } from "@/components/motion/ScreenTransition";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { GradientCard } from "@/components/ui/GradientCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";

const BUILD_DURATION_MS = 12500;
/** Brief hold at 100% before advancing — matches PWA plan-building completion. */
const COMPLETION_HOLD_MS = 350;
const BAR_HEIGHT = 12;
const SHIMMER_WIDTH = 96;
const SHIMMER_DURATION_MS = 1500;

const STATUS_MESSAGES = [
  "Analyzing your profile…",
  "Calculating your nutrition targets…",
  "Building your workout split…",
  "Selecting exercises for your equipment…",
  "Finalizing your coaching plan…",
];

const PLAN_ITEMS = [
  { id: "calories", label: "Calories", completeAt: 18 },
  { id: "protein", label: "Protein", completeAt: 28 },
  { id: "carbs", label: "Carbs", completeAt: 38 },
  { id: "fats", label: "Fats", completeAt: 48 },
  { id: "split", label: "Workout split", completeAt: 62 },
  { id: "exercises", label: "Exercise selection", completeAt: 74 },
  { id: "volume", label: "Weekly volume", completeAt: 96 },
];

function PlanRow({
  label,
  done,
  reduceMotion,
  doneColor,
  mutedColor,
}: {
  label: string;
  done: boolean;
  reduceMotion: boolean;
  doneColor: string;
  mutedColor: string;
}) {
  const v = useSharedValue(done ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      v.value = done ? 1 : 0;
      return;
    }
    v.value = withTiming(done ? 1 : 0, { duration: 420, easing: Easing.out(Easing.cubic) });
  }, [done, reduceMotion, v]);

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(v.value, [0, 1], [mutedColor, doneColor]),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: v.value,
    // Settle in from a near-formed shape, never from scale(0).
    transform: [{ scale: 0.65 + v.value * 0.35 }],
  }));

  return (
    <View style={styles.row}>
      <Animated.Text style={[styles.rowLabel, labelStyle]}>{label}</Animated.Text>
      <Animated.Text style={[styles.check, { color: doneColor }, checkStyle]}>✓</Animated.Text>
    </View>
  );
}

export function OnboardingPlanBuilding({ onComplete }: { onComplete: () => void }) {
  const { colors } = useAppTheme();
  const { ob } = useOnboardingTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const finishedRef = useRef(false);

  const [trackWidth, setTrackWidth] = useState(0);
  const [pct, setPct] = useState(0);

  const progress = useSharedValue(0);
  const shimmerT = useSharedValue(0);

  useEffect(() => {
    let holdTimer: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onCompleteRef.current();
    };

    const finishAfterHold = () => {
      holdTimer = setTimeout(finish, COMPLETION_HOLD_MS);
    };

    progress.value = withTiming(
      1,
      // Match PWA easeOutCubic — fast early progress, slow crawl toward 100%.
      { duration: BUILD_DURATION_MS, easing: Easing.out(Easing.cubic) },
      (done) => {
        if (done) runOnJS(finishAfterHold)();
      },
    );

    if (!reduceMotion) {
      shimmerT.value = withRepeat(
        withTiming(1, { duration: SHIMMER_DURATION_MS, easing: Easing.inOut(Easing.ease) }),
        -1,
        false,
      );
    }

    return () => {
      clearTimeout(holdTimer);
      cancelAnimation(progress);
      cancelAnimation(shimmerT);
    };
  }, [progress, shimmerT, reduceMotion]);

  useAnimatedReaction(
    () => Math.round(progress.value * 100),
    (current, previous) => {
      if (current !== previous) runOnJS(setPct)(current);
    },
  );

  const fillStyle = useAnimatedStyle(() => ({
    width: progress.value * trackWidth,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -SHIMMER_WIDTH + shimmerT.value * (trackWidth + SHIMMER_WIDTH) }],
  }));

  const statusIndex = Math.min(
    STATUS_MESSAGES.length - 1,
    Math.floor((pct / 100) * STATUS_MESSAGES.length),
  );

  return (
    <View
      testID="onboarding-step-20"
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + 40,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 23,
      }}
    >
      <OnboardingContentReveal delay={40}>
        <Text
          style={{
            color: colors.textPrimary,
            textAlign: "center",
            fontSize: 56,
            fontWeight: "800",
            letterSpacing: -1.5,
            fontVariant: ["tabular-nums"],
          }}
        >
          {pct}%
        </Text>
        <Text
          style={{
            marginTop: 14,
            textAlign: "center",
            fontSize: 22,
            fontWeight: "700",
            letterSpacing: -0.4,
            color: colors.textPrimary,
          }}
        >
          We&apos;re setting everything up for you
        </Text>
        <Text
          style={{
            marginTop: 8,
            textAlign: "center",
            fontSize: 14,
            lineHeight: 20,
            color: ob.mutedFg,
          }}
        >
          Tailoring every detail to your goals and stats
        </Text>
      </OnboardingContentReveal>

      <OnboardingContentReveal delay={130}>
        <View style={{ marginTop: 28 }}>
          <View
            style={{
              height: BAR_HEIGHT,
              borderRadius: BAR_HEIGHT / 2,
              backgroundColor: ob.progressTrack,
              overflow: "hidden",
            }}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          >
            <Animated.View style={[styles.fill, fillStyle]}>
              {trackWidth > 0 ? (
                <Svg width={trackWidth} height={BAR_HEIGHT} style={StyleSheet.absoluteFill}>
                  <Defs>
                    <LinearGradient id="planFill" x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0" stopColor={ob.gold} stopOpacity={0.9} />
                      <Stop offset="1" stopColor={ob.goldMid} stopOpacity={1} />
                    </LinearGradient>
                  </Defs>
                  <Rect x={0} y={0} width={trackWidth} height={BAR_HEIGHT} fill="url(#planFill)" />
                </Svg>
              ) : null}

              {!reduceMotion && trackWidth > 0 ? (
                <Animated.View style={[styles.shimmer, shimmerStyle]}>
                  <Svg width={SHIMMER_WIDTH} height={BAR_HEIGHT}>
                    <Defs>
                      <LinearGradient id="planShimmer" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor="#ffffff" stopOpacity={0} />
                        <Stop offset="0.5" stopColor="#ffffff" stopOpacity={0.5} />
                        <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
                      </LinearGradient>
                    </Defs>
                    <Rect x={0} y={0} width={SHIMMER_WIDTH} height={BAR_HEIGHT} fill="url(#planShimmer)" />
                  </Svg>
                </Animated.View>
              ) : null}
            </Animated.View>
          </View>

          <Text
            style={{
              marginTop: 14,
              textAlign: "center",
              fontSize: 13,
              letterSpacing: 0.2,
              color: colors.textSecondary,
            }}
          >
            {STATUS_MESSAGES[statusIndex]}
          </Text>
        </View>
      </OnboardingContentReveal>

      <OnboardingContentReveal delay={220}>
        <GradientCard style={{ marginTop: 34 }} spacious>
          <Text
            style={{
              marginBottom: 14,
              fontSize: 13,
              fontWeight: "600",
              letterSpacing: 0.3,
              textTransform: "uppercase",
              color: colors.textSecondary,
            }}
          >
            Your personalized program
          </Text>
          {PLAN_ITEMS.map((item) => (
            <PlanRow
              key={item.id}
              label={item.label}
              done={pct >= item.completeAt}
              reduceMotion={reduceMotion}
              doneColor={colors.textPrimary}
              mutedColor={colors.textSecondary}
            />
          ))}
        </GradientCard>
      </OnboardingContentReveal>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    height: BAR_HEIGHT,
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SHIMMER_WIDTH,
    height: BAR_HEIGHT,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rowLabel: {
    fontSize: 15,
  },
  check: {
    fontSize: 15,
    fontWeight: "700",
  },
});
