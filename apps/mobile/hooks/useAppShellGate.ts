import {
  canReachOnboardingWizard,
  isAppShellLoading,
  resolveAppShellMainView,
  type AppShellRoutingInput,
} from "@newyouai/core";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useMemo } from "react";

import { useAuth } from "@/context/AuthContext";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { isOnboardingPreviewActive, startOnboardingPreview } from "@/lib/devPreviewOnboarding";

function buildShellRoutingInput(
  auth: Pick<
    ReturnType<typeof useAuth>,
    "configured" | "sessionEmail" | "sessionResolved"
  >,
  onboardingComplete: boolean,
): AppShellRoutingInput {
  return {
    configured: auth.configured,
    sessionResolved: auth.sessionResolved,
    sessionEmail: auth.sessionEmail,
    signInRestorePending: false,
    fitnessHydrated: true,
    onboardingComplete,
    skipOnboarding: false,
  };
}

/** Redirects between `(auth)`, `(onboarding)`, and `(tabs)` based on app shell routing. */
export function useAppShellGate() {
  const auth = useAuth();
  const { onboardingComplete, onboardingHydrated } = useOnboardingState();
  const segments = useSegments();
  const router = useRouter();

  const shellInput = useMemo(
    () => buildShellRoutingInput(auth, onboardingComplete),
    [auth, onboardingComplete],
  );

  useEffect(() => {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      const flag = process.env.EXPO_PUBLIC_PREVIEW_ONBOARDING?.trim().toLowerCase();
      if (flag === "1" || flag === "true") {
        startOnboardingPreview();
      }
    }
  }, []);

  useEffect(() => {
    if (auth.configured && !auth.sessionResolved) return;
    if (auth.configured && auth.sessionEmail && !onboardingHydrated) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const inTabsGroup = segments[0] === "(tabs)";
    const inModalsGroup = segments[0] === "(modals)";

    if (inModalsGroup) return;

    if (isOnboardingPreviewActive()) {
      if (!inOnboardingGroup) router.replace("/(onboarding)");
      return;
    }

    if (!auth.configured) {
      if (inAuthGroup || inOnboardingGroup) {
        router.replace("/(tabs)/home");
      }
      return;
    }

    if (isAppShellLoading(shellInput)) return;

    const mainView = resolveAppShellMainView(shellInput);

    if (mainView === "auth") {
      if (!inAuthGroup) router.replace("/(auth)");
      return;
    }

    if (canReachOnboardingWizard(shellInput)) {
      if (!inOnboardingGroup) router.replace("/(onboarding)");
      return;
    }

    if (inAuthGroup || inOnboardingGroup || (mainView === "app" && !inTabsGroup)) {
      router.replace("/(tabs)/home");
    }
  }, [auth.configured, auth.sessionResolved, auth.sessionEmail, onboardingHydrated, segments, router, shellInput]);
}

export function useAppShellRoutingInput(): AppShellRoutingInput {
  const auth = useAuth();
  const { onboardingComplete } = useOnboardingState();
  return useMemo(() => buildShellRoutingInput(auth, onboardingComplete), [auth, onboardingComplete]);
}
