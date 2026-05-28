import { describe, expect, it } from "vitest";

import {
  clampRestTimerSeconds,
  DEFAULT_REST_TIMER_SECONDS,
  MAX_REST_TIMER_SECONDS,
  MIN_REST_TIMER_SECONDS,
  normalizeRestTimerDefaultSeconds,
  normalizeRestTimerSecondsByExerciseKey,
} from "./restTimerPreferences";

describe("restTimerPreferences", () => {
  it("clamps custom rest seconds to allowed range", () => {
    expect(clampRestTimerSeconds(45)).toBe(45);
    expect(clampRestTimerSeconds(5)).toBe(MIN_REST_TIMER_SECONDS);
    expect(clampRestTimerSeconds(9999)).toBe(MAX_REST_TIMER_SECONDS);
    expect(clampRestTimerSeconds(NaN)).toBe(DEFAULT_REST_TIMER_SECONDS);
  });

  it("rejects out-of-range persisted defaults", () => {
    expect(normalizeRestTimerDefaultSeconds(45)).toBe(45);
    expect(normalizeRestTimerDefaultSeconds(5)).toBe(DEFAULT_REST_TIMER_SECONDS);
    expect(normalizeRestTimerDefaultSeconds(9999)).toBe(DEFAULT_REST_TIMER_SECONDS);
  });

  it("drops invalid per-exercise overrides", () => {
    expect(
      normalizeRestTimerSecondsByExerciseKey({
        bench: 75,
        squat: 5,
        deadlift: 900,
      }),
    ).toEqual({ bench: 75 });
  });
});
