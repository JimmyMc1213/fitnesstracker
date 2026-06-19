import type { GoalPace, NutritionGoal, OnboardingProfile } from "@newyouai/types";

export const GOAL_PACE_OPTIONS: { value: GoalPace; label: string; hint?: string }[] = [
  { value: "slow", label: "Slow and steady (~0.5 lb/wk)" },
  { value: "balanced", label: "Balanced (~1 lb/wk)" },
  {
    value: "aggressive",
    label: "Aggressive (~1.5 lb/wk)",
    hint: "Faster results, but harder to keep muscle if nutrition slips.",
  },
];

export function goalWeightRangeLbs(goal: "cut" | "bulk", currentLbs: number): { minLbs: number; maxLbs: number } {
  if (goal === "cut") {
    return { minLbs: currentLbs - 80, maxLbs: currentLbs - 5 };
  }
  return { minLbs: currentLbs + 3, maxLbs: currentLbs + 50 };
}

export function defaultGoalWeightLbs(goal: "cut" | "bulk", currentLbs: number): number {
  if (goal === "cut") return Math.max(currentLbs - 80, Math.min(currentLbs - 5, currentLbs - 15));
  return Math.min(currentLbs + 50, Math.max(currentLbs + 3, currentLbs + 15));
}

export function clampGoalWeightLbs(valueLbs: number, minLbs: number, maxLbs: number): number {
  return Math.min(maxLbs, Math.max(minLbs, valueLbs));
}

export function isGoalWeightValid(profile: OnboardingProfile, currentWeightLbs: number): boolean {
  if (profile.goal === "maintain") return true;
  const target = profile.goalWeightLbs;
  if (target == null || !Number.isFinite(target)) return false;
  const w = currentWeightLbs;
  if (Math.abs(target - w) < 3) return false;
  if (profile.goal === "cut") return target >= w - 80 && target <= w - 5;
  if (profile.goal === "bulk") return target >= w + 3 && target <= w + 50;
  return false;
}

export function goalWeightDirectionLabel(goal: NutritionGoal): string {
  if (goal === "cut") return "Lose weight";
  if (goal === "bulk") return "Gain weight";
  return "Target weight";
}

export function normalizeGoalOnSelect(
  profile: OnboardingProfile,
  goal: NutritionGoal,
): OnboardingProfile {
  if (goal === "maintain") {
    return { ...profile, goal, goalWeightLbs: undefined, pace: undefined };
  }
  return {
    ...profile,
    goal,
    goalWeightLbs: undefined,
    pace: undefined,
  };
}
