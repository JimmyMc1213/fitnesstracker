import type { AppState, GoalPace, NutritionGoal, OnboardingProfile } from "@newyouai/types";

import { calculateNutritionTargets } from "../nutrition/calculator";
import {
  nutritionCalcInputFromOnboardingProfile,
  progressGoalFromOnboarding,
} from "../onboarding/progressGoal";
import { defaultGoalWeightLbs } from "./goalWeight";

export const NUTRITION_GOALS: NutritionGoal[] = ["cut", "bulk", "maintain"];

export const GOAL_PACE_OPTIONS: { value: GoalPace; label: string; hint?: string }[] = [
  { value: "slow", label: "Slow and steady (~0.5 lb/wk)" },
  { value: "balanced", label: "Balanced (~1 lb/wk)" },
  {
    value: "aggressive",
    label: "Aggressive (~1.5 lb/wk)",
    hint: "Faster results, but harder to keep muscle if nutrition slips.",
  },
];

export function nutritionGoalSettingsLabel(goal: NutritionGoal): string {
  return goal === "cut" ? "Lose weight" : goal === "bulk" ? "Build muscle" : "Maintain and perform";
}

export function latestWeightLbs(state: Pick<AppState, "weightLog" | "onboardingProfile">): number {
  const sorted = [...state.weightLog].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  if (sorted[0]) return sorted[0].weightLbs;
  return state.onboardingProfile?.weightLbs ?? 180;
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

export function clampGoalWeightLbs(valueLbs: number, minLbs: number, maxLbs: number): number {
  return Math.min(maxLbs, Math.max(minLbs, valueLbs));
}

export function normalizeGoalProfilePatch(
  profile: OnboardingProfile,
  patch: Partial<Pick<OnboardingProfile, "goal" | "goalWeightLbs" | "pace">>,
  currentWeightLbs: number,
): OnboardingProfile {
  const next = { ...profile, ...patch };
  if (patch.goal !== undefined && patch.goal !== profile.goal) {
    if (patch.goal === "maintain") {
      return { ...next, goalWeightLbs: undefined, pace: undefined };
    }
    return {
      ...next,
      goalWeightLbs: defaultGoalWeightLbs(patch.goal, currentWeightLbs),
      pace: next.pace ?? profile.pace ?? "balanced",
    };
  }
  return next;
}

export function applyGoalSettingsPatch(
  state: AppState,
  patch: Partial<Pick<OnboardingProfile, "goal" | "goalWeightLbs" | "pace">>,
): AppState {
  if (!state.onboardingProfile) return state;
  const currentWeightLbs = latestWeightLbs(state);
  const onboardingProfile = normalizeGoalProfilePatch(state.onboardingProfile, patch, currentWeightLbs);
  return applyGoalSettingsProfile(state, onboardingProfile, currentWeightLbs);
}

export function applyGoalSettingsDraft(state: AppState, draft: OnboardingProfile): AppState {
  if (!state.onboardingProfile) return state;
  const currentWeightLbs = latestWeightLbs(state);
  const goal = draft.goal ?? "maintain";
  const onboardingProfile: OnboardingProfile = {
    ...state.onboardingProfile,
    goal,
    goalWeightLbs: goal === "maintain" ? undefined : draft.goalWeightLbs,
    pace: goal === "maintain" ? undefined : draft.pace,
  };
  return applyGoalSettingsProfile(state, onboardingProfile, currentWeightLbs);
}

function applyGoalSettingsProfile(
  state: AppState,
  onboardingProfile: OnboardingProfile,
  currentWeightLbs: number,
): AppState {
  const progressGoal = progressGoalFromOnboarding(onboardingProfile, {
    anchorWeightLbs: currentWeightLbs,
    progressStartWeightLbs: state.progressGoal?.progressStartWeightLbs,
  });
  const nutritionTargets = calculateNutritionTargets(nutritionCalcInputFromOnboardingProfile(onboardingProfile));
  return { ...state, onboardingProfile, progressGoal, nutritionTargets };
}

export type GoalSettingsFields = Pick<OnboardingProfile, "goal" | "goalWeightLbs" | "pace">;

function snapshotGoalSettings(profile: OnboardingProfile): GoalSettingsFields {
  return {
    goal: profile.goal,
    goalWeightLbs: profile.goalWeightLbs,
    pace: profile.pace,
  };
}

export function isGoalSettingsDirty(saved: OnboardingProfile, draft: OnboardingProfile): boolean {
  const a = snapshotGoalSettings(saved);
  const b = snapshotGoalSettings(draft);
  return a.goal !== b.goal || a.goalWeightLbs !== b.goalWeightLbs || a.pace !== b.pace;
}
