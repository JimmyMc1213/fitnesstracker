import { weekdayMonStartIndex } from "@newyouai/core";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import type { OnboardingPlanSnapshot } from "@/lib/onboardingPlanSnapshot";
import { planReadyFirstCoachNote } from "@/lib/onboardingReinforcementCopy";
import { formatWaterVolume } from "@/lib/waterIntake";

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
    tone === "protein" ? colors.accent : tone === "carbs" ? "#60a5fa" : tone === "fat" ? "#fbbf24" : colors.textPrimary;

  return (
    <View className="items-center" testID={`plan-ready-macro-${label.replace(/\s+/g, "-")}`}>
      <Text className="text-2xl font-bold" style={{ color: toneColor }}>
        {value.toLocaleString()}
      </Text>
      <Text className="mt-0.5 text-xs uppercase tracking-wide" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
    </View>
  );
}

export function OnboardingPlanReady({ planSnapshot }: Props) {
  const { colors } = useAppTheme();
  const { macros, profile, templates, waterDailyTargetOz, stepsTarget, volumeUnit, timeline } = planSnapshot;
  const weekTemplates = [...templates].sort(
    (a, b) => weekdayMonStartIndex(a.dayLabel) - weekdayMonStartIndex(b.dayLabel),
  );
  const coachNote = planReadyFirstCoachNote(profile);

  return (
    <View testID="onboarding-plan-ready" className="gap-5">
      <View>
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
          Daily fuel
        </Text>
        <View className="flex-row justify-between">
          <MacroStat value={macros.cal} label="cal" />
          <MacroStat value={macros.p} label="g protein" tone="protein" />
          <MacroStat value={macros.c} label="g carbs" tone="carbs" />
          <MacroStat value={macros.f} label="g fat" tone="fat" />
        </View>
        <Text className="mt-3 text-sm" style={{ color: colors.textSecondary }}>
          Goal timeline · {timeline}
        </Text>
      </View>

      <View className="h-px" style={{ backgroundColor: colors.border }} />

      <View>
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
          Your week
        </Text>
        <View className="gap-2">
          {weekTemplates.map((routine) => (
            <View key={routine.id} className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                {routine.dayLabel}
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                {routine.name}
              </Text>
            </View>
          ))}
        </View>
        <View className="mt-4 flex-row justify-between">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
              Hydration
            </Text>
            <Text className="mt-1 text-lg font-semibold" style={{ color: "#38bdf8" }}>
              {formatWaterVolume(waterDailyTargetOz, volumeUnit)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
              Steps
            </Text>
            <Text className="mt-1 text-lg font-semibold" style={{ color: "#34d399" }}>
              {stepsTarget.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <View className="h-px" style={{ backgroundColor: colors.border }} />

      <View>
        <Text className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
          Coach
        </Text>
        <Text className="text-sm leading-6" style={{ color: colors.textSecondary }}>
          {coachNote}
        </Text>
      </View>
    </View>
  );
}
