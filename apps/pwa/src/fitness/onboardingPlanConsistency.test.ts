import { describe, expect, it } from "vitest";

import {
  buildOnboardingPlanSnapshot,
  formatOnboardingPlanFuelLine,
  onboardingPlanSnapshotWeekRows,
} from "./onboardingPlanSnapshot";
import type { OnboardingProfile, WorkoutRoutineTemplate } from "./types";

const profile: OnboardingProfile = {
  goal: "maintain",
  heightIn: 70,
  weightLbs: 180,
  age: 30,
  gender: "male",
  activityLevel: "moderate",
  workoutDaysPerWeek: 4,
  trainingWeekdays: ["Mon", "Wed", "Fri", "Sat"],
};

const templates: WorkoutRoutineTemplate[] = [
  { id: "1", dayLabel: "Mon", name: "Push", focus: "Chest", exercises: [] },
  { id: "2", dayLabel: "Wed", name: "Pull", focus: "Back", exercises: [] },
];

describe("onboarding plan snapshot (step 20)", () => {
  it("builds a single snapshot used by plan ready", () => {
    const snapshot = buildOnboardingPlanSnapshot({
      displayName: "Alex",
      macros: { cal: 2100, p: 160, c: 200, f: 60 },
      profile,
      templates,
      volumeUnit: "oz",
    });

    const planReady = {
      cal: snapshot.macros.cal.toLocaleString(),
      protein: snapshot.macros.p.toLocaleString(),
      timeline: snapshot.timeline,
      week: onboardingPlanSnapshotWeekRows(snapshot),
    };

    expect(formatOnboardingPlanFuelLine(snapshot.macros)).toBe(`${planReady.cal} cal · ${planReady.protein}g protein`);
    expect(planReady.timeline).toBe("3 months");
    expect(planReady.week).toHaveLength(2);
  });

  it("uses edited macros from step 21 in the shared snapshot", () => {
    const edited = { cal: 2222, p: 175, c: 190, f: 58 };
    const snapshot = buildOnboardingPlanSnapshot({
      displayName: "Alex",
      macros: edited,
      profile,
      templates,
      volumeUnit: "oz",
    });

    expect(formatOnboardingPlanFuelLine(snapshot.macros)).toBe("2,222 cal · 175g protein");
    expect(snapshot.macros).toEqual(edited);
  });
});
