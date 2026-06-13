import { defaultTrainingWeekdays, normalizeDayLabel } from "@newyouai/core";
import type { OnboardingProfile, WorkoutDaysPerWeek, WorkoutRoutineTemplate } from "@newyouai/types";

const VALID_DAYS: WorkoutDaysPerWeek[] = [3, 4, 5, 6];

function weekdaysFromTemplates(templates: WorkoutRoutineTemplate[]): string[] {
  return templates.map((t) => normalizeDayLabel(t.dayLabel)).filter((x): x is string => x != null);
}

function templatesMatchWeekdays(templates: WorkoutRoutineTemplate[], weekdays: string[]): boolean {
  if (templates.length !== weekdays.length) return false;
  return templates.every((t, i) => normalizeDayLabel(t.dayLabel) === weekdays[i]);
}

/** Pure sync migration: backfill trainingWeekdays and align template dayLabels. */
export function migrateTrainingSchedule(
  profileInput: OnboardingProfile | null | undefined,
  templatesInput: WorkoutRoutineTemplate[],
): { profile: OnboardingProfile; templates: WorkoutRoutineTemplate[]; dirty: boolean } {
  const profile: OnboardingProfile = profileInput
    ? { ...profileInput }
    : { heightIn: 70, weightLbs: 180, age: 30, workoutDaysPerWeek: 3 };
  let templates = templatesInput.map((t) => ({ ...t }));
  let dirty = false;

  const storedWeekdays = profile.trainingWeekdays?.filter(Boolean) ?? [];
  const templateWeekdays = weekdaysFromTemplates(templates);

  let weekdays: string[];
  if (storedWeekdays.length > 0) {
    weekdays = [...storedWeekdays];
  } else if (templateWeekdays.length === templates.length && templateWeekdays.length > 0) {
    weekdays = templateWeekdays;
    profile.trainingWeekdays = weekdays;
    dirty = true;
  } else {
    weekdays = [...defaultTrainingWeekdays(profile.workoutDaysPerWeek ?? 3)];
    profile.trainingWeekdays = weekdays;
    dirty = true;
  }

  if (!templatesMatchWeekdays(templates, weekdays)) {
    templates = templates.map((t, i) => {
      const dayLabel = weekdays[i] ?? t.dayLabel;
      if (normalizeDayLabel(t.dayLabel) !== dayLabel) {
        dirty = true;
        return { ...t, dayLabel };
      }
      return t;
    });
  }

  const templateCount = templates.length;
  const derivedDays = VALID_DAYS.includes(templateCount as WorkoutDaysPerWeek)
    ? (templateCount as WorkoutDaysPerWeek)
    : profile.workoutDaysPerWeek;

  if (derivedDays !== profile.workoutDaysPerWeek) {
    profile.workoutDaysPerWeek = derivedDays;
    dirty = true;
  }

  if (!profile.trainingWeekdays || profile.trainingWeekdays.join() !== weekdays.join()) {
    profile.trainingWeekdays = weekdays;
    dirty = true;
  }

  return { profile, templates, dirty };
}
