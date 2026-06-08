import type { WorkoutDaysPerWeek, WorkoutRoutineTemplate } from "./types";
import { localDateKey } from "./dailyPlan";

export { startOfWeekMonday, weekDateKeysMondayStart } from "./weeklySummary";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const DEFAULT_TRAINING_DAYS: Record<WorkoutDaysPerWeek, readonly string[]> = {
  3: ["Mon", "Tue", "Thu"],
  4: ["Mon", "Tue", "Wed", "Thu"],
  5: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  6: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

export function defaultTrainingWeekdays(daysPerWeek: WorkoutDaysPerWeek): readonly string[] {
  return DEFAULT_TRAINING_DAYS[daysPerWeek];
}

export function weekdayShort(d: Date): string {
  return WEEKDAY_SHORT[d.getDay()] ?? "Sun";
}

const WEEKDAY_FULL: Record<string, string> = {
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

/** Expand Mon → Monday for display copy. */
export function weekdayFullName(label: string): string {
  const short = normalizeDayLabel(label);
  if (short && WEEKDAY_FULL[short]) return WEEKDAY_FULL[short];
  return label;
}

const WEEKDAY_MON_START = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Mon-first index for sorting training templates in week summaries. */
export function weekdayMonStartIndex(label: string): number {
  const short = normalizeDayLabel(label);
  if (!short) return 99;
  const idx = WEEKDAY_MON_START.indexOf(short as (typeof WEEKDAY_MON_START)[number]);
  return idx >= 0 ? idx : 99;
}

/** Next calendar training day after `fromDate` (exclusive of today). */
export function nextTrainingDayFrom(
  templates: WorkoutRoutineTemplate[],
  fromDate: Date = new Date(),
): { dayLabel: string; fullName: string; template: WorkoutRoutineTemplate } | null {
  const trainingByDay = new Map<string, WorkoutRoutineTemplate>();
  for (const t of templates) {
    const day = normalizeDayLabel(t.dayLabel);
    if (day) trainingByDay.set(day, t);
  }
  if (trainingByDay.size === 0) return null;

  for (let offset = 1; offset <= 7; offset++) {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + offset);
    const short = weekdayShort(d);
    const template = trainingByDay.get(short);
    if (template) {
      return { dayLabel: short, fullName: weekdayFullName(short), template };
    }
  }
  return null;
}

export function resolveWorkoutDaysPerWeek(
  templates: WorkoutRoutineTemplate[] | undefined,
  profileDays?: WorkoutDaysPerWeek,
): WorkoutDaysPerWeek {
  if (profileDays && (DEFAULT_TRAINING_DAYS[profileDays] != null)) return profileDays;
  const count = templates?.length ?? 0;
  if (count === 3 || count === 4 || count === 5 || count === 6) return count;
  return 5;
}

export function normalizeDayLabel(label: string): string | null {
  const t = label.trim();
  if (!t) return null;
  const lower = t.toLowerCase();
  if (lower.startsWith("sun")) return "Sun";
  if (lower.startsWith("mon")) return "Mon";
  if (lower.startsWith("tue")) return "Tue";
  if (lower.startsWith("wed")) return "Wed";
  if (lower.startsWith("thu")) return "Thu";
  if (lower.startsWith("fri")) return "Fri";
  if (lower.startsWith("sat")) return "Sat";
  if (t.length >= 3) return t.slice(0, 3);
  return null;
}

function trainingDaysFromTemplates(templates: WorkoutRoutineTemplate[]): Set<string> | null {
  const labels = templates
    .map((t) => normalizeDayLabel(t.dayLabel))
    .filter((x): x is string => x != null);
  if (labels.length === 0) return null;
  return new Set(labels);
}

export function isTrainingDay(
  date: Date,
  templates: WorkoutRoutineTemplate[],
  daysPerWeek: WorkoutDaysPerWeek,
): boolean {
  const today = weekdayShort(date);
  const fromTemplates = trainingDaysFromTemplates(templates);
  if (fromTemplates) return fromTemplates.has(today);
  return DEFAULT_TRAINING_DAYS[daysPerWeek].includes(today);
}

/** Match workout template to a calendar date via dayLabel (Mon, Tue, …). */
export function templateForDate(templates: WorkoutRoutineTemplate[], date: Date): WorkoutRoutineTemplate | null {
  const day = weekdayShort(date);
  return templates.find((t) => normalizeDayLabel(t.dayLabel) === day) ?? null;
}

function parseDateKeyNoonLocal(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** Sunday (local) containing the given date key, streak calendar week start. */
export function startOfWeekSunday(dateKey: string): string {
  const d = parseDateKeyNoonLocal(dateKey);
  d.setDate(d.getDate() - d.getDay());
  return localDateKey(d);
}

/** Seven date keys Sun → Sat for the week containing `anchorDateKey`. */
export function weekDateKeysSundayStart(anchorDateKey: string): string[] {
  const start = parseDateKeyNoonLocal(startOfWeekSunday(anchorDateKey));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return localDateKey(d);
  });
}
