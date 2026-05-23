/**
 * Cross-domain coach engine — pure functions, no React or side effects.
 * Consumes read-only AppState slices and returns deterministic coach copy.
 */
import { planWeekIndex } from "./data";
import { progressiveOverloadInsight } from "./coach";
import { localDateKey } from "./dailyPlan";
import {
  computeFitnessCheckInStreak,
  nutritionGoalHitForDateKey,
  streakMotivationLabel,
} from "./dailyStreak";
import { estimatedSessionLabel } from "./estimateSessionDuration";
import { homePlanSubline } from "./homeGreeting";
import { buildMacroPaceSnapshot } from "./macroPace";
import { isTrainingDay, templateForDate } from "./trainingCalendar";
import { effectiveNutritionTotalsForDateKey } from "./nutritionTotals";
import {
  buildWeeklySummary,
  startOfWeekMonday,
  weekDateKeysMondayStart,
  type WeeklySummary,
} from "./weeklySummary";
import type {
  AppState,
  CompletedWorkoutSession,
  MacroTotals,
  WeightEntry,
  WorkoutRoutineTemplate,
} from "./types";

export type CoachTaskKind =
  | "start_workout"
  | "log_weigh_in"
  | "hit_protein"
  | "rest_day"
  | "post_workout_review";

export type CoachTask = {
  kind: CoachTaskKind;
  label: string;
  rationale?: string;
  ctaLabel?: string;
  completed: boolean;
  priority: number;
};

export type HomeCoachPlan = {
  headline: string;
  subline?: string;
  tasks: CoachTask[];
  insightStrip?: string;
};

export type CoachAdjustment = {
  message: string;
  macroNudge?: { deltaCal?: number; reason: string };
};

export type CoachNotificationKind = "workout" | "nutrition";

export type WeeklyCoachReview = {
  narrative: string;
  nextWeekFocus: string;
};

/** Read-only snapshot of cross-domain inputs for a single calendar day. */
export type CoachContext = {
  state: AppState;
  dateKey: string;
  now: Date;
  isTrainingDay: boolean;
  todayTemplate: WorkoutRoutineTemplate | null;
  workoutCompletedToday: boolean;
  nutritionTotals: MacroTotals;
  proteinGap: number;
  nutritionGoalHit: boolean;
  streakCount: number;
  weekIndex: number;
  recentWeightTrend: WeightTrendSnapshot;
  weeklySummary: WeeklySummary;
  isSunday: boolean;
  isSaturday: boolean;
  weighInLoggedToday: boolean;
  scheduledWeighInDay: boolean;
};

type WeightTrendSnapshot = {
  avgLbs: number | null;
  priorWeekAvgLbs: number | null;
  deltaFromPriorWeek: number | null;
  entryCount: number;
};

function parseDateKeyNoonLocal(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function dateKeyMinusDays(dateKey: string, days: number): string {
  const d = parseDateKeyNoonLocal(dateKey);
  d.setDate(d.getDate() - days);
  return localDateKey(d);
}

function averageWeight(entries: WeightEntry[]): number | null {
  if (entries.length === 0) return null;
  const sum = entries.reduce((acc, e) => acc + e.weightLbs, 0);
  return sum / entries.length;
}

function weightEntriesInRange(log: WeightEntry[], startKey: string, endKey: string): WeightEntry[] {
  return log.filter((e) => e.dateKey >= startKey && e.dateKey <= endKey);
}

function buildWeightTrendSnapshot(state: AppState, dateKey: string): WeightTrendSnapshot {
  const log = state.weightLog ?? [];
  const endKey = dateKey;
  const startKey = dateKeyMinusDays(endKey, 6);
  const recent = weightEntriesInRange(log, startKey, endKey);
  const priorEnd = dateKeyMinusDays(startKey, 1);
  const priorStart = dateKeyMinusDays(priorEnd, 6);
  const prior = weightEntriesInRange(log, priorStart, priorEnd);
  const avgLbs = averageWeight(recent);
  const priorWeekAvgLbs = averageWeight(prior);
  const deltaFromPriorWeek =
    avgLbs != null && priorWeekAvgLbs != null ? avgLbs - priorWeekAvgLbs : null;
  return {
    avgLbs,
    priorWeekAvgLbs,
    deltaFromPriorWeek,
    entryCount: recent.length,
  };
}

function hasWeighInThisWeek(state: AppState, dateKey: string): boolean {
  const weekKeys = weekDateKeysMondayStart(dateKey);
  return (state.weightLog ?? []).some((e) => weekKeys.includes(e.dateKey));
}

function sessionVolumeLbs(session: CompletedWorkoutSession): number {
  return session.exercises.reduce(
    (acc, ex) => acc + ex.sets.reduce((sum, st) => sum + st.w * st.r, 0),
    0,
  );
}

function countDoneSets(session: CompletedWorkoutSession): number {
  return session.exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.done).length, 0);
}

function formatDurationMinutes(durationSec: number): string {
  const mins = Math.max(1, Math.round(durationSec / 60));
  return `${mins} min`;
}

export function buildCoachContext(state: AppState, dateKey: string, now?: Date): CoachContext {
  const resolvedNow = now ?? parseDateKeyNoonLocal(dateKey);
  const daysPerWeek = state.onboardingProfile?.workoutDaysPerWeek ?? 5;
  const training = isTrainingDay(resolvedNow, state.workoutTemplates, daysPerWeek);
  const todayTemplate = training ? templateForDate(state.workoutTemplates, resolvedNow) : null;
  const nutritionTotals = effectiveNutritionTotalsForDateKey(
    state.nutritionManualByDay,
    state.nutritionItemsByDay,
    dateKey,
  );
  const proteinTarget = state.nutritionTargets.p;
  const proteinGap = Math.max(0, proteinTarget - nutritionTotals.p);
  const nutritionGoalHit = nutritionGoalHitForDateKey(
    state.nutritionManualByDay,
    state.nutritionItemsByDay,
    state.nutritionTargets,
    dateKey,
  );
  const streakCount = computeFitnessCheckInStreak(state, dateKey);
  const weekIndex = planWeekIndex(resolvedNow, state.planStartIso);
  const weeklySummary = buildWeeklySummary(state, dateKey);
  const isSunday = resolvedNow.getDay() === 0;
  const isSaturday = resolvedNow.getDay() === 6;
  const weighInLoggedToday = (state.weightLog ?? []).some((e) => e.dateKey === dateKey);
  const scheduledWeighInDay = isSunday || !hasWeighInThisWeek(state, dateKey);

  return {
    state,
    dateKey,
    now: resolvedNow,
    isTrainingDay: training,
    todayTemplate,
    workoutCompletedToday: state.workoutsCompletedByDay[dateKey] === true,
    nutritionTotals,
    proteinGap,
    nutritionGoalHit,
    streakCount,
    weekIndex,
    recentWeightTrend: buildWeightTrendSnapshot(state, dateKey),
    weeklySummary,
    isSunday,
    isSaturday,
    weighInLoggedToday,
    scheduledWeighInDay,
  };
}

function buildInsightStrip(ctx: CoachContext): string | undefined {
  const domains: string[] = [];
  if (ctx.streakCount > 0) domains.push("streak");
  if (ctx.proteinGap > 0 && !ctx.nutritionGoalHit) domains.push("protein");
  if (ctx.recentWeightTrend.deltaFromPriorWeek != null) domains.push("weigh-in");
  if (ctx.weeklySummary.workoutsCompleted > 0) domains.push("workout");

  if (domains.length < 2) return undefined;

  const parts: string[] = [];
  if (ctx.streakCount > 0) {
    parts.push(`${ctx.streakCount}-day streak`);
  }
  if (ctx.proteinGap > 0 && !ctx.nutritionGoalHit) {
    parts.push(`${Math.round(ctx.proteinGap)}g protein left to hit today's floor`);
  } else if (ctx.recentWeightTrend.deltaFromPriorWeek != null) {
    const delta = ctx.recentWeightTrend.deltaFromPriorWeek;
    const dir = delta < 0 ? "down" : delta > 0 ? "up" : "flat";
    parts.push(`scale trend ${dir} ${Math.abs(delta).toFixed(1)} lb this week`);
  } else if (ctx.weeklySummary.workoutsCompleted > 0) {
    parts.push(
      `${ctx.weeklySummary.workoutsCompleted}/${ctx.weeklySummary.workoutsPlanned} sessions logged this week`,
    );
  }

  if (parts.length < 2) return undefined;
  return parts.slice(0, 2).join(" — ");
}

function buildCandidateTasks(ctx: CoachContext): CoachTask[] {
  const tasks: CoachTask[] = [];
  const { state, todayTemplate } = ctx;

  if (ctx.isTrainingDay && !ctx.workoutCompletedToday && todayTemplate) {
    const sessionLabel = estimatedSessionLabel(todayTemplate);
    tasks.push({
      kind: "start_workout",
      label: sessionLabel ? `Start ${sessionLabel}` : `Start ${todayTemplate.name}`,
      rationale: todayTemplate.focus || undefined,
      ctaLabel: "Start session",
      completed: false,
      priority: 1,
    });
  } else if (ctx.workoutCompletedToday) {
    tasks.push({
      kind: "post_workout_review",
      label: ctx.nutritionGoalHit ? "Session logged — fuel on track" : "Log post-workout fuel",
      rationale: ctx.nutritionGoalHit
        ? "You hit today's protein floor after training."
        : `${Math.round(ctx.proteinGap)}g protein still open after your session.`,
      ctaLabel: ctx.nutritionGoalHit ? "Review session" : "Log fuel",
      completed: ctx.nutritionGoalHit,
      priority: ctx.nutritionGoalHit ? 2 : 1,
    });
  } else if (!ctx.isTrainingDay) {
    const label = ctx.isSaturday
      ? "Active recovery — walk, mobility, easy stretch"
      : ctx.isSunday
        ? "Rest day — optional breathwork or easy stretch"
        : "Rest day — mobility and steps keep the habit chain alive";
    tasks.push({
      kind: "rest_day",
      label,
      rationale: ctx.streakCount > 0 ? `${ctx.streakCount}-day streak — protect it with light movement` : undefined,
      completed: false,
      priority: 1,
    });
  }

  if (ctx.proteinGap > 0 && !ctx.nutritionGoalHit) {
    const pace = buildMacroPaceSnapshot(ctx);
    tasks.push({
      kind: "hit_protein",
      label: `Hit ${state.nutritionTargets.p}g protein (${Math.round(ctx.proteinGap)}g left)`,
      rationale: pace.hint,
      ctaLabel: "Log fuel",
      completed: false,
      priority: 2,
    });
  } else if (ctx.nutritionGoalHit) {
    tasks.push({
      kind: "hit_protein",
      label: `Protein floor hit (${state.nutritionTargets.p}g)`,
      completed: true,
      priority: 2,
    });
  }

  if (ctx.scheduledWeighInDay) {
    tasks.push({
      kind: "log_weigh_in",
      label: ctx.isSunday ? "Sunday weigh-in — log morning weight" : "Log this week's weigh-in",
      rationale: "Week-over-week trend beats daily noise.",
      ctaLabel: "Log weight",
      completed: ctx.weighInLoggedToday,
      priority: 3,
    });
  }

  return tasks;
}

function buildHeadline(ctx: CoachContext): string {
  const streakLabel = streakMotivationLabel(ctx.streakCount);

  if (ctx.workoutCompletedToday) {
    const praise = streakLabel ? `${streakLabel} — session in the books` : "Session in the books";
    return ctx.nutritionGoalHit ? `${praise} · fuel locked` : `${praise} · close the fuel loop`;
  }

  if (ctx.isTrainingDay && ctx.todayTemplate) {
    const base = `${ctx.todayTemplate.name} — progression window`;
    return streakLabel ? `${base} · ${streakLabel.toLowerCase()}` : base;
  }

  if (ctx.isSaturday) {
    return streakLabel
      ? `Active recovery day · ${streakLabel.toLowerCase()}`
      : "Active recovery day — move easy, stay consistent";
  }

  if (ctx.isSunday) {
    return "Rest + weekly check-in — trend beats daily noise";
  }

  return streakLabel
    ? `Recovery day · week ${ctx.weekIndex} · ${streakLabel.toLowerCase()}`
    : `Recovery day · week ${ctx.weekIndex}`;
}

export function getHomeCoachPlan(ctx: CoachContext): HomeCoachPlan {
  const tasks = buildCandidateTasks(ctx)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
  const subline = homePlanSubline(ctx.state, ctx.now) ?? undefined;
  const insightStrip = buildInsightStrip(ctx);
  const headline = buildHeadline(ctx);

  const overloadTip =
    ctx.isTrainingDay &&
    !ctx.workoutCompletedToday &&
    ctx.state.workout.exercises.length > 0
      ? progressiveOverloadInsight(ctx.state.workout)
      : undefined;

  return {
    headline,
    subline,
    tasks,
    insightStrip: insightStrip ?? (overloadTip && ctx.streakCount > 0 ? overloadTip : insightStrip),
  };
}

export function getPostWorkoutRecap(ctx: CoachContext, session: CompletedWorkoutSession): string {
  const doneSets = countDoneSets(session);
  const volume = sessionVolumeLbs(session);
  const duration = formatDurationMinutes(session.durationSec);
  const streakBit =
    ctx.streakCount > 0 ? `${ctx.streakCount}-day streak secured.` : "Log fuel to keep the streak chain alive.";
  const fuelBit =
    ctx.proteinGap > 0 && !ctx.nutritionGoalHit
      ? `${Math.round(ctx.proteinGap)}g protein left today — close the loop while recovery is hot.`
      : ctx.nutritionGoalHit
        ? "Protein floor already hit — solid recovery setup."
        : "";

  return [
    `${session.title} done in ${duration} — ${doneSets} working sets, ${Math.round(volume).toLocaleString()} lb volume.`,
    streakBit,
    fuelBit,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildWeighInReaction(ctx: CoachContext, entry: WeightEntry): CoachAdjustment | null {
  if (!entry.dateKey || entry.weightLbs <= 0) return null;

  const trend = ctx.recentWeightTrend;
  const weekStart = startOfWeekMonday(ctx.dateKey);

  if (entry.dateKey === weekStart && trend.entryCount === 0) {
    return {
      message: "First weigh-in of the week logged — consistency beats perfection. Same time, same scale next Sunday.",
    };
  }

  if (trend.deltaFromPriorWeek != null && trend.deltaFromPriorWeek <= -1.5) {
    return {
      message: `Down ${Math.abs(trend.deltaFromPriorWeek).toFixed(1)} lb vs last week — pace is aggressive. Hold calories unless energy crashes.`,
      macroNudge: { deltaCal: 100, reason: "Loss faster than ~1.5 lb/week" },
    };
  }

  if (trend.deltaFromPriorWeek != null && trend.deltaFromPriorWeek >= 0.5) {
    return {
      message: "Scale ticked up week-over-week — double-check training adherence and evening fuel logging before changing calories.",
    };
  }

  if (ctx.weeklySummary.workoutsCompleted < Math.min(2, ctx.weeklySummary.workoutsPlanned)) {
    return {
      message: "Weigh-in logged — training volume was light this week. Stack sessions before adjusting fuel.",
    };
  }

  return {
    message: `Weigh-in saved at ${entry.weightLbs.toFixed(1)} lb — trend looks stable. Keep executing the plan.`,
  };
}

/** At save time — returns null when updating an existing same-day entry. */
export function getWeighInReaction(ctx: CoachContext, entry: WeightEntry): CoachAdjustment | null {
  const priorSameDay = (ctx.state.weightLog ?? []).some(
    (e) => e.dateKey === entry.dateKey && e.weightLbs > 0,
  );
  if (priorSameDay) return null;
  return buildWeighInReaction(ctx, entry);
}

/** Home display when today's entry is already in the log. */
export function getWeighInReactionForDisplay(ctx: CoachContext, entry: WeightEntry): CoachAdjustment | null {
  if (entry.coachMessage?.trim()) {
    return {
      message: entry.coachMessage.trim(),
      macroNudge: entry.macroNudge,
    };
  }
  return buildWeighInReaction(ctx, entry);
}

export function getNotificationBody(ctx: CoachContext, kind: CoachNotificationKind): string {
  if (kind === "workout") {
    const templateName = ctx.todayTemplate?.name ?? "today's session";
    const streakBit =
      ctx.streakCount > 0 ? `${ctx.streakCount}-day streak on the line` : "keep the chain alive";
    return `${templateName} — ${streakBit}. Open Fitcoach when you're ready.`;
  }

  if (ctx.nutritionGoalHit) {
    return "Fuel logged and protein floor hit — nice work staying on pace today.";
  }

  if (ctx.proteinGap > 0) {
    return `${Math.round(ctx.proteinGap)}g protein left to hit today's floor — log fuel in Fitcoach.`;
  }

  return "Log today's fuel in Fitcoach — protein and calories keep the coach plan honest.";
}

export {
  buildSessionCoachNoteForExercise,
  buildSessionCoachNotesByExerciseId,
  getExerciseSessionNote,
  type ExerciseSessionNoteContext,
} from "./exerciseSessionNotes";

export function getWeeklyCoachReview(ctx: CoachContext): WeeklyCoachReview {
  const { weeklySummary, streakCount, recentWeightTrend } = ctx;
  const { workoutsCompleted, workoutsPlanned, nutritionDaysHit, daysInWeek, totalVolumeLbs } =
    weeklySummary;

  const trainingOnPace = workoutsCompleted >= workoutsPlanned;
  const nutritionOnPace = nutritionDaysHit >= 4;

  const trainingClause = trainingOnPace
    ? `${workoutsCompleted}/${workoutsPlanned} sessions completed`
    : `${workoutsCompleted}/${workoutsPlanned} sessions — ${workoutsPlanned - workoutsCompleted} left on the table`;

  const fuelClause = nutritionOnPace
    ? `${nutritionDaysHit}/${daysInWeek} fuel days on target`
    : `${nutritionDaysHit}/${daysInWeek} fuel days logged — protein floor slipped`;

  const volumeClause =
    totalVolumeLbs > 0
      ? `${Math.round(totalVolumeLbs).toLocaleString()} lb total volume`
      : null;

  const streakClause = streakCount > 0 ? `${streakCount}-day streak holding` : null;

  const trendClause =
    recentWeightTrend.entryCount >= 2 && recentWeightTrend.deltaFromPriorWeek != null
      ? Math.abs(recentWeightTrend.deltaFromPriorWeek) >= 0.5
        ? recentWeightTrend.deltaFromPriorWeek < 0
          ? `scale down ${Math.abs(recentWeightTrend.deltaFromPriorWeek).toFixed(1)} lb vs last week`
          : `scale up ${recentWeightTrend.deltaFromPriorWeek.toFixed(1)} lb vs last week`
        : "weight trend stable week-over-week"
      : null;

  let narrative: string;
  if (trainingOnPace && nutritionOnPace) {
    narrative = `Solid week — ${trainingClause}, ${fuelClause}.`;
    if (volumeClause) narrative += ` ${volumeClause}.`;
    if (streakClause) narrative += ` ${streakClause}.`;
  } else if (!trainingOnPace && !nutritionOnPace) {
    narrative = `Mixed week — ${trainingClause} and ${fuelClause}.`;
    if (trendClause) narrative += ` ${trendClause}.`;
  } else if (!trainingOnPace) {
    narrative = `Training lagged — ${trainingClause}, though ${fuelClause}.`;
    if (volumeClause) narrative += ` ${volumeClause}.`;
  } else {
    narrative = `Fuel trailed training — ${trainingClause}, but ${fuelClause}.`;
    if (streakClause) narrative += ` ${streakClause}.`;
  }

  const trainingGap = Math.max(0, workoutsPlanned - workoutsCompleted);
  const nutritionGap = Math.max(0, 5 - nutritionDaysHit);

  let nextWeekFocus: string;
  if (trainingGap > 0 && trainingGap >= nutritionGap) {
    const leftLabel = trainingGap === 1 ? "1 session" : `${trainingGap} sessions`;
    nextWeekFocus = `Stack all ${workoutsPlanned} sessions — you left ${leftLabel} on the table.`;
  } else if (!nutritionOnPace) {
    nextWeekFocus = "Log fuel 5+ days — protein floor drives every adjustment.";
  } else if (recentWeightTrend.entryCount < 2 && ctx.isSunday) {
    nextWeekFocus = "Sunday weigh-in sets the week — log before the plan resets.";
  } else {
    nextWeekFocus = "Keep executing — training and fuel both on pace.";
  }

  return { narrative, nextWeekFocus };
}
