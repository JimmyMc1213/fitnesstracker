import type { OnboardingPlanSnapshot } from "@/lib/onboardingPlanSnapshot";
import { onboardingPlanSnapshotWeekRows } from "@/lib/onboardingPlanSnapshot";
import { formatWaterVolume } from "@/lib/waterIntake";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { MACRO_COLORS } from "@/lib/macroColors";

type Props = {
  planSnapshot: OnboardingPlanSnapshot;
};

function MacroStat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone?: "protein" | "carbs" | "fat";
}) {
  const { colors } = useAppTheme();
  const toneColor =
    tone === "protein"
      ? MACRO_COLORS.protein
      : tone === "carbs"
        ? MACRO_COLORS.carbs
        : tone === "fat"
          ? MACRO_COLORS.fat
          : colors.textPrimary;

  return (
    <View className="items-center">
      <Text className="text-xl font-bold" style={{ color: toneColor }}>
        {value.toLocaleString()}
      </Text>
      <Text className="text-xs uppercase" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
    </View>
  );
}

/** Compact plan recap for skip / under-18 paywall (no Future You hero). */
export function OnboardingPaywallPlanSummary({ planSnapshot }: Props) {
  const { colors } = useAppTheme();
  const { macros, profile, templates, timeline, waterDailyTargetOz, stepsTarget, volumeUnit } = planSnapshot;
  const weekRows = onboardingPlanSnapshotWeekRows(planSnapshot);
  const templateByDay = new Map(templates.map((t) => [t.dayLabel, t]));
  const trainingDays = profile.workoutDaysPerWeek ?? weekRows.length;

  return (
    <View testID="onboarding-paywall-plan-summary" className="gap-4">
      <View>
        <Text className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
          Daily fuel
        </Text>
        <View className="flex-row justify-between">
          <MacroStat value={macros.cal} label="cal" />
          <MacroStat value={macros.p} label="g protein" tone="protein" />
          <MacroStat value={macros.c} label="g carbs" tone="carbs" />
          <MacroStat value={macros.f} label="g fat" tone="fat" />
        </View>
        <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
          Goal timeline · {timeline}
        </Text>
      </View>

      <View>
        <View className="mb-2 flex-row items-baseline justify-between">
          <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
            Your week
          </Text>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {trainingDays} training days
          </Text>
        </View>
        <View className="gap-2">
          {weekRows.map(({ dayLabel, name }) => {
            const template = templateByDay.get(dayLabel);
            const focus = template?.focus?.trim();
            return (
              <View key={`${dayLabel}-${name}`} className="flex-row gap-3">
                <Text className="w-10 text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  {dayLabel}
                </Text>
                <View className="min-w-0 flex-1">
                  <Text className="text-sm" style={{ color: colors.textPrimary }}>
                    {name}
                  </Text>
                  {focus ? (
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>
                      {focus}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
        <View className="mt-3 flex-row justify-between">
          <View>
            <Text className="text-xs font-semibold uppercase" style={{ color: colors.textTertiary }}>
              Hydration
            </Text>
            <Text className="text-base font-semibold" style={{ color: "#38bdf8" }}>
              {formatWaterVolume(waterDailyTargetOz, volumeUnit)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs font-semibold uppercase" style={{ color: colors.textTertiary }}>
              Steps
            </Text>
            <Text className="text-base font-semibold" style={{ color: "#34d399" }}>
              {stepsTarget.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
