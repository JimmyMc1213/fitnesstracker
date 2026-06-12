import type {
  AppState,
  CompletedWorkoutSession,
  MacroTotals,
  OnboardingProfile,
  WeightEntry,
  WorkoutDaysPerWeek,
  WorkoutState,
} from "@newyouai/types";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "../../sync/notificationPreferences";

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

const DEFAULT_NUTRITION_TARGETS: MacroTotals = { cal: 2000, p: 150, c: 200, f: 65 };

const INITIAL_WORKOUT: WorkoutState = {
  splitId: "",
  startedAt: "-",
  sessionDayKey: null,
  sessionPhase: "idle",
  sessionTitle: "Workout",
  sessionStartedAtMs: null,
  exercises: [],
};

function emptyAppState(): AppState {
  return {
    displayName: "",
    habitTemplates: [],
    habitsDoneByDay: {},
    planStartIso: "2026-01-01",
    stepsTarget: 8000,
    nutritionLog: [],
    nutritionManualByDay: {},
    nutritionItemsByDay: {},
    nutritionPresets: [],
    nutritionUserFoods: [],
    nutritionMeals: [],
    workout: { ...INITIAL_WORKOUT },
    customExercises: [],
    exerciseNotesByKey: {},
    workoutTemplates: [],
    workoutsCompletedByDay: {},
    streakEligibleByDay: {},
    fitnessStreakSnapshot: { currentCount: 0, anchorDateKey: null, updatedAtIso: new Date(0).toISOString() },
    streakSessionBaseline: null,
    streakLossNoticeDismissedForKey: null,
    exercisePersonalBests: {},
    exerciseSessionHistoryByKey: {},
    workoutHistory: [],
    workoutSummary: null,
    pendingTemplateOrderUpdatePrompt: null,
    habits: [],
    nutritionTargets: { ...DEFAULT_NUTRITION_TARGETS },
    weightLog: [],
    progressPics: [],
    progressPicsLock: null,
    lastAdjustmentSundayKey: null,
    sundayReviewCompletedKey: null,
    weekFocusCommitments: [],
    weekFocusWeekStartKey: null,
    sundayCheckInHistory: [],
    adjustmentHistory: [],
    nightlyStretchCompletedArizonaKey: null,
    nightlyStretchBlockIdsByArizonaDay: {},
    progressGoal: null,
    unitPreferences: { weightUnit: "lbs", heightUnit: "ft_in", volumeUnit: "oz" },
    unitPreferencesChosen: true,
    experienceLevel: "intermediate",
    experienceLevelChosen: true,
    equipmentSetup: "full_gym",
    equipmentSetupChosen: true,
    restTimerDefaultSeconds: 60,
    restTimerSecondsByExerciseKey: {},
    onboardingProfile: null,
    onboardingComplete: false,
    onboardingDraft: null,
    theme: "dark",
    subscriptionTier: null,
    notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
    waterLogByDay: {},
    waterDailyTargetOz: 64,
  };
}

export function minimalAppState(overrides?: Partial<AppState>): AppState {
  return {
    ...emptyAppState(),
    ...overrides,
  };
}

export function trainingDayAppState(opts: {
  dateKey: string;
  templateName?: string;
  daysPerWeek?: WorkoutDaysPerWeek;
}): AppState {
  const { templateName = "Upper strength", daysPerWeek = 5 } = opts;
  return {
    ...emptyAppState(),
    workoutTemplates: [
      {
        id: "mon-upper",
        name: templateName,
        dayLabel: "Mon",
        focus: "Bench · Pulldown/pull-up · Accessories",
        exercises: [],
      },
    ],
    notificationPreferences: {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      workoutReminderEnabled: true,
      workoutReminderTime: "08:00",
      nutritionCheckInEnabled: true,
      nutritionCheckInTime: "20:00",
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

export function restDayAppState(dateKey: string, daysPerWeek: WorkoutDaysPerWeek = 5): AppState {
  return trainingDayAppState({ dateKey, daysPerWeek });
}

export function weighInTrendAppState(entries: WeightEntry[]): AppState {
  return minimalAppState({ weightLog: entries });
}

export function workoutHistoryAppState(sessions: CompletedWorkoutSession[]): AppState {
  return minimalAppState({ workoutHistory: sessions });
}

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
