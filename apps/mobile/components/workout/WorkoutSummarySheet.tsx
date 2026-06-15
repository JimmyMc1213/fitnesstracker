import { Modal, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomActionBar } from "@/components/BottomActionBar";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatWorkoutDuration, LBS_PER_KG } from "@newyouai/core";
import type { UnitPreferences, WorkoutSessionSummary } from "@newyouai/types";

type Props = {
  open: boolean;
  summary: WorkoutSessionSummary;
  unitPreferences: UnitPreferences;
  onDone: () => void;
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-1 rounded-xl border px-2.5 py-3.5"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <Text
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: colors.textTertiary }}
      >
        {label}
      </Text>
      <Text
        className="mt-1.5 text-xl font-bold tabular-nums tracking-tight"
        style={{ color: colors.textPrimary }}
      >
        {value}
      </Text>
      {sub ? (
        <Text className="mt-0.5 text-[10px] font-medium" style={{ color: colors.textTertiary }}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

export function WorkoutSummarySheet({ open, summary, unitPreferences, onDone }: Props) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const volLabel = unitPreferences.weightUnit === "kg" ? "kg·reps" : "lb·reps";
  const displayVolume =
    summary.totalVolume > 0 && unitPreferences.weightUnit === "kg"
      ? Math.round(summary.totalVolume / LBS_PER_KG)
      : summary.totalVolume;

  return (
    <Modal visible={open} animationType="fade" presentationStyle="fullScreen" onRequestClose={onDone}>
      <View
        testID="workout-summary"
        className="flex-1"
        style={{ backgroundColor: colors.background, paddingTop: insets.top }}
      >
        <ScrollView
          className="flex-1 px-screen-x"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <View className="items-center pb-2 pt-7">
            <Text style={{ fontSize: 48, lineHeight: 1, marginBottom: 12 }} accessibilityElementsHidden>
              🎉
            </Text>
            <Text
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: colors.textTertiary }}
            >
              Workout complete
            </Text>
            <Text
              className="mt-2.5 text-[26px] font-bold tracking-tight"
              style={{ color: colors.textPrimary }}
            >
              {summary.title}
            </Text>
            <Text className="mt-1 text-sm font-medium" style={{ color: colors.textSecondary }}>
              Nice work, session saved
            </Text>
          </View>

          <View className="mt-6 flex-row gap-2.5">
            <StatCard label="Duration" value={formatWorkoutDuration(summary.durationSec)} />
            <StatCard
              label="Sets"
              value={`${summary.doneSets}/${summary.totalSets}`}
              sub={summary.totalSets > 0 ? "done" : undefined}
            />
            <StatCard
              label="Volume"
              value={summary.totalVolume > 0 ? displayVolume.toLocaleString() : "—"}
              sub={summary.totalVolume > 0 ? volLabel : undefined}
            />
          </View>

          <View className="mt-7">
            <View className="mb-2.5 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="text-[15px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                  Personal records
                </Text>
                {summary.prs.length > 0 ? (
                  <Text
                    className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: colors.accent, backgroundColor: `${colors.accent}22` }}
                  >
                    {summary.prs.length} new
                  </Text>
                ) : null}
              </View>
            </View>
            {summary.prs.length > 0 ? (
              <View className="gap-2">
                {summary.prs.map((pr) => (
                  <View
                    key={`${pr.exerciseName}-${pr.detail}`}
                    className="flex-row items-center justify-between gap-3 rounded-xl border px-3.5 py-3"
                    style={{ borderColor: `${colors.accent}55`, backgroundColor: `${colors.accent}0d` }}
                  >
                    <View className="min-w-0 flex-1">
                      <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                        {pr.exerciseName}
                      </Text>
                      <Text className="mt-0.5 text-xs font-medium" style={{ color: colors.textSecondary }}>
                        {pr.detail}
                      </Text>
                    </View>
                    <Text
                      className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: colors.accent, backgroundColor: `${colors.accent}22` }}
                    >
                      PR
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-[13px] leading-[1.5]" style={{ color: colors.textTertiary }}>
                No PRs this session, keep stacking weight and reps.
              </Text>
            )}
          </View>
        </ScrollView>

        <BottomActionBar
          className="border-t px-screen-x pt-3"
          bordered
          borderColor={colors.border}
          style={{ backgroundColor: colors.background }}
        >
          <PrimaryButton block onPress={onDone}>
            Back to workouts
          </PrimaryButton>
        </BottomActionBar>
      </View>
    </Modal>
  );
}
