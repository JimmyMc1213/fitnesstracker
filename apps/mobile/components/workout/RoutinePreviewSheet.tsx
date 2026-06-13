import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import type { PreWorkoutCoachBrief } from "@/lib/preWorkoutCoachBrief";
import { COACH_BLUE_LABEL, coachCardColors } from "@/lib/workoutUiTokens";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { WorkoutRoutineTemplate } from "@newyouai/types";

type Props = {
  open: boolean;
  template: WorkoutRoutineTemplate;
  coachBrief?: PreWorkoutCoachBrief;
  onClose: () => void;
  onOpenMenu: () => void;
  onStart: () => void;
};

export function RoutinePreviewSheet({
  open,
  template,
  coachBrief,
  onClose,
  onOpenMenu,
  onStart,
}: Props) {
  const { colors, theme } = useAppTheme();
  const coachCard = coachCardColors(theme);
  const totalSets = template.exercises.reduce((a, e) => a + e.sets.length, 0);

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View
          testID="routine-preview-sheet"
          className="max-h-[78%] rounded-t-2xl"
          style={{ backgroundColor: colors.card }}
        >
          <View className="px-4 pb-2 pt-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text
                  className="mb-1 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: colors.textTertiary }}
                >
                  {template.dayLabel.trim() || "Workout"}
                </Text>
                <Text className="text-xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                  {template.name}
                </Text>
              </View>
              <Pressable
                onPress={onOpenMenu}
                accessibilityLabel={`Options for ${template.name}`}
                className="h-9 w-9 items-center justify-center"
              >
                <Text style={{ color: colors.textSecondary, fontSize: 20 }}>⋮</Text>
              </Pressable>
            </View>

            {template.focus.trim() ? (
              <Text className="mt-2 text-xs leading-[1.45]" style={{ color: colors.textSecondary }}>
                {template.focus}
              </Text>
            ) : null}

            <Text className="mt-2 text-[11px] font-medium tabular-nums" style={{ color: colors.textTertiary }}>
              {template.exercises.length} exercise{template.exercises.length === 1 ? "" : "s"} · {totalSets} set
              {totalSets === 1 ? "" : "s"}
            </Text>

            {coachBrief ? (
              <View
                className="mt-3 rounded-[10px] border px-3 py-2.5"
                style={{ borderColor: coachCard.border, backgroundColor: coachCard.background }}
              >
                <Text
                  className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: COACH_BLUE_LABEL }}
                >
                  Coach
                </Text>
                <Text className="text-[13px] font-semibold leading-[1.45]" style={{ color: colors.textPrimary }}>
                  {coachBrief.headline}
                </Text>
                {coachBrief.rationale ? (
                  <Text className="mt-1.5 text-xs font-medium leading-[1.45]" style={{ color: colors.textSecondary }}>
                    {coachBrief.rationale}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>

          <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 16 }}>
            {template.exercises.map((ex, i) => (
              <View
                key={ex.id}
                className="mb-2 flex-row items-start gap-2.5 rounded-xl border px-3 py-2.5"
                style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
              >
                <Text className="min-w-[18px] text-[11px] font-semibold tabular-nums" style={{ color: colors.textTertiary }}>
                  {i + 1}
                </Text>
                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
                    {ex.name}
                  </Text>
                  <Text className="mt-0.5 text-xs font-medium" style={{ color: colors.textTertiary }}>
                    {ex.target.trim() || `${ex.sets.length} sets`}
                    {ex.target.trim() ? ` · ${ex.sets.length} set${ex.sets.length === 1 ? "" : "s"}` : ""}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View className="border-t px-4 pb-8 pt-3" style={{ borderColor: colors.border }}>
            <PrimaryButton
              block
              testID={`workout-start-${template.id}`}
              onPress={onStart}
              disabled={template.exercises.length === 0}
            >
              Start workout
            </PrimaryButton>
            {template.exercises.length === 0 ? (
              <Text className="mt-2 text-center text-[11px]" style={{ color: colors.textTertiary }}>
                Add exercises before starting.
              </Text>
            ) : (
              <Pressable onPress={onClose} className="mt-2 items-center py-2">
                <Text className="text-sm font-semibold" style={{ color: colors.textTertiary }}>
                  Cancel
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
