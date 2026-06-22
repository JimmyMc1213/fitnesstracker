import { describe, expect, it } from "vitest";

import {
  hasOnboardingProfileSetup,
  isLegacyUserEmail,
  shouldSkipOnboarding,
} from "./onboardingSkip";

describe("onboardingSkip", () => {
  it("skips for legacy email when listed", () => {
    expect(
      shouldSkipOnboarding({
        persisted: { onboardingComplete: false },
        sessionEmail: "legacy@example.com",
        legacyEmails: ["legacy@example.com"],
      }),
    ).toBe(true);
  });

  it("does not skip a fresh signed-in user without setup", () => {
    expect(
      shouldSkipOnboarding({
        persisted: { onboardingComplete: false },
        sessionEmail: "new-user@example.com",
        legacyEmails: ["legacy@example.com"],
      }),
    ).toBe(false);
  });

  it("detects onboarding profile setup without onboardingComplete", () => {
    expect(
      hasOnboardingProfileSetup({
        onboardingComplete: false,
        experienceLevelChosen: true,
        equipmentSetupChosen: true,
        unitPreferencesChosen: true,
        onboardingProfile: { goal: "maintain" } as never,
      }),
    ).toBe(true);
  });

  it("matches legacy emails case-insensitively", () => {
    expect(isLegacyUserEmail("Legacy@Example.com", ["legacy@example.com"])).toBe(true);
  });
});
