import { isNutritionProgrammingHabit } from "./habits";
import type { HabitTemplate, OnboardingProfile, WorkoutDaysPerWeek, WorkoutRoutineTemplate } from "./types";
import { normalizeWorkoutTemplates, sanitizeWorkoutTemplates } from "./data";
import { hasExistingFitnessData } from "./onboardingSkip";
import { DEFAULT_ONBOARDING_PROFILE, normalizeOnboardingProfile } from "./onboardingProfile";
import type { PersistedFitnessSlice } from "./persistFitnessSlice";
import { defaultTrainingWeekdays, normalizeDayLabel } from "./trainingCalendar";

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
  const profile = profileInput ? { ...profileInput } : { ...DEFAULT_ONBOARDING_PROFILE };
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

function migrateHabitTemplates(raw: unknown): { templates: HabitTemplate[]; dirty: boolean } {
  if (!Array.isArray(raw)) return { templates: [], dirty: false };
  const kept: HabitTemplate[] = [];
  let dirty = false;
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.name !== "string") continue;
    if (isNutritionProgrammingHabit({ id: o.id, name: o.name })) {
      dirty = true;
      continue;
    }
    kept.push(x as HabitTemplate);
  }
  if (kept.length !== raw.length) dirty = true;
  return { templates: kept, dirty };
}

/** Sync migration on persisted slice before building AppState or saving. */
export function migratePersistedFitnessSlice(
  p: Partial<PersistedFitnessSlice> | null | undefined,
): { slice: Partial<PersistedFitnessSlice>; dirty: boolean } {
  const base = p ?? {};
  const onboardingComplete = base.onboardingComplete === true || hasExistingFitnessData(base);
  const profile = normalizeOnboardingProfile(base.onboardingProfile) ?? { ...DEFAULT_ONBOARDING_PROFILE };
  const rawTemplates =
    base.workoutTemplates === undefined || base.workoutTemplates === null
      ? []
      : normalizeWorkoutTemplates(base.workoutTemplates);
  const sanitizedTemplates = sanitizeWorkoutTemplates(rawTemplates, { onboardingComplete });
  let dirty = sanitizedTemplates.length !== rawTemplates.length;

  const { profile: migratedProfile, templates: migratedTemplates, dirty: scheduleDirty } = migrateTrainingSchedule(
    profile,
    sanitizedTemplates,
  );
  dirty = dirty || scheduleDirty;

  const { templates: habitTemplates, dirty: habitDirty } = migrateHabitTemplates(base.habitTemplates);
  dirty = dirty || habitDirty;

  return {
    slice: {
      ...base,
      onboardingProfile: migratedProfile,
      workoutTemplates: migratedTemplates,
      ...(base.habitTemplates !== undefined ? { habitTemplates } : {}),
    },
    dirty,
  };
}
