import { describe, expect, it } from "vitest";

import { calculateBmr, calculateNutritionTargets, calculateTdee } from "./nutritionCalculator";

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

describe("calculateNutritionTargets bulk balanced reference case", () => {
  const input = {
    weightLbs: 175,
    heightIn: 70,
    age: 18,
    gender: "male" as const,
    activityLevel: "moderate" as const,
    goal: "bulk" as const,
    pace: "balanced" as const,
    goalWeightLbs: 180,
  };

  it("uses Mifflin-St Jeor BMR and activity multiplier for TDEE", () => {
    const bmr = calculateBmr(input);
    const tdee = calculateTdee(input);
    expect(bmr).toBeCloseTo(1820, 0);
    expect(tdee).toBeCloseTo(2821, 0);
  });

  it("applies bulk balanced calorie surplus and macro split", () => {
    const macros = calculateNutritionTargets(input);
    const tdee = calculateTdee(input);

    expect(macros.cal).toBe(tdee + 300);
    expect(macros.p).toBe(180);
    expect(macros.f).toBe(87);
    expect(macros.c).toBe(405);
  });

  it("derives carbs from remaining calories after protein and fat", () => {
    const macros = calculateNutritionTargets(input);
    expect(macros.c).toBe(Math.round((macros.cal - macros.p * 4 - macros.f * 9) / 4));
  });
});

describe("calculateNutritionTargets protein by goal", () => {
  it("bulk uses goal weight at 1g per lb", () => {
    const macros = calculateNutritionTargets({
      ...BASE,
      goal: "bulk",
      pace: "balanced",
      goalWeightLbs: 200,
    });
    expect(macros.p).toBe(200);
  });

  it("cut uses current weight at 1g per lb", () => {
    const macros = calculateNutritionTargets({ ...BASE, goal: "cut", pace: "balanced" });
    expect(macros.p).toBe(180);
  });

  it("maintain uses current weight at 0.85g per lb", () => {
    const macros = calculateNutritionTargets({ ...BASE, goal: "maintain" });
    expect(macros.p).toBe(Math.round(180 * 0.85));
  });
});

describe("calculateNutritionTargets safety clamps", () => {
  it("enforces minimum calories by gender", () => {
    const female = calculateNutritionTargets({
      weightLbs: 100,
      heightIn: 60,
      age: 30,
      gender: "female",
      activityLevel: "sedentary",
      goal: "cut",
      pace: "aggressive",
    });
    expect(female.cal).toBeGreaterThanOrEqual(1400);

    const male = calculateNutritionTargets({
      weightLbs: 100,
      heightIn: 60,
      age: 30,
      gender: "male",
      activityLevel: "sedentary",
      goal: "cut",
      pace: "aggressive",
    });
    expect(male.cal).toBeGreaterThanOrEqual(1600);
  });

  it("clamps protein to 100–300g", () => {
    const low = calculateNutritionTargets({
      weightLbs: 90,
      heightIn: 60,
      age: 30,
      gender: "female",
      activityLevel: "moderate",
      goal: "maintain",
    });
    expect(low.p).toBeGreaterThanOrEqual(100);

    const high = calculateNutritionTargets({
      weightLbs: 350,
      heightIn: 72,
      age: 25,
      gender: "male",
      activityLevel: "moderate",
      goal: "bulk",
      pace: "balanced",
      goalWeightLbs: 350,
    });
    expect(high.p).toBeLessThanOrEqual(300);
  });
});
