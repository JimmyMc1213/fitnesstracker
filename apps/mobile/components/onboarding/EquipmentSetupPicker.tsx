import type { EquipmentSetup } from "@newyouai/types";
import { Text, View } from "react-native";

import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import {
  EQUIPMENT_SETUP_DESCRIPTIONS,
  EQUIPMENT_SETUP_LABELS,
  EQUIPMENT_SETUP_OPTIONS,
} from "@/lib/equipmentSetup";
import { onboardingPillColors } from "@/lib/onboardingTheme";

import { OnboardingPillStack, OnboardingSegment } from "./OnboardingSegment";

export function EquipmentSetupPicker({
  value,
  onChange,
}: {
  value?: EquipmentSetup;
  onChange: (next: EquipmentSetup) => void;
}) {
  const { ob } = useOnboardingTheme();

  return (
    <OnboardingPillStack>
      {EQUIPMENT_SETUP_OPTIONS.map((setup) => {
        const selected = value === setup;
        const pill = onboardingPillColors(ob, selected);
        const subtitleColor = selected ? "rgba(6, 6, 8, 0.60)" : "rgba(255, 255, 255, 0.50)";
        return (
          <OnboardingSegment key={setup} selected={selected} onPress={() => onChange(setup)}>
            <View className="w-full items-start gap-1">
              <Text className="text-base font-medium" style={{ color: pill.color }}>
                {EQUIPMENT_SETUP_LABELS[setup]}
              </Text>
              <Text className="text-sm" style={{ color: subtitleColor }}>
                {EQUIPMENT_SETUP_DESCRIPTIONS[setup]}
              </Text>
            </View>
          </OnboardingSegment>
        );
      })}
    </OnboardingPillStack>
  );
}
