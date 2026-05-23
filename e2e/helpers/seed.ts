import type { Page } from "@playwright/test";

export const FITNESS_LOCAL_STORAGE_KEY = "fitcoach:persist:v1";

export function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DEFAULT_TARGETS = { cal: 2200, p: 180, c: 220, f: 65 };

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
    workout: { splitId: "mon-upper", exercises: [] },
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

export async function seedPersist(page: Page, slice: Record<string, unknown>): Promise<void> {
  const { _dateKey: _, ...persist } = slice;
  await page.addInitScript(
    ([key, json]) => {
      localStorage.setItem(key, json);
    },
    [FITNESS_LOCAL_STORAGE_KEY, JSON.stringify(persist)] as const,
  );
}
