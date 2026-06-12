import type { PersistedFitnessSlice } from "@newyouai/types";
import { DEFAULT_EQUIPMENT_SETUP } from "./equipmentSetup";
import { DEFAULT_EXPERIENCE_LEVEL } from "./experienceLevel";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "./notificationPreferences";
import { DEFAULT_REST_TIMER_SECONDS } from "./restTimerPreferences";
import { DEFAULT_UNIT_PREFERENCES } from "./unitPreferences";
import { DEFAULT_WATER_DAILY_TARGET_OZ } from "./waterIntake";
import { normalizeAppTheme } from "./theme";

const EMPTY_WORKOUT_STATE: PersistedFitnessSlice["workout"] = {
  splitId: "",
  startedAt: "-",
  sessionDayKey: null,
  sessionPhase: "idle",
  sessionTitle: "Workout",
  sessionStartedAtMs: null,
  exercises: [],
};

/** Baseline persisted slice for merge tests and fixtures. */
export function createEmptyPersistedSlice(overrides: Partial<PersistedFitnessSlice> = {}): PersistedFitnessSlice {
  return {
    nutritionLog: [],
    nutritionManualByDay: {},
    nutritionItemsByDay: {},
    nutritionPresets: [],
    nutritionUserFoods: [],
    nutritionMeals: [],
    nutritionTargets: { cal: 2000, p: 150, c: 200, f: 65 },
    weightLog: [],
    progressPics: [],
    progressPicsLock: null,
    lastAdjustmentSundayKey: null,
    sundayReviewCompletedKey: null,
    weekFocusCommitments: [],
    weekFocusWeekStartKey: null,
    sundayCheckInHistory: [],
    adjustmentHistory: [],
    workout: { ...EMPTY_WORKOUT_STATE },
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
    nightlyStretchCompletedArizonaKey: null,
    nightlyStretchBlockIdsByArizonaDay: {},
    displayName: "",
    habitTemplates: [],
    habitsDoneByDay: {},
    planStartIso: "2026-01-01",
    stepsTarget: 10_000,
    progressGoal: null,
    unitPreferences: { ...DEFAULT_UNIT_PREFERENCES },
    unitPreferencesChosen: false,
    experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
    experienceLevelChosen: false,
    equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
    equipmentSetupChosen: false,
    restTimerDefaultSeconds: DEFAULT_REST_TIMER_SECONDS,
    restTimerSecondsByExerciseKey: {},
    onboardingProfile: null,
    onboardingComplete: false,
    onboardingDraft: null,
    theme: normalizeAppTheme(undefined),
    subscriptionTier: null,
    futureYou: undefined,
    notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
    waterLogByDay: {},
    waterDailyTargetOz: DEFAULT_WATER_DAILY_TARGET_OZ,
    ...overrides,
  };
}
