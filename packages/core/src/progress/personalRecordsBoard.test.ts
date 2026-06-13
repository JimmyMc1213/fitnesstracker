import { describe, expect, it } from "vitest";

import type { CompletedWorkoutSession } from "@newyouai/types";

import { buildPersonalRecordsBoard } from "./personalRecordsBoard";

function benchSession(
  id: string,
  endedAtMs: number,
  sets: { w: number; r: number }[],
  dayKey = "2026-05-20",
): CompletedWorkoutSession {
  return {
    id,
    dayKey,
    endedAtMs,
    startedAtMs: endedAtMs - 3_600_000,
    title: "Upper",
    durationSec: 3600,
    exercises: [
      {
        id: "ex1",
        name: "Bench Press",
        target: "3 × 10",
        sets: sets.map((s) => ({ ...s, done: true })),
      },
    ],
  };
}

describe("buildPersonalRecordsBoard", () => {
  it("returns empty when there are no saved workouts", () => {
    expect(buildPersonalRecordsBoard([])).toEqual([]);
  });

  it("builds rows from saved workout sessions", () => {
    const rows = buildPersonalRecordsBoard([
      benchSession("s1", 1_000_000, [{ w: 135, r: 8 }]),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.displayName).toBe("Bench Press");
    expect(rows[0]?.bestWeight).toBe(135);
    expect(rows[0]?.bestReps).toBe(8);
  });

  it("prefers heavier weight over higher reps at lighter weight", () => {
    const rows = buildPersonalRecordsBoard([
      benchSession("s1", 1_000_000, [{ w: 135, r: 12 }]),
      benchSession("s2", 2_000_000, [{ w: 225, r: 5 }]),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.bestWeight).toBe(225);
    expect(rows[0]?.bestReps).toBe(5);
  });

  it("ranks exercises by best weight", () => {
    const rows = buildPersonalRecordsBoard([
      benchSession("s1", 1_000_000, [{ w: 135, r: 8 }], "2026-05-18"),
      {
        ...benchSession("s2", 2_000_000, [{ w: 225, r: 5 }], "2026-05-19"),
        exercises: [
          {
            id: "ex2",
            name: "Deadlift",
            target: "3 × 5",
            sets: [{ w: 225, r: 5, done: true }],
          },
        ],
      },
    ]);
    expect(rows.map((r) => r.displayName)).toEqual(["Deadlift", "Bench Press"]);
  });
});
