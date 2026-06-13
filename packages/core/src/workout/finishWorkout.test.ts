import { describe, expect, it } from "vitest";
import type { AppState, WorkoutState } from "@newyouai/types";

import { minimalAppState } from "../coach/testFixtures/appStateFixtures";
import { finishWorkout } from "./finishWorkout";

function liftingStateWithLoggedSets(overrides?: Partial<WorkoutState>): AppState {
  return minimalAppState({
    workout: {
      splitId: "tpl-1",
      startedAt: "Mon",
      sessionDayKey: "2026-06-12",
      sessionPhase: "lifting",
      sessionTitle: "Push Day",
      sessionStartedAtMs: Date.now() - 45 * 60 * 1000,
      exercises: [
        {
          id: "bench-1",
          name: "Bench Press",
          target: "3×8",
          sets: [
            { w: 135, r: 8, done: true },
            { w: 135, r: 8, done: true },
            { w: 0, r: 0, done: false },
          ],
        },
      ],
      ...overrides,
    },
    workoutTemplates: [
      {
        id: "tpl-1",
        name: "Push",
        dayLabel: "Mon",
        focus: "Chest",
        exercises: [],
      },
    ],
  });
}

describe("finishWorkout", () => {
  it("returns null when session is idle", () => {
    const state = minimalAppState({
      workout: {
        splitId: "",
        startedAt: "-",
        sessionDayKey: null,
        sessionPhase: "idle",
        sessionTitle: "Workout",
        sessionStartedAtMs: null,
        exercises: [],
      },
    });
    expect(finishWorkout(state)).toBeNull();
  });

  it("returns null when lifting but no sets logged", () => {
    const state = minimalAppState({
      workout: {
        splitId: "tpl-1",
        startedAt: "Mon",
        sessionDayKey: "2026-06-12",
        sessionPhase: "lifting",
        sessionTitle: "Push",
        sessionStartedAtMs: Date.now(),
        exercises: [
          {
            id: "bench-1",
            name: "Bench Press",
            target: "3×8",
            sets: [
              { w: 0, r: 0, done: false },
              { w: 0, r: 0, done: false },
            ],
          },
        ],
      },
    });
    expect(finishWorkout(state)).toBeNull();
  });

  it("completes workout when lifting with logged sets", () => {
    const endedAt = 1_700_000_000_000;
    const state = liftingStateWithLoggedSets();
    const result = finishWorkout(state, endedAt);

    expect(result).not.toBeNull();
    expect(result!.summary.doneSets).toBe(2);
    expect(result!.summary.title).toBe("Push Day");
    expect(result!.state.workout.sessionPhase).toBe("idle");
    expect(result!.state.workout.exercises).toEqual([]);
    expect(result!.state.workoutsCompletedByDay["2026-06-12"]).toBe(true);
    expect(result!.state.workoutHistory).toHaveLength(1);
    expect(result!.state.workoutHistory![0]!.exercises[0]!.sets).toHaveLength(2);
    expect(result!.state.workoutSummary).not.toBeNull();
  });
});
