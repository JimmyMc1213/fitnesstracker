import type { WorkoutExercise } from "@newyouai/types";

/** Auto-generated session focus from exercise names (matches onboarding template copy). */
export function templateFocusFromExercises(exercises: WorkoutExercise[]): string {
  const preview = exercises.slice(0, 3).map((e) => e.name);
  if (preview.length === 0) return "Custom workout";
  return preview.join(" · ") + (exercises.length > 3 ? ` · +${exercises.length - 3} more` : "");
}

/** Keep a custom coach note when edited; otherwise refresh from the exercise list. */
export function resolveRoutineFocusOnSave(
  focus: string,
  focusDirty: boolean,
  exercises: WorkoutExercise[],
): string {
  if (focusDirty) return focus.trim();
  if (exercises.length === 0) return focus.trim();
  return templateFocusFromExercises(exercises);
}
