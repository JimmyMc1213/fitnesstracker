import { DEFAULT_NUTRITION_TARGETS } from "./data";
import type { AppState, AdjustmentEvent, MacroTotals, WeightEntry } from "./types";

/** Minimum distinct weigh-in days in a Mon–Sun week to compare week averages in Sunday review. */
export const MIN_WEIGH_INS_FOR_WEEK_COMPARE = 2;

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Monday of the Mon–Sun week that contains `d` (local). */
export function mondayOfWeekContaining(d: Date): Date {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  const day = x.getDay();
  const toMon = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + toMon);
  return x;
}

/** Sunday closing the Mon–Sun week that contains `d` (local). */
export function sundayOfWeekContaining(d: Date): Date {
  const mon = mondayOfWeekContaining(d);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return sun;
}

/** Mon & Sun date keys for the week that ends on `weekEndingSunday`. */
export function calendarWeekRangeFromSunday(weekEndingSunday: Date): { mon: string; sun: string } {
  const s = new Date(weekEndingSunday);
  s.setHours(12, 0, 0, 0);
  const m = new Date(s);
  m.setDate(s.getDate() - 6);
  return { mon: localDateKey(m), sun: localDateKey(s) };
}

export function enumerateWeekDayKeys(monKey: string, sunKey: string): string[] {
  const keys: string[] = [];
  const cur = new Date(`${monKey}T12:00:00`);
  const end = new Date(`${sunKey}T12:00:00`);
  for (; cur <= end; cur.setDate(cur.getDate() + 1)) {
    keys.push(localDateKey(cur));
  }
  return keys;
}

export function weekDayShortLabel(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** Mean weight for distinct logged days in range; null if fewer than `minDistinctDays`. */
export function meanWeightInRangeOrNull(
  log: WeightEntry[],
  startKey: string,
  endKey: string,
  minDistinctDays = 1,
): number | null {
  const entries = log.filter((e) => e.dateKey >= startKey && e.dateKey <= endKey);
  const byDay = new Map<string, number>();
  for (const e of entries) {
    byDay.set(e.dateKey, e.weightLbs);
  }
  if (byDay.size < minDistinctDays) return null;
  const sum = [...byDay.values()].reduce((a, v) => a + v, 0);
  return sum / byDay.size;
}

function applyCalorieDelta(base: MacroTotals, deltaCal: number): MacroTotals {
  if (deltaCal === 0) return { ...base };
  const next = {
    ...base,
    cal: Math.round(base.cal + deltaCal),
    p: base.p,
    f: base.f,
    c: Math.round(base.c + deltaCal / 4),
  };
  next.cal = Math.max(1600, Math.min(2800, next.cal));
  next.c = Math.max(80, next.c);
  return next;
}

/** Preview new macros after an approved calorie delta (same rules as commit). */
export function previewTargetsAfterCalorieDelta(base: MacroTotals, deltaCal: number): MacroTotals {
  return applyCalorieDelta(base, Math.round(deltaCal));
}

function buildReason(weeklyLoss: number): string {
  if (weeklyLoss > 2) return `Fast loss (${weeklyLoss.toFixed(2)} lb/wk avg) → +150 kcal.`;
  if (weeklyLoss >= 0.7 && weeklyLoss <= 1.5) return `On-target pace (~${weeklyLoss.toFixed(2)} lb/wk avg).`;
  if (weeklyLoss > 1.5 && weeklyLoss <= 2) return `Between bands (~${weeklyLoss.toFixed(2)} lb/wk avg) → holding calories.`;
  return `Under 0.7 lb/wk or plateau (${weeklyLoss.toFixed(2)} lb/wk avg) → −150 kcal.`;
}

function previousSundayKey(sundayKey: string): string {
  const d = new Date(`${sundayKey}T12:00:00`);
  d.setDate(d.getDate() - 7);
  return localDateKey(d);
}

export type DayWeighInRow = { dateKey: string; label: string; weightLbs: number | null };

export type SundayReviewPreview = {
  thisSundayKey: string;
  currRange: { mon: string; sun: string };
  prevRange: { mon: string; sun: string };
  currDays: DayWeighInRow[];
  prevDays: DayWeighInRow[];
  avgCurr: number | null;
  avgPrev: number | null;
  distinctCurr: number;
  distinctPrev: number;
  weeklyLoss: number | null;
  baseDelta: number;
  recommendedTotalDelta: number;
  /** Both weeks have enough logged days for a week-over-week mean comparison. */
  ready: boolean;
};

export function buildSundayReviewPreview(state: AppState, now = new Date()): SundayReviewPreview | null {
  if (now.getDay() !== 0) return null;

  const thisSunday = new Date(now);
  thisSunday.setHours(12, 0, 0, 0);
  const thisSundayKey = localDateKey(thisSunday);

  const prevSunday = new Date(thisSunday);
  prevSunday.setDate(prevSunday.getDate() - 7);

  const currRange = calendarWeekRangeFromSunday(thisSunday);
  const prevRange = calendarWeekRangeFromSunday(prevSunday);

  const currKeys = enumerateWeekDayKeys(currRange.mon, currRange.sun);
  const prevKeys = enumerateWeekDayKeys(prevRange.mon, prevRange.sun);

  const logByDay = new Map(state.weightLog.map((e) => [e.dateKey, e.weightLbs]));
  const mapRow = (k: string): DayWeighInRow => ({
    dateKey: k,
    label: weekDayShortLabel(k),
    weightLbs: logByDay.get(k) ?? null,
  });
  const currDays = currKeys.map(mapRow);
  const prevDays = prevKeys.map(mapRow);

  const distinctCurr = currDays.filter((d) => d.weightLbs != null).length;
  const distinctPrev = prevDays.filter((d) => d.weightLbs != null).length;

  const avgCurr = meanWeightInRangeOrNull(state.weightLog, currRange.mon, currRange.sun, MIN_WEIGH_INS_FOR_WEEK_COMPARE);
  const avgPrev = meanWeightInRangeOrNull(state.weightLog, prevRange.mon, prevRange.sun, MIN_WEIGH_INS_FOR_WEEK_COMPARE);
  const ready = avgCurr !== null && avgPrev !== null;

  let weeklyLoss: number | null = null;
  let baseDelta = 0;
  let recommendedTotalDelta = 0;

  if (ready && avgCurr !== null && avgPrev !== null) {
    weeklyLoss = avgPrev - avgCurr;
    if (weeklyLoss > 2) baseDelta = 150;
    else if (weeklyLoss >= 0.7 && weeklyLoss <= 1.5) baseDelta = 0;
    else if (weeklyLoss > 1.5 && weeklyLoss <= 2) baseDelta = 0;
    else baseDelta = -150;
    recommendedTotalDelta = baseDelta;
  }

  return {
    thisSundayKey,
    currRange,
    prevRange,
    currDays,
    prevDays,
    avgCurr,
    avgPrev,
    distinctCurr,
    distinctPrev,
    weeklyLoss,
    baseDelta,
    recommendedTotalDelta,
    ready,
  };
}

export function revertLastNutritionAdjustment(state: AppState): AppState {
  const last = state.adjustmentHistory[0];
  if (!last) return state;
  const priorSun = previousSundayKey(last.weekEndingSunday);
  return {
    ...state,
    nutritionTargets: { ...last.before },
    lastAdjustmentSundayKey: priorSun,
    sundayReviewCompletedKey: priorSun,
    adjustmentHistory: state.adjustmentHistory.slice(1),
  };
}

export function commitSundayReviewSkip(state: AppState, now = new Date()): AppState {
  if (now.getDay() !== 0) return state;
  const thisSunday = new Date(now);
  thisSunday.setHours(12, 0, 0, 0);
  const thisSundayKey = localDateKey(thisSunday);
  return { ...state, sundayReviewCompletedKey: thisSundayKey };
}

export function commitSundayReviewApproval(
  state: AppState,
  now: Date,
  chosenDeltaCal: number,
  preview: SundayReviewPreview,
): AppState {
  if (!preview.ready || preview.weeklyLoss === null) return state;

  const rounded = Math.round(chosenDeltaCal);
  const before = { ...state.nutritionTargets };
  const after = previewTargetsAfterCalorieDelta(before, rounded);

  const rec = preview.recommendedTotalDelta;
  const reasonBase = buildReason(preview.weeklyLoss);
  const reason = `${reasonBase} · User approved ${rounded >= 0 ? "+" : ""}${rounded} kcal/day${rounded !== rec ? ` (recommended ${rec >= 0 ? "+" : ""}${rec})` : ""}.`;

  const event: AdjustmentEvent = {
    atIso: now.toISOString(),
    weekEndingSunday: preview.thisSundayKey,
    weeklyLossLbs: preview.weeklyLoss,
    before,
    after: { ...after },
    reason,
    recommendedDeltaCal: rec,
    appliedDeltaCal: rounded,
  };

  return {
    ...state,
    nutritionTargets: after,
    lastAdjustmentSundayKey: preview.thisSundayKey,
    sundayReviewCompletedKey: preview.thisSundayKey,
    adjustmentHistory: [event, ...state.adjustmentHistory].slice(0, 24),
  };
}

export function resetNutritionTargetsToDefault(state: AppState): AppState {
  return {
    ...state,
    nutritionTargets: { ...DEFAULT_NUTRITION_TARGETS },
  };
}
