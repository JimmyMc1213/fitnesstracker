import {
  createEmptyPersistedSlice,
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_UNIT_PREFERENCES,
  localDateKey,
} from "@newyouai/core";
import type { PersistedFitnessSlice } from "@newyouai/types";

const DEFAULT_TARGETS = { cal: 2000, p: 180, c: 200, f: 65 };

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

/** Routine with one exercise → Workout tab session smoke (start → log set → finish → summary). */
export function workoutSessionPersistSeed(dateKey = localDateKey(new Date())): Partial<PersistedFitnessSlice> {
  const base = basePersistSlice(dateKey);
  const benchExercise = {
    id: "e2e-bench",
    name: "Bench press",
    target: "3 × 10",
    sets: [
      { w: 135, r: 10, done: false },
      { w: 135, r: 10, done: false },
      { w: 135, r: 10, done: false },
    ],
  };
  return {
    ...base,
    workoutHistory: [
      {
        id: "e2e-prev-session",
        dayKey: dateKey,
        endedAtMs: Date.now() - 86_400_000,
        startedAtMs: Date.now() - 86_400_000 - 3_600_000,
        title: "E2E Upper strength",
        durationSec: 3600,
        exercises: [
          {
            ...benchExercise,
            sets: benchExercise.sets.map((s) => ({ ...s, done: true })),
          },
        ],
      },
    ],
    workoutTemplates: [
      {
        id: "e2e-upper",
        name: "E2E Upper strength",
        dayLabel: "Mon",
        focus: "Bench · Smoke test",
        exercises: [benchExercise],
      },
    ],
  };
}

/** Low protein today → Home fuel quick-log available. */
export function fuelQuickLogPersistSeed(dateKey = localDateKey(new Date())): Partial<PersistedFitnessSlice> {
  const base = basePersistSlice(dateKey);
  return {
    ...base,
    nutritionItemsByDay: {
      [dateKey]: [{ id: "e2e-light", name: "Light breakfast", cal: 200, p: 20, c: 15, f: 5 }],
    },
  };
}

/**
 * Saved meal in library + light breakfast logged → My meals one-tap log E2E.
 * Port of `apps/pwa/e2e/helpers/seed.ts` `mealLogPersistSeed`.
 * Tap "E2E prep bowl" (350 cal) → expect 1650 cal left, 63/180g protein.
 */
export function mealLogPersistSeed(dateKey = localDateKey(new Date())): Partial<PersistedFitnessSlice> {
  const base = fuelQuickLogPersistSeed(dateKey);
  return {
    ...base,
    nutritionMeals: [
      {
        id: "e2e-meal-prep",
        name: "E2E prep bowl",
        createdAtMs: 1_700_000_000_000,
        items: [
          { id: "e2e-chicken", name: "Chicken", cal: 200, p: 40, c: 0, f: 4, servingLabel: "4 oz" },
          { id: "e2e-rice", name: "Rice", cal: 150, p: 3, c: 30, f: 1, servingLabel: "1 cup" },
        ],
      },
    ],
  };
}

export type E2eFitnessSeedName = "coach-nutrition" | "workout-session" | "meal-log" | "nutrition-log";

/**
 * Nutrition Maestro smoke — light breakfast logged + E2E prep bowl in My meals.
 * Port of PWA `fuelQuickLogPersistSeed` + `mealLogPersistSeed` with p:180 targets.
 */
export function nutritionLogPersistSeed(dateKey = localDateKey(new Date())): Partial<PersistedFitnessSlice> {
  return mealLogPersistSeed(dateKey);
}

export function e2eFitnessSeedByName(name: E2eFitnessSeedName): Partial<PersistedFitnessSlice> | null {
  if (name === "coach-nutrition") return coachNutritionPersistSeed();
  if (name === "workout-session") return workoutSessionPersistSeed();
  if (name === "meal-log") return mealLogPersistSeed();
  if (name === "nutrition-log") return nutritionLogPersistSeed();
  return null;
}
