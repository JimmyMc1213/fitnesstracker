import { describe, expect, it } from "vitest";

import {
  buildOnboardingPlanSnapshot,
  formatOnboardingPlanFuelLine,
  onboardingPlanSnapshotFirstWorkoutRow,
  onboardingPlanSnapshotWeekRows,
  planSnapshotMatches,
} from "./onboardingPlanSnapshot";
import type { OnboardingProfile, WorkoutRoutineTemplate } from "./types";

const profile: OnboardingProfile = {
  goal: "cut",
  heightIn: 70,
  weightLbs: 200,
  age: 30,
  gender: "male",
  activityLevel: "moderate",
  workoutDaysPerWeek: 4,
  trainingWeekdays: ["Mon", "Wed", "Fri", "Sat"],
  goalWeightLbs: 180,
  pace: "balanced",
};

const templates: WorkoutRoutineTemplate[] = [
  { id: "1", dayLabel: "Wed", name: "Pull", focus: "Back", exercises: [] },
  { id: "2", dayLabel: "Mon", name: "Push", focus: "Chest", exercises: [] },
];

describe("buildOnboardingPlanSnapshot", () => {
  it("derives timeline from profile and clones mutable fields", () => {
    const snapshot = buildOnboardingPlanSnapshot({
      displayName: "Alex",
      macros: { cal: 2100, p: 160, c: 200, f: 60 },
      profile,
      templates,
      volumeUnit: "oz",
    });

    expect(snapshot.displayName).toBe("Alex");
    expect(snapshot.timeline).toBe("6 months");
    expect(snapshot.waterDailyTargetOz).toBe(64);
    expect(snapshot.stepsTarget).toBe(10_000);
    expect(snapshot.templates).not.toBe(templates);
    expect(snapshot.templates[0]).not.toBe(templates[0]);
    expect(snapshot.macros).toEqual({ cal: 2100, p: 160, c: 200, f: 60 });
  });

  it("uses 80 oz hydration when weight is over 200 lbs", () => {
    const snapshot = buildOnboardingPlanSnapshot({
      displayName: "Alex",
      macros: { cal: 2100, p: 160, c: 200, f: 60 },
      profile: { ...profile, weightLbs: 205 },
      templates,
      volumeUnit: "oz",
    });

    expect(snapshot.waterDailyTargetOz).toBe(80);
  });

  it("uses edited macros passed from step 21", () => {
    const edited = { cal: 1950, p: 170, c: 180, f: 55 };
    const snapshot = buildOnboardingPlanSnapshot({
      displayName: "Alex",
      macros: edited,
      profile,
      templates,
      volumeUnit: "oz",
    });

    expect(snapshot.macros).toEqual(edited);
    expect(formatOnboardingPlanFuelLine(snapshot.macros)).toBe("1,950 cal · 170g protein");
  });
});

describe("onboardingPlanSnapshotWeekRows", () => {
  it("returns day/name pairs from templates", () => {
    const snapshot = buildOnboardingPlanSnapshot({
      displayName: "Alex",
      macros: { cal: 2000, p: 150, c: 200, f: 60 },
      profile,
      templates,
      volumeUnit: "oz",
    });

    expect(onboardingPlanSnapshotWeekRows(snapshot)).toEqual([
      { dayLabel: "Mon", name: "Push" },
      { dayLabel: "Wed", name: "Pull" },
    ]);
    expect(onboardingPlanSnapshotFirstWorkoutRow(snapshot)).toEqual({ dayLabel: "Mon", name: "Push" });
  });
});

describe("planSnapshotMatches", () => {
  it("compares plan snapshot fields for consistency checks", () => {
    const base = buildOnboardingPlanSnapshot({
      displayName: "Alex",
      macros: { cal: 2000, p: 150, c: 200, f: 60 },
      profile,
      templates,
      volumeUnit: "oz",
    });
    const same = buildOnboardingPlanSnapshot({
      displayName: "Alex",
      macros: { cal: 2000, p: 150, c: 200, f: 60 },
      profile,
      templates,
      volumeUnit: "oz",
    });
    const editedMacros = buildOnboardingPlanSnapshot({
      displayName: "Alex",
      macros: { cal: 2100, p: 150, c: 200, f: 60 },
      profile,
      templates,
      volumeUnit: "oz",
    });

    expect(planSnapshotMatches(base, same)).toBe(true);
    expect(planSnapshotMatches(base, editedMacros)).toBe(false);
  });
});
