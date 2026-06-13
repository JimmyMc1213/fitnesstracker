import type { EquipmentSetup } from "@newyouai/types";
import { View } from "react-native";

import { EquipmentSetupPicker } from "@/components/onboarding/EquipmentSetupPicker";
import { SettingsDetailCard, SettingsHelper } from "@/components/settings/SettingsLayout";
import { useFitnessState } from "@/context/FitnessContext";
import { rebuildWorkoutTemplatesForEquipment } from "@/lib/workout/workoutTemplateBuilder";

export function EquipmentPanel() {
  const { state, setFitnessState } = useFitnessState();

  if (!state) return null;

  return (
    <View>
      <SettingsHelper>Workout templates swap exercises to match what you have available.</SettingsHelper>
      <SettingsDetailCard>
        <EquipmentSetupPicker
          value={state.equipmentSetup}
          onChange={(next: EquipmentSetup) =>
            setFitnessState((prev) => ({
              ...prev,
              equipmentSetup: next,
              equipmentSetupChosen: true,
              workoutTemplates: rebuildWorkoutTemplatesForEquipment(prev, prev.experienceLevel, next),
            }))
          }
        />
      </SettingsDetailCard>
    </View>
  );
}
