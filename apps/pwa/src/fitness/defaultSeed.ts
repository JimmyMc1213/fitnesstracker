import { buildAppStateFromPersisted } from "./buildAppState";
import { DEFAULT_NUTRITION_TARGETS } from "./data";
import { loadPersistedSlice, savePersistedSlice, sliceFromAppState } from "./persistFitnessSlice";

/** First-launch local demo: nutrition/habit defaults only — workouts come from onboarding or user edits. */
export function seedDefaultData(): void {
  const base = sliceFromAppState(buildAppStateFromPersisted(loadPersistedSlice()));
  savePersistedSlice({
    ...base,
    displayName: "",
    nutritionTargets: { ...DEFAULT_NUTRITION_TARGETS },
    nutritionPresets: [],
    workoutTemplates: [],
    stepsTarget: 10_000,
  });
}
