import type { EquipmentSetup } from "@newyouai/types";

import exerciseLibrary, { type Exercise } from "./exerciseLibrary";
import { equipmentSetupToEngine } from "./workoutSplitByDays";

export type CatalogExercise = { name: string; label: string };

export function catalogExercisesForEquipment(setup: EquipmentSetup): CatalogExercise[] {
  const equipment = equipmentSetupToEngine(setup);
  return exerciseLibrary
    .filter((ex) => ex.equipment.includes(equipment))
    .map((ex) => ({ name: ex.name, label: ex.label }));
}

export function findExerciseInLibrary(name: string, label?: string): Exercise | undefined {
  const nameLow = name.trim().toLowerCase();
  const labelLow = label?.trim().toLowerCase();
  return exerciseLibrary.find(
    (ex) =>
      ex.name.toLowerCase() === nameLow &&
      (labelLow == null || ex.label.toLowerCase() === labelLow),
  );
}

export function filterCatalogExercises(
  exercises: CatalogExercise[],
  query: string,
): CatalogExercise[] {
  const q = query.trim().toLowerCase();
  if (!q) return exercises;
  return exercises.filter(
    (c) => c.name.toLowerCase().includes(q) || c.label.toLowerCase().includes(q),
  );
}
