import { describe, expect, it } from "vitest";

import { futureYouTimelineFromProfile, splitFutureYouTimelineForPaywall } from "./futureYouTimeline";
import { DEFAULT_ONBOARDING_PROFILE } from "./onboardingProfile";

describe("splitFutureYouTimelineForPaywall", () => {
  it("blurs only the numeric part", () => {
    expect(splitFutureYouTimelineForPaywall("3 months")).toEqual({ value: "3", unit: " months" });
    expect(splitFutureYouTimelineForPaywall("6 months")).toEqual({ value: "6", unit: " months" });
    expect(splitFutureYouTimelineForPaywall("1 year")).toEqual({ value: "1", unit: " year" });
  });
});

describe("futureYouTimelineFromProfile", () => {
  it("returns 3 months for maintain goal", () => {
    expect(
      futureYouTimelineFromProfile({
        ...DEFAULT_ONBOARDING_PROFILE,
        goal: "maintain",
      }),
    ).toBe("3 months");
  });

  it("maps ~12 weeks of cut progress to 3 months", () => {
    expect(
      futureYouTimelineFromProfile({
        ...DEFAULT_ONBOARDING_PROFILE,
        goal: "cut",
        weightLbs: 190,
        goalWeightLbs: 178,
        pace: "balanced",
      }),
    ).toBe("3 months");
  });

  it("maps longer cuts to 6 months", () => {
    expect(
      futureYouTimelineFromProfile({
        ...DEFAULT_ONBOARDING_PROFILE,
        goal: "cut",
        weightLbs: 220,
        goalWeightLbs: 190,
        pace: "balanced",
      }),
    ).toBe("6 months");
  });

  it("respects slower pace for the same delta", () => {
    const profile = {
      ...DEFAULT_ONBOARDING_PROFILE,
      goal: "cut" as const,
      weightLbs: 200,
      goalWeightLbs: 185,
    };
    expect(futureYouTimelineFromProfile({ ...profile, pace: "balanced" })).toBe("3 months");
    expect(futureYouTimelineFromProfile({ ...profile, pace: "slow" })).toBe("6 months");
  });
});
