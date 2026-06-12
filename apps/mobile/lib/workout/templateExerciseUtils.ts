import type { WorkoutExercise, WorkoutSet } from "@newyouai/types";

import { defaultExerciseTarget } from "./exercisePrescriptionDefaults";

/** One line when building or editing a routine template. */
export function newTemplateExerciseLine(
  name: string,
  opts?: { label?: string; target?: string; setCount?: number },
): WorkoutExercise {
  const setCount = Math.min(Math.max(opts?.setCount ?? 3, 1), 12);
  const label = opts?.label?.trim();
  const target =
    (opts?.target ?? defaultExerciseTarget(name.trim(), label, setCount)).trim() ||
    defaultExerciseTarget(name.trim(), label, setCount);
  return {
    id: `te${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    ...(label ? { label } : {}),
    target,
    sets: Array.from({ length: setCount }, () => ({ w: 0, r: 0, done: false })),
  };
}

export function resizeWorkoutSets(existing: WorkoutSet[], n: number): WorkoutSet[] {
  const c = Math.min(Math.max(n, 1), 12);
  const next = existing.slice(0, c);
  while (next.length < c) {
    const last = next[next.length - 1] ?? { w: 0, r: 0, done: false };
    next.push({ w: last.w, r: 0, done: false });
  }
  return next;
}
