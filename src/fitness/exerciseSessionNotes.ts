/**
 * Rule-based per-exercise session coach notes (FTI-54).
 * Uses workoutHistory (per-set snapshots), same source as workoutAutofill.
 */
import { findLastLoggedExerciseSets } from "./workoutAutofill";
import type { CompletedWorkoutSession, WorkoutExercise } from "./types";

export type ExerciseSessionNoteContext = {
  workoutHistory: CompletedWorkoutSession[] | undefined;
};

/** Strip em/en dashes and multiplication signs from legacy or cached coach copy. */
export function sanitizeCoachCopy(text: string): string {
  return text
    .replace(/\u2014/g, ", ")
    .replace(/\u2013/g, "-")
    .replace(/(\d)\s*\u00d7\s*(\d)/g, "$1x$2")
    .replace(/\u00d7/g, "x")
    .replace(/\s+,/g, ",")
    .replace(/,\s+,/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function formatSetPair(w: number, r: number): string {
  if (w > 0 && r > 0) return `${w}x${r}`;
  if (w > 0) return `${w} lb`;
  return "";
}

function progressiveOverloadNote(exercise: WorkoutExercise, lastSets: { w: number; r: number }[]): string {
  const logged = lastSets.filter((s) => s.w > 0 || s.r > 0);
  const pairs = logged.map((s) => formatSetPair(s.w, s.r)).filter(Boolean).join(", ");
  const withWeightReps = logged.filter((s) => s.w > 0 && s.r > 0);
  if (withWeightReps.length > 0) {
    const top = Math.max(...withWeightReps.map((s) => s.w));
    const maxR = Math.max(...withWeightReps.map((s) => s.r));
    const historyBit = pairs ? `Last session: ${pairs}. ` : "";
    return `${historyBit}Match or beat ${top}x${maxR} lb, add ~5 lb when every set hits the top of the range with reps in reserve.`;
  }
  return genericExerciseSessionNote(exercise);
}

function genericExerciseSessionNote(exercise: WorkoutExercise): string {
  return `Lead with ${exercise.name}. Hit the listed rep range with 1-2 reps in reserve, chase clean reps before heavier loads.`;
}

/** Deterministic coach note for one exercise at session start. */
export function getExerciseSessionNote(
  ctx: ExerciseSessionNoteContext,
  exercise: WorkoutExercise,
): string {
  const lastSets = findLastLoggedExerciseSets(ctx.workoutHistory, exercise.name, exercise.label);
  if (lastSets?.some((s) => s.w > 0 || s.r > 0)) {
    return progressiveOverloadNote(exercise, lastSets);
  }
  return genericExerciseSessionNote(exercise);
}

export function buildSessionCoachNoteForExercise(
  history: CompletedWorkoutSession[] | undefined,
  exercise: WorkoutExercise,
): string {
  return getExerciseSessionNote({ workoutHistory: history }, exercise);
}

/** Build once per session start / exercise add, keyed by exercise instance id. */
export function buildSessionCoachNotesByExerciseId(
  history: CompletedWorkoutSession[] | undefined,
  exercises: WorkoutExercise[],
): Record<string, string> {
  const notes: Record<string, string> = {};
  for (const ex of exercises) {
    notes[ex.id] = getExerciseSessionNote({ workoutHistory: history }, ex);
  }
  return notes;
}
