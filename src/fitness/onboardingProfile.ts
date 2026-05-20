import type {
  ActivityLevel,
  NutritionGoal,
  OnboardingProfile,
  ProgressGoalConfig,
  UserGender,
  WorkoutDaysPerWeek,
} from "./types";

const GOALS: NutritionGoal[] = ["bulk", "cut", "maintain"];
const ACTIVITY: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "very_active"];
const GENDERS: UserGender[] = ["male", "female", "other"];
const DAYS: WorkoutDaysPerWeek[] = [3, 4, 5, 6];

export const DEFAULT_ONBOARDING_PROFILE: OnboardingProfile = {
  goal: "maintain",
  heightIn: 70,
  weightLbs: 180,
  age: 30,
  gender: "male",
  activityLevel: "moderate",
  workoutDaysPerWeek: 5,
};

export function normalizeOnboardingProfile(raw: unknown): OnboardingProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const goal = GOALS.includes(o.goal as NutritionGoal) ? (o.goal as NutritionGoal) : "maintain";
  const activityLevel = ACTIVITY.includes(o.activityLevel as ActivityLevel)
    ? (o.activityLevel as ActivityLevel)
    : "moderate";
  const gender = GENDERS.includes(o.gender as UserGender) ? (o.gender as UserGender) : "male";
  const days = Number(o.workoutDaysPerWeek);
  const workoutDaysPerWeek = DAYS.includes(days as WorkoutDaysPerWeek) ? (days as WorkoutDaysPerWeek) : 5;
  const heightIn = Number(o.heightIn);
  const weightLbs = Number(o.weightLbs);
  const age = Number(o.age);
  if (!Number.isFinite(heightIn) || heightIn < 48 || heightIn > 96) return null;
  if (!Number.isFinite(weightLbs) || weightLbs < 70 || weightLbs > 450) return null;
  if (!Number.isFinite(age) || age < 13 || age > 100) return null;
  return { goal, heightIn, weightLbs, age: Math.round(age), gender, activityLevel, workoutDaysPerWeek };
}

export function progressGoalFromOnboarding(profile: OnboardingProfile): ProgressGoalConfig {
  const w = profile.weightLbs;
  if (profile.goal === "cut") {
    return {
      goalWeightLowLbs: Math.round(w - 12),
      goalWeightHighLbs: Math.round(w - 5),
      progressStartWeightLbs: Math.round(w),
    };
  }
  if (profile.goal === "bulk") {
    return {
      goalWeightLowLbs: Math.round(w + 3),
      goalWeightHighLbs: Math.round(w + 12),
      progressStartWeightLbs: Math.round(w),
    };
  }
  return {
    goalWeightLowLbs: Math.round(w - 3),
    goalWeightHighLbs: Math.round(w + 3),
    progressStartWeightLbs: Math.round(w),
  };
}
