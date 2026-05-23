import { describe, expect, it } from "vitest";

import {
  appendNutritionLoggedItem,
  buildNutritionLoggedItem,
  getRecentlyLoggedFoods,
  topProteinPresetsForQuickLog,
} from "./nutritionLog";
import { minimalAppState } from "./testFixtures/appStateFixtures";

describe("nutritionLog", () => {
  it("appends a row and upserts presets", () => {
    const state = minimalAppState();
    const row = buildNutritionLoggedItem({ cal: 120, p: 30, c: 0, f: 0 }, "Quick shake");
    const next = appendNutritionLoggedItem(state, "2026-05-18", row);

    expect(next.nutritionItemsByDay["2026-05-18"]).toHaveLength(1);
    expect(next.nutritionItemsByDay["2026-05-18"][0].p).toBe(30);
    expect(typeof next.nutritionItemsByDay["2026-05-18"][0].loggedAtMs).toBe("number");
    expect(next.nutritionPresets.some((p) => p.name === "Quick shake")).toBe(true);
  });

  it("buildNutritionLoggedItem sets loggedAtMs and optional metadata when provided", () => {
    const row = buildNutritionLoggedItem({ cal: 10, p: 1, c: 0, f: 0 }, "Soup", {
      loggedAtMs: 42,
      servingLabel: " 1 bowl ",
      source: "test",
      externalId: "ext-1",
    });
    expect(row.loggedAtMs).toBe(42);
    expect(row.servingLabel).toBe("1 bowl");
    expect(row.source).toBe("test");
    expect(row.externalId).toBe("ext-1");
    expect(typeof row.id).toBe("string");
    expect(row.id.length).toBeGreaterThan(0);
  });

  it("getRecentlyLoggedFoods sorts by loggedAtMs desc and dedupes by normalized name", () => {
    const itemsByDay = {
      "2026-05-10": [
        buildNutritionLoggedItem({ cal: 100, p: 10, c: 0, f: 0 }, "Apple", { loggedAtMs: 100, id: "a1" }),
        buildNutritionLoggedItem({ cal: 50, p: 2, c: 0, f: 0 }, "Banana", { loggedAtMs: 50, id: "b1" }),
      ],
      "2026-05-11": [
        buildNutritionLoggedItem({ cal: 200, p: 5, c: 0, f: 0 }, "apple", { loggedAtMs: 300, id: "a2" }),
        buildNutritionLoggedItem({ cal: 10, p: 1, c: 0, f: 0 }, "Cherry", { loggedAtMs: 400, id: "c1" }),
      ],
    };
    const recent = getRecentlyLoggedFoods(itemsByDay);
    expect(recent.map((r) => r.name)).toEqual(["Cherry", "apple", "Banana"]);
    expect(recent[0].loggedAtMs).toBe(400);
    expect(recent[1].loggedAtMs).toBe(300);
    expect(recent[2].loggedAtMs).toBe(50);
  });

  it("filters favorites to protein presets by recency", () => {
    const presets = topProteinPresetsForQuickLog([
      { id: "a", name: "Rice", cal: 200, p: 0, c: 45, f: 0, lastUsedAtMs: 100 },
      { id: "b", name: "Shake", cal: 120, p: 30, c: 0, f: 0, lastUsedAtMs: 200 },
    ]);

    expect(presets).toHaveLength(1);
    expect(presets[0].name).toBe("Shake");
  });
});
