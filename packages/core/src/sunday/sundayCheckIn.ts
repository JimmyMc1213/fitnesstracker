import type { AppState, WeekFocusCommitment } from "@newyouai/types";

import { buildCoachContext, getWeeklyCoachReview } from "../coach/coachEngine";
import { localDateKey } from "../dates/dailyPlan";
import { meanWeightInRangeOrNull } from "../progress/meanWeightInRange";
import { planWeekIndex } from "../plan/planWeekIndex";
import { nutritionGoalHitForDateKey } from "../streak/dailyStreak";
import { buildWeeklySummary, weekDateKeysMondayStart } from "../training/weeklySummary";
import {
  buildSundayCheckInDayCells,
  buildSundayCheckInHeadline,
  buildSundayCheckInMetrics,
  buildSundayCheckInWatchItems,
  buildSundayCheckInWins,
  buildSundayCommitmentOptions,
  buildSundayFuelUpdate,
  buildSundayWeightInsight,
  formatRangeCaps,
  goalPaceLabel,
} from "./sundayCheckInCoachContent";
import {
  appendSundayCheckInHistory,
  buildSundayHistoryWins,
  buildSundayMultiWeekContext,
  planStartWeightLbs,
  weekRecordFromCheckInData,
} from "./sundayCheckInHistory";

export const MIN_WEIGH_INS_FOR_FULL_RECAP = 2;

export const SUNDAY_CHECK_IN_STEPS = 4;

export type SundayCheckInDayCell = {
  dateKey: string;
  label: string;
  workoutDone: boolean;
  proteinHit: boolean;
};

export type SundayCheckInMetric = {
  label: string;
  value: string;
  status: string;
  tone: "success" | "warning" | "danger" | "neutral" | "accent";
  icon: "workout" | "protein" | "weight" | "mobility" | "sleep" | "weighIn";
};

export type SundayCheckInCoachItem = {
  text: string;
};

export type SundayCheckInCommitmentOption = {
  id: string;
  title: string;
  subtitle: string;
};

export type SundayCheckInFuelUpdate = {
  change: "none" | "increase" | "decrease";
  kcal: number;
  proteinG: number;
  summary: string;
};

export type SundayCheckInDailyWeight = {
  dateKey: string;
  label: string;
  weightLbs: number | null;
};

export type SundayCheckInData = {
  sundayKey: string;
  weekNumber: number;
  nextWeekNumber: number;
  displayName: string;
  weekStartKey: string;
  weekEndKey: string;
  rangeLabel: string;
  rangeLabelCaps: string;
  workoutsCompleted: number;
  workoutsPlanned: number;
  proteinDaysHit: number;
  lastWeightLbs: number | null;
  weighInsThisWeek: number;
  hasFullRecap: boolean;
  onTrack: boolean;
  headline: string;
  summaryLine: string;
  statusLabel: string;
  weightDeltaLbs: number | null;
  weightStartLbs: number | null;
  weightEndLbs: number | null;
  weightWeeklyAvgDelta: number | null;
  dailyWeights: SundayCheckInDailyWeight[];
  weightHeadline: string;
  weightInsight: string;
  goalPaceLabel: string;
  metrics: SundayCheckInMetric[];
  dayCells: SundayCheckInDayCell[];
  wins: SundayCheckInCoachItem[];
  watchItems: SundayCheckInCoachItem[];
  fuelUpdate: SundayCheckInFuelUpdate;
  commitmentOptions: SundayCheckInCommitmentOption[];
  multiWeekLines: string[];
};

function sundayKeyFromDate(now: Date): string {
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  return localDateKey(d);
}

function previousWeekKeys(weekStartKey: string): { start: string; end: string } {
  const start = new Date(`${weekStartKey}T12:00:00`);
  start.setDate(start.getDate() - 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: localDateKey(start), end: localDateKey(end) };
}

function weightForDay(log: AppState["weightLog"], dateKey: string): number | null {
  const entry = log.find((e) => e.dateKey === dateKey);
  return entry?.weightLbs ?? null;
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
  const weekStartKey = weekKeys[0];
  const weekEndKey = weekKeys[6];

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

  const weighInDays = new Set(
    state.weightLog
      .filter((e) => e.dateKey >= weekStartKey && e.dateKey <= weekEndKey)
      .map((e) => e.dateKey),
  );

  const sortedWeights = [...state.weightLog].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  const lastWeightLbs = sortedWeights[0]?.weightLbs ?? null;

  const weekNumber = planWeekIndex(now, state.planStartIso);
  const trimmedName = state.displayName.trim();

  const thisWeekAvg = meanWeightInRangeOrNull(state.weightLog, weekStartKey, weekEndKey, 1);
  const prev = previousWeekKeys(weekStartKey);
  const priorWeekAvg = meanWeightInRangeOrNull(state.weightLog, prev.start, prev.end, 1);
  const weightDeltaLbs =
    thisWeekAvg != null && priorWeekAvg != null ? thisWeekAvg - priorWeekAvg : null;

  const weekStartWeight = weightForDay(state.weightLog, weekStartKey);
  const weekEndWeight = weightForDay(state.weightLog, weekEndKey) ?? lastWeightLbs;
  const weightWeeklyAvgDelta = weightDeltaLbs;

  const dailyWeights = weekKeys.map((dateKey) => ({
    dateKey,
    label: new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3).toUpperCase(),
    weightLbs: weightForDay(state.weightLog, dateKey),
  }));

  const chartValues = dailyWeights.map((d) => d.weightLbs).filter((v): v is number => v != null);
  const hasFullRecap = weighInDays.size >= MIN_WEIGH_INS_FOR_FULL_RECAP;

  const trainingOnPace = summary.workoutsCompleted >= summary.workoutsPlanned;
  const proteinOnPace = proteinDaysHit >= 4;
  const weightOnPace =
    weightDeltaLbs == null ||
    state.onboardingProfile?.goal !== "cut" ||
    weightDeltaLbs <= 0.5;
  const onTrack = trainingOnPace && proteinOnPace && weightOnPace;

  const { headline, summaryLine, statusLabel } = buildSundayCheckInHeadline({
    displayName: trimmedName,
    workoutsCompleted: summary.workoutsCompleted,
    workoutsPlanned: summary.workoutsPlanned,
    proteinDaysHit,
    weightDeltaLbs,
    onTrack,
  });

  const mobilityPlanned = 4;
  const metrics = buildSundayCheckInMetrics({
    state,
    weekKeys,
    workoutsCompleted: summary.workoutsCompleted,
    workoutsPlanned: summary.workoutsPlanned,
    proteinDaysHit,
    weighInsThisWeek: weighInDays.size,
    weightDeltaLbs,
    weightWeeklyAvgDelta,
    mobilityPlanned,
  });

  const dayCells = buildSundayCheckInDayCells(state, weekKeys);
  const history = state.sundayCheckInHistory ?? [];
  const historyWins = buildSundayHistoryWins({
    history,
    weekStartKey,
    workoutsCompleted: summary.workoutsCompleted,
    workoutsPlanned: summary.workoutsPlanned,
    proteinDaysHit,
  });
  const wins = [
    ...historyWins.map((text) => ({ text })),
    ...buildSundayCheckInWins({
      state,
      weekKeys,
      weekStartKey,
      weekEndKey,
      workoutsCompleted: summary.workoutsCompleted,
      workoutsPlanned: summary.workoutsPlanned,
      proteinDaysHit,
      weighInsThisWeek: weighInDays.size,
    }).filter((w) => !historyWins.includes(w.text)),
  ].slice(0, 4);
  const watchItems = buildSundayCheckInWatchItems({
    state,
    weekKeys,
    workoutsCompleted: summary.workoutsCompleted,
    workoutsPlanned: summary.workoutsPlanned,
    proteinDaysHit,
    targets: state.nutritionTargets,
  });
  const fuelUpdate = buildSundayFuelUpdate(state);

  const coachCtx = buildCoachContext(state, sundayKey, now);
  const coachReview = getWeeklyCoachReview(coachCtx);
  const commitmentOptions = buildSundayCommitmentOptions({
    state,
    workoutsPlanned: summary.workoutsPlanned,
    proteinDaysHit,
    targets: state.nutritionTargets,
    watchItems,
    nextWeekFocus: coachReview.nextWeekFocus,
  });

  let weightHeadline = "Weight trend this week.";
  if (weightDeltaLbs != null) {
    if (weightDeltaLbs < -0.3) weightHeadline = "Down at a steady pace.";
    else if (weightDeltaLbs > 0.3) weightHeadline = "Trending up this week.";
    else weightHeadline = "Holding steady.";
  } else if (chartValues.length >= 2) {
    const intra = chartValues[chartValues.length - 1] - chartValues[0];
    if (intra < -0.3) weightHeadline = "Down at a steady pace.";
    else if (intra > 0.3) weightHeadline = "Trending up this week.";
  }

  const multiWeekLines = buildSundayMultiWeekContext({
    history,
    weekStartKey,
    weekNumber,
    workoutsCompleted: summary.workoutsCompleted,
    workoutsPlanned: summary.workoutsPlanned,
    proteinDaysHit,
    weightDeltaLbs,
    onTrack,
    planStartWeightLbs: planStartWeightLbs(state),
    currentWeightLbs: weekEndWeight ?? lastWeightLbs,
  });

  return {
    sundayKey,
    weekNumber,
    nextWeekNumber: weekNumber + 1,
    displayName: trimmedName,
    weekStartKey,
    weekEndKey,
    rangeLabel: formatRangeCaps(weekStartKey, weekEndKey).toLowerCase(),
    rangeLabelCaps: formatRangeCaps(weekStartKey, weekEndKey),
    workoutsCompleted: summary.workoutsCompleted,
    workoutsPlanned: summary.workoutsPlanned,
    proteinDaysHit,
    lastWeightLbs,
    weighInsThisWeek: weighInDays.size,
    hasFullRecap,
    onTrack,
    headline,
    summaryLine,
    statusLabel,
    weightDeltaLbs,
    weightStartLbs: weekStartWeight ?? (chartValues[0] ?? null),
    weightEndLbs: weekEndWeight ?? (chartValues[chartValues.length - 1] ?? null),
    weightWeeklyAvgDelta,
    dailyWeights,
    weightHeadline,
    weightInsight: buildSundayWeightInsight({
      weightDeltaLbs,
      weightWeeklyAvgDelta,
      goal: state.onboardingProfile?.goal,
    }),
    goalPaceLabel: goalPaceLabel(state),
    metrics,
    dayCells,
    wins,
    watchItems,
    fuelUpdate,
    commitmentOptions,
    multiWeekLines,
  };
}

export function isSundayCheckInDay(now = new Date(), previewSunday = false): boolean {
  const effectiveNow = previewSunday ? sundayNoonForCurrentWeek(now) : now;
  return effectiveNow.getDay() === 0;
}

export function isSundayCheckInComplete(state: AppState, sundayKey: string): boolean {
  return state.sundayReviewCompletedKey === sundayKey;
}

/** Home card stays visible all day Sunday; hides Monday. */
export function shouldShowSundayCheckIn(
  state: AppState,
  now: Date,
  previewSunday = false,
): boolean {
  if (previewSunday) return true;
  if (!state.onboardingComplete) return false;
  return isSundayCheckInDay(now, previewSunday);
}

export function hasSundayCheckInHistoryForKey(state: AppState, sundayKey: string): boolean {
  return (state.sundayCheckInHistory ?? []).some((record) => record.sundayKey === sundayKey);
}

/** Home card hides when dismissed (completed without history); stays after full commit. */
export function shouldShowSundayCheckInCard(
  state: AppState,
  data: SundayCheckInData | null,
  now: Date,
  previewSunday = false,
): boolean {
  if (!data || !shouldShowSundayCheckIn(state, now, previewSunday)) return false;
  if (state.sundayReviewCompletedKey !== data.sundayKey) return true;
  return hasSundayCheckInHistoryForKey(state, data.sundayKey);
}

export function dismissSundayCheckIn(
  state: AppState,
  now = new Date(),
  previewSunday = false,
): AppState {
  const effectiveNow = previewSunday ? sundayNoonForCurrentWeek(now) : now;
  if (!previewSunday && effectiveNow.getDay() !== 0) return state;
  const sundayKey = sundayKeyFromDate(effectiveNow);
  return { ...state, sundayReviewCompletedKey: sundayKey };
}

export function commitSundayCheckIn(
  state: AppState,
  data: SundayCheckInData,
  commitments: WeekFocusCommitment[],
): AppState {
  const record = weekRecordFromCheckInData(data, commitments);
  return {
    ...state,
    sundayReviewCompletedKey: data.sundayKey,
    weekFocusCommitments: commitments,
    weekFocusWeekStartKey: data.weekStartKey,
    sundayCheckInHistory: appendSundayCheckInHistory(state.sundayCheckInHistory ?? [], record),
  };
}
