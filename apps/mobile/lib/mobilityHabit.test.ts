import { describe, expect, it } from "vitest";

import { buildHabitsForDateKey } from "./habits";
import { defaultHabitTemplatesFromOnboarding } from "./habitTemplates";
import {
  MOBILITY_HABIT_ID,
  applyStretchSessionComplete,
  ensureMobilityHabitTemplate,
} from "./mobilityHabit";
import type { AppState } from "@newyouai/types";

describe("ensureMobilityHabitTemplate", () => {
  it("appends mobility habit to onboarding defaults", () => {
    const templates = ensureMobilityHabitTemplate(defaultHabitTemplatesFromOnboarding());
    expect(templates.some((t) => t.id === MOBILITY_HABIT_ID)).toBe(true);
    expect(templates.length).toBe(8);
  });
});

describe("applyStretchSessionComplete", () => {
  it("marks mobility habit done when stretch session finishes", () => {
    const templates = ensureMobilityHabitTemplate(defaultHabitTemplatesFromOnboarding());
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
