import { findLastLoggedExerciseSets } from "./workoutAutofill";
import { formatSetWeight, weightUnitLabel } from "./unitPreferences";
import type { CompletedWorkoutSession, WeightUnit, WorkoutSet } from "./types";

export function formatPreviousSetLine(set: WorkoutSet | undefined, unit: WeightUnit): string {
  if (!set || (set.w <= 0 && set.r <= 0)) return "—";
  if (set.w > 0) {
    return `${formatSetWeight(set.w, unit)} ${weightUnitLabel(unit)} × ${set.r}`;
  }
  return `${set.r} rep${set.r === 1 ? "" : "s"}`;
}

/** Per-set lines from the most recent logged session for this exercise. */
export function previousSetsForExercise(
  history: CompletedWorkoutSession[] | undefined,
  name: string,
  label: string | undefined,
): WorkoutSet[] | null {
  return findLastLoggedExerciseSets(history, name, label);
}

export function previousSetAtIndex(
  history: CompletedWorkoutSession[] | undefined,
  name: string,
  label: string | undefined,
  setIndex: number,
  unit: WeightUnit,
): string {
  const last = previousSetsForExercise(history, name, label);
  if (!last?.length) return "—";
  const src = last[Math.min(setIndex, last.length - 1)];
  return formatPreviousSetLine(src, unit);
}

export function previousSetLinesForExercise(
  history: CompletedWorkoutSession[] | undefined,
  name: string,
  label: string | undefined,
  setCount: number,
  unit: WeightUnit,
): string[] {
  const last = previousSetsForExercise(history, name, label);
  return Array.from({ length: setCount }, (_, i) => {
    const src = last?.[Math.min(i, (last?.length ?? 1) - 1)];
    return formatPreviousSetLine(src, unit);
  });
}

/** Placeholder w/r for an in-session set row (history for set 1; prior set when added or logged). */
export function setFieldPlaceholder(
  sets: WorkoutSet[],
  setIndex: number,
  historySets: WorkoutSet[] | null | undefined,
): { w: number; r: number } {
  if (setIndex > 0) {
    const prev = sets[setIndex - 1];
    if (prev && (prev.w > 0 || prev.r > 0)) {
      return { w: prev.w, r: prev.r };
    }
    if (historySets && setIndex >= historySets.length) {
      return setFieldPlaceholder(sets, setIndex - 1, historySets);
    }
  }
  if (!historySets?.length) return { w: 0, r: 0 };
  const src = historySets[Math.min(setIndex, historySets.length - 1)];
  return { w: src?.w ?? 0, r: src?.r ?? 0 };
}

/** Whether a set can be marked done (logged values and/or placeholder to apply). */
export function canCompleteSet(
  set: WorkoutSet,
  sets: WorkoutSet[],
  setIndex: number,
  historySets: WorkoutSet[] | null | undefined,
): boolean {
  if (set.w > 0 || set.r > 0) return true;
  const placeholder = setFieldPlaceholder(sets, setIndex, historySets);
  return placeholder.w > 0 || placeholder.r > 0;
}

/** Apply placeholder w/r when marking a set done; leaves user-entered values unchanged. */
export function buildSetCompletionPatch(
  set: WorkoutSet,
  sets: WorkoutSet[],
  setIndex: number,
  historySets: WorkoutSet[] | null | undefined,
): Partial<WorkoutSet> {
  const placeholder = setFieldPlaceholder(sets, setIndex, historySets);
  const patch: Partial<WorkoutSet> = { done: true };
  if (set.w <= 0 && placeholder.w > 0) patch.w = placeholder.w;
  if (set.r <= 0 && placeholder.r > 0) patch.r = placeholder.r;
  return patch;
}
