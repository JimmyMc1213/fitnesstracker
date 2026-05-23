/**
 * Set autofill from workoutHistory (per-set w/r snapshots).
 * Does NOT use exerciseSessionHistoryByKey, that stores best-only snapshots.
 */
import { exerciseNoteKey } from "./exerciseNotes";
import { getWorkoutHistorySorted } from "./workoutHistory";
import type { CompletedWorkoutSession, WorkoutExercise, WorkoutSet } from "./types";

function blankSet(): WorkoutSet {
  return { w: 0, r: 0, done: false };
}

/** Scan history newest-first; match exercise via exerciseNoteKey; return cloned sets with done: false. */
export function findLastLoggedExerciseSets(
  history: CompletedWorkoutSession[] | undefined,
  name: string,
  label?: string,
): WorkoutSet[] | null {
  const key = exerciseNoteKey(name, label);
  for (const session of getWorkoutHistorySorted(history)) {
    for (const ex of session.exercises) {
      if (exerciseNoteKey(ex.name, ex.label) !== key) continue;
      if (ex.sets.length === 0) continue;
      return ex.sets.map((s) => ({ w: s.w, r: s.r, done: false }));
    }
  }
  return null;
}

/** Map index-by-index; pad extras with last historical w/r; blank sets when lastSets is null/empty. */
export function autofillSetsForTemplateCount(
  templateSetCount: number,
  lastSets: WorkoutSet[] | null,
): WorkoutSet[] {
  if (!lastSets?.length) {
    return Array.from({ length: templateSetCount }, () => blankSet());
  }
  const out: WorkoutSet[] = [];
  for (let i = 0; i < templateSetCount; i++) {
    const src = lastSets[Math.min(i, lastSets.length - 1)]!;
    out.push({ w: src.w, r: src.r, done: false });
  }
  return out;
}

/** Apply autofill to exercise.sets.length using workoutHistory. */
export function autofillExerciseSets(
  exercise: WorkoutExercise,
  history: CompletedWorkoutSession[] | undefined,
): WorkoutExercise {
  const lastSets = findLastLoggedExerciseSets(history, exercise.name, exercise.label);
  return {
    ...exercise,
    sets: autofillSetsForTemplateCount(exercise.sets.length, lastSets),
  };
}

/** Build prefilled sets for a new exercise row (template start, add, swap). */
export function buildSetsForExercise(
  name: string,
  label: string | undefined,
  setCount: number,
  history: CompletedWorkoutSession[] | undefined,
): WorkoutSet[] {
  return autofillSetsForTemplateCount(setCount, findLastLoggedExerciseSets(history, name, label));
}
