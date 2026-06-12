import { localDateKey } from "./dailyPlan";
import {
  NUTRITION_GOAL_HIT_RATIO,
  applyStreakEligibility,
  buildFitnessStreakSnapshot,
  computeFitnessCheckInStreak,
  computeFitnessStreakCount,
  dayEligibleForStreak,
  normalizeFitnessStreakSnapshot,
  normalizeStreakEligibleByDay,
  normalizeStreakSessionBaseline,
  nutritionGoalHitForDateKey,
  rebuildStreakEligibleByDay,
  streakMotivationLabel,
} from "@newyouai/core";
import { effectiveNutritionTotalsForDateKey } from "./nutritionTotals";
import type { AppState, MacroTotals, StreakLossNotice } from "./types";

export {
  NUTRITION_GOAL_HIT_RATIO,
  applyStreakEligibility,
  buildFitnessStreakSnapshot,
  computeFitnessCheckInStreak,
  computeFitnessStreakCount,
  dayEligibleForStreak,
  normalizeFitnessStreakSnapshot,
  normalizeStreakEligibleByDay,
  normalizeStreakSessionBaseline,
  nutritionGoalHitForDateKey,
  rebuildStreakEligibleByDay,
  streakMotivationLabel,
};

const WEEK_LETTERS = ["S", "M", "T", "W", "T", "F", "S"] as const;

export type StreakCalendarCellKind = "past" | "today" | "future";

export type StreakCalendarCell = {
  dateKey: string;
  letter: string;
  dom: number;
  kind: StreakCalendarCellKind;
  /** 0-1; always 0 for future days */
  progress: number;
};

export type DayProgressLineItem = { id: string; label: string; done: boolean };

export type StreakDayStatus = "earned" | "not_yet" | "missed" | "future";

export type DayStreakSummary = {
  dateKey: string;
  status: StreakDayStatus;
  workoutDone: boolean;
  nutritionCalPct: number;
  nutritionProteinPct: number;
  nutritionGoalHit: boolean;
  eligible: boolean;
};

export type DayHabitProgress = {
  dateKey: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: DayProgressLineItem[];
};

/** @deprecated Composed view, prefer getDayStreakSummary + getDayHabitProgress. */
export type DayProgressDetail = {
  dateKey: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  progress: number;
  items: DayProgressLineItem[];
};

function parseDateKeyNoonLocal(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

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

function dateKeyMinusOne(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return localDateKey(dt);
}

function dateKeyPlusOne(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + 1);
  return localDateKey(dt);
}

function macroRatioHit(actual: number, target: number): boolean {
  if (target <= 0) return false;
  return actual >= target * NUTRITION_GOAL_HIT_RATIO;
}

export function proteinGoalHitForDateKey(
  nutritionManualByDay: Record<string, MacroTotals> | undefined,
  nutritionItemsByDay: Record<string, import("./types").NutritionLoggedItem[]> | undefined,
  nutritionTargets: MacroTotals,
  dateKey: string,
): boolean {
  const totals = effectiveNutritionTotalsForDateKey(nutritionManualByDay, nutritionItemsByDay, dateKey);
  return macroRatioHit(totals.p, nutritionTargets.p);
}

export function streakDayProgress(state: AppState, dateKey: string): number {
  if (dayEligibleForStreak(state, dateKey)) return 1;
  const workoutDone = Boolean(state.workoutsCompletedByDay[dateKey]);
  const totals = effectiveNutritionTotalsForDateKey(
    state.nutritionManualByDay,
    state.nutritionItemsByDay,
    dateKey,
  );
  const hasNutrition = totals.cal > 0 || totals.p > 0 || totals.c > 0 || totals.f > 0;
  if (workoutDone || hasNutrition) return 0.5;
  return 0;
}

export function findStreakBreakDateKey(streakEligibleByDay: Record<string, boolean>, todayKey: string): string | null {
  const { currentCount } = computeFitnessStreakCount(streakEligibleByDay, todayKey);
  if (currentCount > 0) return null;

  let k = dateKeyMinusOne(todayKey);
  for (let i = 0; i < 366; i++) {
    if (streakEligibleByDay[k]) {
      let d = dateKeyPlusOne(k);
      while (d <= todayKey) {
        if (!streakEligibleByDay[d]) return d;
        d = dateKeyPlusOne(d);
      }
      return null;
    }
    k = dateKeyMinusOne(k);
  }

  const yesterday = dateKeyMinusOne(todayKey);
  return streakEligibleByDay[yesterday] ? null : yesterday;
}

export function getPendingStreakLossNotice(state: AppState, todayKey: string): StreakLossNotice | null {
  const baseline = state.streakSessionBaseline;
  if (!baseline || baseline.count <= 0) return null;
  if (state.fitnessStreakSnapshot.currentCount > 0) return null;

  const breakDateKey = findStreakBreakDateKey(state.streakEligibleByDay ?? {}, todayKey);
  if (!breakDateKey) return null;
  if (state.streakLossNoticeDismissedForKey === breakDateKey) return null;

  return { lostCount: baseline.count, breakDateKey };
}

export function dismissStreakLossNotice(state: AppState, notice: StreakLossNotice): AppState {
  return {
    ...state,
    streakLossNoticeDismissedForKey: notice.breakDateKey,
    streakSessionBaseline: null,
  };
}

/** @deprecated Use computeFitnessStreakCount + streakEligibleByDay. */
export function dayHadFitnessCheckIn(state: AppState, dateKey: string): boolean {
  return Boolean(state.streakEligibleByDay?.[dateKey]) || dayEligibleForStreak(state, dateKey);
}

function nutritionTargetPct(actual: number, target: number): number {
  if (target <= 0) return 0;
  return Math.round((actual / target) * 100);
}

export function getDayStreakSummary(state: AppState, dateKey: string, todayKey: string): DayStreakSummary {
  if (dateKey > todayKey) {
    return {
      dateKey,
      status: "future",
      workoutDone: false,
      nutritionCalPct: 0,
      nutritionProteinPct: 0,
      nutritionGoalHit: false,
      eligible: false,
    };
  }

  const totals = effectiveNutritionTotalsForDateKey(
    state.nutritionManualByDay,
    state.nutritionItemsByDay,
    dateKey,
  );
  const T = state.nutritionTargets;
  const workoutDone = Boolean(state.workoutsCompletedByDay[dateKey]);
  const nutritionGoalHit = nutritionGoalHitForDateKey(
    state.nutritionManualByDay,
    state.nutritionItemsByDay,
    state.nutritionTargets,
    dateKey,
  );
  const eligible = workoutDone || nutritionGoalHit;

  let status: StreakDayStatus;
  if (eligible) status = "earned";
  else if (dateKey === todayKey) status = "not_yet";
  else status = "missed";

  return {
    dateKey,
    status,
    workoutDone,
    nutritionCalPct: nutritionTargetPct(totals.cal, T.cal),
    nutritionProteinPct: nutritionTargetPct(totals.p, T.p),
    nutritionGoalHit,
    eligible,
  };
}

import { isWeighInActionHabit } from "./habits";

export function getDayHabitProgress(state: AppState, dateKey: string): DayHabitProgress {
  const items: DayProgressLineItem[] = [];
  const t = effectiveNutritionTotalsForDateKey(state.nutritionManualByDay, state.nutritionItemsByDay, dateKey);
  const macrosDone = t.cal > 0 || t.p > 0 || t.c > 0 || t.f > 0;
  items.push({ id: "nutrition-logged", label: "Nutrition logged", done: macrosDone });

  const hasWeighHabit = state.habitTemplates.some((h) => isWeighInActionHabit(h));
  if (!hasWeighHabit) {
    const weighed = state.weightLog.some((e) => e.dateKey === dateKey);
    items.push({ id: "weigh", label: "Morning weigh-in", done: weighed });
  }

  const habitRow = state.habitsDoneByDay[dateKey] ?? {};
  const weighed = state.weightLog.some((e) => e.dateKey === dateKey);
  for (const h of state.habitTemplates) {
    let done = Boolean(habitRow[h.id]);
    if (isWeighInActionHabit(h) && weighed) done = true;
    items.push({ id: `habit:${h.id}`, label: h.name, done });
  }

  return {
    dateKey,
    calories: t.cal,
    protein: t.p,
    carbs: t.c,
    fat: t.f,
    items,
  };
}

/** @deprecated Use getDayStreakSummary + getDayHabitProgress. */
export function getDayProgressDetail(state: AppState, dateKey: string): DayProgressDetail {
  const todayKey = localDateKey(new Date());
  const streak = getDayStreakSummary(state, dateKey, todayKey);
  const habits = getDayHabitProgress(state, dateKey);
  const streakItems: DayProgressLineItem[] = [
    { id: "streak-workout", label: "Workout finished", done: streak.workoutDone },
    { id: "streak-nutrition", label: "Nutrition goal hit", done: streak.nutritionGoalHit },
  ];
  return {
    dateKey,
    calories: habits.calories,
    protein: habits.protein,
    carbs: habits.carbs,
    fat: habits.fat,
    progress: streakDayProgress(state, dateKey),
    items: [...streakItems, ...habits.items],
  };
}

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
    const progress = kind === "future" ? 0 : streakDayProgress(state, dateKey);
    out.push({ dateKey, letter, dom, kind, progress });
  }
  return out;
}
