import { afterEach, describe, expect, it, vi } from "vitest";

import { clearFoodSearchCache, FoodSearchError, FOOD_SEARCH_RESULT_LIMIT, searchFoods } from "./foodSearchService";

const invoke = vi.fn();

vi.mock("./supabaseClient", () => ({
  isSupabaseConfigured: () => true,
  getSupabase: () => ({ functions: { invoke } }),
}));

describe("foodSearchService", () => {
  afterEach(() => {
    invoke.mockReset();
    clearFoodSearchCache();
  });

  it("returns empty for short queries without calling invoke", async () => {
    const rows = await searchFoods("a");
    expect(rows).toEqual([]);
    expect(invoke).not.toHaveBeenCalled();
  });

  it("maps invoke results", async () => {
    invoke.mockResolvedValue({
      data: {
        results: [
          {
            id: "usda-123",
            name: "Chicken breast",
            cal: 165,
            p: 31,
            c: 0,
            f: 3.6,
            defaultServing: "100 g",
            source: "usda",
            externalId: "123",
            servings: [{ label: "1 serving", multiplier: 1 }],
          },
        ],
      },
      error: null,
    });
    const rows = await searchFoods("chicken");
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Chicken breast");
    expect(invoke).toHaveBeenCalledWith("food-search", { body: { query: "chicken" } });
  });

  it("throws FoodSearchError on API error payload", async () => {
    invoke.mockResolvedValue({ data: { error: "USDA unavailable" }, error: null });
    await expect(searchFoods("egg")).rejects.toThrow(FoodSearchError);
  });

  it("throws FoodSearchError on invoke failure", async () => {
    invoke.mockResolvedValue({ data: null, error: { message: "Network down" } });
    await expect(searchFoods("egg")).rejects.toThrow(/Network down/);
  });

  it("returns cached results without a second invoke", async () => {
    invoke.mockResolvedValue({
      data: {
        results: [
          {
            id: "usda-1",
            name: "Egg",
            cal: 70,
            p: 6,
            c: 0,
            f: 5,
            defaultServing: "1 large",
            source: "usda",
            externalId: "1",
            servings: [{ label: "1 large", multiplier: 1 }],
          },
        ],
      },
      error: null,
    });
    await searchFoods("egg");
    await searchFoods("egg");
    expect(invoke).toHaveBeenCalledTimes(1);
  });

  it("limits results to FOOD_SEARCH_RESULT_LIMIT", async () => {
    const rows = Array.from({ length: 25 }, (_, i) => ({
      id: `usda-${i}`,
      name: `Food ${i}`,
      cal: 100,
      p: 10,
      c: 10,
      f: 5,
      defaultServing: "100 g",
      source: "usda" as const,
      externalId: String(i),
      servings: [{ label: "100 g", multiplier: 1 }],
    }));
    invoke.mockResolvedValue({ data: { results: rows }, error: null });
    const out = await searchFoods("food bulk");
    expect(out).toHaveLength(FOOD_SEARCH_RESULT_LIMIT);
  });
});
