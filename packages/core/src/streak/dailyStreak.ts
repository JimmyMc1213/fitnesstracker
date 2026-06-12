import { localDateKey } from "../dates/dailyPlan";
import { effectiveNutritionTotalsForDateKey } from "../nutrition/nutritionTotals";
import type { AppState, FitnessStreakSnapshot, MacroTotals, StreakSessionBaseline } from "@newyouai/types";

/** Minimum fraction of calorie + protein targets to count as "nutrition goal hit". */
export const NUTRITION_GOAL_HIT_RATIO = 0.9;

function dateKeyMinusOne(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const y2 = dt.getFullYear();
  const m2 = String(dt.getMonth() + 1).padStart(2, "0");
  const day2 = String(dt.getDate()).padStart(2, "0");
  return `${y2}-${m2}-${day2}`;
}

function macroRatioHit(actual: number, target: number): boolean {
  if (target <= 0) return false;
  return actual >= target * NUTRITION_GOAL_HIT_RATIO;
}

/** True when logged macros meet at least 90% of calorie and protein targets for the day. */
export function nutritionGoalHitForDateKey(
  nutritionManualByDay: Record<string, MacroTotals> | undefined,
  nutritionItemsByDay: Record<string, import("@newyouai/types").NutritionLoggedItem[]> | undefined,
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
