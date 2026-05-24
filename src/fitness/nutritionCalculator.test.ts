import { describe, expect, it } from "vitest";

import { calculateNutritionTargets } from "./nutritionCalculator";

const BASE = {
  weightLbs: 180,
  heightIn: 70,
  age: 30,
  gender: "male" as const,
  activityLevel: "moderate" as const,
};

describe("calculateNutritionTargets pace", () => {
  it("slow cut is higher calories than balanced cut", () => {
    const balanced = calculateNutritionTargets({ ...BASE, goal: "cut", pace: "balanced" });
    const slow = calculateNutritionTargets({ ...BASE, goal: "cut", pace: "slow" });
    expect(slow.cal).toBeGreaterThan(balanced.cal);
  });

  it("aggressive cut is lower calories than balanced cut", () => {
    const balanced = calculateNutritionTargets({ ...BASE, goal: "cut", pace: "balanced" });
    const aggressive = calculateNutritionTargets({ ...BASE, goal: "cut", pace: "aggressive" });
    expect(aggressive.cal).toBeLessThan(balanced.cal);
  });

  it("maintain ignores pace", () => {
    const a = calculateNutritionTargets({ ...BASE, goal: "maintain", pace: "aggressive" });
    const b = calculateNutritionTargets({ ...BASE, goal: "maintain" });
    expect(a.cal).toBe(b.cal);
  });
});
