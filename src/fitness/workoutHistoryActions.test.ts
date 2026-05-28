import { describe, expect, it } from "vitest";

import { minimalAppState } from "./testFixtures/appStateFixtures";
import { workoutStateFixtures } from "./testFixtures/workoutStateFixtures";
import type { CompletedWorkoutSession } from "./types";
import {
  appendTemplateFromHistory,
  completedSessionToTemplateExercises,
  hasActiveWorkoutSession,
  replaceTemplateFromHistory,
  startWorkoutFromHistory,
  templateFromCompletedSession,
} from "./workoutHistoryActions";

function sampleSession(): CompletedWorkoutSession {
  return {
    id: "hist-1",
    dayKey: "2026-05-20",
    endedAtMs: 1_000_000,
    startedAtMs: 900_000,
    title: "Push day",
    durationSec: 100,
    exercises: [
      {
        id: "ex-1",
        name: "Bench Press",
        target: "3 × 8",
        sets: [
          { w: 135, r: 8, done: true },
          { w: 135, r: 8, done: true },
        ],
      },
      {
        id: "ex-2",
        name: "Overhead Press",
        label: "Barbell",
        target: "3 × 10",
        sets: [{ w: 95, r: 10, done: true }],
      },
    ],
  };
}

describe("workoutHistoryActions", () => {
  it("converts logged exercises to blank template rows", () => {
    const exercises = completedSessionToTemplateExercises(sampleSession().exercises);
    expect(exercises).toHaveLength(2);
    expect(exercises[0].name).toBe("Bench Press");
    expect(exercises[0].sets).toEqual([
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
    ]);
    expect(exercises[1].label).toBe("Barbell");
  });

  it("builds a new template from a completed session", () => {
    const tpl = templateFromCompletedSession(sampleSession());
    expect(tpl.name).toBe("Push day");
    expect(tpl.exercises).toHaveLength(2);
    expect(tpl.focus).toContain("Bench Press");
  });

  it("starts a live workout with blank sets and session title", () => {
    const next = startWorkoutFromHistory(minimalAppState(), sampleSession());
    expect(next.workout.sessionPhase).toBe("lifting");
    expect(next.workout.sessionTitle).toBe("Push day");
    expect(next.workout.exercises).toHaveLength(2);
    expect(next.workout.exercises[0].sets.every((s) => s.w === 0 && s.r === 0 && !s.done)).toBe(true);
    expect(next.workout.exercises[0].id).not.toBe("ex-1");
  });

  it("appends a saved workout template from history", () => {
    const next = appendTemplateFromHistory(minimalAppState(), sampleSession());
    expect(next.workoutTemplates).toHaveLength(1);
    expect(next.workoutTemplates[0].name).toBe("Push day");
  });

  it("replaces an existing template's exercises while keeping metadata", () => {
    const state = minimalAppState({
      workoutTemplates: [
        {
          id: "tpl-1",
          name: "Monday push",
          dayLabel: "Mon",
          focus: "Old focus",
          exercises: [{ id: "old", name: "Squat", target: "3 × 5", sets: [{ w: 0, r: 0, done: false }] }],
        },
      ],
    });
    const next = replaceTemplateFromHistory(state, sampleSession(), "tpl-1");
    expect(next.workoutTemplates[0].name).toBe("Monday push");
    expect(next.workoutTemplates[0].dayLabel).toBe("Mon");
    expect(next.workoutTemplates[0].exercises.map((e) => e.name)).toEqual(["Bench Press", "Overhead Press"]);
    expect(next.workoutTemplates[0].focus).toContain("Bench Press");
  });

  it("detects an active lifting session", () => {
    expect(hasActiveWorkoutSession(minimalAppState())).toBe(false);
    expect(
      hasActiveWorkoutSession(
        minimalAppState({
          workout: workoutStateFixtures.incompleteWithWeightReps,
        }),
      ),
    ).toBe(true);
  });
});
