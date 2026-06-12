import { describe, expect, it } from "vitest";

import { defaultHabitTemplatesFromOnboarding } from "./habitTemplates";
import { MOBILITY_HABIT_ID, ensureMobilityHabitTemplate } from "./mobilityHabit";

describe("ensureMobilityHabitTemplate", () => {
  it("appends mobility habit to onboarding defaults", () => {
    const templates = ensureMobilityHabitTemplate(defaultHabitTemplatesFromOnboarding());
    expect(templates.some((t) => t.id === MOBILITY_HABIT_ID)).toBe(true);
    expect(templates.length).toBe(4);
  });
});
