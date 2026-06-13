import { View } from "react-native";

import { SettingsDetailCard, SettingsHelper } from "@/components/settings/SettingsLayout";
import { RestTimerDurationPicker } from "@/components/workout/RestTimerDurationPicker";
import { useFitnessState } from "@/context/FitnessContext";

export function RestTimerPanel() {
  const { state, setFitnessState } = useFitnessState();

  if (!state) return null;

  return (
    <View>
      <SettingsHelper>
        Default rest between sets. Tap the timer line on any exercise to change it for that exercise.
      </SettingsHelper>
      <SettingsDetailCard>
        <RestTimerDurationPicker
          value={state.restTimerDefaultSeconds}
          onChange={(restTimerDefaultSeconds) =>
            setFitnessState((prev) => ({
              ...prev,
              restTimerDefaultSeconds,
            }))
          }
        />
      </SettingsDetailCard>
    </View>
  );
}
