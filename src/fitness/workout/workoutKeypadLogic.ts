import type { WeightUnit, WorkoutExercise } from "../types";

export type WorkoutKeypadField = "weight" | "reps";

export type WorkoutKeypadTarget = {
  exerciseId: string;
  setIndex: number;
  field: WorkoutKeypadField;
};

export function workoutKeypadTargetKey(target: WorkoutKeypadTarget): string {
  return `${target.exerciseId}:${target.setIndex}:${target.field}`;
}

export function appendKeypadDigit(draft: string, key: string, allowDecimal: boolean): string {
  if (key === ".") {
    if (!allowDecimal || draft.includes(".")) return draft;
    return draft === "" ? "0." : `${draft}.`;
  }
  if (!/^\d$/.test(key)) return draft;
  if (draft === "0") return key;
  return draft + key;
}

export function backspaceKeypadDraft(draft: string): string {
  return draft.slice(0, -1);
}

export function keypadIncrementStep(field: WorkoutKeypadField, weightUnit: WeightUnit): number {
  if (field === "reps") return 1;
  return weightUnit === "kg" ? 2.5 : 5;
}

export function applyKeypadIncrement(
  draft: string,
  field: WorkoutKeypadField,
  delta: number,
  weightUnit: WeightUnit,
): string {
  const current = field === "reps" ? parseInt(draft, 10) || 0 : parseFloat(draft) || 0;
  const next = Math.max(0, current + delta);
  if (next === 0) return "";
  if (field === "reps") return String(Math.round(next));
  if (weightUnit === "kg") {
    const rounded = Math.round(next * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }
  return String(Math.round(next));
}

export function nextWorkoutKeypadTarget(
  exercises: WorkoutExercise[],
  current: WorkoutKeypadTarget,
): WorkoutKeypadTarget | null {
  const exerciseIndex = exercises.findIndex((e) => e.id === current.exerciseId);
  if (exerciseIndex < 0) return null;
  const exercise = exercises[exerciseIndex]!;

  if (current.field === "weight") {
    return { exerciseId: current.exerciseId, setIndex: current.setIndex, field: "reps" };
  }

  if (current.setIndex + 1 < exercise.sets.length) {
    return { exerciseId: current.exerciseId, setIndex: current.setIndex + 1, field: "weight" };
  }

  const nextExercise = exercises[exerciseIndex + 1];
  if (nextExercise) {
    return { exerciseId: nextExercise.id, setIndex: 0, field: "weight" };
  }

  return null;
}
