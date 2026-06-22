import {
  canReachOnboardingWizard,
  isAppShellLoading,
  resolveAppShellMainView,
  type AppShellRoutingInput,
} from "@newyouai/core";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useMemo } from "react";
import { Platform } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useFitnessSync } from "@/context/FitnessSyncContext";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { isOnboardingPreviewActive, startOnboardingPreview } from "@/lib/devPreviewOnboarding";
import { isVisualParityMode } from "@/lib/visualParity";

/** Root stack screens outside `(tabs)` that should not trigger shell redirect to home. */
const APP_STACK_ROUTES_OUTSIDE_TABS = new Set(["log-food", "workout", "progress"]);

function buildShellRoutingInput(
  auth: Pick<
    ReturnType<typeof useAuth>,
    "configured" | "sessionEmail" | "sessionResolved"
  >,
  onboardingComplete: boolean,
  fitnessHydrated: boolean,
): AppShellRoutingInput {
  return {
    configured: auth.configured,
    sessionResolved: auth.sessionResolved,
    sessionEmail: auth.sessionEmail,
    signInRestorePending: false,
    fitnessHydrated,
    onboardingComplete,
    skipOnboarding: false,
  };
}

/** Redirects between `(auth)`, `(onboarding)`, and `(tabs)` based on app shell routing. */
export function useAppShellGate() {
  const auth = useAuth();
  const { fitnessHydrated } = useFitnessSync();
  const { onboardingComplete, onboardingHydrated } = useOnboardingState();
  const segments = useSegments();
  const router = useRouter();

  const shellInput = useMemo(
    () => buildShellRoutingInput(auth, onboardingComplete, fitnessHydrated),
    [auth, onboardingComplete, fitnessHydrated],
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
    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const inTabsGroup = segments[0] === "(tabs)";
    const inModalsGroup = segments[0] === "(modals)";
    const inAppStackRoute = APP_STACK_ROUTES_OUTSIDE_TABS.has(segments[0] ?? "");

    if (inModalsGroup || inAppStackRoute) return;

    if (isVisualParityMode() && Platform.OS === "web") {
      if (inAuthGroup || inOnboardingGroup) {
        router.replace("/(tabs)/home");
      }
      return;
    }

    if (auth.configured && !auth.sessionResolved) return;
    if (auth.configured && auth.sessionEmail && !onboardingHydrated) return;

    if (isOnboardingPreviewActive() && !onboardingComplete) {
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
  }, [
    auth.configured,
    auth.sessionResolved,
    auth.sessionEmail,
    onboardingComplete,
    onboardingHydrated,
    segments,
    router,
    shellInput,
  ]);
}

export function useAppShellRoutingInput(): AppShellRoutingInput {
  const auth = useAuth();
  const { fitnessHydrated } = useFitnessSync();
  const { onboardingComplete } = useOnboardingState();
  return useMemo(
    () => buildShellRoutingInput(auth, onboardingComplete, fitnessHydrated),
    [auth, onboardingComplete, fitnessHydrated],
  );
}
