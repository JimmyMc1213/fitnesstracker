import { describe, expect, it } from "vitest";

import { buildOnboardingDraft } from "./onboardingDraft";
import { DEFAULT_EQUIPMENT_SETUP } from "./equipmentSetup";
import { DEFAULT_EXPERIENCE_LEVEL } from "./experienceLevel";
import { mergePersistedFitnessSlices } from "./mergePersistedFitnessSlices";
import { DEFAULT_UNIT_PREFERENCES } from "./unitPreferences";
import { createEmptyPersistedSlice } from "./testFixtures";

const DEFAULT_ONBOARDING_PROFILE = {
  goal: "maintain" as const,
  heightIn: 70,
  weightLbs: 180,
  age: 30,
  gender: "male" as const,
  activityLevel: "moderate" as const,
  workoutDaysPerWeek: 4 as const,
  pace: "balanced" as const,
  sessionDuration: "45_to_60" as const,
};

function minimalSlice(overrides: Partial<ReturnType<typeof createEmptyPersistedSlice>> = {}) {
  return createEmptyPersistedSlice(overrides);
}

describe("mergePersistedFitnessSlices onboarding draft", () => {
  it("prefers remote onboarding complete over a stale local draft", () => {
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
    expect(merged.onboardingComplete).toBe(true);
    expect(merged.onboardingDraft).toBeNull();
  });
});

describe("mergePersistedFitnessSlices futureYou", () => {
  it("prefers cleared local Future You over a remote ready job after in-app delete", () => {
    const local = minimalSlice({
      subscriptionTier: "pro",
      onboardingComplete: true,
      futureYou: { onboardingGoalLocked: true },
    });
    const remote = minimalSlice({
      subscriptionTier: "pro",
      onboardingComplete: true,
      futureYou: {
        generationStatus: "ready",
        generationJobId: "job-old",
        photoStoragePath: "users/u/source/x.jpg",
        resultStoragePath: "users/u/result/y.png",
      },
    });

    const merged = mergePersistedFitnessSlices(local, remote);
    expect(merged.futureYou).toEqual({
      onboardingGoalLocked: true,
      remindersMuted: false,
      reminderDismissedDateKey: undefined,
    });
    expect(merged.subscriptionTier).toBe("pro");
    expect(merged.onboardingComplete).toBe(true);
  });
});
