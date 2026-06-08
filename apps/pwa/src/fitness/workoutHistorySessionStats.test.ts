import { describe, expect, it } from "vitest";

import type { CompletedWorkoutSession } from "./types";
import { countSessionPersonalRecords, historyExerciseRows, sessionLoggedVolume } from "./workoutHistorySessionStats";

function session(
  id: string,
  endedAtMs: number,
  exercises: CompletedWorkoutSession["exercises"],
): CompletedWorkoutSession {
  return {
    id,
    dayKey: "2026-05-15",
    endedAtMs,
    startedAtMs: endedAtMs - 60_000,
    title: "Push",
    durationSec: 60,
    exercises,
  };
}

describe("workoutHistorySessionStats", () => {
  it("sums logged volume for done sets", () => {
    const s = session("a", 1000, [
      {
        id: "e1",
        name: "Bench",
        target: "3 × 8",
        sets: [
          { w: 100, r: 10, done: true },
          { w: 100, r: 8, done: true },
        ],
      },
    ]);
    expect(sessionLoggedVolume(s)).toBe(1800);
  });

  it("counts PRs against prior sessions only", () => {
    const prior = session("old", 1000, [
      {
        id: "e1",
        name: "Bench",
        target: "3 × 8",
        sets: [{ w: 90, r: 8, done: true }],
      },
    ]);
    const current = session("new", 2000, [
      {
        id: "e2",
        name: "Bench",
        target: "3 × 8",
        sets: [{ w: 100, r: 8, done: true }],
      },
    ]);
    expect(countSessionPersonalRecords(current, [prior, current])).toBe(1);
    expect(countSessionPersonalRecords(prior, [prior, current])).toBe(0);
  });

  it("builds exercise rows with best set detail", () => {
    const s = session("a", 1000, [
      {
        id: "e1",
        name: "Bench",
        target: "3 × 8",
        sets: [
          { w: 100, r: 8, done: true },
          { w: 95, r: 10, done: true },
        ],
      },
    ]);
    const rows = historyExerciseRows(s, "lbs");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.bestDetail).toContain("95");
    expect(rows[0]?.setCount).toBe(2);
  });
});
