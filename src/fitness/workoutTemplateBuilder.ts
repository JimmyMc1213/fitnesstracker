import type { EquipmentSetup, ExperienceLevel, WorkoutRoutineTemplate } from "./types";
import { DEFAULT_EQUIPMENT_SETUP } from "./equipmentSetup";
import { DEFAULT_EXPERIENCE_LEVEL } from "./experienceLevel";
import { adaptExerciseForEquipment } from "./exerciseEquipment";
import { workoutTemplatesForExperience } from "./workoutTemplatesForExperience";

export function buildWorkoutTemplates(
  level: ExperienceLevel = DEFAULT_EXPERIENCE_LEVEL,
  equipment: EquipmentSetup = DEFAULT_EQUIPMENT_SETUP,
): WorkoutRoutineTemplate[] {
  const withExperience = workoutTemplatesForExperience(level);
  return withExperience.map((tpl) => ({
    ...tpl,
    exercises: tpl.exercises.map((e) => adaptExerciseForEquipment(e, equipment)),
  }));
}
