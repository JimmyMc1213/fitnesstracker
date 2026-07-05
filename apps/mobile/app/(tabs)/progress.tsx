import { LBS_PER_KG, localDateKey, weightDeltaSentiment, weightUnitLabel } from "@newyouai/core";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { FullScreenOverlay } from "@/components/motion";
import { TabScreenFade } from "@/components/motion/TabScreenFade";

import { ScreenHeader } from "@/components/home/ScreenHeader";
import { WeighInSheet } from "@/components/home/WeighInSheet";
import { AverageCalTrackerCard } from "@/components/progress/AverageCalTrackerCard";
import { FuelUpdatesSection } from "@/components/progress/FuelUpdatesSection";
import { PersonalRecordsSection } from "@/components/progress/PersonalRecordsSection";
import { ProgressPicsSection } from "@/components/progress/ProgressPicsSection";
import { ProgressSectionLabel } from "@/components/progress/ProgressSectionLabel";
import { ScreenSundayCheckInHistory } from "@/components/progress/ScreenSundayCheckInHistory";
import { SundayCheckInHistorySection } from "@/components/progress/SundayCheckInHistorySection";
import { WorkoutCalendarCard } from "@/components/progress/WorkoutCalendarCard";
import { CHART_PAD_LEFT, CHART_PAD_RIGHT, WeightLineChart } from "@/components/progress/WeightLineChart";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { deltaColorForTheme } from "@/lib/progress/weightDeltaColors";
import { formatWeightFromLbs } from "@/lib/unitConversions";
import { useTabScreenInsets } from "@/lib/tabScreenInsets";

function shortChartDate(dateKey: string): string {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ProgressScreen() {
  const { colors } = useAppTheme();
  const { paddingTop, paddingBottom } = useTabScreenInsets();
  const { state, setFitnessState } = useFitnessState();
  const [weighInOpen, setWeighInOpen] = useState(false);
  const [showCheckInHistoryPage, setShowCheckInHistoryPage] = useState(false);
  const [chartW, setChartW] = useState(0);

  const [todayKey, setTodayKey] = useState(() => localDateKey(new Date()));
  useFocusEffect(
    useCallback(() => {
      setTodayKey(localDateKey(new Date()));
    }, []),
  );
  const wUnit = state?.unitPreferences.weightUnit ?? "lbs";
  const todayEntry = state?.weightLog.find((e) => e.dateKey === todayKey);
  const goal = state?.onboardingProfile?.goal ?? "maintain";
  const cutBarStart = state?.progressGoal?.progressStartWeightLbs;

  const sorted = useMemo(
    () => [...(state?.weightLog ?? [])].sort((a, b) => a.dateKey.localeCompare(b.dateKey)),
    [state?.weightLog],
  );
  const chartSeriesLbs = sorted.map((e) => e.weightLbs);
  const chartSeries = wUnit === "kg" ? chartSeriesLbs.map((lbs) => lbs / LBS_PER_KG) : chartSeriesLbs;
  const todayWeightLbs = chartSeriesLbs.length
    ? chartSeriesLbs[chartSeriesLbs.length - 1]!
    : (todayEntry?.weightLbs ?? cutBarStart ?? 0);
  const startWeightLbs = chartSeriesLbs.length ? chartSeriesLbs[0]! : todayWeightLbs;
  const deltaLbs = todayWeightLbs - startWeightLbs;
  const deltaSentiment = weightDeltaSentiment(goal, deltaLbs);
  const deltaColor = deltaColorForTheme(deltaSentiment, colors);
  const deltaAbsDisplay = wUnit === "kg" ? Math.abs(deltaLbs) / LBS_PER_KG : Math.abs(deltaLbs);
  const todayDisplay = wUnit === "kg" ? todayWeightLbs / LBS_PER_KG : todayWeightLbs;

  const chartDateLabels = useMemo(() => {
    if (sorted.length < 2) return null;
    const first = sorted[0]!.dateKey;
    const mid = sorted[Math.floor((sorted.length - 1) / 2)]!.dateKey;
    const last = sorted[sorted.length - 1]!.dateKey;
    return [first, mid, last].map(shortChartDate);
  }, [sorted]);

  if (!state) {
    return (
      <View testID="tab-progress" style={{ flex: 1, backgroundColor: "transparent" }} />
    );
  }

  return (
    <View testID="tab-progress" style={{ flex: 1, backgroundColor: "transparent" }}>
      <TabScreenFade>
      <ScrollView
        className="flex-1 px-screen-x"
        contentContainerStyle={{ paddingBottom, paddingTop }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Progress" titleTestID="progress-title" />

        <View
          className="mt-[18px] rounded-[14px] border p-[18px]"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className="text-[11px] font-medium uppercase tracking-widest"
              style={{ color: colors.textTertiary }}
            >
              Body weight
            </Text>
            <Pressable
              testID="progress-log-weight"
              accessibilityRole="button"
              onPress={() => setWeighInOpen(true)}
              className="flex-row items-center gap-1"
            >
              <Text className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>
                {todayEntry ? "Update weight" : "Log weight"}
              </Text>
            </Pressable>
          </View>

          <View className="mt-2.5 flex-row items-end justify-between gap-3">
            <View className="flex-row items-baseline gap-1">
              <Text
                className="text-[36px] font-bold tracking-tight tabular-nums"
                style={{ color: colors.textPrimary }}
              >
                {chartSeries.length ? todayDisplay.toFixed(1) : "-"}
              </Text>
              <Text
                className="text-[11px] font-medium uppercase tracking-widest"
                style={{ color: colors.textTertiary }}
              >
                {weightUnitLabel(wUnit)}
              </Text>
            </View>
            <View className="min-w-0 flex-1 items-end">
              {chartSeries.length >= 2 ? (
                <Text className="text-xs font-medium tabular-nums" style={{ lineHeight: 17 }}>
                  <Text style={{ color: deltaColor, fontWeight: "600" }}>
                    {deltaLbs < 0 ? "↓ " : deltaLbs > 0 ? "↑ " : ""}
                    {deltaAbsDisplay.toFixed(1)} {weightUnitLabel(wUnit)}
                  </Text>
                  <Text style={{ color: colors.textTertiary }}>
                    {" "}
                    · started at {formatWeightFromLbs(startWeightLbs, wUnit)}
                  </Text>
                </Text>
              ) : null}
            </View>
          </View>

          <View
            className="mt-3.5 w-full"
            onLayout={(e) => setChartW(Math.max(1, Math.round(e.nativeEvent.layout.width)))}
          >
            {chartSeries.length >= 2 && chartW > 0 ? (
              <>
                <View testID="progress-weight-chart">
                <WeightLineChart
                  data={chartSeries}
                  width={chartW}
                  height={140}
                  stroke={colors.accent}
                  gridColor={colors.border}
                  fillColor={`${colors.accent}22`}
                  tickColor={colors.textTertiary}
                  padLeft={CHART_PAD_LEFT}
                  padRight={CHART_PAD_RIGHT}
                />
                </View>
                {chartDateLabels ? (
                  <View
                    className="mt-1.5 flex-row justify-between"
                    style={{ paddingLeft: CHART_PAD_LEFT, paddingRight: CHART_PAD_RIGHT }}
                  >
                    {chartDateLabels.map((label) => (
                      <Text
                        key={label}
                        className="text-[11px] font-medium tabular-nums"
                        style={{ color: colors.textTertiary }}
                      >
                        {label}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </>
            ) : (
              <View className="items-center py-8">
                <Text className="text-[13px] font-medium" style={{ color: colors.textTertiary }}>
                  Log two weigh-ins to unlock the trend line.
                </Text>
              </View>
            )}
          </View>
        </View>

        <ProgressPicsSection
          state={state}
          onOpenGallery={() => router.push("/progress/gallery")}
        />

        <AverageCalTrackerCard state={state} todayKey={todayKey} />

        <SundayCheckInHistorySection
          history={state.sundayCheckInHistory ?? []}
          unitPreferences={state.unitPreferences}
          onShowPrevious={() => setShowCheckInHistoryPage(true)}
        />

        <ProgressSectionLabel>Workouts</ProgressSectionLabel>
        <WorkoutCalendarCard state={state} />

        <ProgressSectionLabel>Personal records</ProgressSectionLabel>
        <PersonalRecordsSection state={state} />

        <FuelUpdatesSection adjustmentHistory={state.adjustmentHistory} weightUnit={wUnit} />
      </ScrollView>
      </TabScreenFade>

      <WeighInSheet
        open={weighInOpen}
        onClose={() => setWeighInOpen(false)}
        dateKey={todayKey}
        existing={todayEntry}
        unitPreferences={state.unitPreferences}
        setFitnessState={setFitnessState}
      />

      <FullScreenOverlay
        open={showCheckInHistoryPage}
        motionVariant="fade"
        onRequestClose={() => setShowCheckInHistoryPage(false)}
      >
        <ScreenSundayCheckInHistory state={state} onBack={() => setShowCheckInHistoryPage(false)} />
      </FullScreenOverlay>
    </View>
  );
}
