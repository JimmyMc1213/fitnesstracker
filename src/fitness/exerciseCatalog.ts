import exerciseLibrary from "./exerciseLibrary";
import type { ExerciseEquipmentLabel } from "./exerciseLabels";
import type { EquipmentSetup } from "./types";
import { equipmentSetupToEngine } from "./workoutSplitByDays";

export type CatalogExercise = {
  name: string;
  label: ExerciseEquipmentLabel;
};

/** Built-in exercises from the library that match the user's equipment setup. */
export function catalogExercisesForEquipment(setup: EquipmentSetup): CatalogExercise[] {
  const equipment = equipmentSetupToEngine(setup);
  return exerciseLibrary
    .filter((ex) => ex.equipment.includes(equipment))
    .map((ex) => ({ name: ex.name, label: ex.label }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** @deprecated Prefer `catalogExercisesForEquipment` for name + equipment tag. */
export function catalogExerciseNamesForEquipment(setup: EquipmentSetup): string[] {
  return catalogExercisesForEquipment(setup).map((ex) => ex.name);
}

export function catalogExerciseLabelForName(name: string): ExerciseEquipmentLabel | undefined {
  const normalized = name.trim().toLowerCase();
  return exerciseLibrary.find((ex) => ex.name.toLowerCase() === normalized)?.label;
}
