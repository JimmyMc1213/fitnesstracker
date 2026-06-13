import { describe, expect, it } from "vitest";

import { minimalAppState } from "../coach/testFixtures/appStateFixtures";
import {
  buildSundayCheckInData,
  commitSundayCheckIn,
  isSundayCheckInDay,
  shouldShowSundayCheckIn,
  sundayNoonForCurrentWeek,
} from "./sundayCheckIn";

describe("sundayCheckIn", () => {
  it("returns null when not Sunday", () => {
    const wednesday = new Date("2026-06-10T12:00:00");
    const state = minimalAppState({ onboardingComplete: true });
    expect(buildSundayCheckInData(state, wednesday)).toBeNull();
    expect(isSundayCheckInDay(wednesday)).toBe(false);
  });

  it("builds data on Sunday for onboarded users", () => {
    const sunday = new Date("2026-06-14T12:00:00");
    const state = minimalAppState({
      onboardingComplete: true,
      displayName: "Alex",
      workoutsCompletedByDay: { "2026-06-09": true, "2026-06-11": true },
      weightLog: [
        { dateKey: "2026-06-09", weightLbs: 180 },
        { dateKey: "2026-06-14", weightLbs: 179.5 },
      ],
    });
    const data = buildSundayCheckInData(state, sunday);
    expect(data).not.toBeNull();
    expect(data?.sundayKey).toBe("2026-06-14");
    expect(data?.displayName).toBe("Alex");
    expect(data?.metrics.length).toBeGreaterThan(0);
    expect(data?.commitmentOptions.length).toBeGreaterThan(0);
  });

  it("shouldShowSundayCheckIn respects preview flag", () => {
    const wednesday = new Date("2026-06-10T12:00:00");
    const state = minimalAppState({ onboardingComplete: true });
    expect(shouldShowSundayCheckIn(state, wednesday, false)).toBe(false);
    expect(shouldShowSundayCheckIn(state, wednesday, true)).toBe(true);
  });

  it("sundayNoonForCurrentWeek lands on Sunday", () => {
    const wednesday = new Date("2026-06-10T12:00:00");
    expect(sundayNoonForCurrentWeek(wednesday).getDay()).toBe(0);
  });

  it("commitSundayCheckIn persists completion and history", () => {
    const sunday = new Date("2026-06-14T12:00:00");
    const state = minimalAppState({ onboardingComplete: true });
    const data = buildSundayCheckInData(state, sunday);
    expect(data).not.toBeNull();
    if (!data) return;

    const next = commitSundayCheckIn(state, data, [{ id: "stack-sessions", title: "Stack sessions", subtitle: "" }]);
    expect(next.sundayReviewCompletedKey).toBe(data.sundayKey);
    expect(next.weekFocusCommitments).toHaveLength(1);
    expect(next.weekFocusWeekStartKey).toBe(data.weekStartKey);
    expect(next.sundayCheckInHistory).toHaveLength(1);
  });
});
