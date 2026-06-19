import type { HeightDisplayUnit, UnitPreferences, VolumeUnit, WeightUnit } from "@newyouai/types";
import { Text, View } from "react-native";

import { OnboardingPillRow, OnboardingSegment } from "@/components/onboarding/OnboardingSegment";
import { GradientCard } from "@/components/ui/GradientCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { heightUnitLabel, volumeUnitLabel, weightUnitLabel } from "@/lib/unitLabels";

export function UnitPreferencePicker({
  value,
  onChange,
}: {
  value: Partial<UnitPreferences>;
  onChange: (next: Partial<UnitPreferences>) => void;
}) {
  const { colors } = useAppTheme();

  const setWeight = (weightUnit: WeightUnit) => onChange({ ...value, weightUnit });
  const setHeight = (heightUnit: HeightDisplayUnit) => onChange({ ...value, heightUnit });
  const setVolume = (volumeUnit: VolumeUnit) => onChange({ ...value, volumeUnit });

  return (
    <GradientCard style={{ gap: 20 }}>
      <View className="gap-2">
        <Text className="text-sm font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
          Weight
        </Text>
        <OnboardingPillRow>
          {(["lbs", "kg"] as const).map((u) => (
            <OnboardingSegment key={u} layout="inline" selected={value.weightUnit === u} onPress={() => setWeight(u)}>
              {weightUnitLabel(u)}
            </OnboardingSegment>
          ))}
        </OnboardingPillRow>
      </View>
      <View className="gap-2">
        <Text className="text-sm font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
          Height
        </Text>
        <OnboardingPillRow>
          {(["ft_in", "cm"] as const).map((u) => (
            <OnboardingSegment key={u} layout="inline" selected={value.heightUnit === u} onPress={() => setHeight(u)}>
              {heightUnitLabel(u)}
            </OnboardingSegment>
          ))}
        </OnboardingPillRow>
      </View>
      <View className="gap-2">
        <Text className="text-sm font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
          Volume
        </Text>
        <OnboardingPillRow>
          {(["oz", "L"] as const).map((u) => (
            <OnboardingSegment key={u} layout="inline" selected={value.volumeUnit === u} onPress={() => setVolume(u)}>
              {volumeUnitLabel(u)}
            </OnboardingSegment>
          ))}
        </OnboardingPillRow>
      </View>
    </GradientCard>
  );
}
