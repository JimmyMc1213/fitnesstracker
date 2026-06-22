import { useCallback, useEffect, useState } from "react";

import { useFitnessState } from "@/context/FitnessContext";
import { useFitnessSync } from "@/context/FitnessSyncContext";
import {
  readOnboardingComplete,
  writeOnboardingComplete,
} from "@/lib/onboardingStorage";
import {
  DEFAULT_ONBOARDING_COMPLETE,
  ONBOARDING_COMPLETE_STORAGE_KEY,
} from "@/lib/onboardingStub";
import { e2eFitnessSeedByName, type E2eFitnessSeedName } from "@/lib/e2e/fitnessPersistSeed";

/** When unset, new users go through onboarding. Maestro sets EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING=true. */
function resolveDefaultOnboardingComplete(): boolean {
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    const seedName = process.env.EXPO_PUBLIC_E2E_FITNESS_SEED?.trim();
    if (seedName) {
      const seed = e2eFitnessSeedByName(seedName as E2eFitnessSeedName);
      if (seed?.onboardingComplete) return true;
    }
  }
  const flag = process.env.EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING?.trim().toLowerCase();
  if (flag === "false") return false;
  if (flag === "true") return true;
  return DEFAULT_ONBOARDING_COMPLETE;
}

export function useOnboardingState() {
  const { fitnessHydrated } = useFitnessSync();
  const { state: fitnessState, hydrated: fitnessLocalHydrated } = useFitnessState();
  const [onboardingComplete, setOnboardingCompleteState] = useState(resolveDefaultOnboardingComplete);
  const [hydrated, setHydrated] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const skipOnboarding = resolveDefaultOnboardingComplete();

    void (async () => {
      try {
        const stored = await readOnboardingComplete();
        if (cancelled) return;
        if (stored === null) {
          await writeOnboardingComplete(skipOnboarding);
          setOnboardingCompleteState(skipOnboarding);
        } else {
          setOnboardingCompleteState(stored);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!fitnessHydrated) return;

    let cancelled = false;
    void (async () => {
      const stored = await readOnboardingComplete();
      if (cancelled || stored === null) return;
      setOnboardingCompleteState(stored);
    })();

    return () => {
      cancelled = true;
    };
  }, [fitnessHydrated]);

  useEffect(() => {
    if (!fitnessLocalHydrated || !fitnessState?.onboardingComplete) return;
    setOnboardingCompleteState(true);
    void writeOnboardingComplete(true);
  }, [fitnessLocalHydrated, fitnessState?.onboardingComplete]);

  const setOnboardingComplete = useCallback(async (value: boolean) => {
    setOnboardingCompleteState(value);
    await writeOnboardingComplete(value);
  }, []);

  return {
    onboardingComplete,
    onboardingHydrated: hydrated,
    /** @deprecated use onboardingHydrated */
    onboardingStubHydrated: hydrated,
    setOnboardingComplete,
    onboardingCompleteStorageKey: ONBOARDING_COMPLETE_STORAGE_KEY,
  };
}

/** @deprecated use useOnboardingState */
export function useOnboardingStub() {
  return useOnboardingState();
}
