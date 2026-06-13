import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import { formatWorkoutHistoryDate } from "@/lib/workout/workoutHistory";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatSetWeight, formatWorkoutDuration, LBS_PER_KG, weightUnitLabel } from "@newyouai/core";
import type { CompletedWorkoutSession, UnitPreferences } from "@newyouai/types";

type Props = {
  open?: boolean;
  session: CompletedWorkoutSession;
  unitPreferences: UnitPreferences;
  onClose: () => void;
  onDelete?: () => void;
};

function formatSet(w: number, r: number, unit: UnitPreferences["weightUnit"]): string {
  if (w > 0) return `${formatSetWeight(w, unit)} ${weightUnitLabel(unit)} × ${r} rep${r === 1 ? "" : "s"}`;
  return `${r} rep${r === 1 ? "" : "s"}`;
}

export function WorkoutSessionPreviewSheet({
  open = true,
  session,
  unitPreferences,
  onClose,
  onDelete,
}: Props) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const weightUnit = unitPreferences.weightUnit;
  const totalSets = session.exercises.reduce((a, e) => a + e.sets.length, 0);
  const rawVolume = session.exercises.reduce(
    (a, e) => a + e.sets.reduce((b, st) => b + st.w * st.r, 0),
    0,
  );
  const displayVolume =
    rawVolume > 0 && weightUnit === "kg" ? Math.round(rawVolume / LBS_PER_KG) : rawVolume;
  const volLabel = weightUnit === "kg" ? "kg·reps" : "lb·reps";

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View
          testID="workout-session-preview-sheet"
          className="max-h-[82%] rounded-t-2xl"
          style={{ backgroundColor: colors.card, paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <View className="px-5 pb-0 pt-5">
            <Text
              className="mb-1 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: colors.textTertiary }}
            >
              {formatWorkoutHistoryDate(session.dayKey, session.endedAtMs)}
            </Text>
            <Text className="text-xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              {session.title}
            </Text>
            <Text className="mt-2 text-[11px] font-medium tabular-nums" style={{ color: colors.textTertiary }}>
              {formatWorkoutDuration(session.durationSec)}
              {" · "}
              {session.exercises.length} exercise{session.exercises.length === 1 ? "" : "s"}
              {" · "}
              {totalSets} set{totalSets === 1 ? "" : "s"}
              {rawVolume > 0 ? ` · ${displayVolume.toLocaleString()} ${volLabel}` : ""}
            </Text>
          </View>

          <ScrollView className="mt-3 px-5" contentContainerStyle={{ paddingBottom: 12 }}>
            {session.exercises.map((ex, i) => (
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
                    {ex.label ? (
                      <Text style={{ color: colors.textTertiary, fontWeight: "500" }}> · {ex.label}</Text>
                    ) : null}
                  </Text>
                  {ex.target.trim() ? (
                    <Text className="mt-0.5 text-[11px] font-medium" style={{ color: colors.textTertiary }}>
                      Target {ex.target}
                    </Text>
                  ) : null}
                  <View className="mt-2 gap-1">
                    {ex.sets.map((st, si) => (
                      <View
                        key={`${ex.id}-${si}`}
                        className="flex-row items-center justify-between rounded-lg border px-2.5 py-2"
                        style={{ borderColor: colors.border, backgroundColor: colors.card }}
                      >
                        <Text className="text-[11px] font-medium" style={{ color: colors.textTertiary }}>
                          Set {si + 1}
                        </Text>
                        <Text className="text-[13px] font-semibold tabular-nums" style={{ color: colors.textPrimary }}>
                          {formatSet(st.w, st.r, weightUnit)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View className="border-t px-5 pt-3" style={{ borderColor: colors.border }}>
            <PrimaryButton block onPress={onClose}>
              Close
            </PrimaryButton>
            {onDelete ? (
              <Pressable
                testID="workout-session-preview-delete"
                onPress={onDelete}
                className="mt-2.5 items-center py-2"
              >
                <Text className="text-[13px] font-semibold underline" style={{ color: "#FF453A" }}>
                  Delete workout
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}
