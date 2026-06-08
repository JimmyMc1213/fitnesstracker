import { DEFAULT_NUTRITION_TARGETS } from "./data";
import type { AppState, MacroTotals, WeightEntry } from "./types";

/** Minimum distinct weigh-in days in a Mon–Sun week for a full Sunday recap. */
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

function previousSundayKey(sundayKey: string): string {
  const d = new Date(`${sundayKey}T12:00:00`);
  d.setDate(d.getDate() - 7);
  return localDateKey(d);
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

export function resetNutritionTargetsToDefault(state: AppState): AppState {
  return {
    ...state,
    nutritionTargets: { ...DEFAULT_NUTRITION_TARGETS },
  };
}
