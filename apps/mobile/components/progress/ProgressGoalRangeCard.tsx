import { LBS_PER_KG, weightUnitLabel } from "@newyouai/core";
import type { ProgressGoalConfig, WeightUnit } from "@newyouai/types";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  progressGoal: ProgressGoalConfig | null | undefined;
  todayWeightLbs: number;
  goalPct: number;
  weightUnit: WeightUnit;
};

export function ProgressGoalRangeCard({ progressGoal, todayWeightLbs, goalPct, weightUnit }: Props) {
  const { colors } = useAppTheme();
  const goalLo = progressGoal?.goalWeightLowLbs;
  const goalHi = progressGoal?.goalWeightHighLbs;
  const goalLoDisplay = goalLo != null ? (weightUnit === "kg" ? goalLo / LBS_PER_KG : goalLo) : null;
  const goalHiDisplay = goalHi != null ? (weightUnit === "kg" ? goalHi / LBS_PER_KG : goalHi) : null;
  const todayDisplay = weightUnit === "kg" ? todayWeightLbs / LBS_PER_KG : todayWeightLbs;
  const hasGoal = progressGoal && goalLoDisplay != null && goalHiDisplay != null;

  return (
    <View
      testID="progress-goal-range"
      className="rounded-[14px] border p-[18px]"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      {hasGoal ? (
        <>
          <View className="flex-row items-baseline justify-between">
            <Text
              className="text-[22px] font-bold tracking-tight tabular-nums"
              style={{ color: colors.textPrimary }}
            >
              {todayDisplay.toFixed(1)}{" "}
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>→</Text>{" "}
              {goalLoDisplay.toFixed(1)}–{goalHiDisplay.toFixed(1)}
              <Text
                className="ml-1.5 text-[10px] font-medium uppercase tracking-widest"
                style={{ color: colors.textTertiary }}
              >
                {" "}
                {weightUnitLabel(weightUnit)}
              </Text>
            </Text>
            <Text
              className="text-xs font-semibold tabular-nums"
              style={{ color: colors.textPrimary }}
            >
              {Math.round(goalPct * 100)}%
            </Text>
          </View>

          <Text
            className="mt-3 text-[11px] leading-[16px]"
            style={{ color: colors.textSecondary }}
          >
            ~{weightUnit === "kg" ? "0.5" : "1"} {weightUnitLabel(weightUnit)}/wk · read trend over a few weeks
          </Text>

          <View
            className="mt-3.5 h-1 overflow-hidden rounded-full"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <View
              className="h-full rounded-full"
              style={{ width: `${goalPct * 100}%`, backgroundColor: colors.accent }}
            />
          </View>
        </>
      ) : (
        <Text className="text-[13px] leading-[20px]" style={{ color: colors.textSecondary }}>
          Complete onboarding to set your goal weight range.
        </Text>
      )}
    </View>
  );
}
