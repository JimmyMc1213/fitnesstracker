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
import { hasAuthenticatedUser, routingSessionEmail } from "@/lib/authSession";
import { useFitnessState } from "@/context/FitnessContext";
import { useFitnessSync } from "@/context/FitnessSyncContext";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { isOnboardingPreviewActive, startOnboardingPreview } from "@/lib/devPreviewOnboarding";
import { sliceFromAppState } from "@/lib/fitness/sliceFromAppState";
import { shouldSkipOnboarding } from "@/lib/onboardingSkip";
import { isVisualParityMode, isVisualParityWebFrame } from "@/lib/visualParity";

/** Native builds always require sign-in; only visual-parity web may bypass auth routing. */
function authGateConfigured(configured: boolean): boolean {
  if (isVisualParityWebFrame()) return configured;
  return true;
}

/** Root stack screens outside `(tabs)` that should not trigger shell redirect to home. */
const APP_STACK_ROUTES_OUTSIDE_TABS = new Set(["log-food", "workout", "progress"]);

function buildShellRoutingInput(
  auth: Pick<
    ReturnType<typeof useAuth>,
    "configured" | "session" | "sessionEmail" | "sessionResolved"
  >,
  onboardingComplete: boolean,
  fitnessHydrated: boolean,
  skipOnboarding: boolean,
  configuredOverride: boolean,
): AppShellRoutingInput {
  return {
    configured: configuredOverride,
    sessionResolved: auth.sessionResolved,
    sessionEmail: routingSessionEmail(auth.session, auth.sessionEmail),
    signInRestorePending: false,
    fitnessHydrated,
    onboardingComplete,
    skipOnboarding,
  };
}

/** Redirects between `(auth)`, `(onboarding)`, and `(tabs)` based on app shell routing. */
export function useAppShellGate() {
  const auth = useAuth();
  const { fitnessHydrated } = useFitnessSync();
  const { onboardingComplete, onboardingHydrated } = useOnboardingState();
  const { state: fitnessState, hydrated: fitnessLocalHydrated } = useFitnessState();
  const segments = useSegments();
  const router = useRouter();
  const authGateActive = authGateConfigured(auth.configured);

  const skipOnboarding = useMemo(() => {
    if (!auth.sessionEmail || !fitnessLocalHydrated) return false;
    return shouldSkipOnboarding({
      persisted: fitnessState ? sliceFromAppState(fitnessState) : null,
      sessionEmail: auth.sessionEmail,
      forcePreview: false,
    });
  }, [auth.sessionEmail, fitnessLocalHydrated, fitnessState]);

  const shellInput = useMemo(
    () => buildShellRoutingInput(auth, onboardingComplete, fitnessHydrated, skipOnboarding, authGateActive),
    [auth, onboardingComplete, fitnessHydrated, skipOnboarding, authGateActive],
  );

  useEffect(() => {
    if (typeof __DEV__ !== "undefined" && __DEV__ && Platform.OS === "web") {
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

    if (inModalsGroup || inAppStackRoute) {
      if (authGateActive && auth.sessionResolved && !hasAuthenticatedUser(auth.session)) {
        router.replace("/(auth)");
      }
      return;
    }

    if (isVisualParityMode() && Platform.OS === "web") {
      if (inAuthGroup || inOnboardingGroup) {
        router.replace("/(tabs)/home");
      }
      return;
    }

    if (authGateActive && !auth.sessionResolved) return;
    if (authGateActive && auth.sessionEmail && !onboardingHydrated) return;

    if (isAppShellLoading(shellInput)) return;

    const mainView = resolveAppShellMainView(shellInput);

    if (mainView === "auth") {
      if (!inAuthGroup) router.replace("/(auth)");
      return;
    }

    if (
      hasAuthenticatedUser(auth.session) &&
      isOnboardingPreviewActive() &&
      !onboardingComplete &&
      !skipOnboarding
    ) {
      if (!inOnboardingGroup) router.replace("/(onboarding)");
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
    auth.session,
    auth.sessionResolved,
    auth.sessionEmail,
    onboardingComplete,
    onboardingHydrated,
    segments,
    router,
    shellInput,
    skipOnboarding,
    authGateActive,
  ]);
}

export function useAppShellRoutingInput(): AppShellRoutingInput {
  const auth = useAuth();
  const { fitnessHydrated } = useFitnessSync();
  const { onboardingComplete } = useOnboardingState();
  const { state: fitnessState, hydrated: fitnessLocalHydrated } = useFitnessState();
  const authGateActive = authGateConfigured(auth.configured);

  const skipOnboarding = useMemo(() => {
    if (!auth.sessionEmail || !fitnessLocalHydrated) return false;
    return shouldSkipOnboarding({
      persisted: fitnessState ? sliceFromAppState(fitnessState) : null,
      sessionEmail: auth.sessionEmail,
      forcePreview: false,
    });
  }, [auth.sessionEmail, fitnessLocalHydrated, fitnessState]);

  return useMemo(
    () => buildShellRoutingInput(auth, onboardingComplete, fitnessHydrated, skipOnboarding, authGateActive),
    [auth, onboardingComplete, fitnessHydrated, skipOnboarding, authGateActive],
  );
}
