import type { AppState, MacroTotals } from "@newyouai/types";

import { nutritionGoalHitForDateKey } from "../streak/dailyStreak";
import { formatWeeklySummaryRange } from "../training/weeklySummary";
import { exerciseNoteKey } from "../workout/exerciseNoteKey";
import type {
  SundayCheckInCommitmentOption,
  SundayCheckInCoachItem,
  SundayCheckInDayCell,
  SundayCheckInFuelUpdate,
  SundayCheckInMetric,
} from "./sundayCheckIn";

const MOBILITY_HABIT_ID = "habit-mobility";
const SLEEP_HABIT_ID = "sleep";

function workoutCompletedOnDay(state: AppState, dateKey: string): boolean {
  if (state.workoutsCompletedByDay?.[dateKey]) return true;
  return (state.workoutHistory ?? []).some((s) => s.dayKey === dateKey);
}

function mobilityDoneOnDay(state: AppState, dateKey: string): boolean {
  const done = state.habitsDoneByDay[dateKey]?.[MOBILITY_HABIT_ID];
  return Boolean(done);
}

function sleepDoneOnDay(state: AppState, dateKey: string): boolean {
  return Boolean(state.habitsDoneByDay[dateKey]?.[SLEEP_HABIT_ID]);
}

function dayLetter(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "narrow" });
}

function formatRangeCaps(weekStartKey: string, weekEndKey: string): string {
  const start = new Date(`${weekStartKey}T12:00:00`);
  const end = new Date(`${weekEndKey}T12:00:00`);
  const startFmt = start.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  const endFmt = end.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  return `${startFmt} – ${endFmt}`;
}

function goalPaceLabel(state: AppState): string {
  const pace = state.onboardingProfile?.pace;
  if (pace === "slow") return "0.25–0.5 lb/wk";
  if (pace === "aggressive") return "1–1.5 lb/wk";
  return "0.5–1 lb/wk";
}

export function buildSundayCheckInDayCells(state: AppState, weekKeys: string[]): SundayCheckInDayCell[] {
  return weekKeys.map((dateKey) => ({
    dateKey,
    label: dayLetter(dateKey),
    workoutDone: workoutCompletedOnDay(state, dateKey),
    proteinHit: nutritionGoalHitForDateKey(
      state.nutritionManualByDay,
      state.nutritionItemsByDay,
      state.nutritionTargets,
      dateKey,
    ),
  }));
}

export function buildSundayCheckInMetrics(input: {
  state: AppState;
  weekKeys: string[];
  workoutsCompleted: number;
  workoutsPlanned: number;
  proteinDaysHit: number;
  weighInsThisWeek: number;
  weightDeltaLbs: number | null;
  weightWeeklyAvgDelta: number | null;
  mobilityPlanned: number;
}): SundayCheckInMetric[] {
  const mobilityDone = input.weekKeys.filter((k) => mobilityDoneOnDay(input.state, k)).length;
  const sleepDone = input.weekKeys.filter((k) => sleepDoneOnDay(input.state, k)).length;
  const sleepTarget = 7;

  const workoutTone =
    input.workoutsCompleted >= input.workoutsPlanned
      ? "success"
      : input.workoutsCompleted >= input.workoutsPlanned - 1
        ? "warning"
        : "danger";

  const proteinTone =
    input.proteinDaysHit >= 5 ? "success" : input.proteinDaysHit >= 3 ? "warning" : "danger";

  const weightTone =
    input.weightDeltaLbs == null
      ? "neutral"
      : input.weightDeltaLbs <= 0
        ? "accent"
        : input.weightDeltaLbs > 1
          ? "danger"
          : "warning";

  const mobilityTone =
    mobilityDone >= input.mobilityPlanned
      ? "success"
      : mobilityDone >= Math.max(1, input.mobilityPlanned - 1)
        ? "warning"
        : "danger";

  const sleepTone = sleepDone >= 5 ? "success" : sleepDone >= 3 ? "warning" : "danger";

  const weighInTone =
    input.weighInsThisWeek >= 5 ? "success" : input.weighInsThisWeek >= 3 ? "warning" : "danger";

  const missedWorkouts = Math.max(0, input.workoutsPlanned - input.workoutsCompleted);
  const workoutStatus =
    input.workoutsCompleted >= input.workoutsPlanned
      ? "complete"
      : input.workoutsCompleted === 0
        ? "none logged"
        : missedWorkouts === 1
          ? "1 missed"
          : `${missedWorkouts} missed`;

  return [
    {
      label: "Workouts",
      value: `${input.workoutsCompleted}/${input.workoutsPlanned}`,
      status: workoutStatus,
      tone: workoutTone,
      icon: "workout",
    },
    {
      label: "Protein days",
      value: `${input.proteinDaysHit}/7`,
      status:
        input.proteinDaysHit === 0
          ? "no data"
          : input.proteinDaysHit >= 5
            ? "≥ 90% target"
            : "under target",
      tone: proteinTone,
      icon: "protein",
    },
    {
      label: "Weight Δ",
      value:
        input.weightDeltaLbs != null
          ? `${input.weightDeltaLbs > 0 ? "+" : ""}${input.weightDeltaLbs.toFixed(1)} lb`
          : "—",
      status:
        input.weightWeeklyAvgDelta != null
          ? `${Math.abs(input.weightWeeklyAvgDelta).toFixed(1)} lb/wk avg`
          : input.weighInsThisWeek === 0
            ? "no data"
            : "log more weigh-ins",
      tone: weightTone,
      icon: "weight",
    },
    {
      label: "Mobility",
      value: `${mobilityDone}/${input.mobilityPlanned}`,
      status: mobilityDone >= input.mobilityPlanned ? "perfect" : "keep going",
      tone: mobilityTone,
      icon: "mobility",
    },
    {
      label: "Sleep habit",
      value: `${sleepDone}/${sleepTarget}`,
      status: sleepDone >= 5 ? "solid" : "target 5+ nights",
      tone: sleepTone,
      icon: "sleep",
    },
    {
      label: "Weigh-ins",
      value: `${input.weighInsThisWeek}/7`,
      status:
        input.weighInsThisWeek === 0
          ? "no data"
          : input.weighInsThisWeek >= 5
            ? "consistent"
            : input.weighInsThisWeek >= 3
              ? "below target"
              : "log more",
      tone: weighInTone,
      icon: "weighIn",
    },
  ];
}

export function buildSundayCheckInHeadline(input: {
  displayName: string;
  workoutsCompleted: number;
  workoutsPlanned: number;
  proteinDaysHit: number;
  weightDeltaLbs: number | null;
  onTrack: boolean;
}): { headline: string; summaryLine: string; statusLabel: string } {
  const name = input.displayName.trim();
  const suffix = name ? `, ${name}.` : ".";

  let headline: string;
  if (input.workoutsCompleted >= input.workoutsPlanned && input.proteinDaysHit >= 5) {
    headline = `A clean week${suffix}`;
  } else if (input.workoutsCompleted >= input.workoutsPlanned - 1) {
    headline = `Solid week${suffix}`;
  } else {
    headline = `Week in review${suffix}`;
  }

  const parts: string[] = [];
  if (input.weightDeltaLbs != null && Math.abs(input.weightDeltaLbs) >= 0.3) {
    const dir = input.weightDeltaLbs < 0 ? "Down" : "Up";
    parts.push(`${dir} ${Math.abs(input.weightDeltaLbs).toFixed(1)} lb this week`);
  }
  if (input.workoutsCompleted >= input.workoutsPlanned) {
    parts.push("all sessions logged");
  } else if (input.workoutsCompleted > 0) {
    parts.push(`${input.workoutsCompleted}/${input.workoutsPlanned} sessions logged`);
  }
  if (input.proteinDaysHit >= 5) {
    parts.push("protein on point");
  } else if (input.proteinDaysHit > 0 && input.proteinDaysHit < 4) {
    parts.push("protein slipped");
  }

  const summaryLine =
    parts.length > 0 ? parts.join(". ") + "." : "Review the week and set your focus for what's next.";

  const statusLabel = input.onTrack ? "On track for goal pace" : "Adjust focus next week";

  return { headline, summaryLine, statusLabel };
}

export function buildSundayWeightInsight(input: {
  weightDeltaLbs: number | null;
  weightWeeklyAvgDelta: number | null;
  goal: string | undefined;
}): string {
  if (input.weightDeltaLbs == null) {
    return "Log a few more weigh-ins next week so we can read the trend with confidence.";
  }

  const goal = input.goal ?? "maintain";
  if (goal === "cut" && input.weightDeltaLbs > 0.3) {
    return "Weight moved up faster than your goal pace. Don't panic, off weeks happen. Lock in training and protein before touching calories.";
  }
  if (goal === "cut" && input.weightDeltaLbs <= 0) {
    return "You're in the sweet spot. Hold calories where they are. Don't drop yet, even if you want to push faster. Body composition is on your side.";
  }
  if (goal === "bulk" && input.weightDeltaLbs >= 0) {
    return "Weight is moving in the right direction. Keep fuel consistent and let training drive the gains.";
  }
  if (Math.abs(input.weightDeltaLbs) < 0.3) {
    return "Trend is flat this week. Small tweaks beat big swings. Stay consistent before changing targets.";
  }
  if (input.weightWeeklyAvgDelta != null && Math.abs(input.weightWeeklyAvgDelta) > 1.2) {
    return "Pace ran hot this week. Pull back slightly on the deficit or surplus so the trend stays sustainable.";
  }
  return "Steady progress. Keep doing what's working and we'll re-evaluate next Sunday.";
}

export function buildSundayCheckInWins(input: {
  state: AppState;
  weekKeys: string[];
  weekStartKey: string;
  weekEndKey: string;
  workoutsCompleted: number;
  workoutsPlanned: number;
  proteinDaysHit: number;
  weighInsThisWeek: number;
}): SundayCheckInCoachItem[] {
  const wins: SundayCheckInCoachItem[] = [];

  if (input.workoutsCompleted >= input.workoutsPlanned) {
    wins.push({ text: `Hit all ${input.workoutsCompleted}/${input.workoutsPlanned} planned sessions` });
  } else if (input.workoutsCompleted > 0) {
    wins.push({ text: `Logged ${input.workoutsCompleted} training sessions this week` });
  }

  const mobilityDone = input.weekKeys.filter((k) => mobilityDoneOnDay(input.state, k)).length;
  if (mobilityDone >= 4) {
    wins.push({ text: `Mobility locked in ${mobilityDone} days` });
  }

  if (input.proteinDaysHit >= 5) {
    wins.push({ text: `Protein on target ${input.proteinDaysHit}/7 days` });
  }

  if (input.weighInsThisWeek >= 5) {
    wins.push({ text: "Weighed in most mornings" });
  } else if (input.weighInsThisWeek >= 3) {
    wins.push({ text: `${input.weighInsThisWeek} weigh-ins logged. Trend is forming.` });
  }

  const prs = findWeeklyPrHighlights(input.state, input.weekStartKey, input.weekEndKey);
  for (const pr of prs.slice(0, 2)) {
    wins.push({ text: pr });
  }

  if (wins.length === 0) {
    wins.push({ text: "You showed up. That's the hardest part." });
  }

  return wins.slice(0, 4);
}

export function buildSundayCheckInWatchItems(input: {
  state: AppState;
  weekKeys: string[];
  workoutsCompleted: number;
  workoutsPlanned: number;
  proteinDaysHit: number;
  targets: MacroTotals;
}): SundayCheckInCoachItem[] {
  const items: SundayCheckInCoachItem[] = [];
  const missedSessions = Math.max(0, input.workoutsPlanned - input.workoutsCompleted);
  if (missedSessions > 0) {
    const label = missedSessions === 1 ? "1 session" : `${missedSessions} sessions`;
    items.push({ text: `${label} left on the table this week` });
  }

  const lowProteinDays = input.weekKeys.filter((dayKey) => {
    const hit = nutritionGoalHitForDateKey(
      input.state.nutritionManualByDay,
      input.state.nutritionItemsByDay,
      input.targets,
      dayKey,
    );
    return !hit;
  });
  if (lowProteinDays.length >= 2 && input.proteinDaysHit < 5) {
    const sample = lowProteinDays.slice(0, 2).map((k) => {
      const d = new Date(`${k}T12:00:00`);
      return d.toLocaleDateString("en-US", { weekday: "short" });
    });
    items.push({ text: `Protein under target ${sample.join(" + ")}` });
  }

  const sleepMissed = input.weekKeys.filter((k) => !sleepDoneOnDay(input.state, k)).length;
  if (sleepMissed >= 3) {
    items.push({ text: "Sleep habit missed a few nights" });
  }

  return items.slice(0, 3);
}

export function buildSundayFuelUpdate(state: AppState): SundayCheckInFuelUpdate {
  const t = state.nutritionTargets;
  const lastAdj = state.lastAdjustmentSundayKey;
  const changedRecently = Boolean(lastAdj);
  return {
    change: changedRecently ? "none" : "none",
    kcal: t.cal,
    proteinG: t.p,
    summary: changedRecently
      ? `Targets stay put: ${t.cal.toLocaleString()} cal · ${t.p}g P. Pace is good. Re-evaluate next Sunday.`
      : `Targets stay put: ${t.cal.toLocaleString()} cal · ${t.p}g P. Pace is good. Re-evaluate next Sunday.`,
  };
}

export function buildSundayCommitmentOptions(input: {
  state: AppState;
  workoutsPlanned: number;
  proteinDaysHit: number;
  targets: MacroTotals;
  watchItems: SundayCheckInCoachItem[];
  nextWeekFocus: string;
}): SundayCheckInCommitmentOption[] {
  const options: SundayCheckInCommitmentOption[] = [];
  const proteinTarget = input.targets.p;

  if (input.proteinDaysHit < 5) {
    options.push({
      id: "protein-training-days",
      title: "Hit protein on every training day",
      subtitle: `Down weeks correlate with protein dips. Lock ${proteinTarget}g.`,
    });
  }

  options.push({
    id: "stack-sessions",
    title: `Stack all ${input.workoutsPlanned} sessions`,
    subtitle: "Training consistency drives every other metric.",
  });

  const sleepHabit = input.state.habitTemplates.find((h) => h.id === SLEEP_HABIT_ID);
  if (sleepHabit) {
    options.push({
      id: "sleep-habit",
      title: "Lights out on time before training days",
      subtitle: "Sleep < 7h before leg day = volume drops.",
    });
  }

  options.push({
    id: "mobility-4x",
    title: "Keep mobility 4×/week",
    subtitle: "Sustainable load. Don't overshoot it.",
  });

  if (input.watchItems.some((w) => w.text.includes("Protein"))) {
    // protein option already first when needed
  } else if (!options.some((o) => o.id === "protein-training-days")) {
    options.push({
      id: "protein-floor",
      title: `Hit ${proteinTarget}g protein daily`,
      subtitle: input.nextWeekFocus,
    });
  }

  const seen = new Set<string>();
  return options.filter((o) => {
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  }).slice(0, 5);
}

function findWeeklyPrHighlights(state: AppState, weekStartKey: string, weekEndKey: string): string[] {
  const highlights: string[] = [];
  for (const session of state.workoutHistory ?? []) {
    if (session.dayKey < weekStartKey || session.dayKey > weekEndKey) continue;
    for (const ex of session.exercises) {
      const bestSet = ex.sets.reduce<{ w: number; r: number; vol: number } | null>((best, st) => {
        if (st.w <= 0 || st.r <= 0) return best;
        const vol = st.w * st.r;
        if (!best || vol > best.vol) return { w: st.w, r: st.r, vol };
        return best;
      }, null);
      if (!bestSet) continue;
      const key = exerciseNoteKey(ex.name, ex.label);
      const prior = state.exercisePersonalBests?.[key];
      if (prior && bestSet.w > prior.maxWeight) {
        highlights.push(`New PR on ${ex.name}: +${(bestSet.w - prior.maxWeight).toFixed(1)} lb`);
      }
    }
  }
  return highlights;
}

export { formatRangeCaps, goalPaceLabel, formatWeeklySummaryRange };
