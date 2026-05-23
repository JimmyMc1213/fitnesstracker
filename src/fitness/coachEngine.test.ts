import { describe, expect, it } from "vitest";

import {
  buildCoachContext,
  getHomeCoachPlan,
  getNotificationBody,
  getPostWorkoutRecap,
  getWeighInReaction,
} from "./coachEngine";
import type { CompletedWorkoutSession, WeightEntry } from "./types";
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
