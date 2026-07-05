import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import { coreAlignedInputStyle } from "@/components/ui/AlignedTextInput";
import { dismissKeyboard } from "@/lib/keyboard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatWorkoutDuration, weekdayFullName } from "@newyouai/core";

type Props = {
  sessionStartedAtMs: number | null;
  sessionActive: boolean;
  sessionTitle: string;
  onSessionTitleChange: (text: string) => void;
  startedAt: string;
  splitDay?: string;
  exerciseCount: number;
  onFinishWorkout: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  /** Stacked metadata lines for flat workout pilot. */
  metaLayout?: "inline" | "stacked";
};

/**
 * Owns the 1s ticking state so only this small text node re-renders each second,
 * instead of the whole workout screen.
 */
function SessionElapsedClock({
  sessionStartedAtMs,
  sessionActive,
  color,
}: {
  sessionStartedAtMs: number | null;
  sessionActive: boolean;
  color: string;
}) {
  const elapsedSec = useSessionElapsedSec(sessionStartedAtMs, sessionActive);
  return (
    <Text className="text-xl font-bold tabular-nums tracking-tight" style={{ color }}>
      {formatWorkoutDuration(elapsedSec)}
    </Text>
  );
}

export function WorkoutSessionHeader({
  sessionStartedAtMs,
  sessionActive,
  sessionTitle,
  onSessionTitleChange,
  startedAt,
  splitDay,
  exerciseCount,
  onFinishWorkout,
  onBack,
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
          {onBack ? (
            <Pressable
              testID="workout-back"
              onPress={onBack}
              accessibilityLabel="Back"
              className="h-10 w-10 items-center justify-center rounded-[10px] border"
              style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
            >
              <SymbolView
                name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }}
                tintColor={colors.textSecondary}
                size={18}
              />
            </Pressable>
          ) : null}
          <Text style={{ fontSize: 20, lineHeight: 1 }} accessibilityElementsHidden>
            ⏱
          </Text>
          <SessionElapsedClock
            sessionStartedAtMs={sessionStartedAtMs}
            sessionActive={sessionActive}
            color={colors.textPrimary}
          />
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
        returnKeyType="done"
        blurOnSubmit
        onSubmitEditing={dismissKeyboard}
        className="mt-1.5 w-full font-bold tracking-tight"
        style={[
          coreAlignedInputStyle(stackedMeta ? 26 : 20),
          { color: colors.textPrimary, fontWeight: "700", width: "100%" },
        ]}
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
