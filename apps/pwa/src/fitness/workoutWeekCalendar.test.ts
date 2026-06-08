import { describe, expect, it } from "vitest";

import {
  alignTemplatesToTrainingWeekdays,
  isValidTrainingWeekdaySelection,
  MANUAL_TRAINING_DAY_LIMITS,
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

  it("validates 3–6 day selection for generated plans", () => {
    expect(isValidTrainingWeekdaySelection(["Mon", "Wed"])).toBe(false);
    expect(isValidTrainingWeekdaySelection(["Mon", "Wed", "Fri"])).toBe(true);
    expect(isValidTrainingWeekdaySelection(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])).toBe(true);
    expect(isValidTrainingWeekdaySelection(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])).toBe(false);
  });

  it("allows 1–7 day selection for manual setup", () => {
    expect(isValidTrainingWeekdaySelection(["Mon"], MANUAL_TRAINING_DAY_LIMITS)).toBe(true);
    expect(isValidTrainingWeekdaySelection(["Mon", "Wed"], MANUAL_TRAINING_DAY_LIMITS)).toBe(true);
    expect(
      isValidTrainingWeekdaySelection(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], MANUAL_TRAINING_DAY_LIMITS),
    ).toBe(true);
    expect(isValidTrainingWeekdaySelection([], MANUAL_TRAINING_DAY_LIMITS)).toBe(false);
  });

  it("caps manual selection at 7 days", () => {
    const seven = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    expect(toggleTrainingWeekday(seven, "Mon", MANUAL_TRAINING_DAY_LIMITS)).toEqual([
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ]);
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

  it("shows split label in hint by default", () => {
    expect(trainingWeekdaySelectionHint(["Mon", "Tue", "Thu", "Fri"])).toMatch(/4 days selected · Upper \/ Lower/);
    expect(splitLabelForDayCount(4)).toBe("Upper / Lower");
  });

  it("can omit split label in hint for manual setup", () => {
    expect(trainingWeekdaySelectionHint(["Mon", "Tue", "Thu", "Fri"], { includeSplitLabel: false })).toBe(
      "4 days selected",
    );
    expect(trainingWeekdaySelectionHint([], { limits: MANUAL_TRAINING_DAY_LIMITS })).toBe("Pick your training days");
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
