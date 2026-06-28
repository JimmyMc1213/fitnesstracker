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
import { useFitnessSync } from "@/context/FitnessSyncContext";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { isOnboardingPreviewActive } from "@/lib/devPreviewOnboarding";
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
  configuredOverride: boolean,
): AppShellRoutingInput {
  return {
    configured: configuredOverride,
    sessionResolved: auth.sessionResolved,
    sessionEmail: routingSessionEmail(auth.session, auth.sessionEmail),
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
  const authGateActive = authGateConfigured(auth.configured);

  const shellInput = useMemo(
    () => buildShellRoutingInput(auth, onboardingComplete, fitnessHydrated, authGateActive),
    [auth, onboardingComplete, fitnessHydrated, authGateActive],
  );

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const inTabsGroup = segments[0] === "(tabs)";
    const inModalsGroup = segments[0] === "(modals)";
    const inAppStackRoute = APP_STACK_ROUTES_OUTSIDE_TABS.has(segments[0] ?? "");

    if (authGateActive && auth.sessionResolved && !hasAuthenticatedUser(auth.session)) {
      if (!inAuthGroup) router.replace("/(auth)");
      return;
    }

    if (inModalsGroup || inAppStackRoute) {
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
      !onboardingComplete
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
    authGateActive,
  ]);
}

export function useAppShellRoutingInput(): AppShellRoutingInput {
  const auth = useAuth();
  const { fitnessHydrated } = useFitnessSync();
  const { onboardingComplete } = useOnboardingState();
  const authGateActive = authGateConfigured(auth.configured);

  return useMemo(
    () => buildShellRoutingInput(auth, onboardingComplete, fitnessHydrated, authGateActive),
    [auth, onboardingComplete, fitnessHydrated, authGateActive],
  );
}
