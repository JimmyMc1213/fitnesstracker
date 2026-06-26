import { describe, expect, it } from "vitest";

import {
  PROGRAMMED_MAX_SETS,
  PREFERRED_PROGRAMMED_SETS,
  USER_EDITABLE_MAX_SETS,
  clampProgrammedSetCount,
  clampUserEditableSetCount,
} from "./workoutSetLimits";

describe("workoutSetLimits", () => {
  it("caps programmed sets at four and defaults to three", () => {
    expect(clampProgrammedSetCount(PREFERRED_PROGRAMMED_SETS)).toBe(3);
    expect(clampProgrammedSetCount(99)).toBe(PROGRAMMED_MAX_SETS);
    expect(clampProgrammedSetCount(0)).toBe(1);
  });

  it("allows users to edit up to twelve sets", () => {
    expect(clampUserEditableSetCount(8)).toBe(8);
    expect(clampUserEditableSetCount(99)).toBe(USER_EDITABLE_MAX_SETS);
  });
});
