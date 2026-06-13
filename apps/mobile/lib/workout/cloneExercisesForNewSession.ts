import type { WorkoutExercise } from "@newyouai/types";

/** Fresh IDs and set clones for starting a live session from a saved routine. */
export function cloneExercisesForNewSession(exercises: WorkoutExercise[]): WorkoutExercise[] {
  const t = Date.now();
  return exercises.map((e, i) => ({
    ...e,
    id: `e${t}-${i}-${Math.random().toString(36).slice(2, 9)}`,
    sets: e.sets.map((s) => ({ ...s })),
  }));
}
