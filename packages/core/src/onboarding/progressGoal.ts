import type { NutritionGoal, OnboardingProfile, ProgressGoalConfig } from "@newyouai/types";

import type { NutritionCalcInput } from "../nutrition/calculator";

export function nutritionCalcInputFromOnboardingProfile(
  profile: OnboardingProfile,
  ageOverride?: number,
): NutritionCalcInput {
  return {
    weightLbs: profile.weightLbs,
    heightIn: profile.heightIn,
    age: ageOverride ?? profile.age,
    gender: profile.gender ?? "male",
    activityLevel: profile.activityLevel ?? "moderate",
    goal: profile.goal ?? "maintain",
    pace: profile.pace,
    goalWeightLbs: profile.goalWeightLbs,
  };
}

export type ProgressGoalOptions = {
  anchorWeightLbs?: number;
  progressStartWeightLbs?: number;
};

export function progressGoalFromOnboarding(
  profile: OnboardingProfile,
  options?: ProgressGoalOptions,
): ProgressGoalConfig {
  const w = options?.anchorWeightLbs ?? profile.weightLbs;
  const target = profile.goalWeightLbs;
  const progressStartWeightLbs = options?.progressStartWeightLbs ?? Math.round(w);

  if (profile.goal === "cut") {
    if (target != null && target < w) {
      return {
        goalWeightLowLbs: Math.round(target - 3),
        goalWeightHighLbs: Math.round(target),
        progressStartWeightLbs,
      };
    }
    return {
      goalWeightLowLbs: Math.round(w - 12),
      goalWeightHighLbs: Math.round(w - 5),
      progressStartWeightLbs,
    };
  }
  if (profile.goal === "bulk") {
    if (target != null && target > w) {
      return {
        goalWeightLowLbs: Math.round(target),
        goalWeightHighLbs: Math.round(target + 3),
        progressStartWeightLbs,
      };
    }
    return {
      goalWeightLowLbs: Math.round(w + 3),
      goalWeightHighLbs: Math.round(w + 12),
      progressStartWeightLbs,
    };
  }
  return {
    goalWeightLowLbs: Math.round(w - 3),
    goalWeightHighLbs: Math.round(w + 3),
    progressStartWeightLbs,
  };
}

export function nutritionGoalLabel(goal: NutritionGoal): string {
  return goal === "bulk" ? "Bulk" : goal === "cut" ? "Cut" : "Maintain";
}
