import { defaultTrainingWeekdays, normalizeDayLabel } from "./trainingCalendar";
import type { WorkoutDaysPerWeek, WorkoutRoutineTemplate } from "./types";

export const TRAINING_WEEKDAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type TrainingWeekday = (typeof TRAINING_WEEKDAY_ORDER)[number];

export const TRAINING_WEEKDAY_SHORT: Record<TrainingWeekday, string> = {
  Mon: "Mo",
  Tue: "Tu",
  Wed: "We",
  Thu: "Th",
  Fri: "Fr",
  Sat: "Sa",
  Sun: "Su",
};

export const MIN_TRAINING_DAYS = 3;
export const MAX_TRAINING_DAYS = 6;

export type TrainingWeekdaySelectionLimits = {
  minDays: number;
  maxDays: number;
};

export const GENERATED_TRAINING_DAY_LIMITS: TrainingWeekdaySelectionLimits = {
  minDays: MIN_TRAINING_DAYS,
  maxDays: MAX_TRAINING_DAYS,
};

export const MANUAL_TRAINING_DAY_LIMITS: TrainingWeekdaySelectionLimits = {
  minDays: 1,
  maxDays: 7,
};

const PICK_FOR_ME_BY_COUNT: Record<WorkoutDaysPerWeek, readonly TrainingWeekday[]> = {
  3: ["Mon", "Wed", "Fri"],
  4: ["Mon", "Tue", "Thu", "Fri"],
  5: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  6: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

const SPLIT_LABEL_BY_COUNT: Record<WorkoutDaysPerWeek, string> = {
  3: "Push / Pull / Legs",
  4: "Upper / Lower",
  5: "5-day split",
  6: "6-day split",
};

function sortWeekdays(days: string[]): TrainingWeekday[] {
  const set = new Set<TrainingWeekday>();
  for (const d of days) {
    const label = normalizeDayLabel(d);
    if (label && TRAINING_WEEKDAY_ORDER.includes(label as TrainingWeekday)) {
      set.add(label as TrainingWeekday);
    }
  }
  return TRAINING_WEEKDAY_ORDER.filter((d) => set.has(d));
}

export function normalizeTrainingWeekdays(raw: string[] | undefined | null): TrainingWeekday[] {
  if (!raw?.length) return [];
  return sortWeekdays(raw);
}

export function isValidTrainingWeekdaySelection(
  days: string[] | undefined | null,
  limits: TrainingWeekdaySelectionLimits = GENERATED_TRAINING_DAY_LIMITS,
): boolean {
  const n = normalizeTrainingWeekdays(days).length;
  return n >= limits.minDays && n <= limits.maxDays;
}

export function workoutDaysPerWeekFromWeekdays(days: string[] | undefined | null): WorkoutDaysPerWeek | null {
  const n = normalizeTrainingWeekdays(days).length;
  if (n === 3 || n === 4 || n === 5 || n === 6) return n;
  return null;
}

export function splitLabelForDayCount(count: number): string {
  if (count === 3 || count === 4 || count === 5 || count === 6) {
    return SPLIT_LABEL_BY_COUNT[count];
  }
  return "Custom split";
}

export function trainingWeekdaySelectionHint(
  days: string[] | undefined | null,
  options?: { includeSplitLabel?: boolean; limits?: TrainingWeekdaySelectionLimits; emptyHint?: string },
): string {
  const limits = options?.limits ?? GENERATED_TRAINING_DAY_LIMITS;
  const normalized = normalizeTrainingWeekdays(days);
  const n = normalized.length;
  if (n === 0) {
    if (options?.emptyHint) return options.emptyHint;
    if (limits.minDays === 1 && limits.maxDays === 7) return "Pick your training days";
    return `Pick ${limits.minDays}–${limits.maxDays} training days`;
  }
  const countLabel = `${n} day${n === 1 ? "" : "s"} selected`;
  if (options?.includeSplitLabel === false) return countLabel;
  return `${countLabel} · ${splitLabelForDayCount(n)}`;
}

/** Toggle one weekday; enforces max selections from limits. */
export function toggleTrainingWeekday(
  selected: string[],
  day: string,
  limits: TrainingWeekdaySelectionLimits = GENERATED_TRAINING_DAY_LIMITS,
): TrainingWeekday[] {
  const label = normalizeDayLabel(day);
  if (!label || !TRAINING_WEEKDAY_ORDER.includes(label as TrainingWeekday)) {
    return normalizeTrainingWeekdays(selected);
  }
  const current = normalizeTrainingWeekdays(selected);
  if (current.includes(label as TrainingWeekday)) {
    return current.filter((d) => d !== label);
  }
  if (current.length >= limits.maxDays) return current;
  return sortWeekdays([...current, label]);
}

/**
 * Pick a balanced spread for N training days (3–6).
 * Uses count from current selection when valid, otherwise defaults to 4.
 */
export function pickTrainingWeekdaysForMe(selected: string[] | undefined | null): TrainingWeekday[] {
  const normalized = normalizeTrainingWeekdays(selected);
  const count = workoutDaysPerWeekFromWeekdays(normalized) ?? 4;
  return [...PICK_FOR_ME_BY_COUNT[count]];
}

/** Initial weekdays from profile days count or Mon–Fri default. */
export function defaultTrainingWeekdaysForProfile(daysPerWeek: WorkoutDaysPerWeek): TrainingWeekday[] {
  return [...defaultTrainingWeekdays(daysPerWeek)] as TrainingWeekday[];
}

/** Map template session order onto user-selected weekdays. */
export function alignTemplatesToTrainingWeekdays(
  templates: WorkoutRoutineTemplate[],
  trainingWeekdays: string[],
): WorkoutRoutineTemplate[] {
  const weekdays = normalizeTrainingWeekdays(trainingWeekdays);
  return templates.map((t, i) => ({
    ...t,
    dayLabel: weekdays[i] ?? t.dayLabel,
  }));
}

export function profileWithTrainingWeekdays(
  profile: { workoutDaysPerWeek: WorkoutDaysPerWeek; trainingWeekdays?: string[] },
  weekdays: string[],
): { workoutDaysPerWeek: WorkoutDaysPerWeek; trainingWeekdays: TrainingWeekday[] } {
  const normalized = normalizeTrainingWeekdays(weekdays);
  const n = normalized.length;
  const days =
    workoutDaysPerWeekFromWeekdays(normalized) ??
    (n >= 1 && n <= 7 ? (n as WorkoutDaysPerWeek) : profile.workoutDaysPerWeek);
  return {
    workoutDaysPerWeek: days,
    trainingWeekdays: normalized,
  };
}
