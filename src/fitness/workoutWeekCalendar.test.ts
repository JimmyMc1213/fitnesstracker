import { describe, expect, it } from "vitest";

import {
  alignTemplatesToTrainingWeekdays,
  isValidTrainingWeekdaySelection,
  pickTrainingWeekdaysForMe,
  splitLabelForDayCount,
  toggleTrainingWeekday,
  trainingWeekdaySelectionHint,
  workoutDaysPerWeekFromWeekdays,
} from "./workoutWeekCalendar";

describe("workoutWeekCalendar", () => {
  it("toggleTrainingWeekday adds and removes days", () => {
    expect(toggleTrainingWeekday([], "Mon")).toEqual(["Mon"]);
    expect(toggleTrainingWeekday(["Mon"], "Mon")).toEqual([]);
    expect(toggleTrainingWeekday(["Mon"], "Wed")).toEqual(["Mon", "Wed"]);
  });

  it("caps selection at 6 days", () => {
    const six = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    expect(toggleTrainingWeekday(six, "Sun")).toEqual(six);
  });

  it("validates 3–6 day selection", () => {
    expect(isValidTrainingWeekdaySelection(["Mon", "Wed"])).toBe(false);
    expect(isValidTrainingWeekdaySelection(["Mon", "Wed", "Fri"])).toBe(true);
    expect(isValidTrainingWeekdaySelection(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])).toBe(true);
    expect(isValidTrainingWeekdaySelection(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])).toBe(false);
  });

  it("pick for me uses 4-day Mon Tue Thu Fri default", () => {
    expect(pickTrainingWeekdaysForMe([])).toEqual(["Mon", "Tue", "Thu", "Fri"]);
    expect(pickTrainingWeekdaysForMe(["Mon", "Tue", "Wed", "Thu", "Fri"])).toEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
    ]);
  });

  it("derives workoutDaysPerWeek from weekday count", () => {
    expect(workoutDaysPerWeekFromWeekdays(["Mon", "Tue", "Thu", "Fri"])).toBe(4);
  });

  it("shows split label in hint", () => {
    expect(trainingWeekdaySelectionHint(["Mon", "Tue", "Thu", "Fri"])).toMatch(/4 days selected · Upper \/ Lower/);
    expect(splitLabelForDayCount(4)).toBe("Upper / Lower");
  });

  it("alignTemplatesToTrainingWeekdays maps day labels in order", () => {
    const aligned = alignTemplatesToTrainingWeekdays(
      [
        { id: "a", name: "Upper", dayLabel: "Mon", focus: "", exercises: [] },
        { id: "b", name: "Lower", dayLabel: "Tue", focus: "", exercises: [] },
      ],
      ["Thu", "Sun"],
    );
    expect(aligned[0]?.dayLabel).toBe("Thu");
    expect(aligned[1]?.dayLabel).toBe("Sun");
  });
});
