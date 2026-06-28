import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useFitnessState } from "@/context/FitnessContext";
import { writeOnboardingComplete } from "@/lib/onboardingStorage";
import { ONBOARDING_COMPLETE_STORAGE_KEY } from "@/lib/onboardingStub";

/** Onboarding completion follows the signed-in user's fitness slice — not device-global env flags. */
export function useOnboardingState() {
  const { session } = useAuth();
  const { state: fitnessState, hydrated: fitnessLocalHydrated } = useFitnessState();
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      setOnboardingCompleteState(false);
      return;
    }
    if (!fitnessLocalHydrated || !fitnessState) return;

    const complete = fitnessState.onboardingComplete === true;
    setOnboardingCompleteState(complete);
    void writeOnboardingComplete(complete);
  }, [session?.user?.id, fitnessLocalHydrated, fitnessState, fitnessState?.onboardingComplete]);

  const setOnboardingComplete = useCallback(async (value: boolean) => {
    setOnboardingCompleteState(value);
    await writeOnboardingComplete(value);
  }, []);

  const onboardingHydrated = !session?.user?.id || fitnessLocalHydrated;

  return {
    onboardingComplete,
    onboardingHydrated,
    /** @deprecated use onboardingHydrated */
    onboardingStubHydrated: onboardingHydrated,
    setOnboardingComplete,
    onboardingCompleteStorageKey: ONBOARDING_COMPLETE_STORAGE_KEY,
  };
}

/** @deprecated use useOnboardingState */
export function useOnboardingStub() {
  return useOnboardingState();
}
