import type {
  ActivityLevel,
  GoalPace,
  NutritionGoal,
  OnboardingProfile,
  ProgressGoalConfig,
  UserGender,
  WorkoutDaysPerWeek,
} from "./types";
import { normalizeDayLabel } from "./trainingCalendar";

const GOALS: NutritionGoal[] = ["bulk", "cut", "maintain"];
const ACTIVITY: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "very_active"];
const GENDERS: UserGender[] = ["male", "female", "other"];
const DAYS: WorkoutDaysPerWeek[] = [3, 4, 5, 6];
const PACES: GoalPace[] = ["slow", "balanced", "aggressive"];

export const DEFAULT_ONBOARDING_PROFILE: OnboardingProfile = {
  goal: "maintain",
  heightIn: 70,
  weightLbs: 180,
  age: 30,
  gender: "male",
  activityLevel: "moderate",
  workoutDaysPerWeek: 5,
  trainingWeekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
};

/** Age in whole years on `asOf` (local calendar). */
export function ageFromDateOfBirth(dateOfBirth: string, asOf: Date = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return null;
  const [y, m, d] = dateOfBirth.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  let age = asOf.getFullYear() - y;
  const monthDiff = asOf.getMonth() + 1 - m;
  const dayDiff = asOf.getDate() - d;
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1;
  return age;
}

function normalizeTrainingWeekdays(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string" || !item.trim()) continue;
    const label = normalizeDayLabel(item);
    if (label) out.push(label);
  }
  return out.length > 0 ? out : undefined;
}

function normalizeGoalWeightLbs(raw: unknown): number | undefined {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 70 || n > 450) return undefined;
  return Math.round(n * 10) / 10;
}

function normalizePace(raw: unknown): GoalPace | undefined {
  return PACES.includes(raw as GoalPace) ? (raw as GoalPace) : undefined;
}

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
  let age = Number(o.age);
  const dateOfBirth = typeof o.dateOfBirth === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.dateOfBirth) ? o.dateOfBirth : undefined;
  if (dateOfBirth) {
    const fromDob = ageFromDateOfBirth(dateOfBirth);
    if (fromDob != null) age = fromDob;
  }
  if (!Number.isFinite(heightIn) || heightIn < 48 || heightIn > 96) return null;
  if (!Number.isFinite(weightLbs) || weightLbs < 70 || weightLbs > 450) return null;
  if (!Number.isFinite(age) || age < 13 || age > 100) return null;
  const trainingWeekdays = normalizeTrainingWeekdays(o.trainingWeekdays);
  const goalWeightLbs = normalizeGoalWeightLbs(o.goalWeightLbs);
  const pace = normalizePace(o.pace);
  return {
    goal,
    heightIn,
    weightLbs,
    age: Math.round(age),
    dateOfBirth,
    gender,
    activityLevel,
    workoutDaysPerWeek,
    trainingWeekdays,
    goalWeightLbs,
    pace,
  };
}

export function progressGoalFromOnboarding(profile: OnboardingProfile): ProgressGoalConfig {
  const w = profile.weightLbs;
  const target = profile.goalWeightLbs;

  if (profile.goal === "cut") {
    if (target != null && target < w) {
      return {
        goalWeightLowLbs: Math.round(target - 3),
        goalWeightHighLbs: Math.round(target),
        progressStartWeightLbs: Math.round(w),
      };
    }
    return {
      goalWeightLowLbs: Math.round(w - 12),
      goalWeightHighLbs: Math.round(w - 5),
      progressStartWeightLbs: Math.round(w),
    };
  }
  if (profile.goal === "bulk") {
    if (target != null && target > w) {
      return {
        goalWeightLowLbs: Math.round(target),
        goalWeightHighLbs: Math.round(target + 3),
        progressStartWeightLbs: Math.round(w),
      };
    }
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
