import { localDateKey } from "./dailyPlan";
import { effectiveNutritionTotalsForDateKey } from "./nutritionTotals";
import { startOfWeekSunday, weekDateKeysSundayStart } from "./trainingCalendar";
import type { AppState, MacroTotals } from "./types";

export type MacroCalories = {
  protein: number;
  carbs: number;
  fat: number;
  total: number;
};

export type AverageCalDay = {
  dateKey: string;
  dayLabel: string;
  macros: MacroCalories;
  isFuture: boolean;
  isToday: boolean;
};

export type AverageCalWeekStats = {
  weekStartKey: string;
  weekEndKey: string;
  days: AverageCalDay[];
  averageCal: number | null;
  loggedDays: number;
  trendPct: number | null;
  chartMaxCal: number;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function parseDateKeyNoonLocal(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function dateKeyPlusDays(dateKey: string, days: number): string {
  const d = parseDateKeyNoonLocal(dateKey);
  d.setDate(d.getDate() + days);
  return localDateKey(d);
}

export function weekAnchorWeeksAgo(todayKey: string, weeksAgo: number): string {
  const sunday = startOfWeekSunday(todayKey);
  return dateKeyPlusDays(sunday, -weeksAgo * 7);
}

export function macroCaloriesFromTotals(t: MacroTotals): MacroCalories {
  const protein = (Number(t.p) || 0) * 4;
  const carbs = (Number(t.c) || 0) * 4;
  const fat = (Number(t.f) || 0) * 9;
  const sum = protein + carbs + fat;
  const loggedCal = Number(t.cal) || 0;
  const total = loggedCal > 0 ? loggedCal : sum;
  if (sum > 0 && total > 0 && Math.abs(total - sum) > 1) {
    const scale = total / sum;
    return { protein: protein * scale, carbs: carbs * scale, fat: fat * scale, total };
  }
  return { protein, carbs, fat, total: total || sum };
}

export function niceChartMaxCal(maxCal: number, targetCal: number): number {
  const peak = Math.max(maxCal, targetCal, 1);
  if (peak <= 500) return 500;
  if (peak <= 1000) return 1000;
  if (peak <= 1500) return 1500;
  if (peak <= 2000) return 2000;
  return Math.ceil(peak / 500) * 500;
}

function buildWeekStats(state: AppState, todayKey: string, weeksAgo: number): AverageCalWeekStats {
  const anchorKey = weekAnchorWeeksAgo(todayKey, weeksAgo);
  const weekKeys = weekDateKeysSundayStart(anchorKey);
  const weekStartKey = weekKeys[0]!;
  const weekEndKey = weekKeys[6]!;
  const isCurrentWeek = weeksAgo === 0;

  let totalCal = 0;
  let loggedDays = 0;
  let peakDayCal = 0;

  const days: AverageCalDay[] = weekKeys.map((dateKey, i) => {
    const totals = effectiveNutritionTotalsForDateKey(
      state.nutritionManualByDay,
      state.nutritionItemsByDay,
      dateKey,
    );
    const macros = macroCaloriesFromTotals(totals);
    const logged = macros.total > 0;
    if (logged) {
      totalCal += macros.total;
      loggedDays += 1;
      peakDayCal = Math.max(peakDayCal, macros.total);
    }
    return {
      dateKey,
      dayLabel: DAY_LABELS[i]!,
      macros,
      isFuture: isCurrentWeek && dateKey > todayKey,
      isToday: isCurrentWeek && dateKey === todayKey,
    };
  });

  const averageCal = loggedDays > 0 ? Math.round(totalCal / loggedDays) : null;
  const chartMaxCal = niceChartMaxCal(peakDayCal, state.nutritionTargets.cal);

  return {
    weekStartKey,
    weekEndKey,
    days,
    averageCal,
    loggedDays,
    trendPct: null,
    chartMaxCal,
  };
}

/** Average daily calories for a Sun–Sat week, with trend vs the prior week. */
export function buildAverageCalWeekStats(
  state: AppState,
  todayKey: string,
  weeksAgo = 0,
): AverageCalWeekStats {
  const stats = buildWeekStats(state, todayKey, weeksAgo);
  const prior = buildWeekStats(state, todayKey, weeksAgo + 1);
  let trendPct: number | null = null;
  if (stats.averageCal != null && prior.averageCal != null && prior.averageCal > 0) {
    trendPct = Math.round(((stats.averageCal - prior.averageCal) / prior.averageCal) * 100);
  }
  return { ...stats, trendPct };
}

export const AVERAGE_CAL_WEEK_OPTIONS = [
  { weeksAgo: 0, label: "This wk" },
  { weeksAgo: 1, label: "Last wk" },
  { weeksAgo: 2, label: "2 wk ago" },
  { weeksAgo: 3, label: "3 wk ago" },
] as const;
