import { describe, expect, it } from "vitest";

import {
  appendNutritionLoggedItem,
  buildNutritionLoggedItem,
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
    expect(next.nutritionPresets.some((p) => p.name === "Quick shake")).toBe(true);
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
