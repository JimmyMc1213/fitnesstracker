import { describe, expect, it } from "vitest";

import { buildHabitsForDateKey, WEIGH_IN_HABIT_ID } from "@/lib/habits";

const templates = [
  { id: "water", name: "Drink water", icon: "drop" },
  { id: WEIGH_IN_HABIT_ID, name: "Morning weigh-in", icon: "scale", action: "openWeighIn" as const },
];

describe("buildHabitsForDateKey", () => {
  it("marks weigh-in habit done when weightLogged option is true", () => {
    const habits = buildHabitsForDateKey(templates, {}, "2026-06-12", { weightLogged: true });
    const weighIn = habits.find((h) => h.id === WEIGH_IN_HABIT_ID);
    expect(weighIn?.done).toBe(true);
  });

  it("reflects habitsDoneByDay toggles for manual habits", () => {
    const habits = buildHabitsForDateKey(
      templates,
      { "2026-06-12": { water: true } },
      "2026-06-12",
    );
    expect(habits.find((h) => h.id === "water")?.done).toBe(true);
  });
});
