import exerciseExpansion from "./exerciseExpansion";
import exerciseLibrary, { type Exercise } from "./exerciseLibrary";
import type { ExerciseEquipmentLabel } from "./exerciseLabels";
import type { EquipmentSetup } from "./types";
import { equipmentSetupToEngine } from "./workoutSplitByDays";
import type { Equipment } from "./exerciseLibrary";

export type CatalogExercise = {
  name: string;
  label: ExerciseEquipmentLabel;
};

export type CatalogExerciseGroups = {
  /** Auto-programmed by the plan builder — `exerciseLibrary` only. */
  program: CatalogExercise[];
  /** Browse/add only — not selected by the engine. */
  expansion: CatalogExercise[];
};

function catalogFromSource(source: Exercise[], equipment: Equipment): CatalogExercise[] {
  return source
    .filter((ex) => ex.equipment.includes(equipment))
    .map((ex) => ({ name: ex.name, label: ex.label }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Exercises the plan builder may auto-select (core library only). */
export function programCatalogExercisesForEquipment(setup: EquipmentSetup): CatalogExercise[] {
  return catalogFromSource(exerciseLibrary, equipmentSetupToEngine(setup));
}

/** Extra exercises users can search and add manually — not auto-programmed. */
export function expansionCatalogExercisesForEquipment(setup: EquipmentSetup): CatalogExercise[] {
  return catalogFromSource(exerciseExpansion, equipmentSetupToEngine(setup));
}

export function catalogExerciseGroupsForEquipment(setup: EquipmentSetup): CatalogExerciseGroups {
  const equipment = equipmentSetupToEngine(setup);
  return {
    program: catalogFromSource(exerciseLibrary, equipment),
    expansion: catalogFromSource(exerciseExpansion, equipment),
  };
}

/** All built-in exercises for manual search (program + expansion). */
export function catalogExercisesForEquipment(setup: EquipmentSetup): CatalogExercise[] {
  const { program, expansion } = catalogExerciseGroupsForEquipment(setup);
  return [...program, ...expansion];
}

/** @deprecated Prefer `catalogExercisesForEquipment` for name + equipment tag. */
export function catalogExerciseNamesForEquipment(setup: EquipmentSetup): string[] {
  return catalogExercisesForEquipment(setup).map((ex) => ex.name);
}

export function catalogExerciseLabelForName(name: string): ExerciseEquipmentLabel | undefined {
  const normalized = name.trim().toLowerCase();
  const match =
    exerciseLibrary.find((ex) => ex.name.toLowerCase() === normalized) ??
    exerciseExpansion.find((ex) => ex.name.toLowerCase() === normalized);
  return match?.label;
}
