import type { AppState } from "./types";

export const FITNESS_LOCAL_STORAGE_KEY = "fitcoach:persist:v1";

const KEY = FITNESS_LOCAL_STORAGE_KEY;

export type PersistedFitnessSlice = Pick<
  AppState,
  | "nutritionLog"
  | "nutritionManualByDay"
  | "nutritionItemsByDay"
  | "nutritionPresets"
  | "nutritionTargets"
  | "weightLog"
  | "lastAdjustmentSundayKey"
  | "sundayReviewCompletedKey"
  | "adjustmentHistory"
  | "workout"
  | "customExercises"
  | "exerciseNotesByKey"
  | "workoutTemplates"
  | "workoutsCompletedByDay"
  | "exercisePersonalBests"
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
>;

export function sliceFromAppState(state: AppState): PersistedFitnessSlice {
  return {
    nutritionLog: state.nutritionLog,
    nutritionManualByDay: state.nutritionManualByDay,
    nutritionItemsByDay: state.nutritionItemsByDay,
    nutritionPresets: state.nutritionPresets,
    nutritionTargets: state.nutritionTargets,
    weightLog: state.weightLog,
    lastAdjustmentSundayKey: state.lastAdjustmentSundayKey,
    sundayReviewCompletedKey: state.sundayReviewCompletedKey,
    adjustmentHistory: state.adjustmentHistory,
    workout: state.workout,
    customExercises: state.customExercises,
    exerciseNotesByKey: state.exerciseNotesByKey,
    workoutTemplates: state.workoutTemplates,
    workoutsCompletedByDay: state.workoutsCompletedByDay,
    exercisePersonalBests: state.exercisePersonalBests,
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
  };
}

export function loadPersistedSlice(): Partial<PersistedFitnessSlice> | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PersistedFitnessSlice>;
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
