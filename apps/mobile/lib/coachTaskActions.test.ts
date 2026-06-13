import { describe, expect, it, vi, beforeEach } from "vitest";

import type { CoachTask } from "@newyouai/core";

import {
  coachTaskOpensLogFood,
  resolveCoachTaskNavigation,
  coachTaskHasAction,
} from "@/lib/coachTaskActions";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("expo-router", () => ({
  router: { push },
}));

describe("coachTaskOpensLogFood", () => {
  it("opens Log Food for incomplete hit_protein", () => {
    const task: CoachTask = {
      kind: "hit_protein",
      label: "Hit 180g protein",
      completed: false,
      priority: 2,
      ctaLabel: "Log fuel",
    };
    expect(coachTaskOpensLogFood(task)).toBe(true);
  });

  it("opens Log Food for post_workout Log fuel CTA", () => {
    const task: CoachTask = {
      kind: "post_workout_review",
      label: "Log post-workout fuel",
      completed: false,
      priority: 1,
      ctaLabel: "Log fuel",
    };
    expect(coachTaskOpensLogFood(task)).toBe(true);
  });

  it("does not open Log Food for completed tasks", () => {
    const task: CoachTask = {
      kind: "hit_protein",
      label: "Protein floor hit",
      completed: true,
      priority: 2,
    };
    expect(coachTaskOpensLogFood(task)).toBe(false);
  });
});

describe("resolveCoachTaskNavigation", () => {
  it("routes stretch rest_day when copy mentions mobility", () => {
    const task: CoachTask = {
      kind: "rest_day",
      label: "Rest day, mobility and steps",
      completed: false,
      priority: 3,
    };
    expect(resolveCoachTaskNavigation(task)).toBe("stretch");
  });

  it("skips completed start_workout", () => {
    const task: CoachTask = {
      kind: "start_workout",
      label: "Upper strength",
      completed: true,
      priority: 1,
    };
    expect(resolveCoachTaskNavigation(task)).toBeNull();
    expect(coachTaskHasAction(task)).toBe(false);
  });
});

describe("handleCoachTaskAction", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("routes fuel tasks to nutrition with openLogFood param", async () => {
    const { handleCoachTaskAction } = await import("@/lib/coachTaskActions");
    handleCoachTaskAction({
      kind: "hit_protein",
      label: "Hit protein",
      completed: false,
      priority: 2,
      ctaLabel: "Log fuel",
    });

    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0]?.[0]).toEqual({
      pathname: "/(tabs)/nutrition",
      params: { openLogFood: "1" },
    });
  });
});
