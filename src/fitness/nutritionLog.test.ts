import { describe, expect, it } from "vitest";

import {
  appendNutritionLoggedItem,
  appendNutritionUserFoodToState,
  buildNutritionLoggedItem,
  getRecentlyLoggedFoods,
  nutritionUserFoodFromLoggedItem,
  removeNutritionLoggedItem,
  removeNutritionPresetFromState,
  removeNutritionUserFoodFromState,
  toggleNutritionFavoriteInState,
  updateNutritionLoggedItem,
  topProteinPresetsForQuickLog,
} from "./nutritionLog";
import { minimalAppState } from "./testFixtures/appStateFixtures";

describe("nutritionLog", () => {
  it("appends a row without auto-adding favorites", () => {
    const state = minimalAppState();
    const row = buildNutritionLoggedItem({ cal: 120, p: 30, c: 0, f: 0 }, "Quick shake");
    const next = appendNutritionLoggedItem(state, "2026-05-18", row);

    expect(next.nutritionItemsByDay["2026-05-18"]).toHaveLength(1);
    expect(next.nutritionItemsByDay["2026-05-18"][0].p).toBe(30);
    expect(typeof next.nutritionItemsByDay["2026-05-18"][0].loggedAtMs).toBe("number");
    expect(next.nutritionPresets.some((p) => p.name === "Quick shake")).toBe(false);
  });

  it("adds favorites only when explicitly starred", () => {
    const state = minimalAppState();
    const favorited = toggleNutritionFavoriteInState(state, {
      name: "Quick shake",
      cal: 120,
      p: 30,
      c: 0,
      f: 0,
      servingLabel: "1 scoop",
    });
    expect(favorited.nutritionPresets).toHaveLength(1);
    expect(favorited.nutritionPresets[0]?.favoritedAtMs).toBeGreaterThan(0);
    expect(favorited.nutritionPresets[0]?.name).toBe("Quick shake");

    const unfavorited = toggleNutritionFavoriteInState(favorited, {
      name: "Quick shake",
      cal: 120,
      p: 30,
      c: 0,
      f: 0,
    });
    expect(unfavorited.nutritionPresets).toHaveLength(0);
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

  it("filters favorites to starred protein presets by recency", () => {
    const presets = topProteinPresetsForQuickLog([
      { id: "a", name: "Rice", cal: 200, p: 0, c: 45, f: 0, lastUsedAtMs: 0, favoritedAtMs: 100 },
      { id: "b", name: "Shake", cal: 120, p: 30, c: 0, f: 0, lastUsedAtMs: 0, favoritedAtMs: 200 },
    ]);

    expect(presets).toHaveLength(1);
    expect(presets[0].name).toBe("Shake");
  });

  it("removeNutritionLoggedItem drops a row for the day", () => {
    const state = minimalAppState();
    const row = buildNutritionLoggedItem({ cal: 100, p: 10, c: 0, f: 0 }, "Oats", { id: "o1" });
    const withRow = appendNutritionLoggedItem(state, "2026-05-18", row);
    const next = removeNutritionLoggedItem(withRow, "2026-05-18", "o1");
    expect(next.nutritionItemsByDay["2026-05-18"]).toBeUndefined();
  });

  it("updateNutritionLoggedItem replaces macros in place", () => {
    const state = minimalAppState();
    const row = buildNutritionLoggedItem({ cal: 100, p: 10, c: 0, f: 0 }, "Oats", { id: "o1" });
    const withRow = appendNutritionLoggedItem(state, "2026-05-18", row);
    const updated = buildNutritionLoggedItem({ cal: 150, p: 12, c: 1, f: 2 }, "Oats bowl", {
      id: "o1",
      loggedAtMs: row.loggedAtMs,
    });
    const next = updateNutritionLoggedItem(withRow, "2026-05-18", "o1", updated);
    expect(next.nutritionItemsByDay["2026-05-18"][0].cal).toBe(150);
    expect(next.nutritionItemsByDay["2026-05-18"][0].name).toBe("Oats bowl");
  });

  it("manual log also saves to My foods library", () => {
    const state = minimalAppState();
    const row = buildNutritionLoggedItem({ cal: 120, p: 30, c: 0, f: 0 }, "Quick shake");
    const withLibrary = appendNutritionUserFoodToState(state, nutritionUserFoodFromLoggedItem(row));
    expect(withLibrary.nutritionUserFoods.some((f) => f.name === "Quick shake")).toBe(true);
  });

  it("removes user food and preset without touching log history", () => {
    const state = minimalAppState({
      nutritionUserFoods: [
        { id: "uf1", name: "Oats", cal: 150, p: 5, c: 27, f: 3, savedAtMs: 1 },
      ],
      nutritionPresets: [{ id: "p1", name: "Oats", cal: 150, p: 5, c: 27, f: 3, lastUsedAtMs: 0, favoritedAtMs: 1 }],
      nutritionItemsByDay: {
        "2026-05-18": [buildNutritionLoggedItem({ cal: 150, p: 5, c: 27, f: 3 }, "Oats", { id: "log1" })],
      },
    });
    const noFood = removeNutritionUserFoodFromState(state, "uf1");
    const noPreset = removeNutritionPresetFromState(noFood, "p1");
    expect(noPreset.nutritionUserFoods).toHaveLength(0);
    expect(noPreset.nutritionPresets).toHaveLength(0);
    expect(noPreset.nutritionItemsByDay["2026-05-18"]).toHaveLength(1);
  });
});
