import { hasExistingFitnessData, sanitizeWorkoutTemplates } from "@newyouai/core";
import type { PersistedFitnessSlice } from "@newyouai/types";

/** Sync migration on persisted slice before building AppState or saving (PWA parity subset). */
export function migratePersistedFitnessSlice(
  slice: PersistedFitnessSlice,
): { slice: PersistedFitnessSlice; dirty: boolean } {
  const onboardingComplete = slice.onboardingComplete === true || hasExistingFitnessData(slice);
  const workoutTemplates = sanitizeWorkoutTemplates(slice.workoutTemplates, { onboardingComplete });
  const dirty = JSON.stringify(workoutTemplates) !== JSON.stringify(slice.workoutTemplates);

  return {
    slice: dirty ? { ...slice, workoutTemplates } : slice,
    dirty,
  };
}
