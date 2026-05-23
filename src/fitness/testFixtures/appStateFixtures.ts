/**
 * AppState fixtures for notificationScheduler tests and FTI-34 coachEngine snapshot tests.
 * Built via buildAppStateFromPersisted — no React or DOM imports.
 */
import { buildAppStateFromPersisted } from "../buildAppState";
import { DEFAULT_ONBOARDING_PROFILE } from "../onboardingProfile";
import type { AppState, MacroTotals, WorkoutDaysPerWeek } from "../types";

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
