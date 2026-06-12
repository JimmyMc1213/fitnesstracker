import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/useAppTheme";

const BUILD_DURATION_MS = 3500;

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

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function progressFromElapsed(elapsedMs: number): number {
  const raw = Math.min(1, elapsedMs / BUILD_DURATION_MS);
  return Math.round(easeOutCubic(raw) * 100);
}

export function OnboardingPlanBuilding({ onComplete }: { onComplete: () => void }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const startRef = useRef(Date.now());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = startRef.current;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(progressFromElapsed(elapsed));
      if (elapsed >= BUILD_DURATION_MS) {
        clearInterval(interval);
        onCompleteRef.current();
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const statusIndex = Math.min(
    STATUS_MESSAGES.length - 1,
    Math.floor((progress / 100) * STATUS_MESSAGES.length),
  );

  return (
    <View
      testID="onboarding-step-20"
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + 32,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 23,
      }}
    >
      <Text className="text-center text-5xl font-bold" style={{ color: colors.accent }}>
        {progress}%
      </Text>
      <Text className="mt-4 text-center text-2xl font-bold" style={{ color: colors.textPrimary }}>
        We&apos;re setting everything up for you
      </Text>

      <View className="mt-6">
        <View className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: colors.border }}>
          <View
            className="h-full rounded-full"
            style={{ width: `${progress}%`, backgroundColor: colors.accent }}
          />
        </View>
        <Text className="mt-3 text-center text-sm" style={{ color: colors.textSecondary }}>
          {STATUS_MESSAGES[statusIndex]}
        </Text>
      </View>

      <View
        className="mt-8 rounded-2xl border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <Text className="mb-3 text-sm font-semibold" style={{ color: colors.textSecondary }}>
          Your personalized program
        </Text>
        {PLAN_ITEMS.map((item) => {
          const done = progress >= item.completeAt;
          return (
            <View key={item.id} className="mb-2 flex-row items-center justify-between">
              <Text
                className="text-sm"
                style={{ color: done ? colors.accent : colors.textSecondary }}
              >
                {item.label}
              </Text>
              {done ? (
                <Text className="text-sm" style={{ color: colors.accent }}>
                  ✓
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
