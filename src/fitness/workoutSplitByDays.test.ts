import { describe, expect, it } from "vitest";

import { buildWorkoutTemplatesForDays } from "./workoutSplitByDays";

describe("buildWorkoutTemplatesForDays", () => {
  it("uses default split meta day labels when trainingWeekdays omitted", () => {
    const templates = buildWorkoutTemplatesForDays(4, "intermediate", "full_gym");
    expect(templates).toHaveLength(4);
    expect(templates.map((t) => t.dayLabel)).toEqual(["Mon", "Tue", "Wed", "Thu"]);
  });

  it("maps dayLabel from trainingWeekdays when provided", () => {
    const templates = buildWorkoutTemplatesForDays(4, "intermediate", "full_gym", [
      "Mon",
      "Tue",
      "Thu",
      "Fri",
    ]);
    expect(templates).toHaveLength(4);
    expect(templates.map((t) => t.dayLabel)).toEqual(["Mon", "Tue", "Thu", "Fri"]);
  });

  it("maps 3-day custom weekdays", () => {
    const templates = buildWorkoutTemplatesForDays(3, "beginner", "home_gym", ["Wed", "Fri", "Sun"]);
    expect(templates).toHaveLength(3);
    expect(templates.map((t) => t.dayLabel)).toEqual(["Wed", "Fri", "Sun"]);
  });

  it("ignores extra weekdays beyond template count", () => {
    const templates = buildWorkoutTemplatesForDays(3, "intermediate", "full_gym", [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
    ]);
    expect(templates.map((t) => t.dayLabel)).toEqual(["Mon", "Tue", "Wed"]);
  });

  it("falls back to meta labels when weekdays shorter than template count", () => {
    const templates = buildWorkoutTemplatesForDays(4, "intermediate", "full_gym", ["Mon", "Wed"]);
    expect(templates.map((t) => t.dayLabel)).toEqual(["Mon", "Wed", "Wed", "Thu"]);
  });
});
