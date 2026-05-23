import { describe, expect, it } from "vitest";

import {
  areSimilarFoodNames,
  areSimilarFoods,
  mergeFoodSearchResults,
  normalizeFoodName,
  rankFoodSearchResults,
} from "./foodSearchMerge";
import type { FoodSearchResult } from "./foodSearchTypes";

function mockResult(partial: Partial<FoodSearchResult> & Pick<FoodSearchResult, "id" | "name" | "source" | "externalId">): FoodSearchResult {
  return {
    cal: 100,
    p: 10,
    c: 5,
    f: 2,
    defaultServing: "100 g",
    servings: [{ label: "100 g", multiplier: 1 }],
    ...partial,
  };
}

describe("foodSearchMerge", () => {
  it("normalizes food names for comparison", () => {
    expect(normalizeFoodName("  Chicken Breast! ")).toBe("chicken breast");
  });

  it("detects similar food names", () => {
    expect(areSimilarFoodNames("Chicken breast", "chicken breast, raw")).toBe(true);
    expect(areSimilarFoodNames("Apple", "Banana")).toBe(false);
  });

  it("dedupes similar USDA and OFF rows, preferring unbranded for generic queries", () => {
    const usda = [
      mockResult({
        id: "usda-1",
        name: "Canes Sauce",
        source: "usda",
        externalId: "1",
        cal: 90,
      }),
    ];
    const off = [
      mockResult({
        id: "off-1",
        name: "Cane's Sauce",
        brand: "Raising Cane's",
        source: "off",
        externalId: "12345",
        cal: 95,
      }),
    ];
    const merged = mergeFoodSearchResults(usda, off, "canes sauce");
    expect(merged).toHaveLength(1);
    expect(merged[0].brand).toBeUndefined();
    expect(merged[0].source).toBe("usda");
  });

  it("dedupes similar rows preferring branded when query matches brand", () => {
    const usda = [
      mockResult({
        id: "usda-1",
        name: "Canes Sauce",
        source: "usda",
        externalId: "1",
        cal: 90,
      }),
    ];
    const off = [
      mockResult({
        id: "off-1",
        name: "Cane's Sauce",
        brand: "Raising Cane's",
        source: "off",
        externalId: "12345",
        cal: 95,
      }),
    ];
    const merged = mergeFoodSearchResults(usda, off, "raising cane");
    expect(merged).toHaveLength(1);
    expect(merged[0].brand).toBe("Raising Cane's");
    expect(merged[0].source).toBe("off");
  });

  it("ranks unbranded generic foods above branded for basic ingredient searches", () => {
    const genericCooked = mockResult({
      id: "u1",
      name: "Chicken, breast, meat only, cooked, roasted",
      source: "usda",
      externalId: "1",
    });
    const genericRaw = mockResult({
      id: "u2",
      name: "Chicken, breast, meat only, raw",
      source: "usda",
      externalId: "2",
    });
    const branded = mockResult({
      id: "o1",
      name: "Grilled Chicken Breast",
      brand: "Perdue",
      source: "off",
      externalId: "3",
    });
    const ranked = rankFoodSearchResults([branded, genericCooked, genericRaw], "chicken breast");
    expect(ranked[0].brand).toBeUndefined();
    expect(ranked[1].brand).toBeUndefined();
    expect(ranked[2].brand).toBe("Perdue");
  });

  it("ranks branded query matches higher", () => {
    const generic = mockResult({ id: "u1", name: "Sauce", source: "usda", externalId: "1" });
    const branded = mockResult({
      id: "o1",
      name: "Cane's Sauce",
      brand: "Raising Cane's",
      source: "off",
      externalId: "2",
    });
    const ranked = rankFoodSearchResults([generic, branded], "raising cane");
    expect(ranked[0].brand).toBe("Raising Cane's");
  });

  it("areSimilarFoods matches same source id", () => {
    const a = mockResult({ id: "usda-1", name: "Egg", source: "usda", externalId: "99" });
    const b = mockResult({ id: "usda-1", name: "Egg", source: "usda", externalId: "99" });
    expect(areSimilarFoods(a, b)).toBe(true);
  });
});
