import { DEFAULT_UNIT_PREFERENCES } from "@newyouai/core";
import type { OnboardingProfile } from "@newyouai/types";

/** Empty profile, selections come from step screens in RN-4-02+. */
export const FRESH_ONBOARDING_PROFILE: OnboardingProfile = {
  heightIn: 0,
  weightLbs: 0,
  age: 0,
};

export const DEFAULT_WIZARD_UNIT_PREFERENCES = DEFAULT_UNIT_PREFERENCES;
