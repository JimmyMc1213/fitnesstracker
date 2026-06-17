import type { WorkoutExercise } from "@newyouai/types";

/** How the progressive-overload coach interprets logged sets for an exercise. */
export type ExerciseProgressionKind =
  | "weight_reps"
  | "time_seconds"
  | "time_seconds_or_meters"
  | "reps_only"
  | "none";

/** Onboarding template build, full lookup ships with workout domain (RN-6). */
export function resolveExerciseId(_name: string, _label?: string): string | undefined {
  return undefined;
}

export function getExerciseProgressionKind(
  _exercise: Pick<WorkoutExercise, "name" | "label">,
  _lastSets: { w: number; r: number }[] = [],
): ExerciseProgressionKind {
  return "weight_reps";
}
