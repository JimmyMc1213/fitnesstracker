import {
  AVERAGE_CAL_WEEK_OPTIONS,
  buildAverageCalWeekStats,
  type MacroCalories,
} from "@newyouai/core";
import type { AppState } from "@newyouai/types";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

import { MACRO_COLORS } from "@/lib/macroColors";

const CHART_HEIGHT = 112;
const TREND_UP = "#6ecf8a";
const TREND_DOWN = "#f87171";

type Props = {
  state: AppState;
  todayKey: string;
};

export function AverageCalTrackerCard({ state, todayKey }: Props) {
  const { colors } = useAppTheme();
  const [weeksAgo, setWeeksAgo] = useState(0);
  const stats = useMemo(
    () => buildAverageCalWeekStats(state, todayKey, weeksAgo),
    [state, todayKey, weeksAgo],
  );

  const yTicks = useMemo(() => {
    const step = stats.chartMaxCal / 3;
    return [stats.chartMaxCal, Math.round(step * 2), Math.round(step), 0];
  }, [stats.chartMaxCal]);

  const trendUp = stats.trendPct != null && stats.trendPct > 0;
  const trendNeutral = stats.trendPct === 0;
  const trendColor = trendNeutral
    ? colors.textSecondary
    : trendUp
      ? TREND_UP
      : TREND_DOWN;

  return (
    <View
      testID="progress-avg-calories"
      className="mt-[18px] rounded-[14px] border px-4 pb-3.5 pt-[18px]"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <Text className="text-[15px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
        Daily Average Calories
      </Text>

      <View className="mb-[18px] mt-2.5 flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-row items-baseline gap-1.5">
          <Text
            className="text-[34px] font-bold leading-none tracking-tight tabular-nums"
            style={{ color: colors.textPrimary }}
          >
            {(stats.averageCal ?? 0).toLocaleString()}
          </Text>
          <Text className="text-[15px] font-medium" style={{ color: colors.textSecondary }}>
            cals
          </Text>
        </View>

        {stats.trendPct != null ? (
          <View className="shrink-0 flex-row items-center gap-1">
            {!trendNeutral ? (
              <Text className="text-[13px] font-semibold" style={{ color: trendColor }}>
                {trendUp ? "↑" : "↓"}
              </Text>
            ) : null}
            <Text className="text-sm font-semibold tabular-nums" style={{ color: trendColor }}>
              {Math.abs(stats.trendPct)}%
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mb-2 flex-row gap-2">
        <View className="w-[34px]" style={{ height: CHART_HEIGHT, justifyContent: "space-between" }}>
          {yTicks.map((tick) => (
            <Text
              key={tick}
              className="text-right text-[10px] font-medium tabular-nums"
              style={{ color: colors.textSecondary, lineHeight: 10 }}
            >
              {tick.toLocaleString()}
            </Text>
          ))}
        </View>

        <View className="min-w-0 flex-1">
          <View style={{ height: CHART_HEIGHT, position: "relative" }}>
            {yTicks.slice(0, -1).map((tick) => {
              const pct = 1 - tick / stats.chartMaxCal;
              return (
                <View
                  key={`grid-${tick}`}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: `${pct * 100}%`,
                    borderTopWidth: 1,
                    borderStyle: "dashed",
                    borderColor: `${colors.border}88`,
                  }}
                />
              );
            })}

            <View className="h-full flex-row items-end gap-2">
              {stats.days.map((day) => (
                <StackedDayBar
                  key={day.dateKey}
                  macros={day.macros}
                  chartMaxCal={stats.chartMaxCal}
                  muted={day.isFuture}
                />
              ))}
            </View>
          </View>

          <View className="mt-2 flex-row gap-2">
            {stats.days.map((day) => (
              <Text
                key={`${day.dateKey}-label`}
                className="flex-1 text-center text-[11px] tabular-nums"
                style={{
                  fontWeight: day.isToday ? "700" : "500",
                  color: day.isToday ? colors.textPrimary : colors.textSecondary,
                }}
              >
                {day.dayLabel}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View className="mb-4 mt-3.5 flex-row flex-wrap justify-center gap-[18px]">
        <LegendItem color={MACRO_COLORS.protein} label="Protein" />
        <LegendItem color={MACRO_COLORS.carbs} label="Carbs" />
        <LegendItem color={MACRO_COLORS.fat} label="Fats" />
      </View>

      <View
        className="flex-row gap-1.5 rounded-full p-1"
        style={{ backgroundColor: colors.backgroundSecondary }}
      >
        {AVERAGE_CAL_WEEK_OPTIONS.map((opt) => {
          const active = weeksAgo === opt.weeksAgo;
          return (
            <Pressable
              key={opt.weeksAgo}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setWeeksAgo(opt.weeksAgo)}
              className="flex-1 items-center rounded-full px-1.5 py-2"
              style={{ backgroundColor: active ? colors.backgroundTertiary : "transparent" }}
            >
              <Text
                className="text-[11px] tabular-nums"
                style={{
                  fontWeight: active ? "600" : "500",
                  color: active ? colors.textPrimary : colors.textSecondary,
                }}
                numberOfLines={1}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function StackedDayBar({
  macros,
  chartMaxCal,
  muted,
}: {
  macros: MacroCalories;
  chartMaxCal: number;
  muted: boolean;
}) {
  const segments = [
    { key: "fat", cal: macros.fat, color: MACRO_COLORS.fat },
    { key: "carbs", cal: macros.carbs, color: MACRO_COLORS.carbs },
    { key: "protein", cal: macros.protein, color: MACRO_COLORS.protein },
  ].filter((s) => s.cal > 0);

  const totalPct = Math.min(1, macros.total / chartMaxCal);
  const barHeight = Math.max(totalPct * CHART_HEIGHT, segments.length > 0 ? 6 : 0);

  return (
    <View
      className="flex-1 items-center justify-end"
      style={{ height: CHART_HEIGHT, opacity: muted ? 0.28 : 1 }}
    >
      {segments.length > 0 ? (
        <View
          className="w-full max-w-[28px] overflow-hidden rounded-t-md"
          style={{ height: barHeight, flexDirection: "column-reverse" }}
        >
          {segments.map((seg, idx) => {
            const segPct = macros.total > 0 ? (seg.cal / macros.total) * 100 : 0;
            const isTop = idx === segments.length - 1;
            return (
              <View
                key={seg.key}
                style={{
                  height: `${segPct}%`,
                  backgroundColor: seg.color,
                  borderTopLeftRadius: isTop ? 6 : 0,
                  borderTopRightRadius: isTop ? 6 : 0,
                }}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <Text className="text-xs font-semibold" style={{ color }}>
      {label}
    </Text>
  );
}
