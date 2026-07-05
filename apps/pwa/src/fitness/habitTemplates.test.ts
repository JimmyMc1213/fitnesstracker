import { describe, expect, it } from "vitest";

import { buildAppStateFromPersisted } from "./buildAppState";
import { buildHabitsForDateKey, dedupeHabitTemplates, defaultHabitTemplates, habitTemplatesFromOnboarding, isDefaultSeedHabitTemplates } from "./data";
import { DEFAULT_HABITS, ONBOARDING_HABITS, WEIGH_IN_HABIT_ID, isNutritionProgrammingHabit, isWeighInActionHabit, markWeighInHabitDone, stripNutritionProgrammingHabits } from "./habits";
import { dailyHabitTemplatesFromState } from "./HomeDailyHabitsCard";
import { isMobilityHabit } from "./mobilityHabit";
import { migratePersistedFitnessSlice } from "./migrateTrainingSchedule";

describe("stripNutritionProgrammingHabits", () => {
  it("removes legacy Jimmy-plan nutrition habits by id and name", () => {
    const templates = [
      ...defaultHabitTemplates(),
      { id: "habit-track", name: "Track every meal", icon: "bolt" },
      { id: "habit-protein", name: "Hit 175g protein", icon: "bolt" },
      { id: "custom-protein", name: "Protein goal", icon: "bolt" },
    ];
    const stripped = stripNutritionProgrammingHabits(templates);
    expect(stripped).toHaveLength(4);
    expect(stripped.some((h) => h.id === "habit-track" || h.id === "habit-protein")).toBe(false);
    expect(stripped.some((h) => /protein goal|track every meal/i.test(h.name))).toBe(false);
  });
});

describe("migratePersistedFitnessSlice nutrition habits", () => {
  it("strips auto-programmed meal and protein habits from persisted templates", () => {
    const { slice, dirty } = migratePersistedFitnessSlice({
      onboardingComplete: true,
      habitTemplates: [
        { id: "water", name: "Drink water target", icon: "drop" },
        { id: "habit-track", name: "Track every meal", icon: "bolt" },
        { id: "habit-protein", name: "Hit 180g protein", icon: "bolt" },
      ],
    });
    expect(dirty).toBe(true);
    expect(slice.habitTemplates?.map((h) => h.id)).toEqual(["water"]);
  });
});

describe("buildAppStateFromPersisted nutrition habits", () => {
  it("never loads protein goal or track meal habits onto Home", () => {
    const state = buildAppStateFromPersisted({
      onboardingComplete: true,
      habitTemplates: [
        { id: "habit-track", name: "Track meal goal", icon: "bolt" },
        { id: "habit-protein", name: "Protein goal", icon: "bolt" },
        { id: "water", name: "Drink water target", icon: "drop" },
      ],
      habitsDoneByDay: {
        "2026-05-25": { "habit-track": true, "habit-protein": true, water: true },
      },
    });
    expect(state.habitTemplates.some((h) => isNutritionProgrammingHabit(h))).toBe(false);
    expect(state.habitsDoneByDay["2026-05-25"]?.["habit-track"]).toBeUndefined();
    expect(state.habitsDoneByDay["2026-05-25"]?.water).toBe(true);
  });
});

describe("ONBOARDING_HABITS", () => {
  it("defines four core daily habits without mobility", () => {
    expect(ONBOARDING_HABITS).toHaveLength(4);
    expect(DEFAULT_HABITS).toHaveLength(4);
    expect(ONBOARDING_HABITS.some((h) => /mobility|stretch/i.test(h.name))).toBe(false);
    expect(ONBOARDING_HABITS.find((h) => h.id === WEIGH_IN_HABIT_ID)).toMatchObject({
      type: "action",
      action: "openWeighIn",
    });
  });
});

describe("habitTemplatesFromOnboarding", () => {
  it("uses the onboarding daily habit templates", () => {
    const templates = habitTemplatesFromOnboarding(10_000, 64);
    expect(templates).toHaveLength(4);
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
    expect(daily).toHaveLength(4);
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
