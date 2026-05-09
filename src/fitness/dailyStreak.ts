import { localDateKey } from "./dailyPlan";
import { effectiveNutritionTotalsForDateKey } from "./nutritionTotals";
import type { AppState } from "./types";

const WEEK_LETTERS = ["S", "M", "T", "W", "T", "F", "S"] as const;

export type StreakCalendarCellKind = "past" | "today" | "future";

export type StreakCalendarCell = {
  dateKey: string;
  letter: string;
  dom: number;
  kind: StreakCalendarCellKind;
  /** 0–1; always 0 for future days */
  progress: number;
};

export type DayProgressLineItem = { id: string; label: string; done: boolean };

export type DayProgressDetail = {
  dateKey: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** 0–1 */
  progress: number;
  items: DayProgressLineItem[];
};

function parseDateKeyNoonLocal(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** Human-readable heading for a calendar detail sheet. */
export function formatDayHeading(dateKey: string): string {
  const d = parseDateKeyNoonLocal(dateKey);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function startOfWeekSundayContaining(d: Date): Date {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  const dow = x.getDay();
  x.setDate(x.getDate() - dow);
  return x;
}

/** Per-day checklist for streak UI & detail modal (equal weight each row). */
export function getDayProgressDetail(state: AppState, dateKey: string): DayProgressDetail {
  const items: DayProgressLineItem[] = [];
  const weighed = state.weightLog.some((e) => e.dateKey === dateKey);
  items.push({ id: "weigh", label: "Morning weigh-in", done: weighed });

  items.push({
    id: "workout",
    label: "Workout finished",
    done: Boolean(state.workoutsCompletedByDay[dateKey]),
  });

  const t = effectiveNutritionTotalsForDateKey(state.nutritionManualByDay, state.nutritionItemsByDay, dateKey);
  const macrosDone = t.cal > 0 || t.p > 0 || t.c > 0 || t.f > 0;
  items.push({ id: "nutrition", label: "Nutrition logged", done: macrosDone });

  const habitRow = state.habitsDoneByDay[dateKey] ?? {};
  for (const h of state.habitTemplates) {
    items.push({ id: `habit:${h.id}`, label: h.name, done: Boolean(habitRow[h.id]) });
  }

  const total = Math.max(items.length, 1);
  const doneCount = items.filter((i) => i.done).length;
  const progress = doneCount / total;

  return {
    dateKey,
    calories: t.cal,
    protein: t.p,
    carbs: t.c,
    fat: t.f,
    progress,
    items,
  };
}

/** Seven days Sunday → Saturday for the week that contains `todayKey` (local calendar). */
export function buildStreakCalendarWeek(state: AppState, todayKey: string): StreakCalendarCell[] {
  const mid = parseDateKeyNoonLocal(todayKey);
  const start = startOfWeekSundayContaining(mid);
  const out: StreakCalendarCell[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateKey = localDateKey(d);
    const letter = WEEK_LETTERS[d.getDay()];
    const dom = d.getDate();
    let kind: StreakCalendarCellKind;
    if (dateKey > todayKey) kind = "future";
    else if (dateKey === todayKey) kind = "today";
    else kind = "past";
    const progress = kind === "future" ? 0 : getDayProgressDetail(state, dateKey).progress;
    out.push({ dateKey, letter, dom, kind, progress });
  }
  return out;
}

function dateKeyMinusOne(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const y2 = dt.getFullYear();
  const m2 = String(dt.getMonth() + 1).padStart(2, "0");
  const day2 = String(dt.getDate()).padStart(2, "0");
  return `${y2}-${m2}-${day2}`;
}

/** True if the user logged something for this local calendar day (streak-eligible). */
export function dayHadFitnessCheckIn(state: AppState, dateKey: string): boolean {
  if (state.weightLog.some((e) => e.dateKey === dateKey)) return true;
  if (state.workoutsCompletedByDay[dateKey]) return true;
  const t = effectiveNutritionTotalsForDateKey(state.nutritionManualByDay, state.nutritionItemsByDay, dateKey);
  if (t.cal > 0 || t.p > 0 || t.c > 0 || t.f > 0) return true;
  const habits = state.habitsDoneByDay[dateKey];
  return Boolean(habits && Object.values(habits).some(Boolean));
}

/**
 * Consecutive local days with any check-in. If today has none yet, still shows the streak
 * continuing from yesterday so the count doesn't reset at midnight locally.
 */
export function computeFitnessCheckInStreak(state: AppState, todayDateKey: string): number {
  const anchor = dayHadFitnessCheckIn(state, todayDateKey) ? todayDateKey : dateKeyMinusOne(todayDateKey);
  if (!dayHadFitnessCheckIn(state, anchor)) return 0;
  let count = 0;
  let k = anchor;
  for (let i = 0; i < 365 * 10; i++) {
    if (!dayHadFitnessCheckIn(state, k)) break;
    count++;
    k = dateKeyMinusOne(k);
  }
  return count;
}
