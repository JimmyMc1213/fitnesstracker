import { describe, expect, it } from "vitest";

import {
  buildAverageCalWeekStats,
  macroCaloriesFromTotals,
  weekAnchorWeeksAgo,
} from "./averageCalTracker";
import { minimalAppState, nutritionLoggedAppState } from "./testFixtures/appStateFixtures";

const TODAY = "2026-05-26"; // Tuesday

describe("weekAnchorWeeksAgo", () => {
  it("returns the current week Sunday when weeksAgo is 0", () => {
    expect(weekAnchorWeeksAgo(TODAY, 0)).toBe("2026-05-24");
  });

  it("steps back one week at a time", () => {
    expect(weekAnchorWeeksAgo(TODAY, 1)).toBe("2026-05-17");
    expect(weekAnchorWeeksAgo(TODAY, 2)).toBe("2026-05-10");
    expect(weekAnchorWeeksAgo(TODAY, 3)).toBe("2026-05-03");
  });
});

describe("buildAverageCalWeekStats week filters", () => {
  it("this wk only counts logs in the current Sun–Sat window", () => {
    const state = nutritionLoggedAppState("2026-05-25", { cal: 2000, p: 150, c: 200, f: 60 }); // Mon this wk
    const stats = buildAverageCalWeekStats(state, TODAY, 0);
    expect(stats.weekStartKey).toBe("2026-05-24");
    expect(stats.weekEndKey).toBe("2026-05-30");
    expect(stats.averageCal).toBe(2000);
    expect(stats.days.find((d) => d.dateKey === "2026-05-25")?.macros.total).toBe(2000);
    expect(stats.days.find((d) => d.dateKey === "2026-05-24")?.macros.total).toBe(0);
  });

  it("last wk reads the prior Sun–Sat window", () => {
    const state = nutritionLoggedAppState("2026-05-20", { cal: 1800, p: 140, c: 180, f: 55 }); // Wed last wk
    const stats = buildAverageCalWeekStats(state, TODAY, 1);
    expect(stats.weekStartKey).toBe("2026-05-17");
    expect(stats.weekEndKey).toBe("2026-05-23");
    expect(stats.averageCal).toBe(1800);
    expect(stats.days.every((d) => !d.isFuture)).toBe(true);
  });

  it("2 wk ago and 3 wk ago use distinct windows", () => {
    const state = minimalAppState({
      nutritionItemsByDay: {
        "2026-05-12": [{ id: "a", name: "Meal", cal: 1600, p: 120, c: 160, f: 50, loggedAtMs: 1 }],
        "2026-05-05": [{ id: "b", name: "Meal", cal: 1400, p: 110, c: 140, f: 45, loggedAtMs: 1 }],
      },
    });

    const twoWk = buildAverageCalWeekStats(state, TODAY, 2);
    expect(twoWk.weekStartKey).toBe("2026-05-10");
    expect(twoWk.weekEndKey).toBe("2026-05-16");
    expect(twoWk.averageCal).toBe(1600);

    const threeWk = buildAverageCalWeekStats(state, TODAY, 3);
    expect(threeWk.weekStartKey).toBe("2026-05-03");
    expect(threeWk.weekEndKey).toBe("2026-05-09");
    expect(threeWk.averageCal).toBe(1400);
  });

  it("computes trend vs the immediately prior week", () => {
    const state = minimalAppState({
      nutritionItemsByDay: {
        "2026-05-25": [{ id: "this", name: "Meal", cal: 2200, p: 160, c: 220, f: 70, loggedAtMs: 1 }],
        "2026-05-20": [{ id: "last", name: "Meal", cal: 2000, p: 150, c: 200, f: 60, loggedAtMs: 1 }],
      },
    });
    const thisWk = buildAverageCalWeekStats(state, TODAY, 0);
    const lastWk = buildAverageCalWeekStats(state, TODAY, 1);
    expect(thisWk.trendPct).toBe(10);
    expect(lastWk.trendPct).toBeNull();
  });
});

describe("macroCaloriesFromTotals", () => {
  it("derives stacked kcal from macros", () => {
    const macros = macroCaloriesFromTotals({ cal: 1940, p: 150, c: 200, f: 60 });
    expect(Math.round(macros.protein)).toBe(600);
    expect(Math.round(macros.carbs)).toBe(800);
    expect(Math.round(macros.fat)).toBe(540);
    expect(macros.total).toBe(1940);
  });
});
