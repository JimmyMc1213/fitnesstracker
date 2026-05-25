import { describe, expect, it } from "vitest";

import {
  dedupeHabitTemplates,
  defaultHabitTemplates,
  habitTemplatesFromOnboarding,
  isDefaultSeedHabitTemplates,
} from "./data";

describe("habitTemplatesFromOnboarding", () => {
  it("creates hydration, steps, and mobility rows from plan targets", () => {
    const templates = habitTemplatesFromOnboarding(10_000, 64);
    expect(templates).toHaveLength(3);
    expect(templates[0]).toMatchObject({ id: "habit-hydration", icon: "drop", name: "Water 64 oz" });
    expect(templates[1]).toMatchObject({ id: "habit-steps", icon: "run", name: "Steps 10k" });
    expect(templates[2]).toMatchObject({ id: "habit-mobility", icon: "bolt", name: "Mobility" });
  });
});

describe("dedupeHabitTemplates", () => {
  it("keeps one water and one steps row when seed and onboarding habits were merged", () => {
    const merged = [
      ...defaultHabitTemplates(),
      ...habitTemplatesFromOnboarding(10_000, 64),
    ];
    const deduped = dedupeHabitTemplates(merged);
    expect(deduped).toHaveLength(4);
    expect(deduped.filter((h) => h.icon === "drop")).toHaveLength(1);
    expect(deduped.filter((h) => h.icon === "run")).toHaveLength(1);
    expect(deduped.find((h) => h.icon === "drop")?.id).toBe("habit-hydration");
    expect(deduped.find((h) => h.icon === "run")?.id).toBe("habit-steps");
  });
});

describe("isDefaultSeedHabitTemplates", () => {
  it("detects pre-onboarding demo habits", () => {
    expect(isDefaultSeedHabitTemplates(defaultHabitTemplates())).toBe(true);
    expect(isDefaultSeedHabitTemplates(habitTemplatesFromOnboarding())).toBe(false);
  });
});
