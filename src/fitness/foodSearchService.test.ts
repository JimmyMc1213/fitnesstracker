import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearFoodSearchCache,
  FoodSearchError,
  FOOD_SEARCH_RESULT_LIMIT,
  lookupFoodByBarcode,
  mapOffProduct,
  normalizeBarcodeDigits,
  offBarcodesMatch,
  OFF_BARCODE_PRODUCT_API,
  searchFoods,
} from "./foodSearchService";

const invoke = vi.fn();
const getSession = vi.fn();

vi.mock("./supabaseClient", () => ({
  isSupabaseConfigured: () => true,
  getSupabase: () => ({
    functions: { invoke },
    auth: { getSession },
  }),
}));

describe("foodSearchService", () => {
  afterEach(() => {
    invoke.mockReset();
    getSession.mockReset();
    getSession.mockResolvedValue({ data: { session: { user: { id: "user-1" } } } });
    clearFoodSearchCache();
  });

  it("returns empty for short queries without calling invoke", async () => {
    const rows = await searchFoods("a");
    expect(rows).toEqual([]);
    expect(invoke).not.toHaveBeenCalled();
  });

  it("requires sign-in before calling food-search", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    await expect(searchFoods("chicken")).rejects.toMatchObject({
      message: "Sign in to search the food database.",
      code: "auth_required",
    });
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

  it("maps rate-limit responses", async () => {
    invoke.mockResolvedValue({
      data: { error: "Too many food searches. Wait a moment and try again." },
      error: null,
    });
    await expect(searchFoods("egg")).rejects.toMatchObject({ code: "rate_limited" });
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

  it("maps OFF barcode products using per-serving macros and gram weight", () => {
    const food = mapOffProduct({
      code: "1234567890123",
      product_name: "Pure Protein Bar",
      serving_size: "1 bar (60 g)",
      nutriments: {
        "energy-kcal_serving": 180,
        proteins_serving: 21,
        carbohydrates_serving: 4,
        fat_serving: 4.5,
        "energy-kcal_100g": 367,
        proteins_100g: 42,
      },
    });
    expect(food).toMatchObject({
      cal: 180,
      p: 21,
      baseGrams: 60,
      defaultServing: "1 bar (60 g)",
    });
  });

  it("infers OFF serving grams from per-serving and per-100g calories when label omits weight", () => {
    const food = mapOffProduct({
      code: "999",
      product_name: "Protein Bar",
      serving_size: "1 bar",
      nutriments: {
        "energy-kcal_serving": 180,
        proteins_serving: 21,
        "energy-kcal_100g": 367,
        proteins_100g: 42,
      },
    });
    expect(food?.cal).toBe(180);
    expect(food?.p).toBe(21);
    expect(food?.baseGrams).toBe(49);
  });

  it("normalizes UPC-A and EAN-13 barcodes for comparison", () => {
    expect(normalizeBarcodeDigits("036000291452")).toBe("0036000291452");
    expect(normalizeBarcodeDigits("0036000291452")).toBe("0036000291452");
    expect(offBarcodesMatch("036000291452", "0036000291452")).toBe(true);
    expect(offBarcodesMatch("1234567890123", "9990001112223")).toBe(false);
  });

  it("lookupFoodByBarcode uses the exact OFF product endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 1,
        product: {
          code: "0036000291452",
          product_name: "Test Bar",
          nutriments: { "energy-kcal_serving": 180, proteins_serving: 21 },
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const food = await lookupFoodByBarcode("036000291452");
    expect(food?.name).toBe("Test Bar");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain(`${OFF_BARCODE_PRODUCT_API}/036000291452.json`);
    expect(calledUrl).not.toContain("/api/v2/search");

    vi.unstubAllGlobals();
  });

  it("lookupFoodByBarcode returns null when OFF status is 0", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 0, status_verbose: "product not found", product: null }),
      }),
    );
    expect(await lookupFoodByBarcode("1234567890123")).toBeNull();
    vi.unstubAllGlobals();
  });

  it("lookupFoodByBarcode returns null when product code does not match scan", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 1,
          product: {
            code: "9990001112223",
            product_name: "Wrong Product",
            nutriments: { "energy-kcal_serving": 200, proteins_serving: 10 },
          },
        }),
      }),
    );
    expect(await lookupFoodByBarcode("1234567890123")).toBeNull();
    vi.unstubAllGlobals();
  });

  it("caps long queries before invoke", async () => {
    invoke.mockResolvedValue({ data: { results: [] }, error: null });
    const longQuery = "a".repeat(150);
    await searchFoods(longQuery);
    expect(invoke).toHaveBeenCalledWith("food-search", {
      body: { query: "a".repeat(100) },
    });
  });
});
