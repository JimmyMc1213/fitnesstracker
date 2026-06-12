import { describe, expect, it } from "vitest";

import {
  isTrainingScheduleValid,
  pickTrainingWeekdaysForMe,
  toggleTrainingWeekday,
} from "./workoutWeekCalendar";

describe("workoutWeekCalendar", () => {
  it("requires 3–6 training days", () => {
    expect(isTrainingScheduleValid({ trainingWeekdays: ["Mon", "Tue"] })).toBe(false);
    expect(isTrainingScheduleValid({ trainingWeekdays: ["Mon", "Tue", "Wed"] })).toBe(true);
    expect(
      isTrainingScheduleValid({
        trainingWeekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      }),
    ).toBe(false);
  });

  it("pick for me defaults to 4 days", () => {
    expect(pickTrainingWeekdaysForMe([])).toEqual(["Mon", "Tue", "Thu", "Fri"]);
  });

  it("toggle respects max day count", () => {
    const six = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    expect(toggleTrainingWeekday(six, "Sun")).toEqual(six);
  });
});
