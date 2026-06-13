import {
  buildWeeklySummary,
  localDateKey,
  nutritionGoalHitForDateKey,
  planWeekIndex,
  weekDateKeysMondayStart,
} from "@newyouai/core";
import type { AppState } from "@newyouai/types";

export type SundayCheckInDayCell = {
  dateKey: string;
  label: string;
  workoutDone: boolean;
  proteinHit: boolean;
};

export type SundayCheckInData = {
  sundayKey: string;
  weekNumber: number;
  workoutsCompleted: number;
  workoutsPlanned: number;
  proteinDaysHit: number;
  weightDeltaLbs: number | null;
  onTrack: boolean;
  dayCells: SundayCheckInDayCell[];
};

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export function isSundayCheckInDay(now = new Date()): boolean {
  return now.getDay() === 0;
}

export function shouldShowSundayCheckIn(state: AppState, now: Date): boolean {
  if (!state.onboardingComplete) return false;
  return isSundayCheckInDay(now);
}

function sundayKeyFromDate(now: Date): string {
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  return localDateKey(d);
}

export function buildSundayCheckInData(state: AppState, now = new Date()): SundayCheckInData | null {
  if (now.getDay() !== 0) return null;

  const sundayKey = sundayKeyFromDate(now);
  const summary = buildWeeklySummary(state, sundayKey);
  const weekKeys = weekDateKeysMondayStart(sundayKey);

  let proteinDaysHit = 0;
  for (const dayKey of weekKeys) {
    if (
      nutritionGoalHitForDateKey(
        state.nutritionManualByDay,
        state.nutritionItemsByDay,
        state.nutritionTargets,
        dayKey,
      )
    ) {
      proteinDaysHit += 1;
    }
  }

  const dayCells: SundayCheckInDayCell[] = weekKeys.map((dateKey, i) => ({
    dateKey,
    label: DAY_LABELS[i] ?? "·",
    workoutDone: Boolean(state.workoutsCompletedByDay[dateKey]),
    proteinHit: nutritionGoalHitForDateKey(
      state.nutritionManualByDay,
      state.nutritionItemsByDay,
      state.nutritionTargets,
      dateKey,
    ),
  }));

  const weekStartKey = weekKeys[0];
  const weekEndKey = weekKeys[6];
  const weekWeights = state.weightLog
    .filter((e) => e.dateKey >= weekStartKey && e.dateKey <= weekEndKey)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  const weightDeltaLbs =
    weekWeights.length >= 2
      ? weekWeights[weekWeights.length - 1]!.weightLbs - weekWeights[0]!.weightLbs
      : null;

  const onTrack =
    summary.workoutsCompleted >= Math.min(summary.workoutsPlanned, 3) && proteinDaysHit >= 4;

  return {
    sundayKey,
    weekNumber: planWeekIndex(new Date(`${sundayKey}T12:00:00`), state.planStartIso),
    workoutsCompleted: summary.workoutsCompleted,
    workoutsPlanned: summary.workoutsPlanned,
    proteinDaysHit,
    weightDeltaLbs,
    onTrack,
    dayCells,
  };
}
