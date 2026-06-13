import { normalizeUnitPreferences } from "@newyouai/core";

import { UnitPreferencePicker } from "@/components/onboarding/UnitPreferencePicker";
import { SettingsHelper } from "@/components/settings/SettingsLayout";
import { useFitnessState } from "@/context/FitnessContext";

export function UnitsPanel() {
  const { state, setFitnessState } = useFitnessState();

  if (!state) return null;

  return (
    <>
      <SettingsHelper>Weight, height, and volume units apply across Progress, Workout, and Nutrition.</SettingsHelper>
      <UnitPreferencePicker
        value={state.unitPreferences}
        onChange={(next) =>
          setFitnessState((prev) => ({
            ...prev,
            unitPreferences: normalizeUnitPreferences(next),
            unitPreferencesChosen: true,
          }))
        }
      />
    </>
  );
}
