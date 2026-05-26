import type { Page } from "@playwright/test";

export const FITNESS_LOCAL_STORAGE_KEY = "fitcoach:persist:v1";
export const GYMMY_ONBOARDING_DRAFT_KEY = "gymmy_onboarding_draft";

export async function clearFitnessStorage(page: Page): Promise<void> {
  await page.addInitScript(
    ([fitnessKey, draftKey, flagKey]) => {
      if (sessionStorage.getItem(flagKey)) return;
      localStorage.removeItem(fitnessKey);
      localStorage.removeItem(draftKey);
      sessionStorage.setItem(flagKey, "1");
    },
    [FITNESS_LOCAL_STORAGE_KEY, GYMMY_ONBOARDING_DRAFT_KEY, "__e2e_fitness_cleared__"] as const,
  );
}

export function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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

function basePersistSlice(dateKey: string) {
  return {
    onboardingComplete: true,
    displayName: "Test",
    nutritionTargets: { ...DEFAULT_TARGETS },
    nutritionPresets: [],
    nutritionItemsByDay: {},
    nutritionManualByDay: {},
    workoutTemplates: BASE_WORKOUT_TEMPLATES,
    workoutsCompletedByDay: {},
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
    unitPreferences: { weightUnit: "lbs", heightUnit: "ft_in" },
    unitPreferencesChosen: true,
    habitTemplates: [],
    habitsDoneByDay: {},
    weightLog: [],
    waterLogByDay: {},
    waterDailyTargetOz: 64,
    notificationPreferences: {
      workoutReminderEnabled: false,
      workoutReminderTime: "08:00",
      nutritionCheckInEnabled: false,
      nutritionCheckInTime: "20:00",
      lastFiredWorkoutReminderDateKey: null,
      lastFiredNutritionReminderDateKey: null,
    },
    workout: {
      splitId: "",
      exercises: [],
      sessionPhase: "idle",
      startedAt: "-",
      sessionDayKey: null,
      sessionStartedAtMs: null,
      sessionTitle: "Workout",
    },
    _dateKey: dateKey,
  };
}

/** Workout done + protein goal hit → coach task "Review session" navigates to Nutrition tab. */
export function coachNutritionPersistSeed(dateKey = localDateKey()) {
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
export function workoutSessionPersistSeed(dateKey = localDateKey()) {
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
export function fuelQuickLogPersistSeed(dateKey = localDateKey()) {
  const base = basePersistSlice(dateKey);
  return {
    ...base,
    nutritionItemsByDay: {
      [dateKey]: [{ id: "e2e-light", name: "Light breakfast", cal: 200, p: 20, c: 15, f: 5 }],
    },
  };
}

/** Saved meal in library + light breakfast logged → My meals one-tap log E2E. */
export function mealLogPersistSeed(dateKey = localDateKey()) {
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

export async function seedPersist(page: Page, slice: Record<string, unknown>): Promise<void> {
  const { _dateKey: _, ...persist } = slice;
  await page.addInitScript(
    ([key, json]) => {
      localStorage.setItem(key, json);
    },
    [FITNESS_LOCAL_STORAGE_KEY, JSON.stringify(persist)] as const,
  );
}
