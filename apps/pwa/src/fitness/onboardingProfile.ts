import type {
  ActivityLevel,
  GoalPace,
  NutritionGoal,
  OnboardingProfile,
  ProgressGoalConfig,
  TrainingSessionDuration,
  UserGender,
  WorkoutDaysPerWeek,
} from "./types";
import type { NutritionCalcInput } from "./nutritionCalculator";
import { normalizeReferralSource } from "./referralSource";
import {
  migrateDietaryRestrictions,
  normalizeDietaryRestrictions,
  normalizeTrainingStyle,
  normalizeBarriers,
} from "./onboardingMotivationSurvey";
import { normalizeDayLabel } from "./trainingCalendar";

const GOALS: NutritionGoal[] = ["bulk", "cut", "maintain"];
const ACTIVITY: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "very_active"];
const GENDERS: UserGender[] = ["male", "female", "other"];
const DAYS: WorkoutDaysPerWeek[] = [3, 4, 5, 6];
const PACES: GoalPace[] = ["slow", "balanced", "aggressive"];
const SESSION_DURATIONS: TrainingSessionDuration[] = [
  "30_or_less",
  "30_to_45",
  "45_to_60",
  "60_to_90",
  "90_plus",
];

const LEGACY_SESSION_DURATION: Record<string, TrainingSessionDuration> = {
  "45": "45_to_60",
  "60": "60_to_90",
  "90": "60_to_90",
  "120_plus": "90_plus",
};

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

/** Empty onboarding profile — no pill selections until the user chooses. */
export const FRESH_ONBOARDING_PROFILE: OnboardingProfile = {
  heightIn: 0,
  weightLbs: 0,
  age: 0,
};

/** Sensible starting point on the current-weight ruler (within 70–450 lb). */
export const DEFAULT_ONBOARDING_CURRENT_WEIGHT_LBS = 160;

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

export function completeOnboardingProfile(profile: OnboardingProfile, age: number): OnboardingProfile {
  if (!profile.gender || !profile.goal || !profile.activityLevel || !profile.workoutDaysPerWeek) {
    throw new Error("Onboarding profile is incomplete");
  }
  return {
    ...profile,
    age,
    gender: profile.gender,
    goal: profile.goal,
    activityLevel: profile.activityLevel,
    workoutDaysPerWeek: profile.workoutDaysPerWeek,
  };
}

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

function normalizeSessionDuration(raw: unknown): TrainingSessionDuration | undefined {
  if (typeof raw !== "string") return undefined;
  if (SESSION_DURATIONS.includes(raw as TrainingSessionDuration)) return raw as TrainingSessionDuration;
  return LEGACY_SESSION_DURATION[raw];
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
  const referralSource = normalizeReferralSource(o.referralSource);
  const barriers =
    normalizeBarriers(o.barriers) ??
    normalizeBarriers(o.goalObstacles);
  const dietaryRestrictions =
    normalizeDietaryRestrictions(o.dietaryRestrictions) ??
    migrateDietaryRestrictions(undefined, o.dietPreference);
  const trainingStyle = normalizeTrainingStyle(o.trainingStyle);
  const sessionDuration = normalizeSessionDuration(o.sessionDuration);
  const residencyCountry = o.residencyCountry === "US" || o.residencyCountry === "CA" ? o.residencyCountry : undefined;
  const residencyRegion =
    typeof o.residencyRegion === "string" && o.residencyRegion.trim()
      ? o.residencyRegion.trim().toUpperCase()
      : undefined;
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
    sessionDuration,
    goalWeightLbs,
    pace,
    referralSource,
    barriers,
    dietaryRestrictions,
    trainingStyle,
    residencyCountry,
    residencyRegion,
  };
}

export type ProgressGoalOptions = {
  /** Weight anchor for goal range math (defaults to profile.weightLbs). */
  anchorWeightLbs?: number;
  /** Keep an existing progress bar baseline when updating goal in settings. */
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
