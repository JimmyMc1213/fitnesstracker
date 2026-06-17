import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatWorkoutDuration, weekdayFullName } from "@newyouai/core";

type Props = {
  elapsedSec: number;
  sessionTitle: string;
  onSessionTitleChange: (text: string) => void;
  startedAt: string;
  splitDay?: string;
  exerciseCount: number;
  onFinishWorkout: () => void;
  onCancel?: () => void;
  /** Stacked metadata lines for flat workout pilot. */
  metaLayout?: "inline" | "stacked";
};

export function WorkoutSessionHeader({
  elapsedSec,
  sessionTitle,
  onSessionTitleChange,
  startedAt,
  splitDay,
  exerciseCount,
  onFinishWorkout,
  onCancel,
  metaLayout = "inline",
}: Props) {
  const { colors } = useAppTheme();
  const stackedMeta = metaLayout === "stacked";
  const exerciseLabel = `${exerciseCount} exercise${exerciseCount === 1 ? "" : "s"}`;
  const splitDayLabel = splitDay?.trim() ? weekdayFullName(splitDay.trim()) : undefined;

  return (
    <View testID="workout-session-header" className="pt-2">
      <View className="mb-1 flex-row items-center justify-between">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <Text style={{ fontSize: 20, lineHeight: 1 }} accessibilityElementsHidden>
            ⏱
          </Text>
          <Text
            className="text-xl font-bold tabular-nums tracking-tight"
            style={{ color: colors.textPrimary }}
          >
            {formatWorkoutDuration(elapsedSec)}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {onCancel ? (
            <Pressable
              testID="workout-cancel"
              onPress={onCancel}
              accessibilityLabel="Cancel workout"
              className="h-10 w-10 items-center justify-center rounded-[10px] border"
              style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕</Text>
            </Pressable>
          ) : null}
          <PrimaryButton testID="workout-finish" onPress={onFinishWorkout} style={{ minHeight: 40, paddingVertical: 10, paddingHorizontal: 18 }}>
            Finish workout
          </PrimaryButton>
        </View>
      </View>

      <TextInput
        value={sessionTitle}
        onChangeText={onSessionTitleChange}
        placeholder="Workout name"
        placeholderTextColor={colors.textTertiary}
        className={`mt-1.5 w-full py-1.5 font-bold tracking-tight ${stackedMeta ? "text-[26px]" : "text-xl"}`}
        style={{ color: colors.textPrimary }}
      />

      {stackedMeta ? (
        <View className="mb-2.5 mt-1.5 gap-1">
          <Text className="text-sm font-medium" style={{ color: colors.textTertiary }}>
            Started {startedAt}
          </Text>
          {splitDayLabel ? (
            <Text className="text-sm font-medium" style={{ color: colors.textTertiary }}>
              {splitDayLabel}
            </Text>
          ) : null}
          <Text className="text-sm font-medium" style={{ color: colors.textTertiary }}>
            {exerciseLabel}
          </Text>
        </View>
      ) : (
        <Text className="mb-2.5 mt-1 text-xs font-medium" style={{ color: colors.textTertiary }}>
          Started {startedAt}
          {splitDayLabel ? ` · ${splitDayLabel}` : ""} · {exerciseLabel}
        </Text>
      )}
    </View>
  );
}

export function useSessionElapsedSec(sessionStartedAtMs: number | null, active: boolean): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active || sessionStartedAtMs == null) return;
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [active, sessionStartedAtMs]);

  if (!active || sessionStartedAtMs == null) return 0;
  void tick;
  return Math.max(0, Math.floor((Date.now() - sessionStartedAtMs) / 1000));
}
