import { afterEach, describe, expect, it, vi } from "vitest";

import {
  lookupFoodByBarcode,
  mapOffProduct,
  normalizeBarcodeDigits,
  offBarcodesMatch,
  OFF_BARCODE_PRODUCT_API,
} from "./offBarcodeLookup";

describe("offBarcodeLookup", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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

  it("does not inflate calories when OFF stores per-serving values in the _100g slot", () => {
    // Real-world failure: Vita Coco 330 ml coconut water. OFF reports the data
    // per serving (nutrition_data_per: "serving") with no explicit `_serving`
    // fields, and mirrors the ~60 kcal per-serving value into `energy-kcal_100g`.
    // Scaling by baseGrams/100 (330/100) previously produced ~198 kcal.
    const food = mapOffProduct({
      code: "0898999000664",
      product_name: "Pure coconut water",
      brands: "Vita coco",
      serving_size: "1 bottle (330 ml)",
      serving_quantity: 330,
      serving_quantity_unit: "ml",
      nutrition_data_per: "serving",
      nutriments: {
        "energy-kcal": 60,
        "energy-kcal_value": 60,
        "energy-kcal_100g": 60,
        carbohydrates_value: 15,
        carbohydrates_100g: 15,
        proteins_value: 0,
        proteins_100g: 0,
        fat_value: 0,
        fat_100g: 0,
      },
    });
    expect(food).toMatchObject({ cal: 60, c: 15, baseGrams: 330 });
  });

  it("prefers explicit per-serving nutriments even when the basis is per serving", () => {
    const food = mapOffProduct({
      code: "0898999000664",
      product_name: "Pure coconut water",
      serving_size: "11.1 OZA (330 ml)",
      serving_quantity: 330,
      serving_quantity_unit: "ml",
      nutrition_data_per: "100ml",
      nutriments: {
        "energy-kcal": 18,
        "energy-kcal_100g": 18,
        "energy-kcal_serving": 59.4,
        carbohydrates_100g: 4.55,
        carbohydrates_serving: 15,
      },
    });
    expect(food?.cal).toBe(59);
    expect(food?.baseGrams).toBe(330);
  });

  it("still scales genuine per-100g data by the serving weight", () => {
    const food = mapOffProduct({
      code: "0894700010045",
      product_name: "Greek Yogurt Strawberry",
      serving_size: "150 g",
      serving_quantity: 150,
      serving_quantity_unit: "g",
      nutrition_data_per: "100g",
      nutriments: {
        "energy-kcal_100g": 73.33,
        proteins_100g: 8,
        carbohydrates_100g: 12,
        fat_100g: 0,
      },
    });
    expect(food?.cal).toBe(110);
    expect(food?.p).toBe(12);
    expect(food?.baseGrams).toBe(150);
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
  });
});
