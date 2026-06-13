import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import { useAppTheme } from "@/hooks/useAppTheme";

function formatElapsed(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Props = {
  elapsedSec: number;
  sessionTitle: string;
  onSessionTitleChange: (text: string) => void;
  startedAt: string;
  splitDay?: string;
  exerciseCount: number;
  onFinishWorkout: () => void;
  onCancel?: () => void;
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
}: Props) {
  const { colors } = useAppTheme();

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
            {formatElapsed(elapsedSec)}
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
        className="mt-1.5 w-full py-1.5 text-xl font-bold tracking-tight"
        style={{ color: colors.textPrimary }}
      />

      <Text className="mb-2.5 mt-1 text-xs font-medium" style={{ color: colors.textTertiary }}>
        Started {startedAt}
        {splitDay ? ` · ${splitDay}` : ""} · {exerciseCount} exercise{exerciseCount === 1 ? "" : "s"}
      </Text>
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
