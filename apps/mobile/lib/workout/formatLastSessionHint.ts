import { findLastLoggedExerciseSets, formatSetWeight } from "@newyouai/core";
import type { CompletedWorkoutSession, WeightUnit } from "@newyouai/types";

/** Autofill hint line shown on exercise cards when prior history exists. */
export function formatLastSessionHint(
  history: CompletedWorkoutSession[] | undefined,
  name: string,
  label: string | undefined,
  unit: WeightUnit,
): string | null {
  const lastSets = findLastLoggedExerciseSets(history, name, label);
  if (!lastSets?.length) return null;

  const formatted = lastSets
    .filter((s) => s.w > 0 || s.r > 0)
    .map((s) => (s.w > 0 ? `${formatSetWeight(s.w, unit)}×${s.r}` : String(s.r)))
    .join(", ");

  if (!formatted) return null;
  return `Last session: ${formatted}`;
}
