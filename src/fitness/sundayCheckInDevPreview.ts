import { localDateKey } from "./dailyPlan";
import { planWeekIndex } from "./data";
import {
  buildSundayCheckInHeadline,
  buildSundayWeightInsight,
  formatRangeCaps,
  goalPaceLabel,
} from "./sundayCheckInCoachContent";
import type { SundayCheckInData } from "./sundayCheckIn";
import { sundayNoonForCurrentWeek } from "./sundayCheckIn";
import { weekDateKeysMondayStart } from "./weeklySummary";
import type { AppState } from "./types";

/** Rich demo stats for dev Sunday preview (`?previewSunday=1`). */
export function buildDevPreviewSundayCheckInData(
  state: AppState,
  now = new Date(),
): SundayCheckInData {
  const reviewNow = sundayNoonForCurrentWeek(now);
  const sundayKey = localDateKey(reviewNow);
  const weekKeys = weekDateKeysMondayStart(sundayKey);
  const weekStartKey = weekKeys[0];
  const weekEndKey = weekKeys[6];
  const weekNumber = Math.max(4, planWeekIndex(reviewNow, state.planStartIso));
  const displayName = state.displayName.trim() || "Alex";

  const workoutsCompleted = 4;
  const workoutsPlanned = 5;
  const proteinDaysHit = 5;
  const weighInsThisWeek = 6;
  const weightDeltaLbs = -1.2;
  const weightWeeklyAvgDelta = -1.2;
  const onTrack = true;

  const dailyWeightValues = [188.4, 188.1, 187.9, null, 187.6, 187.4, 187.2];
  const dailyWeights = weekKeys.map((dateKey, i) => ({
    dateKey,
    label: new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3).toUpperCase(),
    weightLbs: dailyWeightValues[i] ?? null,
  }));

  const dayCells = [
    { workoutDone: true, proteinHit: true },
    { workoutDone: true, proteinHit: true },
    { workoutDone: true, proteinHit: true },
    { workoutDone: false, proteinHit: false },
    { workoutDone: true, proteinHit: true },
    { workoutDone: false, proteinHit: true },
    { workoutDone: false, proteinHit: true },
  ].map((flags, i) => ({
    dateKey: weekKeys[i],
    label: new Date(`${weekKeys[i]}T12:00:00`).toLocaleDateString("en-US", { weekday: "narrow" }),
    ...flags,
  }));

  const { headline, summaryLine, statusLabel } = buildSundayCheckInHeadline({
    displayName,
    workoutsCompleted,
    workoutsPlanned,
    proteinDaysHit,
    weightDeltaLbs,
    onTrack,
  });

  return {
    sundayKey,
    weekNumber,
    nextWeekNumber: weekNumber + 1,
    displayName,
    weekStartKey,
    weekEndKey,
    rangeLabel: formatRangeCaps(weekStartKey, weekEndKey).toLowerCase(),
    rangeLabelCaps: formatRangeCaps(weekStartKey, weekEndKey),
    workoutsCompleted,
    workoutsPlanned,
    proteinDaysHit,
    lastWeightLbs: 187.2,
    weighInsThisWeek,
    hasFullRecap: true,
    onTrack,
    headline,
    summaryLine,
    statusLabel,
    weightDeltaLbs,
    weightStartLbs: 188.4,
    weightEndLbs: 187.2,
    weightWeeklyAvgDelta,
    dailyWeights,
    weightHeadline: "Down at a steady pace.",
    weightInsight: buildSundayWeightInsight({
      weightDeltaLbs,
      weightWeeklyAvgDelta,
      goal: state.onboardingProfile?.goal ?? "cut",
    }),
    goalPaceLabel: goalPaceLabel(state),
    metrics: [
      { label: "Workouts", value: "4/5", status: "1 missed", tone: "warning", icon: "workout" },
      { label: "Protein days", value: "5/7", status: "≥ 90% target", tone: "success", icon: "protein" },
      { label: "Weight Δ", value: "-1.2 lb", status: "1.2 lb/wk avg", tone: "accent", icon: "weight" },
      { label: "Mobility", value: "3/4", status: "keep going", tone: "warning", icon: "mobility" },
      { label: "Sleep habit", value: "6/7", status: "solid", tone: "success", icon: "sleep" },
      { label: "Weigh-ins", value: "6/7", status: "consistent", tone: "success", icon: "weighIn" },
    ],
    dayCells,
    wins: [
      { text: "Logged weight 6 days — best consistency yet." },
      { text: "Hit protein on every training day." },
      { text: "Down 1.2 lb — right on your cut pace." },
      { text: "Two weeks on track in a row." },
    ],
    watchItems: [
      { text: "Thursday workout slipped — stack sessions Mon/Wed/Fri next week." },
      { text: "Weekend protein dipped — prep a shake for Saturday." },
    ],
    fuelUpdate: {
      change: "none",
      kcal: state.nutritionTargets.cal,
      proteinG: state.nutritionTargets.p,
      summary: `Targets stay put: ${state.nutritionTargets.cal.toLocaleString()} cal · ${state.nutritionTargets.p}g P. Pace is good. Re-evaluate next Sunday.`,
    },
    commitmentOptions: [
      {
        id: "protein-training-days",
        title: "Hit protein on every training day",
        subtitle: `Lock ${state.nutritionTargets.p}g on lift days.`,
      },
      {
        id: "thursday-backup",
        title: "Schedule a Thursday backup session",
        subtitle: "Short 30-min session if the week gets busy.",
      },
      {
        id: "weekend-prep",
        title: "Prep weekend protein shakes",
        subtitle: "Keep Saturday protein from slipping again.",
      },
    ],
    multiWeekLines: [
      "Week 4: down 1.2 lb · 4/5 workouts · 5/7 protein",
      "Week 3: down 0.9 lb · 5/5 workouts · 6/7 protein",
      "Since plan start: down 3.8 lb total",
    ],
  };
}
