import { afterEach, describe, expect, it, vi } from "vitest";

import { FoodSearchError, searchFoods } from "./foodSearchService";

const invoke = vi.fn();

vi.mock("./supabaseClient", () => ({
  isSupabaseConfigured: () => true,
  getSupabase: () => ({ functions: { invoke } }),
}));

describe("foodSearchService", () => {
  afterEach(() => {
    invoke.mockReset();
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
});
