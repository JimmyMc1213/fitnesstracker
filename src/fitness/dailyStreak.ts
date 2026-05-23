import { localDateKey } from "./dailyPlan";
import { effectiveNutritionTotalsForDateKey } from "./nutritionTotals";
import type { AppState, FitnessStreakSnapshot, MacroTotals, StreakLossNotice, StreakSessionBaseline } from "./types";

const WEEK_LETTERS = ["S", "M", "T", "W", "T", "F", "S"] as const;

/** Minimum fraction of calorie + protein targets to count as "nutrition goal hit". */
export const NUTRITION_GOAL_HIT_RATIO = 0.9;

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
  /** Logged calories as % of target (can exceed 100). */
  nutritionCalPct: number;
  /** Logged protein as % of target (can exceed 100). */
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
  /** 0-1 */
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

function dateKeyMinusOne(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const y2 = dt.getFullYear();
  const m2 = String(dt.getMonth() + 1).padStart(2, "0");
  const day2 = String(dt.getDate()).padStart(2, "0");
  return `${y2}-${m2}-${day2}`;
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

/** True when logged macros meet at least 90% of calorie and protein targets for the day. */
export function nutritionGoalHitForDateKey(
  nutritionManualByDay: Record<string, MacroTotals> | undefined,
  nutritionItemsByDay: Record<string, import("./types").NutritionLoggedItem[]> | undefined,
  nutritionTargets: MacroTotals,
  dateKey: string,
): boolean {
  const totals = effectiveNutritionTotalsForDateKey(nutritionManualByDay, nutritionItemsByDay, dateKey);
  return macroRatioHit(totals.cal, nutritionTargets.cal) && macroRatioHit(totals.p, nutritionTargets.p);
}

/** True when the user finished a workout or hit nutrition targets for this local calendar day. */
export function dayEligibleForStreak(state: AppState, dateKey: string): boolean {
  if (state.workoutsCompletedByDay[dateKey]) return true;
  return nutritionGoalHitForDateKey(
    state.nutritionManualByDay,
    state.nutritionItemsByDay,
    state.nutritionTargets,
    dateKey,
  );
}

/** Week ring progress: 1 = streak day secured, 0.5 = partial progress, 0 = none. */
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

export function normalizeStreakEligibleByDay(raw: unknown): Record<string, boolean> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && v === true) out[k] = true;
  }
  return out;
}

export function normalizeFitnessStreakSnapshot(raw: unknown): FitnessStreakSnapshot {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { currentCount: 0, anchorDateKey: null, updatedAtIso: new Date(0).toISOString() };
  }
  const o = raw as Record<string, unknown>;
  const currentCount = typeof o.currentCount === "number" && o.currentCount >= 0 ? Math.floor(o.currentCount) : 0;
  const anchorDateKey = typeof o.anchorDateKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.anchorDateKey) ? o.anchorDateKey : null;
  const updatedAtIso = typeof o.updatedAtIso === "string" ? o.updatedAtIso : new Date(0).toISOString();
  return { currentCount, anchorDateKey, updatedAtIso };
}

export function normalizeStreakSessionBaseline(raw: unknown): StreakSessionBaseline | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const count = typeof o.count === "number" && o.count >= 0 ? Math.floor(o.count) : 0;
  const dateKey = typeof o.dateKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.dateKey) ? o.dateKey : null;
  if (!dateKey || count <= 0) return null;
  return { count, dateKey };
}

function collectCandidateDateKeys(state: AppState): Set<string> {
  const keys = new Set<string>();
  for (const [k, v] of Object.entries(state.workoutsCompletedByDay)) {
    if (v) keys.add(k);
  }
  for (const k of Object.keys(state.nutritionManualByDay)) keys.add(k);
  for (const k of Object.keys(state.nutritionItemsByDay)) keys.add(k);
  for (const k of Object.keys(state.streakEligibleByDay ?? {})) keys.add(k);
  return keys;
}

/** Rebuild eligibility map from workouts + nutrition logs (preserves true flags). */
export function rebuildStreakEligibleByDay(state: AppState): Record<string, boolean> {
  const out: Record<string, boolean> = { ...(state.streakEligibleByDay ?? {}) };
  for (const dateKey of collectCandidateDateKeys(state)) {
    if (dayEligibleForStreak(state, dateKey)) out[dateKey] = true;
    else if (!dayEligibleForStreak(state, dateKey) && !state.workoutsCompletedByDay[dateKey]) {
      delete out[dateKey];
    }
  }
  return out;
}

/**
 * Consecutive local days with streak eligibility. If today has none yet, still shows the streak
 * continuing from yesterday so the count doesn't reset at midnight locally.
 */
export function computeFitnessStreakCount(
  streakEligibleByDay: Record<string, boolean>,
  todayDateKey: string,
): { currentCount: number; anchorDateKey: string | null } {
  const anchor = streakEligibleByDay[todayDateKey] ? todayDateKey : dateKeyMinusOne(todayDateKey);
  if (!streakEligibleByDay[anchor]) return { currentCount: 0, anchorDateKey: null };
  let count = 0;
  let k = anchor;
  for (let i = 0; i < 365 * 10; i++) {
    if (!streakEligibleByDay[k]) break;
    count++;
    k = dateKeyMinusOne(k);
  }
  return { currentCount: count, anchorDateKey: anchor };
}

export function buildFitnessStreakSnapshot(
  streakEligibleByDay: Record<string, boolean>,
  todayDateKey: string,
): FitnessStreakSnapshot {
  const { currentCount, anchorDateKey } = computeFitnessStreakCount(streakEligibleByDay, todayDateKey);
  return {
    currentCount,
    anchorDateKey,
    updatedAtIso: new Date().toISOString(),
  };
}

/** Recompute streak eligibility + snapshot after workout finish or nutrition logging. */
export function applyStreakEligibility(state: AppState, todayDateKey = localDateKey(new Date())): AppState {
  const streakEligibleByDay = rebuildStreakEligibleByDay(state);
  const fitnessStreakSnapshot = buildFitnessStreakSnapshot(streakEligibleByDay, todayDateKey);
  let streakSessionBaseline = state.streakSessionBaseline;
  if (fitnessStreakSnapshot.currentCount > 0) {
    streakSessionBaseline = { count: fitnessStreakSnapshot.currentCount, dateKey: todayDateKey };
  }
  return { ...state, streakEligibleByDay, fitnessStreakSnapshot, streakSessionBaseline };
}

/** Calendar day where the streak chain broke (first miss after eligible days). */
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

/** Pending streak-loss notice when an active streak reset to zero. */
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

/** @deprecated Use computeFitnessStreakCount + streakEligibleByDay. Kept for callers migrating off check-in logic. */
export function dayHadFitnessCheckIn(state: AppState, dateKey: string): boolean {
  return Boolean(state.streakEligibleByDay?.[dateKey]) || dayEligibleForStreak(state, dateKey);
}

export function computeFitnessCheckInStreak(state: AppState, todayDateKey: string): number {
  const eligible = state.streakEligibleByDay ?? rebuildStreakEligibleByDay(state);
  return computeFitnessStreakCount(eligible, todayDateKey).currentCount;
}

export function streakMotivationLabel(count: number): string | null {
  if (count >= 30) return "Unstoppable";
  if (count >= 14) return "Two weeks strong";
  if (count >= 7) return "On fire";
  if (count >= 3) return "Building momentum";
  if (count >= 1) return "Keep it going";
  return null;
}

function nutritionTargetPct(actual: number, target: number): number {
  if (target <= 0) return 0;
  return Math.round((actual / target) * 100);
}

/** Streak-only summary for calendar day tap, workout OR nutrition goal. */
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

function habitTemplateMentionsWeighIn(name: string): boolean {
  return /weigh/i.test(name);
}

/** Habits + optional weigh-in for expanded day log, excludes streak criteria. */
export function getDayHabitProgress(state: AppState, dateKey: string): DayHabitProgress {
  const items: DayProgressLineItem[] = [];
  const t = effectiveNutritionTotalsForDateKey(state.nutritionManualByDay, state.nutritionItemsByDay, dateKey);
  const macrosDone = t.cal > 0 || t.p > 0 || t.c > 0 || t.f > 0;
  items.push({ id: "nutrition-logged", label: "Nutrition logged", done: macrosDone });

  const hasWeighHabit = state.habitTemplates.some((h) => habitTemplateMentionsWeighIn(h.name));
  if (!hasWeighHabit) {
    const weighed = state.weightLog.some((e) => e.dateKey === dateKey);
    items.push({ id: "weigh", label: "Morning weigh-in", done: weighed });
  }

  const habitRow = state.habitsDoneByDay[dateKey] ?? {};
  for (const h of state.habitTemplates) {
    items.push({ id: `habit:${h.id}`, label: h.name, done: Boolean(habitRow[h.id]) });
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
    const progress = kind === "future" ? 0 : streakDayProgress(state, dateKey);
    out.push({ dateKey, letter, dom, kind, progress });
  }
  return out;
}
