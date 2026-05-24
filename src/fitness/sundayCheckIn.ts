import { planWeekIndex } from "./data";
import { proteinGoalHitForDateKey } from "./dailyStreak";
import { localDateKey } from "./dailyPlan";
import { buildWeeklySummary, weekDateKeysMondayStart } from "./weeklySummary";
import type { AppState } from "./types";

export const MIN_WEIGH_INS_FOR_FULL_RECAP = 2;

export type SundayCheckInData = {
  sundayKey: string;
  weekNumber: number;
  nextWeekNumber: number;
  displayName: string;
  workoutsCompleted: number;
  workoutsPlanned: number;
  proteinDaysHit: number;
  lastWeightLbs: number | null;
  weighInsThisWeek: number;
  hasFullRecap: boolean;
};

function sundayKeyFromDate(now: Date): string {
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  return localDateKey(d);
}

/** Dev only: treat "now" as noon on this week's Sunday so the check-in card is visible any day. */
export function sundayNoonForCurrentWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  return x;
}

export function buildSundayCheckInData(state: AppState, now = new Date()): SundayCheckInData | null {
  if (now.getDay() !== 0) return null;

  const sundayKey = sundayKeyFromDate(now);
  const summary = buildWeeklySummary(state, sundayKey);
  const weekKeys = weekDateKeysMondayStart(sundayKey);

  let proteinDaysHit = 0;
  for (const dayKey of weekKeys) {
    if (
      proteinGoalHitForDateKey(
        state.nutritionManualByDay,
        state.nutritionItemsByDay,
        state.nutritionTargets,
        dayKey,
      )
    ) {
      proteinDaysHit += 1;
    }
  }

  const weekStartKey = weekKeys[0];
  const weekEndKey = weekKeys[6];
  const weighInDays = new Set(
    state.weightLog
      .filter((e) => e.dateKey >= weekStartKey && e.dateKey <= weekEndKey)
      .map((e) => e.dateKey),
  );

  const sortedWeights = [...state.weightLog].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  const lastWeightLbs = sortedWeights[0]?.weightLbs ?? null;

  const weekNumber = planWeekIndex(now, state.planStartIso);
  const nextWeekNumber = Math.min(12, weekNumber + 1);
  const trimmedName = state.displayName.trim();

  return {
    sundayKey,
    weekNumber,
    nextWeekNumber,
    displayName: trimmedName,
    workoutsCompleted: summary.workoutsCompleted,
    workoutsPlanned: summary.workoutsPlanned,
    proteinDaysHit,
    lastWeightLbs,
    weighInsThisWeek: weighInDays.size,
    hasFullRecap: weighInDays.size >= MIN_WEIGH_INS_FOR_FULL_RECAP,
  };
}

export function shouldShowSundayCheckIn(
  state: AppState,
  now: Date,
  previewSunday = false,
): boolean {
  const effectiveNow = previewSunday ? sundayNoonForCurrentWeek(now) : now;
  const data = buildSundayCheckInData(state, effectiveNow);
  if (!data) return false;
  if (previewSunday) return true;
  return data.sundayKey !== state.sundayReviewCompletedKey;
}

export function dismissSundayCheckIn(state: AppState, now = new Date()): AppState {
  if (now.getDay() !== 0) return state;
  const sundayKey = sundayKeyFromDate(now);
  return { ...state, sundayReviewCompletedKey: sundayKey };
}
