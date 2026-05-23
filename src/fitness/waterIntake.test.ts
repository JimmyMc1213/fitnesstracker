import { describe, expect, it } from "vitest";

import {
  appendWaterLogEntry,
  DEFAULT_WATER_DAILY_TARGET_OZ,
  mergeWaterLogByDay,
  normalizeWaterDailyTargetOz,
  normalizeWaterLogByDay,
  normalizeWaterLogEntry,
  removeWaterLogEntry,
  totalWaterOzForDateKey,
} from "./waterIntake";
import { minimalAppState } from "./testFixtures/appStateFixtures";

describe("normalizeWaterDailyTargetOz", () => {
  it("returns default for invalid input", () => {
    expect(normalizeWaterDailyTargetOz(undefined)).toBe(DEFAULT_WATER_DAILY_TARGET_OZ);
    expect(normalizeWaterDailyTargetOz("nope")).toBe(DEFAULT_WATER_DAILY_TARGET_OZ);
  });

  it("clamps to 16-256 oz and rounds", () => {
    expect(normalizeWaterDailyTargetOz(10)).toBe(16);
    expect(normalizeWaterDailyTargetOz(300)).toBe(256);
    expect(normalizeWaterDailyTargetOz(64.4)).toBe(64);
  });
});

describe("normalizeWaterLogEntry", () => {
  it("accepts valid entries", () => {
    expect(normalizeWaterLogEntry({ id: "w1", amountOz: 8, loggedAtMs: 1000 })).toEqual({
      id: "w1",
      amountOz: 8,
      loggedAtMs: 1000,
    });
  });

  it("rejects invalid entries", () => {
    expect(normalizeWaterLogEntry(null)).toBeNull();
    expect(normalizeWaterLogEntry({ id: "", amountOz: 8, loggedAtMs: 1000 })).toBeNull();
    expect(normalizeWaterLogEntry({ id: "w1", amountOz: 0, loggedAtMs: 1000 })).toBeNull();
    expect(normalizeWaterLogEntry({ id: "w1", amountOz: 200, loggedAtMs: 1000 })).toBeNull();
    expect(normalizeWaterLogEntry({ id: "w1", amountOz: 8, loggedAtMs: -1 })).toBeNull();
  });
});

describe("normalizeWaterLogByDay", () => {
  it("keeps valid day keys and drops invalid rows", () => {
    const out = normalizeWaterLogByDay({
      "2026-05-18": [{ id: "a", amountOz: 16, loggedAtMs: 1 }],
      bad: [{ id: "b", amountOz: 8, loggedAtMs: 2 }],
      "2026-05-19": [{ id: "c", amountOz: 0, loggedAtMs: 3 }],
    });
    expect(out).toEqual({
      "2026-05-18": [{ id: "a", amountOz: 16, loggedAtMs: 1 }],
    });
  });
});

describe("mergeWaterLogByDay", () => {
  it("merges by entry id per day, remote wins on id collision", () => {
    const local = {
      "2026-05-18": [{ id: "a", amountOz: 8, loggedAtMs: 1 }],
    };
    const remote = {
      "2026-05-18": [{ id: "a", amountOz: 16, loggedAtMs: 2 }],
      "2026-05-19": [{ id: "b", amountOz: 8, loggedAtMs: 3 }],
    };
    const merged = mergeWaterLogByDay(local, remote);
    expect(merged["2026-05-18"]).toEqual([{ id: "a", amountOz: 16, loggedAtMs: 2 }]);
    expect(merged["2026-05-19"]).toEqual([{ id: "b", amountOz: 8, loggedAtMs: 3 }]);
  });
});

describe("appendWaterLogEntry", () => {
  it("appends a valid entry for the date key", () => {
    const state = minimalAppState();
    const next = appendWaterLogEntry(state, "2026-05-18", 12);
    expect(next.waterLogByDay["2026-05-18"]).toHaveLength(1);
    expect(next.waterLogByDay["2026-05-18"][0].amountOz).toBe(12);
  });

  it("ignores invalid amounts", () => {
    const state = minimalAppState();
    expect(appendWaterLogEntry(state, "2026-05-18", 0)).toBe(state);
    expect(appendWaterLogEntry(state, "2026-05-18", 200)).toBe(state);
  });
});

describe("removeWaterLogEntry", () => {
  it("removes an entry and drops empty day keys", () => {
    const state = appendWaterLogEntry(minimalAppState(), "2026-05-18", 8);
    const id = state.waterLogByDay["2026-05-18"][0].id;
    const next = removeWaterLogEntry(state, "2026-05-18", id);
    expect(next.waterLogByDay["2026-05-18"]).toBeUndefined();
  });
});

describe("totalWaterOzForDateKey", () => {
  it("sums oz for a day", () => {
    const byDay = {
      "2026-05-18": [
        { id: "a", amountOz: 8, loggedAtMs: 1 },
        { id: "b", amountOz: 16, loggedAtMs: 2 },
      ],
    };
    expect(totalWaterOzForDateKey(byDay, "2026-05-18")).toBe(24);
    expect(totalWaterOzForDateKey(byDay, "2026-05-19")).toBe(0);
  });
});
