import { describe, expect, it } from "vitest";

import { buildPreWorkoutCoachBrief, shouldDefaultExpandCoachCard } from "./preWorkoutCoachBrief";
import { trainingDayWithExercisesAppState } from "./testFixtures/appStateFixtures";

const MONDAY = new Date(2026, 4, 18, 9, 0);
const MONDAY_KEY = "2026-05-18";

describe("buildPreWorkoutCoachBrief", () => {
  it("returns engine headline and start_workout rationale on training day", () => {
    const state = trainingDayWithExercisesAppState({ dateKey: MONDAY_KEY, templateName: "Push" });
    const result = buildPreWorkoutCoachBrief(state, MONDAY);

    expect(result).not.toBeNull();
    expect(result?.brief.headline).toMatch(/Push/i);
    expect(result?.brief.rationale).toBeTruthy();
    expect(result?.todayTemplateId).toBe(state.workoutTemplates[0]?.id);
  });

  it("returns null on rest day", () => {
    const state = trainingDayWithExercisesAppState({ dateKey: MONDAY_KEY, templateName: "Push" });
    const sunday = new Date(2026, 4, 17, 9, 0);
    expect(buildPreWorkoutCoachBrief(state, sunday)).toBeNull();
  });
});

describe("shouldDefaultExpandCoachCard", () => {
  it("expands only when session matches today's template on a training day", () => {
    expect(shouldDefaultExpandCoachCard(true, "push-template", "push-template")).toBe(true);
    expect(shouldDefaultExpandCoachCard(true, "", "push-template")).toBe(false);
    expect(shouldDefaultExpandCoachCard(true, "leg-template", "push-template")).toBe(false);
    expect(shouldDefaultExpandCoachCard(false, "push-template", "push-template")).toBe(false);
    expect(shouldDefaultExpandCoachCard(true, "push-template", null)).toBe(false);
  });
});
