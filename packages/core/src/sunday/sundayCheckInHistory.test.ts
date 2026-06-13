import { describe, expect, it } from "vitest";
import type { SundayCheckInWeekRecord } from "@newyouai/types";

import { coalesceSundayCheckInRecord } from "../sync/sundayCheckInHistoryMerge";
import {
  appendSundayCheckInHistory,
  buildSundayHistoryWins,
  buildSundayMultiWeekContext,
  compactSundayDayFlags,
  normalizeSundayCheckInHistory,
  onTrackWeekStreak,
  priorSundayCheckInWeek,
  weekRecordFromCheckInData,
} from "./sundayCheckInHistory";

const recapDefaults = {
  headline: "Solid week",
  summary: "You hit most targets.",
  weightInsight: "Trend looks good.",
  wins: ["Full training volume."],
  watch: ["Sleep dipped mid-week."],
  commitments: ["Hit protein 5 days"],
  dayFlags: "bwp.bwp",
  weightEndLbs: 185.2,
};

const week1: SundayCheckInWeekRecord = {
  sundayKey: "2026-05-10",
  weekStartKey: "2026-05-04",
  weekNumber: 1,
  workoutsCompleted: 2,
  workoutsPlanned: 4,
  proteinDaysHit: 3,
  weighInsThisWeek: 4,
  weightDeltaLbs: -0.8,
  onTrack: false,
  ...recapDefaults,
};

const week2: SundayCheckInWeekRecord = {
  sundayKey: "2026-05-17",
  weekStartKey: "2026-05-11",
  weekNumber: 2,
  workoutsCompleted: 4,
  workoutsPlanned: 4,
  proteinDaysHit: 6,
  weighInsThisWeek: 6,
  weightDeltaLbs: -1.1,
  onTrack: true,
  ...recapDefaults,
  headline: "Back on track",
};

describe("sundayCheckInHistory", () => {
  it("appends and replaces by week start key", () => {
    const next = appendSundayCheckInHistory([week1], { ...week1, workoutsCompleted: 3 });
    expect(next).toHaveLength(1);
    expect(next[0].workoutsCompleted).toBe(3);
  });

  it("finds prior week and streak", () => {
    const history = [week1, week2];
    expect(priorSundayCheckInWeek(history, "2026-05-18")?.weekNumber).toBe(2);
    expect(onTrackWeekStreak(history, "2026-05-18", true)).toBe(2);
    expect(onTrackWeekStreak(history, "2026-05-11", true)).toBe(1);
  });

  it("builds compounding context from prior weeks", () => {
    const lines = buildSundayMultiWeekContext({
      history: [week1, week2],
      weekStartKey: "2026-05-18",
      weekNumber: 3,
      workoutsCompleted: 3,
      workoutsPlanned: 4,
      proteinDaysHit: 5,
      weightDeltaLbs: -0.5,
      onTrack: true,
      planStartWeightLbs: 190,
      currentWeightLbs: 186,
    });

    expect(lines.some((l) => l.includes("fewer workout"))).toBe(true);
    expect(lines.some((l) => l.includes("week 1") || l.includes("on track"))).toBe(true);
  });

  it("adds history-based wins when metrics rebound", () => {
    const wins = buildSundayHistoryWins({
      history: [week1],
      weekStartKey: "2026-05-11",
      workoutsCompleted: 4,
      workoutsPlanned: 4,
      proteinDaysHit: 6,
    });
    expect(wins.length).toBeGreaterThan(0);
  });

  it("normalizes legacy records without recap fields", () => {
    const normalized = normalizeSundayCheckInHistory([
      {
        sundayKey: "2026-05-10",
        weekStartKey: "2026-05-04",
        weekNumber: 1,
        workoutsCompleted: 3,
        workoutsPlanned: 4,
        proteinDaysHit: 4,
        weighInsThisWeek: 5,
        weightDeltaLbs: -0.5,
        onTrack: true,
      },
    ]);
    expect(normalized).toHaveLength(1);
    expect(normalized[0].headline).toBe("");
    expect(normalized[0].dayFlags).toBe(".......");
    expect(normalized[0].wins).toEqual([]);
  });

  it("coalesces partial in-memory records", () => {
    const safe = coalesceSundayCheckInRecord({
      ...week1,
      wins: undefined as unknown as string[],
      watch: undefined as unknown as string[],
      commitments: undefined as unknown as string[],
      dayFlags: undefined as unknown as string,
    });
    expect(safe.wins).toEqual([]);
    expect(safe.watch).toEqual([]);
    expect(safe.commitments).toEqual([]);
    expect(safe.dayFlags).toBe(".......");
  });

  it("builds compact day flags and recap snapshot", () => {
    const flags = compactSundayDayFlags([
      { dateKey: "a", label: "M", workoutDone: true, proteinHit: true },
      { dateKey: "b", label: "T", workoutDone: true, proteinHit: false },
      { dateKey: "c", label: "W", workoutDone: false, proteinHit: true },
      { dateKey: "d", label: "T", workoutDone: false, proteinHit: false },
      { dateKey: "e", label: "F", workoutDone: true, proteinHit: true },
      { dateKey: "f", label: "S", workoutDone: false, proteinHit: false },
      { dateKey: "g", label: "S", workoutDone: true, proteinHit: false },
    ]);
    expect(flags).toBe("bwp.b.w");

    const record = weekRecordFromCheckInData(
      {
        sundayKey: "2026-05-17",
        weekStartKey: "2026-05-11",
        weekNumber: 2,
        nextWeekNumber: 3,
        displayName: "Jimmy",
        weekEndKey: "2026-05-17",
        rangeLabel: "May 11–17",
        rangeLabelCaps: "MAY 11–17",
        workoutsCompleted: 4,
        workoutsPlanned: 4,
        proteinDaysHit: 6,
        lastWeightLbs: 185,
        weighInsThisWeek: 6,
        hasFullRecap: true,
        onTrack: true,
        headline: "Strong week",
        summaryLine: "Everything clicked.",
        statusLabel: "On track",
        weightDeltaLbs: -1.1,
        weightStartLbs: 186.1,
        weightEndLbs: 185,
        weightWeeklyAvgDelta: -1.1,
        dailyWeights: [],
        weightHeadline: "Down 1.1 lb",
        weightInsight: "Pace is on target.",
        goalPaceLabel: "Cut",
        metrics: [],
        dayCells: [
          { dateKey: "a", label: "M", workoutDone: true, proteinHit: true },
          { dateKey: "b", label: "T", workoutDone: false, proteinHit: false },
          { dateKey: "c", label: "W", workoutDone: false, proteinHit: false },
          { dateKey: "d", label: "T", workoutDone: false, proteinHit: false },
          { dateKey: "e", label: "F", workoutDone: false, proteinHit: false },
          { dateKey: "f", label: "S", workoutDone: false, proteinHit: false },
          { dateKey: "g", label: "S", workoutDone: false, proteinHit: false },
        ],
        wins: [{ text: "Hit all workouts." }],
        watchItems: [{ text: "Sleep was short." }],
        fuelUpdate: { change: "none", kcal: 0, proteinG: 0, summary: "" },
        commitmentOptions: [],
        multiWeekLines: [],
      },
      [{ id: "c1", title: "Protein 5 days", subtitle: "" }],
    );

    expect(record.headline).toBe("Strong week");
    expect(record.commitments).toEqual(["Protein 5 days"]);
    expect(record.dayFlags).toBe("b......");
  });
});
