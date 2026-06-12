import { describe, expect, it } from "vitest";

import { isGoalWeightValid } from "./goalWeight";

describe("isGoalWeightValid", () => {
  it("accepts cut targets within range and away from current weight", () => {
    const profile = { heightIn: 70, weightLbs: 200, age: 30, goal: "cut" as const, goalWeightLbs: 175 };
    expect(isGoalWeightValid(profile, 200)).toBe(true);
    expect(isGoalWeightValid(profile, 170)).toBe(false);
  });

  it("accepts bulk targets within range", () => {
    const profile = { heightIn: 70, weightLbs: 160, age: 30, goal: "bulk" as const, goalWeightLbs: 175 };
    expect(isGoalWeightValid(profile, 160)).toBe(true);
    expect(isGoalWeightValid({ ...profile, goalWeightLbs: 162 }, 160)).toBe(false);
  });

  it("always accepts maintain", () => {
    const profile = { heightIn: 70, weightLbs: 180, age: 30, goal: "maintain" as const };
    expect(isGoalWeightValid(profile, 180)).toBe(true);
  });
});
