import type { OnboardingProfile, ProgressGoalConfig } from "@newyouai/types";

/** Age in whole years on `asOf` (local calendar). Ported from PWA onboardingProfile.ts */
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

export function defaultOnboardingDateOfBirth(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 30);
  d.setMonth(0);
  d.setDate(1);
  return localDateKey(d);
}

export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isValidOnboardingDateOfBirth(dateOfBirth: string | undefined): boolean {
  if (!dateOfBirth) return false;
  const age = ageFromDateOfBirth(dateOfBirth);
  return age != null && age >= 13 && age <= 100;
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

export function progressGoalFromOnboarding(profile: OnboardingProfile): ProgressGoalConfig {
  const w = profile.weightLbs;
  const target = profile.goalWeightLbs;
  const progressStartWeightLbs = Math.round(w);

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
