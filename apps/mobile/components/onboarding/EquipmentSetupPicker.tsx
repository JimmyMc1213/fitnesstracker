import type { EquipmentSetup } from "@newyouai/types";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import {
  EQUIPMENT_SETUP_DESCRIPTIONS,
  EQUIPMENT_SETUP_LABELS,
  EQUIPMENT_SETUP_OPTIONS,
} from "@/lib/equipmentSetup";

import { OnboardingPillStack, OnboardingSegment } from "./OnboardingSegment";

export function EquipmentSetupPicker({
  value,
  onChange,
}: {
  value?: EquipmentSetup;
  onChange: (next: EquipmentSetup) => void;
}) {
  const { colors } = useAppTheme();

  return (
    <OnboardingPillStack>
      {EQUIPMENT_SETUP_OPTIONS.map((setup) => (
        <OnboardingSegment key={setup} selected={value === setup} onPress={() => onChange(setup)}>
          <View className="w-full items-start gap-1">
            <Text className="text-base font-medium" style={{ color: colors.textPrimary }}>
              {EQUIPMENT_SETUP_LABELS[setup]}
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {EQUIPMENT_SETUP_DESCRIPTIONS[setup]}
            </Text>
          </View>
        </OnboardingSegment>
      ))}
    </OnboardingPillStack>
  );
}
