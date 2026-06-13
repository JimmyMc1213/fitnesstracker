import { findBrowsableExercise } from "./exerciseLookup";
import type { WorkoutExercise } from "@newyouai/types";

/** How the progressive-overload coach interprets logged sets for an exercise. */
export type ExerciseProgressionKind =
  | "weight_reps"
  | "time_seconds"
  | "time_seconds_or_meters"
  | "reps_only"
  | "none";

const TIME_SECONDS_IDS = new Set([
  "wall_sit",
  "side_plank",
  "plank",
  "l_sit",
  "hollow_body_hold",
  "battle_rope",
]);

const TIME_SECONDS_OR_METERS_IDS = new Set(["farmers_carry", "suitcase_carry"]);

const REPS_ONLY_IDS = new Set([
  "burpee",
  "dragon_flag",
  "muscle_up",
  "toe_to_bar",
  "bicycle_crunch",
  "v_up",
  "clamshell",
  "donkey_kick",
  "nordic_curl",
]);

const NONE_IDS = new Set(["frog_pump", "jump_rope"]);

const LOAD_WHEN_READY_IDS = new Set(["sissy_squat", "bench_dip"]);

/** Reps-only exercises switch to weight × reps once the user logs load. */
function usesLoadWhenReady(id: string, lastSets: { w: number; r: number }[]): boolean {
  if (!LOAD_WHEN_READY_IDS.has(id)) return false;
  return lastSets.some((s) => s.w > 0 && s.r > 0);
}

export function resolveExerciseId(name: string, label?: string): string | undefined {
  return findBrowsableExercise(name, label)?.id;
}

export function getExerciseProgressionKind(
  exercise: Pick<WorkoutExercise, "name" | "label">,
  lastSets: { w: number; r: number }[],
): ExerciseProgressionKind {
  const id = resolveExerciseId(exercise.name, exercise.label);

  if (id && NONE_IDS.has(id)) return "none";
  if (id && TIME_SECONDS_OR_METERS_IDS.has(id)) return "time_seconds_or_meters";
  if (id && TIME_SECONDS_IDS.has(id)) return "time_seconds";
  if (id && REPS_ONLY_IDS.has(id)) return "reps_only";
  if (id && usesLoadWhenReady(id, lastSets)) return "weight_reps";
  if (id && LOAD_WHEN_READY_IDS.has(id)) return "reps_only";

  return "weight_reps";
}

/** Whether carry targets use meters instead of seconds (from prescription text). */
export function carryUsesMeters(exercise: WorkoutExercise): boolean {
  return /\bm(eters?)?\b/i.test(exercise.target) && !/\bsec/i.test(exercise.target);
}

export const REPS_ONLY_ADD_WEIGHT_THRESHOLD = 20;

export const TIME_PROGRESSION_STEP_SEC = 5;

export const TIME_STRUGGLE_DROP_SEC = 5;
