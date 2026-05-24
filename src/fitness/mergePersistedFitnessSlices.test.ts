import { describe, expect, it } from "vitest";

import { mergePersistedFitnessSlices } from "./mergePersistedFitnessSlices";
import { buildOnboardingDraft } from "./onboardingDraft";
import { DEFAULT_ONBOARDING_PROFILE } from "./onboardingProfile";
import { DEFAULT_EQUIPMENT_SETUP } from "./equipmentSetup";
import { DEFAULT_EXPERIENCE_LEVEL } from "./experienceLevel";
import { DEFAULT_UNIT_PREFERENCES } from "./unitPreferences";
import type { PersistedFitnessSlice } from "./persistFitnessSlice";
import { sliceFromAppState } from "./persistFitnessSlice";
import { buildAppStateFromPersisted } from "./buildAppState";

function minimalSlice(overrides: Partial<PersistedFitnessSlice> = {}): PersistedFitnessSlice {
  return { ...sliceFromAppState(buildAppStateFromPersisted({})), ...overrides };
}

describe("mergePersistedFitnessSlices onboarding draft", () => {
  it("keeps local in-progress draft when remote marks onboarding complete", () => {
    const draft = buildOnboardingDraft({
      stepIndex: 3,
      displayName: "Jimmy",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    });
    const local = minimalSlice({ onboardingComplete: false, onboardingDraft: draft });
    const remote = minimalSlice({
      onboardingComplete: true,
      onboardingDraft: null,
      weightLog: [{ dateKey: "2026-01-01", weightLbs: 180 }],
    });

    const merged = mergePersistedFitnessSlices(local, remote);
    expect(merged.onboardingComplete).toBe(false);
    expect(merged.onboardingDraft?.stepIndex).toBe(3);
  });
});
