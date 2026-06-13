import { describe, expect, it } from "vitest";

import {
  DEFAULT_ONBOARDING_PROFILE,
  minimalAppState,
} from "../coach/testFixtures/appStateFixtures";
import {
  applyGoalSettingsDraft,
  applyGoalSettingsPatch,
  isGoalSettingsDirty,
  isGoalWeightValid,
  latestWeightLbs,
  normalizeGoalProfilePatch,
} from "./goalSettings";

describe("goalSettings", () => {
  it("uses latest weigh-in for goal weight validation", () => {
    const profile = { ...DEFAULT_ONBOARDING_PROFILE, goal: "cut" as const, goalWeightLbs: 175, weightLbs: 200 };
    expect(isGoalWeightValid(profile, 200)).toBe(true);
    expect(isGoalWeightValid(profile, 170)).toBe(false);
  });

  it("resets goal weight when switching between cut and bulk", () => {
    const profile = { ...DEFAULT_ONBOARDING_PROFILE, goal: "cut" as const, goalWeightLbs: 165, pace: "slow" as const };
    const next = normalizeGoalProfilePatch(profile, { goal: "bulk" }, 180);
    expect(next.goal).toBe("bulk");
    expect(next.goalWeightLbs).toBeGreaterThan(180);
    expect(next.pace).toBe("slow");
  });

  it("clears goal weight and pace when switching to maintain", () => {
    const profile = { ...DEFAULT_ONBOARDING_PROFILE, goal: "cut" as const, goalWeightLbs: 165, pace: "slow" as const };
    const next = normalizeGoalProfilePatch(profile, { goal: "maintain" }, 180);
    expect(next.goalWeightLbs).toBeUndefined();
    expect(next.pace).toBeUndefined();
  });

  it("updates progress goal and nutrition targets when applying a patch", () => {
    const state = minimalAppState({
      onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, goal: "maintain" },
      progressGoal: {
        goalWeightLowLbs: 177,
        goalWeightHighLbs: 183,
        progressStartWeightLbs: 180,
      },
      nutritionTargets: { cal: 2200, p: 150, c: 200, f: 70 },
      weightLog: [{ dateKey: "2026-05-20", weightLbs: 190 }],
    });
    const next = applyGoalSettingsPatch(state, { goal: "cut", goalWeightLbs: 175, pace: "balanced" });
    expect(next.onboardingProfile?.goal).toBe("cut");
    expect(next.onboardingProfile?.goalWeightLbs).toBe(175);
    expect(next.progressGoal?.goalWeightHighLbs).toBe(175);
    expect(next.progressGoal?.progressStartWeightLbs).toBe(180);
    expect(next.nutritionTargets).not.toEqual(state.nutritionTargets);
    expect(next.nutritionTargets.cal).toBeGreaterThan(1200);
  });

  it("prefers latest weigh-in over onboarding weight", () => {
    const state = minimalAppState({
      onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, weightLbs: 200 },
      weightLog: [{ dateKey: "2026-05-20", weightLbs: 185 }],
    });
    expect(latestWeightLbs(state)).toBe(185);
  });

  it("detects dirty goal settings", () => {
    const saved = { ...DEFAULT_ONBOARDING_PROFILE, goal: "maintain" as const };
    const draft = { ...saved, goal: "cut" as const, goalWeightLbs: 165, pace: "balanced" as const };
    expect(isGoalSettingsDirty(saved, draft)).toBe(true);
    expect(isGoalSettingsDirty(saved, saved)).toBe(false);
  });

  it("applies a full draft on save", () => {
    const state = minimalAppState({
      onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, goal: "maintain" },
      progressGoal: {
        goalWeightLowLbs: 177,
        goalWeightHighLbs: 183,
        progressStartWeightLbs: 180,
      },
    });
    const draft = {
      ...DEFAULT_ONBOARDING_PROFILE,
      goal: "cut" as const,
      goalWeightLbs: 165,
      pace: "balanced" as const,
    };
    const next = applyGoalSettingsDraft(state, draft);
    expect(next.onboardingProfile?.goal).toBe("cut");
    expect(next.progressGoal?.goalWeightHighLbs).toBe(165);
  });
});
