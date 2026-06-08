/** Auth-first routing for FitnessApp — sign in before any onboarding step. */

export type AppShellMainView = "loading" | "auth" | "app";

export type AppShellRoutingInput = {
  configured: boolean;
  sessionResolved: boolean;
  sessionEmail: string | null;
  signInRestorePending: boolean;
  fitnessHydrated: boolean;
  onboardingComplete: boolean;
  skipOnboarding: boolean;
};

export function needsAuthForApp(
  input: Pick<AppShellRoutingInput, "configured" | "sessionResolved" | "sessionEmail">,
): boolean {
  return input.configured && input.sessionResolved && input.sessionEmail == null;
}

export function isAppShellLoading(input: AppShellRoutingInput): boolean {
  const awaitingSessionBootstrap = input.configured && !input.sessionResolved;
  const restoringAfterSignIn = input.signInRestorePending && input.sessionEmail != null;
  const awaitingSignedInHydration =
    input.configured &&
    input.sessionEmail != null &&
    !input.fitnessHydrated &&
    !input.onboardingComplete;

  return awaitingSessionBootstrap || awaitingSignedInHydration || restoringAfterSignIn;
}

export function resolveAppShellMainView(input: AppShellRoutingInput): AppShellMainView {
  if (isAppShellLoading(input)) return "loading";
  if (needsAuthForApp(input)) return "auth";
  return "app";
}

/** True when the onboarding wizard (welcome, theme picker, step 1+) may render. */
export function canReachOnboardingWizard(input: AppShellRoutingInput): boolean {
  return resolveAppShellMainView(input) === "app" && !input.skipOnboarding && !input.onboardingComplete;
}
