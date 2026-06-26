import { describe, expect, it } from "vitest";

import { buildHabitsForDateKey, normalizeHabitTemplate, stripEmDash, WEIGH_IN_HABIT_ID } from "@/lib/habits";

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

describe("stripEmDash", () => {
  it("replaces em dashes with commas", () => {
    expect(stripEmDash("Every day — including rest days")).toBe("Every day, including rest days");
    expect(stripEmDash("Weekends especially — burns fat")).toBe("Weekends especially, burns fat");
  });
});

describe("normalizeHabitTemplate", () => {
  it("cleans legacy em dash subtitles on save", () => {
    expect(
      normalizeHabitTemplate({
        id: "steps",
        name: "10,000 steps",
        subtitle: "Weekends especially — burns fat without touching recovery",
        icon: "run",
        type: "manual",
      }).subtitle,
    ).toBe("Weekends especially, burns fat without touching recovery");
  });
});
