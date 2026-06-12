import { useCallback, useEffect, useState } from "react";

import {
  readOnboardingComplete,
  writeOnboardingComplete,
} from "@/lib/onboardingStorage";
import {
  DEFAULT_ONBOARDING_COMPLETE,
  ONBOARDING_COMPLETE_STORAGE_KEY,
} from "@/lib/onboardingStub";

/** When unset, Maestro auth flows default to tabs (onboarding skipped). Set `false` to exercise the wizard. */
function resolveDefaultOnboardingComplete(): boolean {
  const flag = process.env.EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING?.trim().toLowerCase();
  if (flag === "false") return false;
  return DEFAULT_ONBOARDING_COMPLETE;
}

export function useOnboardingState() {
  const [onboardingComplete, setOnboardingCompleteState] = useState(resolveDefaultOnboardingComplete);
  // Optimistic true so Maestro auth flows are not blocked while AsyncStorage reads.
  const [hydrated, setHydrated] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const stored = await readOnboardingComplete();
        if (cancelled) return;
        setOnboardingCompleteState(stored);
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
