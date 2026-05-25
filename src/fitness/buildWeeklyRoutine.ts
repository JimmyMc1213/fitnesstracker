import { loadTasksForToday } from "./dailyPlan";
import { migrateTrainingSchedule } from "./migrateTrainingSchedule";
import { resolveWorkoutDaysPerWeek } from "./trainingCalendar";
import type {
  AppState,
  EquipmentSetup,
  ExperienceLevel,
  OnboardingProfile,
  SessionLength,
  WorkoutDaysPerWeek,
  WorkoutRoutineTemplate,
} from "./types";
import {
  buildWorkoutTemplatesForDays,
  sessionDurationFromSessionLength,
} from "./workoutSplitByDays";
import { restSecondsFromTrainingDuration } from "./sessionLengthConfig";
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

export function buildBlankWeeklyRoutineTemplates(weekdays: string[]): WorkoutRoutineTemplate[] {
  const stamp = Date.now();
  return weekdays.map((dayLabel, idx) => ({
    id: `custom-${dayLabel.toLowerCase()}-${stamp}-${idx}`,
    name: `${dayLabel} workout`,
    dayLabel,
    focus: "",
    exercises: [],
  }));
}

export type WeeklyRoutineProfilePatch = Pick<
  OnboardingProfile,
  "workoutDaysPerWeek" | "trainingWeekdays" | "sessionDuration"
>;

export function applyWeeklyRoutineToState(
  state: AppState,
  templates: WorkoutRoutineTemplate[],
  profilePatch: WeeklyRoutineProfilePatch,
  options?: { experienceLevel?: ExperienceLevel; equipmentSetup?: EquipmentSetup },
): AppState {
  const profile: OnboardingProfile = {
    ...(state.onboardingProfile ?? {}),
    ...profilePatch,
  } as OnboardingProfile;

  const { profile: migratedProfile, templates: migratedTemplates } = migrateTrainingSchedule(profile, templates);
  const daysPerWeek = resolveWorkoutDaysPerWeek(migratedTemplates, migratedProfile.workoutDaysPerWeek);

  return {
    ...state,
    workoutTemplates: migratedTemplates,
    onboardingProfile: migratedProfile,
    ...(options?.experienceLevel != null ? { experienceLevel: options.experienceLevel } : {}),
    ...(options?.equipmentSetup != null ? { equipmentSetup: options.equipmentSetup } : {}),
    ...(profilePatch.sessionDuration != null
      ? { restTimerDefaultSeconds: restSecondsFromTrainingDuration(profilePatch.sessionDuration) }
      : {}),
    dailyTasks: loadTasksForToday(
      state.nutritionTargets,
      state.planStartIso,
      state.stepsTarget,
      migratedTemplates,
      daysPerWeek,
    ),
  };
}

export function profilePatchFromRoutineInputs(
  trainingWeekdays: string[],
  sessionLength?: SessionLength,
): WeeklyRoutineProfilePatch {
  return {
    trainingWeekdays,
    workoutDaysPerWeek: trainingWeekdays.length as OnboardingProfile["workoutDaysPerWeek"],
    ...(sessionLength != null ? { sessionDuration: sessionDurationFromSessionLength(sessionLength) } : {}),
  };
}

function exerciseContentKey(exercise: WorkoutRoutineTemplate["exercises"][number]): string {
  return `${exercise.id}|${exercise.name}|${exercise.target ?? ""}|${exercise.label ?? ""}`;
}

/** Compare generated or edited weekly routines without set-level progress noise. */
export function weeklyRoutineContentMatches(
  next: WorkoutRoutineTemplate[],
  current: WorkoutRoutineTemplate[],
): boolean {
  if (next.length !== current.length) return false;

  return next.every((nextTemplate, index) => {
    const currentTemplate = current[index];
    if (
      nextTemplate.id !== currentTemplate.id ||
      nextTemplate.dayLabel !== currentTemplate.dayLabel ||
      nextTemplate.name !== currentTemplate.name
    ) {
      return false;
    }

    if (nextTemplate.exercises.length !== currentTemplate.exercises.length) return false;

    return nextTemplate.exercises.every(
      (exercise, exerciseIndex) =>
        exerciseContentKey(exercise) === exerciseContentKey(currentTemplate.exercises[exerciseIndex]),
    );
  });
}
