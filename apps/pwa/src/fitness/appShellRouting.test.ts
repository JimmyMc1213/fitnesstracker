import { describe, expect, it } from "vitest";

import {
  canReachOnboardingWizard,
  needsAuthForApp,
  resolveAppShellMainView,
  type AppShellRoutingInput,
} from "./appShellRouting";

function baseInput(overrides: Partial<AppShellRoutingInput> = {}): AppShellRoutingInput {
  return {
    configured: true,
    sessionResolved: true,
    sessionEmail: "user@example.com",
    signInRestorePending: false,
    fitnessHydrated: true,
    onboardingComplete: false,
    skipOnboarding: false,
    ...overrides,
  };
}

describe("appShellRouting — Future You step 1 auth gate", () => {
  it("fresh install: signed-out user sees auth and cannot reach onboarding", () => {
    const signedOut = baseInput({ sessionEmail: null });

    expect(needsAuthForApp(signedOut)).toBe(true);
    expect(resolveAppShellMainView(signedOut)).toBe("auth");
    expect(canReachOnboardingWizard(signedOut)).toBe(false);
  });

  it("after sign-in: new user reaches onboarding wizard (welcome step 0 inside flow)", () => {
    const freshAccount = baseInput();

    expect(resolveAppShellMainView(freshAccount)).toBe("app");
    expect(canReachOnboardingWizard(freshAccount)).toBe(true);
  });

  it("sign-out mid-onboarding: user returns to auth screen", () => {
    const signedOutMidFlow = baseInput({ sessionEmail: null });

    expect(resolveAppShellMainView(signedOutMidFlow)).toBe("auth");
    expect(canReachOnboardingWizard(signedOutMidFlow)).toBe(false);
  });

  it("local-only mode without Supabase skips auth gate", () => {
    const localOnly = baseInput({ configured: false, sessionEmail: null });

    expect(needsAuthForApp(localOnly)).toBe(false);
    expect(resolveAppShellMainView(localOnly)).toBe("app");
    expect(canReachOnboardingWizard(localOnly)).toBe(true);
  });
});
