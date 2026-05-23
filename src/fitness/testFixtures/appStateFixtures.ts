/**
 * AppState fixtures for notificationScheduler tests and FTI-34 coachEngine snapshot tests.
 * Built via buildAppStateFromPersisted — no React or DOM imports.
 */
import { buildAppStateFromPersisted } from "../buildAppState";
import { DEFAULT_ONBOARDING_PROFILE } from "../onboardingProfile";
import type { AppState, CompletedWorkoutSession, MacroTotals, WeightEntry, WorkoutDaysPerWeek } from "../types";

export { workoutStateFixtures } from "./workoutStateFixtures";

export function minimalAppState(overrides?: Partial<AppState>): AppState {
  return {
    ...buildAppStateFromPersisted({}),
    ...overrides,
  };
}

export function trainingDayAppState(opts: {
  dateKey: string;
  templateName?: string;
  daysPerWeek?: WorkoutDaysPerWeek;
}): AppState {
  const { templateName = "Upper strength", daysPerWeek = 5 } = opts;
  const base = buildAppStateFromPersisted({
    onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, workoutDaysPerWeek: daysPerWeek },
    workoutTemplates: [
      {
        id: "mon-upper",
        name: templateName,
        dayLabel: "Mon",
        focus: "Bench · Pulldown/pull-up · Accessories",
        exercises: [],
      },
    ],
  });
  return {
    ...base,
    notificationPreferences: {
      ...base.notificationPreferences,
      workoutReminderEnabled: true,
      workoutReminderTime: "08:00",
      nutritionCheckInEnabled: true,
      nutritionCheckInTime: "20:00",
      lastFiredWorkoutReminderDateKey: null,
      lastFiredNutritionReminderDateKey: null,
    },
    workoutsCompletedByDay: {},
    onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, workoutDaysPerWeek: daysPerWeek },
  };
}

export function workoutCompletedAppState(dateKey: string): AppState {
  return minimalAppState({
    workoutsCompletedByDay: { [dateKey]: true },
  });
}

export function nutritionLoggedAppState(
  dateKey: string,
  totals: MacroTotals = { cal: 500, p: 40, c: 50, f: 15 },
): AppState {
  return minimalAppState({
    nutritionItemsByDay: {
      [dateKey]: [
        {
          id: "item-1",
          name: "Test meal",
          ...totals,
        },
      ],
    },
  });
}

/** Sunday or other non-training day for a 5-day split (no Mon template match). */
export function restDayAppState(dateKey: string, daysPerWeek: WorkoutDaysPerWeek = 5): AppState {
  return trainingDayAppState({ dateKey, daysPerWeek });
}

export function weighInTrendAppState(entries: WeightEntry[]): AppState {
  return minimalAppState({ weightLog: entries });
}

export function workoutHistoryAppState(sessions: CompletedWorkoutSession[]): AppState {
  return minimalAppState({ workoutHistory: sessions });
}

/** Training day with exercises on the Monday template for session estimate tests. */
export function trainingDayWithExercisesAppState(opts: {
  dateKey: string;
  templateName?: string;
}): AppState {
  const { dateKey, templateName = "Push" } = opts;
  const base = trainingDayAppState({ dateKey, templateName });
  return {
    ...base,
    workoutTemplates: [
      {
        id: "mon-push",
        name: templateName,
        dayLabel: "Mon",
        focus: "Bench · OHP · Accessories",
        exercises: [
          {
            id: "bench-1",
            name: "Bench Press",
            label: "Barbell",
            target: "3×8",
            sets: [
              { w: 135, r: 8, done: false },
              { w: 135, r: 8, done: false },
              { w: 135, r: 8, done: false },
            ],
          },
        ],
      },
    ],
  };
}
