import { describe, expect, it } from "vitest";

import {
  buildMeasurements,
  computeServingMultiplier,
  formatServingLabel,
  parseQuantityInput,
  parseServingLabel,
} from "./foodMeasurements";
import type { FoodSearchResult } from "./foodSearchTypes";

const chicken: FoodSearchResult = {
  id: "usda-1",
  name: "Chicken breast",
  cal: 195,
  p: 30,
  c: 0,
  f: 8,
  defaultServing: "100 g",
  baseGrams: 100,
  portionLabels: ["1 small breast"],
  source: "usda",
  externalId: "1",
  servings: [],
};

describe("foodMeasurements", () => {
  it("parses gram and oz serving labels", () => {
    expect(parseServingLabel("100 g")).toEqual({ quantity: 100, unit: "g", grams: 100 });
    expect(parseServingLabel("4 oz")?.grams).toBeCloseTo(113.4, 1);
  });

  it("builds g and oz measurements plus portion labels", () => {
    const ms = buildMeasurements(chicken);
    expect(ms.map((m) => m.label)).toEqual(["G", "Oz", "Small breast"]);
    expect(ms[0].defaultQuantity).toBe(100);
  });

  it("scales macros via quantity in selected unit", () => {
    const ms = buildMeasurements(chicken);
    const g = ms.find((m) => m.id === "g")!;
    expect(computeServingMultiplier(g, 150, 100)).toBe(1.5);
    const oz = ms.find((m) => m.id === "oz")!;
    expect(computeServingMultiplier(oz, 4, 100)).toBeCloseTo(1.134, 2);
  });

  it("formats serving labels with unit suffix", () => {
    const ms = buildMeasurements(chicken);
    expect(formatServingLabel(ms[0], 100)).toBe("100 g");
    expect(formatServingLabel(ms[1], 3.5)).toBe("3.5 oz");
  });

  it("parses quantity input", () => {
    expect(parseQuantityInput("150")).toBe(150);
    expect(parseQuantityInput("0")).toBeNull();
    expect(parseQuantityInput("abc")).toBeNull();
  });
});
