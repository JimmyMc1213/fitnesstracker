import {
  createEmptyPersistedSlice,
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_UNIT_PREFERENCES,
  localDateKey,
} from "@newyouai/core";
import type { PersistedFitnessSlice } from "@newyouai/types";

const DEFAULT_TARGETS = { cal: 2000, p: 150, c: 200, f: 65 };

const BASE_WORKOUT_TEMPLATES = [
  {
    id: "mon-upper",
    name: "Upper strength",
    dayLabel: "Mon",
    focus: "Bench · Pulldown · Accessories",
    exercises: [],
  },
];

function basePersistSlice(dateKey: string): Partial<PersistedFitnessSlice> {
  void dateKey;
  return createEmptyPersistedSlice({
    onboardingComplete: true,
    displayName: "Test",
    nutritionTargets: { ...DEFAULT_TARGETS },
    workoutTemplates: BASE_WORKOUT_TEMPLATES,
    planStartIso: "2026-05-07",
    stepsTarget: 10_000,
    onboardingProfile: {
      goal: "maintain",
      heightIn: 70,
      weightLbs: 180,
      age: 30,
      gender: "male",
      activityLevel: "moderate",
      workoutDaysPerWeek: 5,
    },
    unitPreferences: { ...DEFAULT_UNIT_PREFERENCES },
    unitPreferencesChosen: true,
    notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
    subscriptionTier: "pro",
  });
}

/** Workout done + protein logged → coach task "Log fuel" on Home. */
export function coachNutritionPersistSeed(dateKey = localDateKey(new Date())): Partial<PersistedFitnessSlice> {
  const base = basePersistSlice(dateKey);
  return {
    ...base,
    workoutsCompletedByDay: { [dateKey]: true },
    nutritionItemsByDay: {
      [dateKey]: [{ id: "e2e-meal", name: "Post-workout meal", cal: 600, p: 180, c: 40, f: 12 }],
    },
  };
}

export type E2eFitnessSeedName = "coach-nutrition";

export function e2eFitnessSeedByName(name: E2eFitnessSeedName): Partial<PersistedFitnessSlice> | null {
  if (name === "coach-nutrition") return coachNutritionPersistSeed();
  return null;
}
