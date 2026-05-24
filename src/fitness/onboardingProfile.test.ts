import { describe, expect, it } from "vitest";

import {
  ageFromDateOfBirth,
  normalizeOnboardingProfile,
  progressGoalFromOnboarding,
  DEFAULT_ONBOARDING_PROFILE,
} from "./onboardingProfile";

describe("ageFromDateOfBirth", () => {
  it("derives age on a reference date", () => {
    expect(ageFromDateOfBirth("1990-06-15", new Date(2026, 4, 23))).toBe(35);
    expect(ageFromDateOfBirth("1990-06-15", new Date(2026, 5, 15))).toBe(36);
  });

  it("returns null for invalid input", () => {
    expect(ageFromDateOfBirth("not-a-date")).toBeNull();
  });
});

describe("normalizeOnboardingProfile", () => {
  it("derives age from dateOfBirth when present", () => {
    const profile = normalizeOnboardingProfile({
      ...DEFAULT_ONBOARDING_PROFILE,
      age: 99,
      dateOfBirth: "2000-01-01",
    });
    expect(profile?.age).toBeGreaterThanOrEqual(25);
    expect(profile?.dateOfBirth).toBe("2000-01-01");
  });

  it("accepts goalWeightLbs and pace", () => {
    const profile = normalizeOnboardingProfile({
      ...DEFAULT_ONBOARDING_PROFILE,
      goalWeightLbs: 165,
      pace: "slow",
    });
    expect(profile?.goalWeightLbs).toBe(165);
    expect(profile?.pace).toBe("slow");
  });
});

describe("progressGoalFromOnboarding", () => {
  it("uses explicit goalWeightLbs for cut", () => {
    const goal = progressGoalFromOnboarding({
      ...DEFAULT_ONBOARDING_PROFILE,
      goal: "cut",
      weightLbs: 200,
      goalWeightLbs: 180,
    });
    expect(goal.goalWeightHighLbs).toBe(180);
    expect(goal.progressStartWeightLbs).toBe(200);
  });

  it("uses explicit goalWeightLbs for bulk", () => {
    const goal = progressGoalFromOnboarding({
      ...DEFAULT_ONBOARDING_PROFILE,
      goal: "bulk",
      weightLbs: 160,
      goalWeightLbs: 175,
    });
    expect(goal.goalWeightLowLbs).toBe(175);
    expect(goal.progressStartWeightLbs).toBe(160);
  });
});
