import type { AppState, PersistedFitnessSlice } from "@newyouai/types";
import {
  FITNESS_LOCAL_STORAGE_KEY,
  createLocalStorageAdapter,
  savePersistedSlice as savePersistedSliceToAdapter,
  safeJsonParse,
} from "@newyouai/core";
import type { SyncStorageLike } from "@newyouai/core";

function fitnessSyncStorage(): SyncStorageLike {
  if (typeof localStorage !== "undefined") return localStorage;
  const mem = new Map<string, string>();
  return {
    getItem: (key) => mem.get(key) ?? null,
    setItem: (key, value) => {
      mem.set(key, value);
    },
    removeItem: (key) => {
      mem.delete(key);
    },
  };
}

export { FITNESS_LOCAL_STORAGE_KEY };
export type { PersistedFitnessSlice };

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

/** Sync load — mirrors core `loadPersistedSlice` for browser localStorage. */
export function loadPersistedSlice(): Partial<PersistedFitnessSlice> | null {
  try {
    const raw = fitnessSyncStorage().getItem(FITNESS_LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return safeJsonParse<Partial<PersistedFitnessSlice> | null>(raw, null, FITNESS_LOCAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Sync save — delegates to core adapter; localStorage write completes before return. */
export function savePersistedSlice(slice: PersistedFitnessSlice): void {
  const adapter = createLocalStorageAdapter(fitnessSyncStorage());
  void savePersistedSliceToAdapter(adapter, FITNESS_LOCAL_STORAGE_KEY, slice);
}
