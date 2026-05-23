import { describe, expect, it } from "vitest";

import {
  buildCoachContext,
  getHomeCoachPlan,
  getNotificationBody,
  getPostWorkoutRecap,
  getWeeklyCoachReview,
  getWeighInReaction,
  getWeighInReactionForDisplay,
} from "./coachEngine";
import type { CompletedWorkoutSession, MacroTotals, WeightEntry, WorkoutDaysPerWeek } from "./types";
import { DEFAULT_ONBOARDING_PROFILE } from "./onboardingProfile";
import {
  minimalAppState,
  restDayAppState,
  trainingDayAppState,
  trainingDayWithExercisesAppState,
  weighInTrendAppState,
  workoutCompletedAppState,
  workoutHistoryAppState,
} from "./testFixtures/appStateFixtures";

const MONDAY = new Date(2026, 4, 18, 9, 0); // 2026-05-18
const MONDAY_KEY = "2026-05-18";
const SUNDAY = new Date(2026, 4, 17, 9, 0); // 2026-05-17
const SUNDAY_KEY = "2026-05-17";

const sampleSession: CompletedWorkoutSession = {
  id: "sess-1",
  dayKey: MONDAY_KEY,
  endedAtMs: Date.UTC(2026, 4, 18, 11, 0),
  startedAtMs: Date.UTC(2026, 4, 18, 10, 0),
  title: "Push",
  durationSec: 3600,
  exercises: [
    {
      id: "bench-1",
      name: "Bench Press",
      label: "Barbell",
      target: "2×8",
      sets: [
        { w: 135, r: 8, done: true },
        { w: 135, r: 8, done: true },
      ],
    },
  ],
};

const NUTRITION_TARGETS: MacroTotals = { cal: 2500, p: 180, c: 250, f: 70 };

function weekSession(dayKey: string, title = "Push"): CompletedWorkoutSession {
  return { ...sampleSession, id: `sess-${dayKey}`, dayKey, title };
}

function nutritionDaysHitState(dayKeys: string[]): Record<string, MacroTotals> {
  return Object.fromEntries(dayKeys.map((key) => [key, { ...NUTRITION_TARGETS }]));
}

describe("buildCoachContext", () => {
  it("flags training day on Monday with Mon template", () => {
    const state = trainingDayAppState({ dateKey: MONDAY_KEY, templateName: "Push" });
    const ctx = buildCoachContext(state, MONDAY_KEY, MONDAY);
    expect(ctx.isTrainingDay).toBe(true);
    expect(ctx.todayTemplate?.name).toBe("Push");
    expect(ctx.workoutCompletedToday).toBe(false);
  });

  it("flags rest day on Sunday", () => {
    const state = restDayAppState(SUNDAY_KEY);
    const ctx = buildCoachContext(state, SUNDAY_KEY, SUNDAY);
    expect(ctx.isTrainingDay).toBe(false);
    expect(ctx.isSunday).toBe(true);
  });
});

describe("getHomeCoachPlan", () => {
  it("surfaces start_workout on training day with template headline", () => {
    const state = trainingDayWithExercisesAppState({ dateKey: MONDAY_KEY, templateName: "Push" });
    const ctx = buildCoachContext(state, MONDAY_KEY, MONDAY);
    const plan = getHomeCoachPlan(ctx);

    expect(plan.headline).toMatch(/Push/i);
    expect(plan.headline).toMatch(/progression window/i);
    expect(plan.tasks.some((t) => t.kind === "start_workout" && !t.completed)).toBe(true);
    expect(plan.tasks.length).toBeLessThanOrEqual(3);
  });

  it("omits incomplete start_workout when workout already completed", () => {
    const state = workoutCompletedAppState(MONDAY_KEY);
    const ctx = buildCoachContext(state, MONDAY_KEY, MONDAY);
    const plan = getHomeCoachPlan(ctx);

    expect(plan.tasks.some((t) => t.kind === "start_workout" && !t.completed)).toBe(false);
    expect(plan.tasks.some((t) => t.kind === "post_workout_review")).toBe(true);
  });

  it("uses rest copy on Sunday without start_workout", () => {
    const state = restDayAppState(SUNDAY_KEY);
    const ctx = buildCoachContext(state, SUNDAY_KEY, SUNDAY);
    const plan = getHomeCoachPlan(ctx);

    expect(plan.headline).toMatch(/Rest/i);
    expect(plan.tasks.some((t) => t.kind === "start_workout")).toBe(false);
    expect(plan.tasks.some((t) => t.kind === "rest_day")).toBe(true);
  });

  it("includes hit_protein task with remaining grams", () => {
    const state = minimalAppState({
      nutritionTargets: { cal: 2500, p: 180, c: 250, f: 70 },
      nutritionItemsByDay: {
        [MONDAY_KEY]: [{ id: "1", name: "Snack", cal: 200, p: 20, c: 10, f: 5 }],
      },
    });
    const ctx = buildCoachContext(state, MONDAY_KEY, MONDAY);
    const plan = getHomeCoachPlan(ctx);

    const proteinTask = plan.tasks.find((t) => t.kind === "hit_protein");
    expect(proteinTask).toBeDefined();
    expect(proteinTask?.label).toMatch(/160g left|180g protein/i);
    expect(proteinTask?.rationale).toMatch(/pace/i);
  });

  it("includes insight strip when streak and protein gap both apply", () => {
    const state = minimalAppState({
      nutritionTargets: { cal: 2500, p: 180, c: 250, f: 70 },
      streakEligibleByDay: { [MONDAY_KEY]: true, "2026-05-17": true, "2026-05-16": true },
      fitnessStreakSnapshot: { currentCount: 3, anchorDateKey: MONDAY_KEY, updatedAtIso: "" },
    });
    const ctx = buildCoachContext(state, MONDAY_KEY, MONDAY);
    const plan = getHomeCoachPlan(ctx);

    expect(plan.insightStrip).toBeDefined();
    expect(plan.insightStrip).toMatch(/streak/i);
    expect(plan.insightStrip).toMatch(/protein/i);
  });
});

describe("getPostWorkoutRecap", () => {
  it("returns non-empty recap with session title and volume", () => {
    const state = workoutHistoryAppState([sampleSession]);
    const ctx = buildCoachContext(state, MONDAY_KEY, MONDAY);
    const recap = getPostWorkoutRecap(ctx, sampleSession);

    expect(recap.length).toBeGreaterThan(0);
    expect(recap).toMatch(/Push/i);
    expect(recap).toMatch(/volume/i);
  });
});

describe("getWeighInReaction", () => {
  it("returns null for duplicate weigh-in on same day", () => {
    const state = weighInTrendAppState([{ dateKey: MONDAY_KEY, weightLbs: 180 }]);
    const ctx = buildCoachContext(state, MONDAY_KEY, MONDAY);
    const reaction = getWeighInReaction(ctx, { dateKey: MONDAY_KEY, weightLbs: 181 });
    expect(reaction).toBeNull();
  });

  it("getWeighInReactionForDisplay returns message for logged same-day entry", () => {
    const state = weighInTrendAppState([{ dateKey: MONDAY_KEY, weightLbs: 180 }]);
    const ctx = buildCoachContext(state, MONDAY_KEY, MONDAY);
    const display = getWeighInReactionForDisplay(ctx, { dateKey: MONDAY_KEY, weightLbs: 180 });
    expect(display).not.toBeNull();
    expect(display?.message.length).toBeGreaterThan(0);
  });

  it("returns message for aggressive downward trend", () => {
    const entries: WeightEntry[] = [];
    for (let day = 5; day <= 11; day++) {
      entries.push({ dateKey: `2026-05-${String(day).padStart(2, "0")}`, weightLbs: 190 });
    }
    for (let day = 12; day <= 17; day++) {
      entries.push({ dateKey: `2026-05-${String(day).padStart(2, "0")}`, weightLbs: 185 });
    }
    const state = weighInTrendAppState(entries);
    const ctx = buildCoachContext(state, MONDAY_KEY, MONDAY);
    const reaction = getWeighInReaction(ctx, { dateKey: MONDAY_KEY, weightLbs: 184 });

    expect(reaction).not.toBeNull();
    expect(reaction?.message).toMatch(/Down|aggressive|Hold calories/i);
    expect(reaction?.macroNudge?.deltaCal).toBe(100);
  });
});

describe("getNotificationBody", () => {
  it("returns context-aware workout copy with template and streak", () => {
    const state = trainingDayAppState({ dateKey: MONDAY_KEY, templateName: "Push" });
    const ctx = buildCoachContext(state, MONDAY_KEY, MONDAY);
    ctx.streakCount = 5;
    const body = getNotificationBody(ctx, "workout");

    expect(body).toMatch(/Push/i);
    expect(body).toMatch(/5-day streak/i);
    expect(body).not.toMatch(/open Fitcoach to start your session/i);
  });

  it("returns protein-gap nutrition copy", () => {
    const state = minimalAppState({
      nutritionTargets: { cal: 2500, p: 180, c: 250, f: 70 },
    });
    const ctx = buildCoachContext(state, MONDAY_KEY, MONDAY);
    const body = getNotificationBody(ctx, "nutrition");

    expect(body).toMatch(/180g protein/i);
    expect(body).not.toMatch(/Log today's fuel in Fitcoach to stay on track with your targets/i);
  });
});

describe("getWeeklyCoachReview", () => {
  const FRIDAY = new Date(2026, 4, 22, 9, 0);
  const FRIDAY_KEY = "2026-05-22";
  const weekDayKeys = ["2026-05-18", "2026-05-19", "2026-05-20", "2026-05-21", "2026-05-22"];

  it("returns strong-week narrative with maintenance focus", () => {
    const state = workoutHistoryAppState(weekDayKeys.map((dayKey) => weekSession(dayKey)));
    const fullState = {
      ...state,
      nutritionManualByDay: nutritionDaysHitState(weekDayKeys),
      nutritionTargets: NUTRITION_TARGETS,
      onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, workoutDaysPerWeek: 5 as WorkoutDaysPerWeek },
    };
    const ctx = buildCoachContext(fullState, FRIDAY_KEY, FRIDAY);
    const review = getWeeklyCoachReview(ctx);

    expect(review.narrative).toMatch(/Solid week/i);
    expect(review.narrative).toMatch(/sessions/i);
    expect(review.narrative).toMatch(/fuel/i);
    expect(review.nextWeekFocus).toMatch(/Keep executing/i);
  });

  it("nudges training when sessions lag", () => {
    const state = workoutHistoryAppState([weekSession("2026-05-18")]);
    const fullState = {
      ...state,
      nutritionManualByDay: nutritionDaysHitState(weekDayKeys),
      nutritionTargets: NUTRITION_TARGETS,
      onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, workoutDaysPerWeek: 5 as WorkoutDaysPerWeek },
    };
    const ctx = buildCoachContext(fullState, FRIDAY_KEY, FRIDAY);
    const review = getWeeklyCoachReview(ctx);

    expect(review.narrative).toMatch(/Training lagged|left on the table/i);
    expect(review.nextWeekFocus).toMatch(/Stack all 5 sessions/i);
  });

  it("nudges fuel logging when nutrition days slip", () => {
    const state = workoutHistoryAppState(weekDayKeys.map((dayKey) => weekSession(dayKey)));
    const fullState = {
      ...state,
      nutritionManualByDay: nutritionDaysHitState(["2026-05-18"]),
      nutritionTargets: NUTRITION_TARGETS,
      onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, workoutDaysPerWeek: 5 as WorkoutDaysPerWeek },
    };
    const ctx = buildCoachContext(fullState, FRIDAY_KEY, FRIDAY);
    const review = getWeeklyCoachReview(ctx);

    expect(review.narrative).toMatch(/Fuel trailed training/i);
    expect(review.nextWeekFocus).toMatch(/Log fuel 5\+ days/i);
  });

  it("returns deterministic copy for the same context", () => {
    const state = workoutHistoryAppState(weekDayKeys.map((dayKey) => weekSession(dayKey)));
    const fullState = {
      ...state,
      nutritionManualByDay: nutritionDaysHitState(weekDayKeys),
      nutritionTargets: NUTRITION_TARGETS,
      onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, workoutDaysPerWeek: 5 as WorkoutDaysPerWeek },
    };
    const ctx = buildCoachContext(fullState, FRIDAY_KEY, FRIDAY);
    const first = getWeeklyCoachReview(ctx);
    const second = getWeeklyCoachReview(ctx);

    expect(first).toEqual(second);
  });
});
