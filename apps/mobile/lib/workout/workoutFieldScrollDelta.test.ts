import { describe, expect, it } from "vitest";

import { workoutFieldScrollDelta } from "./workoutFieldScrollDelta";

const KEYPAD_TOP = 560;

describe("workoutFieldScrollDelta", () => {
  it("returns 0 when the field is fully above the keypad", () => {
    expect(workoutFieldScrollDelta({ fieldBottom: 300, keypadTop: KEYPAD_TOP })).toBe(0);
  });

  it("returns 0 when the field bottom sits exactly at the margin boundary", () => {
    expect(workoutFieldScrollDelta({ fieldBottom: KEYPAD_TOP - 20, keypadTop: KEYPAD_TOP })).toBe(0);
  });

  it("returns the overlap (incl. margin) when the field is behind the keypad", () => {
    // field bottom 600, keypad top 560, margin 20 -> 600 + 20 - 560 = 60
    expect(workoutFieldScrollDelta({ fieldBottom: 600, keypadTop: KEYPAD_TOP })).toBe(60);
  });

  it("never returns a negative (upward) scroll", () => {
    expect(workoutFieldScrollDelta({ fieldBottom: 10, keypadTop: KEYPAD_TOP })).toBe(0);
  });

  it("honors a custom margin", () => {
    expect(workoutFieldScrollDelta({ fieldBottom: 550, keypadTop: KEYPAD_TOP, margin: 40 })).toBe(30);
  });
});
