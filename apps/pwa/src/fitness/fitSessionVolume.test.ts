import { describe, expect, it } from "vitest";

import { fitSessionVolume } from "./fitSessionVolume";
import { PROGRAMMED_MAX_SETS, PREFERRED_PROGRAMMED_SETS } from "@newyouai/core";
import type { SessionLength } from "./types";

const SESSION_LENGTHS: SessionLength[] = ["under_30", "30_45", "45_60", "60_90", "90_plus"];

describe("fitSessionVolume", () => {
  it("never programs more than four sets per exercise", () => {
    for (const sessionLength of SESSION_LENGTHS) {
      for (let maxExercises = 1; maxExercises <= 8; maxExercises++) {
        const fit = fitSessionVolume(maxExercises, sessionLength);
        expect(fit.setCount).toBeLessThanOrEqual(PROGRAMMED_MAX_SETS);
      }
    }
  });

  it("uses four sets when three sets cannot fill the session window", () => {
    const fit = fitSessionVolume(6, "45_60", PREFERRED_PROGRAMMED_SETS);
    expect(fit.setCount).toBe(4);
    expect(fit.exerciseCount).toBe(6);
  });
});
