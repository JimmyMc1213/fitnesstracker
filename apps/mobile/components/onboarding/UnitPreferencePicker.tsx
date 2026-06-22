import type { HeightDisplayUnit, UnitPreferences, VolumeUnit, WeightUnit } from "@newyouai/types";
import { View } from "react-native";

import { OnboardingFieldGroup } from "@/components/onboarding/OnboardingInputField";
import { OnboardingPillRow, OnboardingSegment } from "@/components/onboarding/OnboardingSegment";
import { SettingsDetailCard } from "@/components/settings/SettingsLayout";
import { GradientCard } from "@/components/ui/GradientCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { heightUnitLabel, volumeUnitLabel, weightUnitLabel } from "@/lib/unitLabels";

type UnitSection<T extends string> = {
  label: string;
  options: readonly T[];
  selected: T | undefined;
  onSelect: (unit: T) => void;
  optionLabel: (unit: T) => string;
};

export function UnitPreferencePicker({
  value,
  onChange,
  variant = "onboarding",
}: {
  value: Partial<UnitPreferences>;
  onChange: (next: Partial<UnitPreferences>) => void;
  variant?: "onboarding" | "settings";
}) {
  const { colors } = useAppTheme();

  const setWeight = (weightUnit: WeightUnit) => onChange({ ...value, weightUnit });
  const setHeight = (heightUnit: HeightDisplayUnit) => onChange({ ...value, heightUnit });
  const setVolume = (volumeUnit: VolumeUnit) => onChange({ ...value, volumeUnit });

  const sections: UnitSection<string>[] = [
    {
      label: "Weight",
      options: ["lbs", "kg"],
      selected: value.weightUnit,
      onSelect: (unit) => setWeight(unit as WeightUnit),
      optionLabel: (unit) => weightUnitLabel(unit as WeightUnit),
    },
    {
      label: "Height",
      options: ["ft_in", "cm"],
      selected: value.heightUnit,
      onSelect: (unit) => setHeight(unit as HeightDisplayUnit),
      optionLabel: (unit) => heightUnitLabel(unit as HeightDisplayUnit),
    },
    {
      label: "Volume",
      options: ["oz", "L"],
      selected: value.volumeUnit,
      onSelect: (unit) => setVolume(unit as VolumeUnit),
      optionLabel: (unit) => volumeUnitLabel(unit as VolumeUnit),
    },
  ];

  const fieldStack = (
    <View style={{ gap: 20 }}>
      {sections.map((section) => (
        <OnboardingFieldGroup key={section.label} label={section.label} labelColor={colors.textTertiary}>
          <OnboardingPillRow>
            {section.options.map((unit) => (
              <OnboardingSegment
                key={unit}
                layout="inline"
                selected={section.selected === unit}
                onPress={() => section.onSelect(unit)}
              >
                {section.optionLabel(unit)}
              </OnboardingSegment>
            ))}
          </OnboardingPillRow>
        </OnboardingFieldGroup>
      ))}
    </View>
  );

  if (variant === "settings") {
    return <SettingsDetailCard>{fieldStack}</SettingsDetailCard>;
  }

  return <GradientCard>{fieldStack}</GradientCard>;
}
