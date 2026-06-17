import type { WorkoutRoutineTemplate } from "@newyouai/types";

/** Pilot: flat Hevy-style exercise rows — Upper strength on Monday only. */
export function isUpperStrengthMondayWorkout(
  splitId: string,
  workoutTemplates: WorkoutRoutineTemplate[],
): boolean {
  if (!splitId.trim()) return false;
  const tpl = workoutTemplates.find((t) => t.id === splitId);
  if (!tpl) return false;
  const name = tpl.name.trim().toLowerCase();
  const day = tpl.dayLabel.trim().toLowerCase();
  return name === "upper strength" && (day.startsWith("mon") || day === "monday");
}

export function formatFlatExerciseTitle(name: string, label?: string): string {
  const trimmed = name.trim();
  const tag = label?.trim();
  if (!tag) return trimmed;
  return `${trimmed} (${tag})`;
}
