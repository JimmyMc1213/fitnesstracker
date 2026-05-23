import { describe, expect, it } from "vitest";

import { isTrainingDay, startOfWeekMonday, startOfWeekSunday, templateForDate, weekDateKeysSundayStart } from "./trainingCalendar";
import type { WorkoutRoutineTemplate } from "./types";

const mondayMorning = new Date(2026, 4, 4, 7, 0);
const sundayMorning = new Date(2026, 4, 10, 9, 0);

function mondayTemplate(name = "Upper strength"): WorkoutRoutineTemplate[] {
  return [
    {
      id: "mon-upper",
      name,
      dayLabel: "Mon",
      focus: "Bench",
      exercises: [],
    },
  ];
}

describe("isTrainingDay", () => {
  it("returns true on Monday when template has Mon dayLabel", () => {
    expect(isTrainingDay(mondayMorning, mondayTemplate(), 5)).toBe(true);
  });

  it("falls back to default 5-day split when templates empty", () => {
    expect(isTrainingDay(mondayMorning, [], 5)).toBe(true);
    expect(isTrainingDay(new Date(2026, 4, 5, 9, 0), [], 5)).toBe(true);
    expect(isTrainingDay(new Date(2026, 4, 6, 9, 0), [], 5)).toBe(true);
    expect(isTrainingDay(new Date(2026, 4, 7, 9, 0), [], 5)).toBe(true);
    expect(isTrainingDay(new Date(2026, 4, 8, 9, 0), [], 5)).toBe(true);
  });

  it("returns false on Sunday for default 5-day split", () => {
    expect(isTrainingDay(sundayMorning, [], 5)).toBe(false);
  });
});

describe("templateForDate", () => {
  it("matches template by dayLabel", () => {
    expect(templateForDate(mondayTemplate(), mondayMorning)?.name).toBe("Upper strength");
  });
});

describe("week boundaries", () => {
  it("startOfWeekSunday returns Sunday for a Wednesday", () => {
    expect(startOfWeekSunday("2026-05-06")).toBe("2026-05-03");
  });

  it("startOfWeekMonday returns Monday for a Wednesday", () => {
    expect(startOfWeekMonday("2026-05-06")).toBe("2026-05-04");
  });

  it("weekDateKeysSundayStart spans Sun–Sat", () => {
    const keys = weekDateKeysSundayStart("2026-05-06");
    expect(keys).toHaveLength(7);
    expect(keys[0]).toBe("2026-05-03");
    expect(keys[6]).toBe("2026-05-09");
  });
});
