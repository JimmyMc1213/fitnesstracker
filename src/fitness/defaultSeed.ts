import { buildAppStateFromPersisted } from "./buildAppState";
import {
  DEFAULT_NUTRITION_TARGETS,
  defaultHabitTemplates,
  defaultWorkoutRoutineTemplates,
} from "./data";
import { loadPersistedSlice, savePersistedSlice, sliceFromAppState } from "./persistFitnessSlice";

/** First-launch local demo: generic program defaults (no personal plan bundle). */
export function seedDefaultData(): void {
  const base = sliceFromAppState(buildAppStateFromPersisted(loadPersistedSlice()));
  const templates = defaultWorkoutRoutineTemplates();
  savePersistedSlice({
    ...base,
    displayName: "",
    nutritionTargets: { ...DEFAULT_NUTRITION_TARGETS },
    nutritionPresets: [],
    workoutTemplates: templates,
    habitTemplates: defaultHabitTemplates(),
    stepsTarget: 10_000,
    workout: {
      ...base.workout,
      splitId: templates[0]?.id ?? base.workout.splitId,
    },
  });
}
