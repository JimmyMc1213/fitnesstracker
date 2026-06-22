import { clampMacroValue } from "@newyouai/core";

import { OnboardingDailyFuelPlan } from "@/components/onboarding/OnboardingDailyFuelPlan";
import { SettingsHelper } from "@/components/settings/SettingsLayout";
import { useFitnessState } from "@/context/FitnessContext";

export function FuelTargetsPanel() {
  const { state, setFitnessState } = useFitnessState();
  const T = state?.nutritionTargets;

  if (!state || !T) return null;

  return (
    <>
      <SettingsHelper>
        Daily calorie and macro goals used on Home, Fuel, habits copy, and weekly review math.
      </SettingsHelper>
      <OnboardingDailyFuelPlan
        macros={T}
        onChangeMacros={(next) =>
          setFitnessState((prev) => ({
            ...prev,
            nutritionTargets: {
              cal: clampMacroValue("cal", next.cal),
              p: clampMacroValue("p", next.p),
              c: clampMacroValue("c", next.c),
              f: clampMacroValue("f", next.f),
            },
          }))
        }
      />
    </>
  );
}
