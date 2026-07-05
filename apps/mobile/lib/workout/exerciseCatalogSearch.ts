import type { EquipmentSetup } from "@newyouai/types";

import exerciseLibrary, { type Exercise, type MuscleGroup } from "./exerciseLibrary";
import { equipmentSetupToEngine } from "./workoutSplitByDays";

export type CatalogExercise = { name: string; label: string; muscleGroup?: MuscleGroup };

export const MUSCLE_GROUP_FILTER_ORDER: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "core",
  "traps",
  "rear_delt",
  "forearms",
];

const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
  core: "Core",
  traps: "Traps",
  rear_delt: "Rear delt",
  forearms: "Forearms",
};

export function muscleGroupDisplayName(muscleGroup: MuscleGroup): string {
  return MUSCLE_GROUP_LABELS[muscleGroup];
}

export function catalogExercisesForEquipment(setup: EquipmentSetup): CatalogExercise[] {
  const equipment = equipmentSetupToEngine(setup);
  return exerciseLibrary
    .filter((ex) => ex.equipment.includes(equipment))
    .map((ex) => ({ name: ex.name, label: ex.label, muscleGroup: ex.muscleGroup }));
}

export function muscleGroupsInCatalog(exercises: CatalogExercise[]): MuscleGroup[] {
  const available = new Set(
    exercises.map((exercise) => exercise.muscleGroup).filter((group): group is MuscleGroup => group != null),
  );
  return MUSCLE_GROUP_FILTER_ORDER.filter((group) => available.has(group));
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
  muscleGroup?: MuscleGroup | null,
): CatalogExercise[] {
  let result = exercises;
  if (muscleGroup) {
    result = result.filter((exercise) => exercise.muscleGroup === muscleGroup);
  }

  const q = query.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (c) => c.name.toLowerCase().includes(q) || c.label.toLowerCase().includes(q),
    );
  }

  return [...result].sort((a, b) => a.name.localeCompare(b.name));
}
