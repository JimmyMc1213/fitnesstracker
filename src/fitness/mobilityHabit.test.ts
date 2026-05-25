import { describe, expect, it } from "vitest";

import { buildHabitsForDateKey, habitTemplatesFromOnboarding } from "./data";
import {
  MOBILITY_HABIT_ID,
  applyStretchSessionComplete,
  ensureMobilityHabitTemplate,
  isMobilityHabit,
  migrateMobilityHabitCompletion,
} from "./mobilityHabit";
import type { AppState } from "./types";

describe("mobilityHabit", () => {
  it("detects mobility habit ids", () => {
    expect(isMobilityHabit(MOBILITY_HABIT_ID)).toBe(true);
    expect(isMobilityHabit("h4")).toBe(true);
    expect(isMobilityHabit("habit-steps")).toBe(false);
  });

  it("adds mobility template and removes legacy h4", () => {
    const templates = ensureMobilityHabitTemplate(habitTemplatesFromOnboarding());
    expect(templates.some((t) => t.id === MOBILITY_HABIT_ID)).toBe(true);
    expect(templates.some((t) => t.id === "h4")).toBe(false);
  });

  it("migrates legacy h4 completion to mobility", () => {
    const migrated = migrateMobilityHabitCompletion({
      "2026-05-25": { h4: true, "habit-steps": true },
    });
    expect(migrated["2026-05-25"]).toEqual({ [MOBILITY_HABIT_ID]: true, "habit-steps": true });
  });

  it("marks mobility habit done when stretch session finishes", () => {
    const templates = habitTemplatesFromOnboarding();
    const base = {
      habitTemplates: templates,
      habitsDoneByDay: {},
      habits: buildHabitsForDateKey(templates, {}, "2026-05-25"),
      nightlyStretchBlockIdsByArizonaDay: {},
      nightlyStretchCompletedArizonaKey: null,
    } as Pick<
      AppState,
      | "habitTemplates"
      | "habitsDoneByDay"
      | "habits"
      | "nightlyStretchBlockIdsByArizonaDay"
      | "nightlyStretchCompletedArizonaKey"
    >;

    const next = applyStretchSessionComplete(base as AppState, "2026-05-25", "2026-05-25");
    expect(next.habitsDoneByDay["2026-05-25"]?.[MOBILITY_HABIT_ID]).toBe(true);
    expect(next.habits.find((h) => h.id === MOBILITY_HABIT_ID)?.done).toBe(true);
    expect(next.nightlyStretchCompletedArizonaKey).toBe("2026-05-25");
  });
});
