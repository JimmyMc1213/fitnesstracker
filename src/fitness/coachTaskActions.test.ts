import { describe, expect, it } from "vitest";

import type { CoachTask } from "./coachEngine";
import { coachTaskOpensFuelQuickLog } from "./coachTaskActions";

describe("coachTaskOpensFuelQuickLog", () => {
  it("opens quick log for incomplete hit_protein", () => {
    const task: CoachTask = {
      kind: "hit_protein",
      label: "Hit 180g protein",
      completed: false,
      priority: 2,
      ctaLabel: "Log fuel",
    };
    expect(coachTaskOpensFuelQuickLog(task)).toBe(true);
  });

  it("opens quick log for post_workout Log fuel CTA", () => {
    const task: CoachTask = {
      kind: "post_workout_review",
      label: "Log post-workout fuel",
      completed: false,
      priority: 1,
      ctaLabel: "Log fuel",
    };
    expect(coachTaskOpensFuelQuickLog(task)).toBe(true);
  });

  it("does not open quick log for completed tasks", () => {
    const task: CoachTask = {
      kind: "hit_protein",
      label: "Protein floor hit",
      completed: true,
      priority: 2,
    };
    expect(coachTaskOpensFuelQuickLog(task)).toBe(false);
  });
});
