import type { AppState } from "./types";
import { safeJsonParse } from "./safeJsonParse";

export const FITNESS_LOCAL_STORAGE_KEY = "fitcoach:persist:v1";

const KEY = FITNESS_LOCAL_STORAGE_KEY;

export type PersistedFitnessSlice = Pick<
  AppState,
  | "nutritionLog"
  | "nutritionManualByDay"
  | "nutritionItemsByDay"
  | "nutritionPresets"
  | "nutritionUserFoods"
  | "nutritionMeals"
  | "nutritionTargets"
  | "weightLog"
  | "progressPics"
  | "progressPicsLock"
  | "lastAdjustmentSundayKey"
  | "sundayReviewCompletedKey"
  | "weekFocusCommitments"
  | "weekFocusWeekStartKey"
  | "sundayCheckInHistory"
  | "adjustmentHistory"
  | "workout"
  | "customExercises"
  | "exerciseNotesByKey"
  | "workoutTemplates"
  | "workoutsCompletedByDay"
  | "streakEligibleByDay"
  | "fitnessStreakSnapshot"
  | "streakSessionBaseline"
  | "streakLossNoticeDismissedForKey"
  | "exercisePersonalBests"
  | "exerciseSessionHistoryByKey"
  | "workoutHistory"
  | "nightlyStretchCompletedArizonaKey"
  | "nightlyStretchBlockIdsByArizonaDay"
  | "displayName"
  | "habitTemplates"
  | "habitsDoneByDay"
  | "planStartIso"
  | "stepsTarget"
  | "progressGoal"
  | "unitPreferences"
  | "unitPreferencesChosen"
  | "experienceLevel"
  | "experienceLevelChosen"
  | "equipmentSetup"
  | "equipmentSetupChosen"
  | "restTimerDefaultSeconds"
  | "restTimerSecondsByExerciseKey"
  | "onboardingProfile"
  | "onboardingComplete"
  | "onboardingDraft"
  | "theme"
  | "subscriptionTier"
  | "futureYou"
  | "notificationPreferences"
  | "waterLogByDay"
  | "waterDailyTargetOz"
>;

export function sliceFromAppState(state: AppState): PersistedFitnessSlice {
  return {
    nutritionLog: state.nutritionLog,
    nutritionManualByDay: state.nutritionManualByDay,
    nutritionItemsByDay: state.nutritionItemsByDay,
    nutritionPresets: state.nutritionPresets,
    nutritionUserFoods: state.nutritionUserFoods,
    nutritionMeals: state.nutritionMeals,
    nutritionTargets: state.nutritionTargets,
    weightLog: state.weightLog,
    progressPics: state.progressPics ?? [],
    progressPicsLock: state.progressPicsLock ?? null,
    lastAdjustmentSundayKey: state.lastAdjustmentSundayKey,
    sundayReviewCompletedKey: state.sundayReviewCompletedKey,
    weekFocusCommitments: state.weekFocusCommitments,
    weekFocusWeekStartKey: state.weekFocusWeekStartKey,
    sundayCheckInHistory: state.sundayCheckInHistory,
    adjustmentHistory: state.adjustmentHistory,
    workout: state.workout,
    customExercises: state.customExercises,
    exerciseNotesByKey: state.exerciseNotesByKey,
    workoutTemplates: state.workoutTemplates,
    workoutsCompletedByDay: state.workoutsCompletedByDay,
    streakEligibleByDay: state.streakEligibleByDay,
    fitnessStreakSnapshot: state.fitnessStreakSnapshot,
    streakSessionBaseline: state.streakSessionBaseline,
    streakLossNoticeDismissedForKey: state.streakLossNoticeDismissedForKey,
    exercisePersonalBests: state.exercisePersonalBests,
    exerciseSessionHistoryByKey: state.exerciseSessionHistoryByKey,
    workoutHistory: state.workoutHistory,
    nightlyStretchCompletedArizonaKey: state.nightlyStretchCompletedArizonaKey,
    nightlyStretchBlockIdsByArizonaDay: state.nightlyStretchBlockIdsByArizonaDay,
    displayName: state.displayName,
    habitTemplates: state.habitTemplates,
    habitsDoneByDay: state.habitsDoneByDay,
    planStartIso: state.planStartIso,
    stepsTarget: state.stepsTarget,
    progressGoal: state.progressGoal,
    unitPreferences: state.unitPreferences,
    unitPreferencesChosen: state.unitPreferencesChosen,
    experienceLevel: state.experienceLevel,
    experienceLevelChosen: state.experienceLevelChosen,
    equipmentSetup: state.equipmentSetup,
    equipmentSetupChosen: state.equipmentSetupChosen,
    restTimerDefaultSeconds: state.restTimerDefaultSeconds,
    restTimerSecondsByExerciseKey: state.restTimerSecondsByExerciseKey,
    onboardingProfile: state.onboardingProfile,
    onboardingComplete: state.onboardingComplete,
    onboardingDraft: state.onboardingDraft,
    theme: state.theme,
    subscriptionTier: state.subscriptionTier,
    futureYou: state.futureYou,
    notificationPreferences: state.notificationPreferences,
    waterLogByDay: state.waterLogByDay,
    waterDailyTargetOz: state.waterDailyTargetOz,
  };
}

export function loadPersistedSlice(): Partial<PersistedFitnessSlice> | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = safeJsonParse<Partial<PersistedFitnessSlice> | null>(raw, null, FITNESS_LOCAL_STORAGE_KEY);
    return parsed;
  } catch {
    return null;
  }
}

export function savePersistedSlice(slice: PersistedFitnessSlice): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(slice));
  } catch {
    /* quota */
  }
}
