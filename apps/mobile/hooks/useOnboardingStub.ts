import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_ONBOARDING_COMPLETE,
  ONBOARDING_COMPLETE_STORAGE_KEY,
} from "@/lib/onboardingStub";

export function useOnboardingStub() {
  const [onboardingComplete, setOnboardingCompleteState] = useState(DEFAULT_ONBOARDING_COMPLETE);
  // Optimistic true so Maestro auth flows are not blocked while AsyncStorage reads.
  const [hydrated, setHydrated] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const stored = await AsyncStorage.getItem(ONBOARDING_COMPLETE_STORAGE_KEY);
        if (cancelled) return;
        if (stored === "true") setOnboardingCompleteState(true);
        else if (stored === "false") setOnboardingCompleteState(false);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setOnboardingComplete = useCallback(async (value: boolean) => {
    setOnboardingCompleteState(value);
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_STORAGE_KEY, value ? "true" : "false");
  }, []);

  return {
    onboardingComplete,
    onboardingStubHydrated: hydrated,
    setOnboardingComplete,
  };
}
