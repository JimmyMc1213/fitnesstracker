import type { WorkoutRoutineTemplate } from "@newyouai/types";
import { DEFAULT_REST_TIMER_SECONDS } from "./restTimerConstants";

/** Average seconds of work per set (lifting + setup). */
export const AVG_WORK_SECONDS_PER_SET = 45;

/** Seconds between exercises (walk, rack change). */
export const EXERCISE_TRANSITION_SECONDS = 60;

/** Fixed warmup / general session buffer before main lifts. */
export const SESSION_WARMUP_BUFFER_SECONDS = 300;

export function estimateSessionSecondsFromCounts(
  exerciseCount: number,
  setsPerExercise: number,
  restSeconds: number,
): number {
  if (exerciseCount <= 0 || setsPerExercise <= 0) return 0;

  let total = SESSION_WARMUP_BUFFER_SECONDS;
  for (let i = 0; i < exerciseCount; i++) {
    total += setsPerExercise * AVG_WORK_SECONDS_PER_SET;
    total += Math.max(0, setsPerExercise - 1) * restSeconds;
  }
  total += Math.max(0, exerciseCount - 1) * EXERCISE_TRANSITION_SECONDS;
  return total;
}

export function estimateRoutineSessionSeconds(
  routine: WorkoutRoutineTemplate,
  restSeconds?: number,
): number {
  const rest = restSeconds ?? DEFAULT_REST_TIMER_SECONDS;
  const { exercises } = routine;
  if (exercises.length === 0) return 0;

  const setsPerExercise = exercises.map((ex) => ex.sets.length);
  const uniformSets = setsPerExercise.every((count) => count === setsPerExercise[0]);
  if (uniformSets && setsPerExercise[0] != null) {
    return estimateSessionSecondsFromCounts(exercises.length, setsPerExercise[0], rest);
  }

  let total = SESSION_WARMUP_BUFFER_SECONDS;
  for (const ex of exercises) {
    const sets = ex.sets.length;
    total += sets * AVG_WORK_SECONDS_PER_SET;
    total += Math.max(0, sets - 1) * rest;
  }
  total += Math.max(0, exercises.length - 1) * EXERCISE_TRANSITION_SECONDS;
  return total;
}

/** Rounded human copy for display (e.g. `~55 min`). Empty string when totalSec <= 0. */
export function formatEstimatedSessionMinutes(totalSec: number): string {
  if (totalSec <= 0) return "";
  const minutes = totalSec / 60;
  const rounded = Math.round(minutes / 5) * 5;
  const display = Math.max(15, rounded);
  return `~${display} min`;
}

/** Secondary header label: `Push, ~55 min`. Empty string when routine has no exercises. */
export function estimatedSessionLabel(routine: WorkoutRoutineTemplate): string {
  if (routine.exercises.length === 0) return "";
  const mins = formatEstimatedSessionMinutes(estimateRoutineSessionSeconds(routine));
  if (!mins) return "";
  return `${routine.name}, ${mins}`;
}
