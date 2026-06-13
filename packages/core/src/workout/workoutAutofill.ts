/**
 * Workout set initialization and previous-set lookup from workoutHistory.
 * Previous values are display-only placeholders; sets start blank (w/r = 0).
 */
import type { CompletedWorkoutSession, WorkoutExercise, WorkoutSet } from "@newyouai/types";

import { getWorkoutHistorySorted } from "../sync/workoutHistoryMerge";
import { exerciseNoteKey } from "./exerciseNoteKey";

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
      return ex.sets.map((s) => ({
        w: s.w,
        r: s.r,
        done: false,
        ...(s.kind && s.kind !== "working" ? { kind: s.kind } : {}),
      }));
    }
  }
  return null;
}

/** Blank sets for template count; previous session values are shown as UI placeholders only. */
export function autofillSetsForTemplateCount(templateSetCount: number): WorkoutSet[] {
  return Array.from({ length: templateSetCount }, () => blankSet());
}

/** Normalize exercise sets to blank rows at template count. */
export function autofillExerciseSets(
  exercise: WorkoutExercise,
  _history?: CompletedWorkoutSession[] | undefined,
): WorkoutExercise {
  return {
    ...exercise,
    sets: autofillSetsForTemplateCount(exercise.sets.length),
  };
}

/** Build blank sets for a new exercise row (template start, add, swap). */
export function buildSetsForExercise(
  _name: string,
  _label: string | undefined,
  setCount: number,
  _history?: CompletedWorkoutSession[] | undefined,
): WorkoutSet[] {
  return autofillSetsForTemplateCount(setCount);
}
