import { describe, expect, it } from "vitest";

import {
  futureYouGoalDetailLine,
  futureYouGoalLabel,
  futureYouTargetMonthLabel,
  futureYouTimelineMonths,
  futureYouWeightDeltaLabel,
} from "./futureYouGoalSummary";

describe("futureYouGoalSummary", () => {
  it("maps goals to app wording labels", () => {
    expect(futureYouGoalLabel("cut")).toBe("Lose weight");
    expect(futureYouGoalLabel("bulk")).toBe("Gain weight");
    expect(futureYouGoalLabel("maintain")).toBe("Maintain");
  });

  it("formats signed weight deltas with compact units", () => {
    expect(
      futureYouWeightDeltaLabel(
        { goal: "cut", weightLbs: 190, goalWeightLbs: 176 },
        "lbs",
      ),
    ).toBe("-14 lb");
    expect(
      futureYouWeightDeltaLabel(
        { goal: "bulk", weightLbs: 160, goalWeightLbs: 170 },
        "lbs",
      ),
    ).toBe("+10 lb");
    expect(
      futureYouWeightDeltaLabel({ goal: "maintain", weightLbs: 180 }, "lbs"),
    ).toBeNull();
  });

  it("parses coarse timeline strings into months", () => {
    expect(futureYouTimelineMonths("3 months")).toBe(3);
    expect(futureYouTimelineMonths("6 months")).toBe(6);
    expect(futureYouTimelineMonths("1 year")).toBe(12);
    expect(futureYouTimelineMonths("2 years")).toBe(24);
    expect(futureYouTimelineMonths("unknown")).toBe(3);
  });

  it("computes target month from timeline", () => {
    const now = new Date(2026, 5, 20); // Jun 20, 2026
    expect(futureYouTargetMonthLabel("3 months", now)).toBe("Sep 2026");
    expect(futureYouTargetMonthLabel("1 year", now)).toBe("Jun 2027");
  });

  it("joins delta and month for cut/bulk; month only for maintain", () => {
    const now = new Date(2026, 5, 20);
    expect(
      futureYouGoalDetailLine(
        { goal: "cut", weightLbs: 190, goalWeightLbs: 176 },
        "lbs",
        "3 months",
        now,
      ),
    ).toBe("-14 lb · Sep 2026");
    expect(
      futureYouGoalDetailLine({ goal: "maintain", weightLbs: 180 }, "lbs", "3 months", now),
    ).toBe("Sep 2026");
  });
});
