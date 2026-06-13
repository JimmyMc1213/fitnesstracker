import { describe, expect, it } from "vitest";

import {
  buildMeasurements,
  computeServingMultiplier,
  formatServingLabel,
  loggedItemToPickerEdit,
  parseQuantityInput,
  parseServingLabel,
  inferLoggedServingQuantity,
  resolvePickerMeasurementFromServing,
} from "./foodMeasurements";
import type { FoodMeasurement, FoodSearchResult } from "@newyouai/types";

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
    expect(parseServingLabel("60g")).toEqual({ quantity: 60, unit: "g", grams: 60 });
    expect(parseServingLabel("1 bar (60 g)")).toEqual({ quantity: 1, unit: "serving", grams: 60 });
    expect(parseServingLabel("49")).toEqual({ quantity: 49, unit: "g", grams: 49 });
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

  it("reconstructs picker edit state from a catalog logged row", () => {
    const edit = loggedItemToPickerEdit({
      id: "log-1",
      name: "Chicken breast",
      cal: 293,
      p: 45,
      c: 0,
      f: 12,
      servingLabel: "150 g",
      source: "usda",
      externalId: "usda-1",
      loggedAtMs: 1,
    });
    expect(edit).not.toBeNull();
    expect(edit!.measurementId).toBe("g");
    expect(edit!.quantity).toBe("150");
    expect(edit!.food.cal).toBe(195);
    expect(computeServingMultiplier(
      buildMeasurements(edit!.food).find((m) => m.id === "g")!,
      150,
      100,
    )).toBe(1.5);
  });

  it("returns null for manual logged rows without external id", () => {
    expect(
      loggedItemToPickerEdit({
        id: "log-2",
        name: "Shake",
        cal: 300,
        p: 40,
        c: 0,
        f: 0,
      }),
    ).toBeNull();
  });

  it("resolves gram servings to the 100g picker preset", () => {
    const measurements: FoodMeasurement[] = [
      { id: "smart-default", label: "1 breast (8oz)", unitSuffix: "", gramsPerUnit: 226, defaultQuantity: 1 },
      { id: "100g", label: "100g", unitSuffix: "g", gramsPerUnit: 1, defaultQuantity: 100 },
      { id: "oz", label: "Oz", unitSuffix: "oz", gramsPerUnit: 28.3495, defaultQuantity: 3.5 },
    ];
    const fixedLabels = { "smart-default": "1 breast (8oz)" };

    expect(
      resolvePickerMeasurementFromServing(measurements, fixedLabels, "100 g"),
    ).toEqual({ measurementId: "100g", quantity: "100" });
  });

  it("resolves fixed-label servings to smart-default", () => {
    const measurements: FoodMeasurement[] = [
      { id: "smart-default", label: "1 breast (8oz)", unitSuffix: "", gramsPerUnit: 226, defaultQuantity: 1 },
      { id: "100g", label: "100g", unitSuffix: "g", gramsPerUnit: 1, defaultQuantity: 100 },
      { id: "oz", label: "Oz", unitSuffix: "oz", gramsPerUnit: 28.3495, defaultQuantity: 3.5 },
    ];
    const fixedLabels = { "smart-default": "1 breast (8oz)" };

    expect(
      resolvePickerMeasurementFromServing(measurements, fixedLabels, "1 breast (8oz)"),
    ).toEqual({ measurementId: "smart-default", quantity: "1" });
  });

  it("resolves multi-count fixed-label servings", () => {
    const measurements: FoodMeasurement[] = [
      { id: "smart-default", label: "1 breast (8oz)", unitSuffix: "", gramsPerUnit: 226, defaultQuantity: 1 },
      { id: "100g", label: "100g", unitSuffix: "g", gramsPerUnit: 1, defaultQuantity: 100 },
    ];
    const fixedLabels = { "smart-default": "1 breast (8oz)" };

    expect(
      resolvePickerMeasurementFromServing(measurements, fixedLabels, "14 × 1 breast (8oz)"),
    ).toEqual({ measurementId: "smart-default", quantity: "14" });
  });

  it("infers hidden quantity from logged macros when label says 1 serving", () => {
    const food: FoodSearchResult = {
      id: "c1",
      name: "Chicken Breast, Cooked",
      cal: 165,
      p: 31,
      c: 0,
      f: 3.6,
      defaultServing: "100 g",
      baseGrams: 100,
      source: "curated",
      externalId: "c_chicken_breast",
      servings: [],
    };
    const measurement: FoodMeasurement = {
      id: "smart-default",
      label: "1 breast (8oz)",
      unitSuffix: "",
      gramsPerUnit: 226,
      defaultQuantity: 1,
    };
    const logged = {
      id: "log-1",
      name: "Chicken Breast, Cooked",
      cal: 5222,
      p: 434,
      c: 0,
      f: 50.4,
      servingLabel: "1 breast (8oz)",
      source: "curated",
      externalId: "c_chicken_breast",
      loggedAtMs: 1,
    };

    expect(inferLoggedServingQuantity(logged, food, measurement, 1, 100)).toBe(14);
  });
});
