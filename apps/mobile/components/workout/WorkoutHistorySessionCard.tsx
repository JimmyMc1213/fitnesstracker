import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { COACH_BLUE_LABEL } from "@/lib/workoutUiTokens";
import { formatWorkoutHistoryDate } from "@/lib/workout/workoutHistory";
import {
  countSessionPersonalRecords,
  formatSessionVolume,
  historyExerciseRows,
  sessionLoggedVolume,
} from "@/lib/workout/workoutHistorySessionStats";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatWorkoutDuration } from "@newyouai/core";
import type { CompletedWorkoutSession, WeightUnit } from "@newyouai/types";

type Props = {
  session: CompletedWorkoutSession;
  workoutHistory: CompletedWorkoutSession[] | undefined;
  weightUnit: WeightUnit;
  onOpen: () => void;
  onShowActions: () => void;
  onDelete: () => void;
};

export function WorkoutHistorySessionCard({
  session,
  workoutHistory,
  weightUnit,
  onOpen,
  onShowActions,
  onDelete,
}: Props) {
  const { colors } = useAppTheme();
  const volume = sessionLoggedVolume(session);
  const prCount = countSessionPersonalRecords(session, workoutHistory);
  const rows = historyExerciseRows(session, weightUnit);

  return (
    <View
      testID={`workout-history-session-${session.id}`}
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <View className="flex-row items-start gap-2 px-3.5 pb-2.5 pt-3">
        <Pressable onPress={onOpen} className="min-w-0 flex-1">
          <Text className="text-base font-bold tracking-tight" style={{ color: colors.textPrimary }}>
            {session.title}
          </Text>
          <Text className="mt-1 text-xs font-medium" style={{ color: colors.textTertiary }}>
            {formatWorkoutHistoryDate(session.dayKey, session.endedAtMs)}
          </Text>
        </Pressable>
        <Pressable
          testID={`workout-history-session-${session.id}-menu`}
          accessibilityLabel={`Options for ${session.title}`}
          onPress={onShowActions}
          className="h-8 w-8 items-center justify-center rounded-full border"
          style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
        >
          <Text className="text-base font-bold" style={{ color: COACH_BLUE_LABEL }}>
            ···
          </Text>
        </Pressable>
      </View>

      <Pressable onPress={onOpen} className="px-3.5 pb-2.5">
        <Text className="text-xs font-semibold tabular-nums" style={{ color: colors.textTertiary }}>
          {[
            formatWorkoutDuration(session.durationSec),
            formatSessionVolume(volume, weightUnit),
            prCount > 0 ? `${prCount} PR${prCount === 1 ? "" : "s"}` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </Text>
      </Pressable>

      {rows.length > 0 ? (
        <View className="border-t px-3.5 pb-3 pt-2" style={{ borderColor: colors.border }}>
          <View className="mb-1.5 flex-row justify-between">
            <Text
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: colors.textTertiary }}
            >
              Exercise
            </Text>
            <Text
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: colors.textTertiary }}
            >
              Best set
            </Text>
          </View>
          {rows.map((row) => (
            <View key={`${row.name}-${row.label ?? ""}`} className="flex-row justify-between py-1">
              <Text
                className="min-w-0 flex-1 text-[13px] font-medium"
                numberOfLines={1}
                style={{ color: colors.textSecondary }}
              >
                {row.setCount} × {row.name}
              </Text>
              <Text className="shrink-0 text-[13px] font-medium tabular-nums" style={{ color: colors.textTertiary }}>
                {row.bestDetail}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View className="flex-row border-t" style={{ borderColor: colors.border }}>
        <Pressable onPress={onOpen} className="flex-1 items-center py-2.5">
          <Text className="text-xs font-semibold" style={{ color: COACH_BLUE_LABEL }}>
            View details
          </Text>
        </Pressable>
        <Pressable
          testID={`workout-history-session-${session.id}-delete`}
          accessibilityLabel={`Delete ${session.title}`}
          onPress={onDelete}
          className="items-center border-l px-4 py-2.5"
          style={{ borderColor: colors.border }}
        >
          <Text className="text-xs font-semibold" style={{ color: "#FF453A" }}>
            Delete
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
