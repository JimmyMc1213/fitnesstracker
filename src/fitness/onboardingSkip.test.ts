import { describe, expect, it } from "vitest";

import { DEFAULT_ONBOARDING_PROFILE } from "./onboardingProfile";
import { hasOnboardingProfileSetup, shouldSkipOnboarding } from "./onboardingSkip";
import type { PersistedFitnessSlice } from "./persistFitnessSlice";

describe("onboardingSkip", () => {
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
});
