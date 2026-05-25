import { describe, expect, it } from "vitest";

import { buildHabitsForDateKey, dedupeHabitTemplates, defaultHabitTemplates, habitTemplatesFromOnboarding, isDefaultSeedHabitTemplates } from "./data";
import { DEFAULT_HABITS, WEIGH_IN_HABIT_ID, isWeighInActionHabit, markWeighInHabitDone } from "./habits";
import { dailyHabitTemplatesFromState } from "./HomeDailyHabitsCard";
import { isMobilityHabit } from "./mobilityHabit";

describe("DEFAULT_HABITS", () => {
  it("defines seven daily habits without mobility", () => {
    expect(DEFAULT_HABITS).toHaveLength(7);
    expect(DEFAULT_HABITS.some((h) => /mobility|stretch/i.test(h.name))).toBe(false);
    expect(DEFAULT_HABITS.find((h) => h.id === WEIGH_IN_HABIT_ID)).toMatchObject({
      type: "action",
      action: "openWeighIn",
    });
  });
});

describe("habitTemplatesFromOnboarding", () => {
  it("uses the default daily habit templates", () => {
    const templates = habitTemplatesFromOnboarding(10_000, 64);
    expect(templates).toHaveLength(7);
    expect(templates[0]).toMatchObject({ id: "water", icon: "drop", name: "Drink water target" });
    expect(templates[1]).toMatchObject({ id: "steps", icon: "run" });
    expect(templates.find((h) => h.id === WEIGH_IN_HABIT_ID)).toMatchObject({ type: "action", action: "openWeighIn" });
  });
});

describe("buildHabitsForDateKey weigh-in action", () => {
  it("marks weigh-in habit done when weight is logged for the day", () => {
    const templates = defaultHabitTemplates();
    const habits = buildHabitsForDateKey(templates, {}, "2026-05-25", { weightLogged: true });
    expect(habits.find((h) => h.id === WEIGH_IN_HABIT_ID)?.done).toBe(true);
  });

  it("stores manual completion by date key", () => {
    const templates = defaultHabitTemplates();
    const habits = buildHabitsForDateKey(
      templates,
      { "2026-05-25": { water: true } },
      "2026-05-25",
    );
    expect(habits.find((h) => h.id === "water")?.done).toBe(true);
    expect(habits.find((h) => h.id === "steps")?.done).toBe(false);
  });
});

describe("markWeighInHabitDone", () => {
  it("persists completion under the weigh-in habit id", () => {
    const next = markWeighInHabitDone({}, "2026-05-25");
    expect(next["2026-05-25"]?.[WEIGH_IN_HABIT_ID]).toBe(true);
  });
});

describe("dailyHabitTemplatesFromState", () => {
  it("filters mobility out of editable daily templates", () => {
    const templates = [...defaultHabitTemplates(), { id: "habit-mobility", name: "Mobility", icon: "bolt" }];
    const daily = dailyHabitTemplatesFromState(templates);
    expect(daily.every((t) => !isMobilityHabit(t.id))).toBe(true);
    expect(daily).toHaveLength(7);
  });
});

describe("isDefaultSeedHabitTemplates", () => {
  it("detects legacy pre-onboarding demo habits", () => {
    expect(isDefaultSeedHabitTemplates([{ id: "h1", name: "Water", icon: "drop" }])).toBe(true);
    expect(isDefaultSeedHabitTemplates(defaultHabitTemplates())).toBe(false);
  });
});

describe("isWeighInActionHabit", () => {
  it("matches id and action", () => {
    expect(isWeighInActionHabit({ id: WEIGH_IN_HABIT_ID })).toBe(true);
    expect(isWeighInActionHabit({ id: "custom", action: "openWeighIn" })).toBe(true);
  });
});

describe("dedupeHabitTemplates", () => {
  it("keeps one row per standard icon when duplicates were merged", () => {
    const merged = [
      ...defaultHabitTemplates(),
      { id: "water-copy", name: "Drink water target", icon: "drop" },
    ];
    const deduped = dedupeHabitTemplates(merged);
    expect(deduped.filter((h) => h.icon === "drop")).toHaveLength(1);
  });
});
