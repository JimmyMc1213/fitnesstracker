import { describe, expect, it } from "vitest";

import {
  buildOnboardingPlanSnapshot,
  planSnapshotMatches,
} from "./onboardingPlanSnapshot";
import { FRESH_ONBOARDING_PROFILE } from "./onboardingDefaults";

const baseMacros = { cal: 2200, p: 165, c: 220, f: 70 };

describe("buildOnboardingPlanSnapshot", () => {
  it("freezes macro targets from step 21 for plan ready", () => {
    const profile = { ...FRESH_ONBOARDING_PROFILE, goal: "cut" as const, pace: "balanced" as const };
    const templates = [
      { id: "t1", dayLabel: "Mon", name: "Push", focus: "Chest", exercises: [] },
      { id: "t2", dayLabel: "Wed", name: "Pull", focus: "Back", exercises: [] },
    ];

    const snapshot = buildOnboardingPlanSnapshot({
      displayName: "Alex",
      macros: baseMacros,
      profile,
      templates,
      volumeUnit: "oz",
    });

    expect(snapshot.macros).toEqual(baseMacros);
    expect(snapshot.templates).toHaveLength(2);
    expect(snapshot.timeline).toBeTruthy();
  });

  it("planSnapshotMatches detects macro drift", () => {
    const input = {
      displayName: "Alex",
      macros: baseMacros,
      profile: FRESH_ONBOARDING_PROFILE,
      templates: [{ id: "t1", dayLabel: "Mon", name: "Push", focus: "Chest", exercises: [] }],
      volumeUnit: "oz" as const,
    };
    const a = buildOnboardingPlanSnapshot(input);
    const b = buildOnboardingPlanSnapshot({ ...input, macros: { ...baseMacros, cal: 2300 } });
    expect(planSnapshotMatches(a, b)).toBe(false);
  });
});
