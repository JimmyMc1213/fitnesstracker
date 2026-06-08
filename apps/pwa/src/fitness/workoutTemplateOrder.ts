import { exerciseNoteKey } from "./exerciseNotes";
import type { WorkoutExercise, WorkoutRoutineTemplate } from "./types";

export function exerciseOrderKeys(exercises: WorkoutExercise[]): string[] {
  return exercises.map((e) => exerciseNoteKey(e.name, e.label));
}

/** True when the user reordered exercises without adding, removing, or swapping. */
export function detectExerciseOrderChange(baseline: string[] | undefined, current: string[]): boolean {
  if (!baseline?.length || baseline.length !== current.length) return false;

  const baselineSorted = [...baseline].sort();
  const currentSorted = [...current].sort();
  if (baselineSorted.some((key, i) => key !== currentSorted[i])) return false;

  return baseline.some((key, i) => key !== current[i]);
}

export function applyOrderToTemplate(
  template: WorkoutRoutineTemplate,
  orderKeys: string[],
): WorkoutRoutineTemplate {
  const byKey = new Map(template.exercises.map((e) => [exerciseNoteKey(e.name, e.label), e]));
  const reordered = orderKeys.map((key) => byKey.get(key)).filter((e): e is WorkoutExercise => e != null);
  if (reordered.length !== template.exercises.length) return template;
  return { ...template, exercises: reordered };
}
