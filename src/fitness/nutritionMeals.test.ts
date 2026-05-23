import { describe, expect, it } from "vitest";

import { buildAppStateFromPersisted } from "./buildAppState";
import {
  buildLoggedItemFromMeal,
  formatMealServingLabel,
  logNutritionMealToDay,
  mergeNutritionMeals,
  normalizeNutritionMeals,
  removeNutritionMeal,
  sumMealMacros,
  updateNutritionMeal,
  upsertNutritionMeal,
} from "./nutritionMeals";
import type { AppState, NutritionMeal, NutritionMealItem } from "./types";

function sampleItem(overrides: Partial<NutritionMealItem> = {}): NutritionMealItem {
  return {
    id: "item-1",
    name: "Chicken",
    cal: 200,
    p: 40,
    c: 0,
    f: 4,
    servingLabel: "4 oz",
    ...overrides,
  };
}

function baseState(overrides: Partial<AppState> = {}): AppState {
  return buildAppStateFromPersisted({ nutritionMeals: [], ...overrides });
}

describe("sumMealMacros", () => {
  it("sums ingredient macros", () => {
    const total = sumMealMacros([
      sampleItem({ cal: 200, p: 40, c: 0, f: 4 }),
      sampleItem({ id: "item-2", name: "Rice", cal: 150, p: 3, c: 30, f: 1 }),
    ]);
    expect(total).toEqual({ cal: 350, p: 43, c: 30, f: 5 });
  });

  it("returns zeros for empty meal", () => {
    expect(sumMealMacros([])).toEqual({ cal: 0, p: 0, c: 0, f: 0 });
  });
});

describe("formatMealServingLabel", () => {
  it("uses ingredient count for multi-item meals", () => {
    expect(formatMealServingLabel([sampleItem(), sampleItem({ id: "item-2", name: "Rice" })])).toBe("2 ingredients");
  });

  it("uses single ingredient serving when only one item", () => {
    expect(formatMealServingLabel([sampleItem()])).toBe("4 oz");
  });
});

describe("normalizeNutritionMeals", () => {
  it("defaults to empty array for missing or invalid persisted data", () => {
    expect(normalizeNutritionMeals(undefined)).toEqual([]);
    expect(normalizeNutritionMeals("bad")).toEqual([]);
    expect(normalizeNutritionMeals([{ name: "", items: [] }])).toEqual([]);
  });

  it("normalizes valid meals and drops invalid items", () => {
    const meals = normalizeNutritionMeals([
      {
        id: "m1",
        name: "Lunch prep",
        createdAtMs: 1000,
        items: [{ id: "i1", name: "Eggs", cal: 70, p: 6, c: 0, f: 5 }, { name: "" }],
      },
    ]);
    expect(meals).toHaveLength(1);
    expect(meals[0]?.name).toBe("Lunch prep");
    expect(meals[0]?.items).toHaveLength(1);
  });
});

describe("buildAppStateFromPersisted nutritionMeals", () => {
  it("defaults existing users to empty meals without errors", () => {
    const state = buildAppStateFromPersisted({});
    expect(state.nutritionMeals).toEqual([]);
  });
});

describe("meal state helpers", () => {
  const meal: NutritionMeal = {
    id: "meal-1",
    name: "Protein bowl",
    createdAtMs: 1000,
    items: [sampleItem()],
  };

  it("upsertNutritionMeal adds and updates meals", () => {
    const added = upsertNutritionMeal([], meal);
    expect(added).toHaveLength(1);
    const updated = upsertNutritionMeal(added, { ...meal, name: "Updated bowl" });
    expect(updated[0]?.name).toBe("Updated bowl");
    expect(updated[0]?.createdAtMs).toBe(1000);
    expect(updated[0]?.updatedAtMs).toBeDefined();
  });

  it("updateNutritionMeal and removeNutritionMeal mutate AppState", () => {
    let state = baseState({ nutritionMeals: [meal] });
    state = updateNutritionMeal(state, "meal-1", { name: "Renamed" });
    expect(state.nutritionMeals[0]?.name).toBe("Renamed");
    state = removeNutritionMeal(state, "meal-1");
    expect(state.nutritionMeals).toHaveLength(0);
  });

  it("buildLoggedItemFromMeal and logNutritionMealToDay create composite log row", () => {
    const row = buildLoggedItemFromMeal(meal);
    expect(row.name).toBe("Protein bowl");
    expect(row.cal).toBe(200);
    expect(row.source).toBe("meal");
    expect(row.servingLabel).toBe("4 oz");

    const state = logNutritionMealToDay(baseState(), "2026-05-23", meal);
    expect(state.nutritionItemsByDay["2026-05-23"]).toHaveLength(1);
    expect(state.nutritionItemsByDay["2026-05-23"]?.[0]?.name).toBe("Protein bowl");
  });
});

describe("mergeNutritionMeals", () => {
  it("keeps newer version by updatedAtMs", () => {
    const local: NutritionMeal[] = [
      { id: "m1", name: "Local", createdAtMs: 1, updatedAtMs: 10, items: [] },
    ];
    const remote: NutritionMeal[] = [
      { id: "m1", name: "Remote", createdAtMs: 1, updatedAtMs: 20, items: [] },
    ];
    expect(mergeNutritionMeals(local, remote)[0]?.name).toBe("Remote");
  });
});
