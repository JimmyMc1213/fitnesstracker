import { getExerciseProgressionKind, resolveExerciseId } from "./exerciseProgressionProfile";
import { formatRepRangeBounds, formatWorkoutTarget } from "./workoutTarget";
import type { WorkoutExercise } from "@newyouai/types";

/** Default hold duration (seconds) when auto-programming timed exercises. */
export const TIMED_DEFAULT_SECONDS: Record<string, number> = {
  plank: 30,
  side_plank: 20,
  wall_sit: 30,
  l_sit: 15,
  hollow_body_hold: 20,
  battle_rope: 30,
};

export const CARRY_EXERCISE_IDS = new Set(["farmers_carry", "suitcase_carry"]);

export const CARRY_PRESCRIPTION_SUFFIX = "30 sec (or 40m)";

/** Build the prescription line shown on routines (e.g. `3 × 30 sec`). */
export function defaultExerciseTarget(
  name: string,
  label: string | undefined,
  setCount: number,
  fallbackRepRange = "8-12",
): string {
  const id = resolveExerciseId(name, label);
  if (id && id in TIMED_DEFAULT_SECONDS) {
    return formatWorkoutTarget(setCount, `${TIMED_DEFAULT_SECONDS[id]} sec`);
  }
  if (id && CARRY_EXERCISE_IDS.has(id)) {
    return formatWorkoutTarget(setCount, CARRY_PRESCRIPTION_SUFFIX);
  }
  return formatWorkoutTarget(setCount, fallbackRepRange);
}

export function usesSecFieldForExercise(exercise: Pick<WorkoutExercise, "name" | "label">): boolean {
  const kind = getExerciseProgressionKind(exercise, []);
  return kind === "time_seconds" || kind === "time_seconds_or_meters";
}

export function isCarryExercise(exercise: Pick<WorkoutExercise, "name" | "label">): boolean {
  const id = resolveExerciseId(exercise.name, exercise.label);
  return id != null && CARRY_EXERCISE_IDS.has(id);
}

/** Rep-range segment for `exercise.target` (handles sec / carry copy). */
export function formatPrescriptionRepRange(
  exercise: Pick<WorkoutExercise, "name" | "label">,
  low: number,
  high: number,
): string {
  if (usesSecFieldForExercise(exercise)) {
    const sec = Math.max(low, high);
    return isCarryExercise(exercise) ? `${sec} sec (or 40m)` : `${sec} sec`;
  }
  return formatRepRangeBounds(low, high);
}

/** Second column label in the active workout log. */
export function setFieldSecondColumnLabel(exercise: Pick<WorkoutExercise, "name" | "label">): "Reps" | "Sec" {
  return usesSecFieldForExercise(exercise) ? "Sec" : "Reps";
}
