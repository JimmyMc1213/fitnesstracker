import { describe, expect, it } from "vitest";

import { estimateRoutineSessionSeconds } from "./estimateSessionDuration";
import {
  restSecondsForSessionLength,
  sessionWithinBounds,
} from "./sessionLengthConfig";
import type { SessionLength } from "./types";
import { buildWorkoutTemplatesForDays } from "./workoutSplitByDays";

const SESSION_LENGTHS: SessionLength[] = ["under_30", "30_45", "45_60", "60_90", "90_plus"];

function estimatedSecondsForLength(sessionLength: SessionLength): number {
  const template = buildWorkoutTemplatesForDays(4, "intermediate", "full_gym", undefined, sessionLength)[0]!;
  return estimateRoutineSessionSeconds(template, restSecondsForSessionLength(sessionLength));
}

describe("session length programming", () => {
  it("maps rest seconds from onboarding session length buckets", () => {
    expect(restSecondsForSessionLength("under_30")).toBe(45);
    expect(restSecondsForSessionLength("30_45")).toBe(60);
    expect(restSecondsForSessionLength("45_60")).toBe(75);
    expect(restSecondsForSessionLength("60_90")).toBe(90);
    expect(restSecondsForSessionLength("90_plus")).toBe(120);
  });

  it.each(SESSION_LENGTHS)("programs %s sessions within the target duration bucket", (sessionLength) => {
    const totalSeconds = estimatedSecondsForLength(sessionLength);
    expect(sessionWithinBounds(totalSeconds, sessionLength)).toBe(true);
  });

  it("programs longer sessions for longer onboarding preferences", () => {
    const durations = SESSION_LENGTHS.map((length) => ({
      length,
      seconds: estimatedSecondsForLength(length),
    }));

    for (let i = 1; i < durations.length; i++) {
      expect(durations[i]!.seconds).toBeGreaterThan(durations[i - 1]!.seconds);
    }
  });

  it("stores estimatedMinutes aligned with computed duration", () => {
    const templates = buildWorkoutTemplatesForDays(4, "intermediate", "full_gym", undefined, "45_60");
    const rest = restSecondsForSessionLength("45_60");

    for (const template of templates) {
      const computed = estimateRoutineSessionSeconds(template, rest);
      expect(sessionWithinBounds(computed, "45_60")).toBe(true);
      expect(template.estimatedMinutes).toBeGreaterThanOrEqual(45);
      expect(template.estimatedMinutes).toBeLessThanOrEqual(60);
    }
  });

  it("uses more exercises and sets for longer sessions than under_30", () => {
    const short = buildWorkoutTemplatesForDays(4, "intermediate", "full_gym", undefined, "under_30");
    const long = buildWorkoutTemplatesForDays(4, "intermediate", "full_gym", undefined, "90_plus");

    const shortSets = short[0]!.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const longSets = long[0]!.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

    expect(short[0]!.exercises.length).toBeLessThan(long[0]!.exercises.length);
    expect(shortSets).toBeLessThan(longSets);
  });
});
