import type {
  EquipmentSetup,
  ExperienceLevel,
  OnboardingProfile,
  SessionLength,
  WorkoutDaysPerWeek,
  WorkoutRoutineTemplate,
} from "@newyouai/types";

import { buildWorkoutTemplatesForDays } from "./workoutSplitByDays";
import { defaultTrainingWeekdaysForProfile } from "./workoutWeekCalendar";

export const SESSION_LENGTH_OPTIONS: { value: SessionLength; label: string }[] = [
  { value: "under_30", label: "Less than 30 min" },
  { value: "30_45", label: "30–45 min" },
  { value: "45_60", label: "45 min – 1 hour" },
  { value: "60_90", label: "1 hour – 1.5 hours" },
  { value: "90_plus", label: "1.5 hours+" },
];

export function buildWeeklyRoutineTemplates(
  profile: Pick<OnboardingProfile, "workoutDaysPerWeek" | "trainingWeekdays">,
  experienceLevel: ExperienceLevel,
  equipmentSetup: EquipmentSetup,
  sessionLength: SessionLength,
): WorkoutRoutineTemplate[] {
  const daysPerWeek = (profile.workoutDaysPerWeek ?? profile.trainingWeekdays?.length ?? 3) as WorkoutDaysPerWeek;
  const weekdays =
    profile.trainingWeekdays?.length ?
      profile.trainingWeekdays
    : defaultTrainingWeekdaysForProfile(daysPerWeek);
  const days = weekdays.length as WorkoutDaysPerWeek;
  return buildWorkoutTemplatesForDays(days, experienceLevel, equipmentSetup, weekdays, sessionLength);
}
