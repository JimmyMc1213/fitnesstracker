import { formatWeeklyRateLbsPerWeek } from "@newyouai/core";
import type { AdjustmentEvent, WeightUnit } from "@newyouai/types";
import { Text, View } from "react-native";

import { ProgressSectionLabel } from "@/components/progress/ProgressSectionLabel";
import { useAppTheme } from "@/hooks/useAppTheme";

function shortWeekEnding(dateKey: string): string {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type Props = {
  adjustmentHistory: AdjustmentEvent[];
  weightUnit: WeightUnit;
};

export function FuelUpdatesSection({ adjustmentHistory, weightUnit }: Props) {
  const { colors } = useAppTheme();
  const entries = adjustmentHistory.slice(0, 6);

  if (entries.length === 0) return null;

  return (
    <>
      <ProgressSectionLabel>Fuel updates</ProgressSectionLabel>
      <View
        className="rounded-[14px] border p-[18px]"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        {entries.map((ev, idx) => (
          <View
            key={`${ev.atIso}-${ev.weekEndingSunday}`}
            className="flex-row items-start justify-between gap-3"
            style={{
              paddingTop: idx > 0 ? 12 : 0,
              borderTopWidth: idx > 0 ? 0.5 : 0,
              borderTopColor: colors.border,
            }}
          >
            <Text
              className="shrink-0 text-xs tabular-nums"
              style={{ color: colors.textSecondary }}
            >
              {shortWeekEnding(ev.weekEndingSunday)}
            </Text>
            <View className="min-w-0 flex-1 items-end">
              <Text
                className="text-xs font-semibold tabular-nums"
                style={{ color: colors.textPrimary }}
              >
                {ev.before.cal}→{ev.after.cal} cal · {formatWeeklyRateLbsPerWeek(ev.weeklyLossLbs, weightUnit)}
              </Text>
              {ev.recommendedDeltaCal != null &&
              ev.appliedDeltaCal != null &&
              ev.recommendedDeltaCal !== ev.appliedDeltaCal ? (
                <Text
                  className="mt-1 text-[10px] tabular-nums"
                  style={{ color: colors.textTertiary }}
                >
                  rec {ev.recommendedDeltaCal >= 0 ? "+" : ""}
                  {ev.recommendedDeltaCal} · applied {ev.appliedDeltaCal >= 0 ? "+" : ""}
                  {ev.appliedDeltaCal}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </>
  );
}
