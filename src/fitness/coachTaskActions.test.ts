import { describe, expect, it } from "vitest";

import type { CoachTask } from "./coachEngine";
import { coachTaskOpensLogFood, handleCoachTaskAction } from "./coachTaskActions";

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

describe("handleCoachTaskAction", () => {
  it("routes fuel tasks to Nutrition with openLogFood", () => {
    const calls: Array<{ tab: string; options?: { openLogFood?: boolean } }> = [];
    const navigate = (tab: string, options?: { openLogFood?: boolean }) => {
      calls.push({ tab, options });
    };

    handleCoachTaskAction(
      {
        kind: "hit_protein",
        label: "Hit protein",
        completed: false,
        priority: 2,
        ctaLabel: "Log fuel",
      },
      navigate,
    );

    expect(calls).toEqual([{ tab: "nutrition", options: { openLogFood: true } }]);
  });

  it("routes rest-day stretch tasks with startStretchSession", () => {
    const calls: Array<{ tab: string; options?: { startStretchSession?: boolean } }> = [];
    const navigate = (tab: string, options?: { startStretchSession?: boolean }) => {
      calls.push({ tab, options });
    };

    handleCoachTaskAction(
      {
        kind: "rest_day",
        label: "Rest day, mobility and steps",
        completed: false,
        priority: 3,
      },
      navigate,
    );

    expect(calls).toEqual([{ tab: "stretch", options: { startStretchSession: true } }]);
  });
});
