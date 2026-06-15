import { Text, View, Pressable } from "react-native";

import type { SundayCheckInData } from "@newyouai/core";
import { formatWeightFromLbs } from "@/lib/unitConversions";
import { weightUnitLabel } from "@/lib/unitLabels";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { UnitPreferences } from "@newyouai/types";

type Props = {
  data: SundayCheckInData;
  completed?: boolean;
  unitPreferences: UnitPreferences;
  onReview: () => void;
};

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const SUCCESS_GREEN = "#16a34a";

export function HomeSundayCheckInCard({ data, completed = false, unitPreferences, onReview }: Props) {
  const { colors } = useAppTheme();
  const wUnit = unitPreferences.weightUnit;
  const sundayDom = new Date(`${data.sundayKey}T12:00:00`).getDate();

  const weightPositive = data.weightDeltaLbs != null && data.weightDeltaLbs > 0;
  const weightNegative = data.weightDeltaLbs != null && data.weightDeltaLbs < 0;
  const weightText =
    data.weightDeltaLbs != null
      ? `${data.weightDeltaLbs > 0 ? "+" : ""}${formatWeightFromLbs(data.weightDeltaLbs, wUnit)} ${weightUnitLabel(wUnit)}`
      : null;

  return (
    <Pressable
      testID="sunday-check-in-card"
      onPress={onReview}
      accessibilityLabel={completed ? "View Sunday check-in recap" : "Open Sunday check-in"}
      className="mt-[18px] w-full rounded-xl border p-4"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-[11px] border"
          style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
        >
          <Text className="text-[8px] font-bold tracking-wider" style={{ color: colors.textSecondary }}>
            SUN
          </Text>
          <Text className="text-sm font-bold tabular-nums" style={{ color: colors.textPrimary }}>
            {sundayDom}
          </Text>
        </View>

        <View className="min-w-0 flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1">
              <Text
                className="mb-1 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: colors.textTertiary }}
              >
                Sunday check-in
              </Text>
              <Text className="text-[15px] font-semibold leading-tight tracking-tight" style={{ color: colors.textPrimary }}>
                Week {data.weekNumber} in the books
              </Text>
            </View>
            {completed ? <StatusBadge label="Done" /> : data.onTrack ? <StatusBadge label="On track" /> : null}
          </View>

          <Text className="mt-1.5 text-[11px] font-medium leading-[1.4]" style={{ color: colors.textSecondary }}>
            {data.workoutsCompleted}/{data.workoutsPlanned} workouts · {data.proteinDaysHit}/7 protein
            {weightText ? (
              <Text
                style={{
                  fontWeight: "600",
                  color: weightNegative ? SUCCESS_GREEN : weightPositive ? "#d97706" : colors.textSecondary,
                }}
              >
                {" · "}
                {weightText}
              </Text>
            ) : null}
          </Text>
        </View>
      </View>

      <WeekDayTracker cells={data.dayCells} />

      <Text className="mt-2.5 text-xs font-semibold" style={{ color: colors.textTertiary }}>
        {completed ? "View recap" : "Review the week"}
      </Text>
    </Pressable>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <Text
      className="rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide"
      style={{
        color: SUCCESS_GREEN,
        borderColor: "rgba(22, 163, 74, 0.18)",
        backgroundColor: "rgba(22, 163, 74, 0.1)",
      }}
    >
      {label}
    </Text>
  );
}

function WeekDayTracker({ cells }: { cells: SundayCheckInData["dayCells"] }) {
  const { colors } = useAppTheme();

  return (
    <View className="mt-3 flex-row justify-between gap-0.5">
      {cells.map((cell, i) => {
        const completed = cell.workoutDone;
        return (
          <View key={cell.dateKey} className="min-w-0 flex-1 items-center gap-0.5">
            <View
              className="h-[26px] w-[26px] items-center justify-center rounded-[7px] border"
              style={{
                backgroundColor: completed ? "rgba(22, 163, 74, 0.1)" : colors.backgroundSecondary,
                borderColor: completed ? "rgba(22, 163, 74, 0.18)" : colors.border,
              }}
            >
              {completed ? (
                <Text className="text-[10px]" style={{ color: SUCCESS_GREEN }}>
                  ✓
                </Text>
              ) : null}
            </View>
            <View
              className="h-0.5 w-[65%] rounded-full"
              style={{ backgroundColor: cell.proteinHit ? "rgba(22, 163, 74, 0.45)" : "transparent" }}
            />
            <Text className="text-[9px] font-semibold" style={{ color: colors.textTertiary }}>
              {DAY_LABELS[i] ?? cell.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
