import { describe, expect, it, vi } from "vitest";

import { DEFAULT_ONBOARDING_PROFILE } from "./onboardingProfile";
import {
  finalizeSignedInAppAccess,
  hasOnboardingProfileSetup,
  isLegacyUserEmail,
  shouldSkipOnboarding,
} from "./onboardingSkip";
import type { PersistedFitnessSlice } from "./persistFitnessSlice";
import { FITNESS_LOCAL_STORAGE_KEY } from "./persistFitnessSlice";

describe("onboardingSkip", () => {
  it("treats personal outlook email as legacy; dev email is not legacy", () => {
    expect(isLegacyUserEmail("jimmymccarthy1213@outlook.com")).toBe(true);
    expect(isLegacyUserEmail("jimmy.mccarthy@nodoublesgolfco.com")).toBe(false);
  });

  it("skips when onboarding profile setup flags are present without onboardingComplete", () => {
    const persisted: Partial<PersistedFitnessSlice> = {
      onboardingComplete: false,
      experienceLevelChosen: true,
      equipmentSetupChosen: true,
      unitPreferencesChosen: true,
      onboardingProfile: DEFAULT_ONBOARDING_PROFILE,
    };

    expect(hasOnboardingProfileSetup(persisted)).toBe(true);
    expect(
      shouldSkipOnboarding({
        persisted,
        sessionEmail: "new-user@example.com",
        forcePreview: false,
      }),
    ).toBe(true);
  });

  it("does not skip onboarding for a signed-in user without completed setup", () => {
    expect(
      shouldSkipOnboarding({
        persisted: { onboardingComplete: false },
        sessionEmail: "jimmy.mccarthy@nodoublesgolfco.com",
        forcePreview: false,
      }),
    ).toBe(false);
  });

  it("finalizeSignedInAppAccess marks onboarding complete and clears draft storage", () => {
    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    });

    const slice = finalizeSignedInAppAccess({
      onboardingComplete: false,
      onboardingDraft: { version: 16, stepIndex: 2, updatedAtIso: "2026-01-01T00:00:00.000Z" },
    } as Partial<PersistedFitnessSlice>);

    expect(slice.onboardingComplete).toBe(true);
    expect(slice.onboardingDraft).toBeNull();
    const persisted = JSON.parse(store[FITNESS_LOCAL_STORAGE_KEY] ?? "{}");
    expect(persisted.onboardingComplete).toBe(true);
    expect(persisted.onboardingDraft).toBeNull();

    vi.unstubAllGlobals();
  });
});
