import {
  DEFAULT_EQUIPMENT_SETUP,
  DEFAULT_EXPERIENCE_LEVEL,
} from "@newyouai/core";
import type { AppState, EquipmentSetup, ExperienceLevel, WorkoutRoutineTemplate } from "@newyouai/types";

import { buildWeeklyRoutineTemplates } from "@/lib/workout/buildWeeklyRoutine";
import { adaptExerciseForEquipment } from "@/lib/workout/exerciseEquipment";
import { sessionLengthFromDuration } from "@/lib/workout/workoutSplitByDays";

/** Rebuild or adapt routines when equipment changes in Settings. */
export function rebuildWorkoutTemplatesForEquipment(
  state: Pick<AppState, "onboardingProfile" | "workoutTemplates">,
  level: ExperienceLevel = DEFAULT_EXPERIENCE_LEVEL,
  equipment: EquipmentSetup = DEFAULT_EQUIPMENT_SETUP,
): WorkoutRoutineTemplate[] {
  const profile = state.onboardingProfile;
  if (profile?.workoutDaysPerWeek || profile?.trainingWeekdays?.length) {
    const sessionLength = sessionLengthFromDuration(profile.sessionDuration);
    return buildWeeklyRoutineTemplates(profile, level, equipment, sessionLength);
  }

  return state.workoutTemplates.map((tpl) => ({
    ...tpl,
    exercises: tpl.exercises.map((e) => adaptExerciseForEquipment(e, equipment)),
  }));
}
