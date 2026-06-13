import { describe, expect, it } from "vitest";

import { buildFitnessAppState } from "@/lib/fitness/buildFitnessAppState";

describe("buildFitnessAppState", () => {
  it("returns defaults when slice is null", () => {
    const state = buildFitnessAppState(null);
    expect(state.onboardingComplete).toBe(false);
    expect(state.habits).toEqual([]);
  });

  it("hydrates onboarding display name and ensures mobility habit", () => {
    const state = buildFitnessAppState({
      onboardingComplete: true,
      displayName: "Jimmy",
      habitTemplates: [{ id: "water", name: "Water", icon: "drop" }],
    });
    expect(state.displayName).toBe("Jimmy");
    expect(state.habitTemplates.some((t) => t.id === "habit-mobility")).toBe(true);
  });
});
