import { describe, expect, it } from "vitest";

import { buildAppStateFromPersisted } from "./buildAppState";
import { habitTemplatesFromOnboarding } from "./data";
import { goalWeightDeltaDisplay } from "./onboardingReinforcementCopy";
import { mergePersistedFitnessSlices } from "./mergePersistedFitnessSlices";
import { DEFAULT_ONBOARDING_PROFILE } from "./onboardingProfile";
import { sliceFromAppState } from "./persistFitnessSlice";
import {
  formatVolumeFromOz,
  formatWaterVolume,
  formatWaterVolumeAlt,
  parseVolumeToOz,
  totalWaterOzForDateKey,
  waterQuickAddPresets,
  waterTargetPresets,
} from "./waterIntake";
import {
  formatHeightFromInches,
  formatWeightFromLbs,
} from "./unitPreferences";
import { buildWorkoutSessionSummary } from "./workoutSummary";
import type { OnboardingProfile, UnitPreferences, WorkoutState } from "./types";

const IMPERIAL: UnitPreferences = { weightUnit: "lbs", heightUnit: "ft_in", volumeUnit: "oz" };
const METRIC: UnitPreferences = { weightUnit: "kg", heightUnit: "cm", volumeUnit: "L" };

function persistedWithUnits(units: UnitPreferences) {
  return {
    onboardingComplete: true,
    unitPreferences: units,
    unitPreferencesChosen: true,
    weightLog: [{ dateKey: "2026-05-18", weightLbs: 180 }],
    onboardingProfile: {
      heightIn: 70,
      weightLbs: 180,
      age: 30,
      gender: "male",
      activityLevel: "moderate",
      nutritionGoal: "cut",
      workoutDaysPerWeek: 4,
      goalPace: "balanced",
      sessionDuration: 60,
    },
    waterDailyTargetOz: 64,
    waterLogByDay: {
      "2026-05-18": [
        { id: "w1", amountOz: 16, loggedAtMs: 1 },
        { id: "w2", amountOz: 8, loggedAtMs: 2 },
      ],
    },
  };
}

describe("buildAppStateFromPersisted unit switching", () => {
  it("does not mutate canonical weight, height, or water when display units change", () => {
    const imperial = buildAppStateFromPersisted(persistedWithUnits(IMPERIAL));
    const metric = buildAppStateFromPersisted(persistedWithUnits(METRIC));

    expect(imperial.weightLog[0]?.weightLbs).toBe(180);
    expect(metric.weightLog[0]?.weightLbs).toBe(180);
    expect(imperial.onboardingProfile?.heightIn).toBe(70);
    expect(metric.onboardingProfile?.heightIn).toBe(70);
    expect(imperial.waterDailyTargetOz).toBe(64);
    expect(metric.waterDailyTargetOz).toBe(64);
    expect(totalWaterOzForDateKey(imperial.waterLogByDay, "2026-05-18")).toBe(24);
    expect(totalWaterOzForDateKey(metric.waterLogByDay, "2026-05-18")).toBe(24);
  });

  it("translates display values correctly for each unit preference", () => {
    const imperial = buildAppStateFromPersisted(persistedWithUnits(IMPERIAL));
    const metric = buildAppStateFromPersisted(persistedWithUnits(METRIC));

    expect(formatWeightFromLbs(180, imperial.unitPreferences.weightUnit)).toBe("180.0");
    expect(formatWeightFromLbs(180, metric.unitPreferences.weightUnit)).toBe("81.6");
    expect(formatHeightFromInches(70, imperial.unitPreferences.heightUnit)).toBe(`5'10"`);
    expect(formatHeightFromInches(70, metric.unitPreferences.heightUnit)).toBe("178");
    expect(formatWaterVolume(64, imperial.unitPreferences.volumeUnit)).toBe("64 oz");
    expect(formatWaterVolume(64, metric.unitPreferences.volumeUnit)).toBe("1.9 L");
    expect(formatWaterVolume(24, imperial.unitPreferences.volumeUnit)).toBe("24 oz");
    expect(formatWaterVolume(24, metric.unitPreferences.volumeUnit)).toBe("0.7 L");
  });
});

describe("mergePersistedFitnessSlices unit preferences", () => {
  it("normalizes partial or invalid unit preferences from sync payloads", () => {
    const local = sliceFromAppState(buildAppStateFromPersisted(persistedWithUnits(IMPERIAL)));
    const remote = sliceFromAppState(
      buildAppStateFromPersisted({
        ...persistedWithUnits({ weightUnit: "kg", heightUnit: "cm", volumeUnit: "L" }),
        weightLog: [{ dateKey: "2026-05-19", weightLbs: 178 }],
      }),
    );

    const merged = mergePersistedFitnessSlices(local, remote);
    expect(merged.unitPreferences).toEqual(METRIC);
    expect(merged.weightLog.at(-1)?.weightLbs).toBe(178);
  });

  it("falls back to defaults when both sides lack unit preferences", () => {
    const base = buildAppStateFromPersisted({});
    const local = sliceFromAppState(base);
    const remote = sliceFromAppState(buildAppStateFromPersisted({ unitPreferences: METRIC }));

    const merged = mergePersistedFitnessSlices(local, remote);
    expect(merged.unitPreferences).toEqual(METRIC);
  });
});

describe("volume unit switching", () => {
  it("keeps canonical oz stable when toggling display format", () => {
    const canonicalOz = 64;
    expect(formatWaterVolume(canonicalOz, "oz")).toBe("64 oz");
    expect(formatWaterVolume(canonicalOz, "L")).toBe("1.9 L");
    expect(Math.round(parseVolumeToOz(parseFloat(formatVolumeFromOz(canonicalOz, "L")), "L"))).toBe(canonicalOz);
  });

  it("documents that liter display rounding can drift slightly from original oz", () => {
    expect(parseFloat(formatVolumeFromOz(16, "L"))).toBe(0.5);
    expect(Math.round(parseVolumeToOz(0.5, "L"))).toBe(17);
    expect(parseFloat(formatVolumeFromOz(8, "L"))).toBe(0.2);
    expect(Math.round(parseVolumeToOz(0.2, "L"))).toBe(7);
  });

  it("shows alternate unit as a hint without changing canonical oz", () => {
    expect(formatWaterVolumeAlt(64, "oz")).toBe("≈ 1.9 L");
    expect(formatWaterVolumeAlt(64, "L")).toBe("≈ 64 oz");
  });

  it("maps quick-add presets to equivalent canonical oz values", () => {
    const ozPresets = waterQuickAddPresets("oz");
    const lPresets = waterQuickAddPresets("L");

    expect(ozPresets).toEqual([8, 16]);
    expect(lPresets).toEqual([0.25, 0.5]);

    const ozFromQuarterLiter = Math.round(parseVolumeToOz(0.25, "L"));
    const ozFromHalfLiter = Math.round(parseVolumeToOz(0.5, "L"));
    expect(ozFromQuarterLiter).toBeGreaterThanOrEqual(7);
    expect(ozFromQuarterLiter).toBeLessThanOrEqual(9);
    expect(ozFromHalfLiter).toBeGreaterThanOrEqual(15);
    expect(ozFromHalfLiter).toBeLessThanOrEqual(17);
  });

  it("maps target presets to stable canonical oz when selected in liters", () => {
    for (const presetL of waterTargetPresets("L")) {
      const oz = Math.round(parseVolumeToOz(presetL, "L"));
      expect(oz).toBeGreaterThanOrEqual(16);
      expect(oz).toBeLessThanOrEqual(256);
    }

    expect(Math.round(parseVolumeToOz(2, "L"))).toBe(68);
    expect(Math.round(parseVolumeToOz(3, "L"))).toBe(101);
  });

  it("keeps the same total when only the display unit changes", () => {
    const totalOz = 24;
    expect(formatWaterVolume(totalOz, "oz")).toBe("24 oz");
    expect(formatWaterVolume(totalOz, "L")).toBe("0.7 L");
    expect(formatVolumeFromOz(totalOz, "oz")).toBe("24");
    expect(formatVolumeFromOz(totalOz, "L")).toBe("0.7");
  });
});

describe("habit template hydration label", () => {
  it("reflects the selected volume unit without changing the underlying oz target", () => {
    expect(habitTemplatesFromOnboarding(10_000, 64, "oz")[0]?.name).toBe("Water 64 oz");
    expect(habitTemplatesFromOnboarding(10_000, 64, "L")[0]?.name).toBe("Water 1.9 L");
    expect(habitTemplatesFromOnboarding(10_000, 96, "L")[0]?.name).toBe("Water 2.8 L");
  });
});

describe("onboarding goal weight display", () => {
  const profile: OnboardingProfile = {
    ...DEFAULT_ONBOARDING_PROFILE,
    weightLbs: 200,
    goalWeightLbs: 180,
    goal: "cut",
  };

  it("shows the same delta in lbs and kg without changing stored values", () => {
    expect(goalWeightDeltaDisplay(profile, "lbs")).toBe("20 lb");
    expect(goalWeightDeltaDisplay(profile, "kg")).toBe("9.1 kg");
  });
});

describe("workout summary weight display", () => {
  const workout: WorkoutState = {
    sessionTitle: "Upper",
    sessionStartedAtMs: 1_000_000,
    exercises: [
      {
        id: "ex1",
        name: "Bench Press",
        target: "3 × 5",
        sets: [{ w: 225, r: 5, done: true }],
      },
    ],
  };

  it("formats PR set detail in the selected weight unit", () => {
    const prior = { "bench press": { maxWeight: 200, maxReps: 5 } };
    const lbsSummary = buildWorkoutSessionSummary(workout, prior, 1_003_600_000, "lbs");
    const kgSummary = buildWorkoutSessionSummary(workout, prior, 1_003_600_000, "kg");

    expect(lbsSummary.prs[0]?.detail).toBe("225 lbs × 5 reps");
    expect(kgSummary.prs[0]?.detail).toBe("102.1 kg × 5 reps");
  });
});

describe("full metric ↔ imperial toggle scenario", () => {
  it("presents consistent equivalents across a settings change", () => {
    const canonical = persistedWithUnits(IMPERIAL);
    const before = buildAppStateFromPersisted(canonical);
    const after = buildAppStateFromPersisted({
      ...canonical,
      unitPreferences: METRIC,
    });

    const weightLbs = before.weightLog[0]!.weightLbs;
    const heightIn = before.onboardingProfile!.heightIn;
    const waterOz = before.waterDailyTargetOz;
    const loggedOz = totalWaterOzForDateKey(before.waterLogByDay, "2026-05-18");

    expect(after.weightLog[0]!.weightLbs).toBe(weightLbs);
    expect(after.onboardingProfile!.heightIn).toBe(heightIn);
    expect(after.waterDailyTargetOz).toBe(waterOz);
    expect(totalWaterOzForDateKey(after.waterLogByDay, "2026-05-18")).toBe(loggedOz);

    expect(formatWeightFromLbs(weightLbs, before.unitPreferences.weightUnit)).toBe("180.0");
    expect(formatWeightFromLbs(weightLbs, after.unitPreferences.weightUnit)).toBe("81.6");
    expect(formatHeightFromInches(heightIn, before.unitPreferences.heightUnit)).toBe(`5'10"`);
    expect(formatHeightFromInches(heightIn, after.unitPreferences.heightUnit)).toBe("178");
    expect(formatWaterVolume(waterOz, before.unitPreferences.volumeUnit)).toBe("64 oz");
    expect(formatWaterVolume(waterOz, after.unitPreferences.volumeUnit)).toBe("1.9 L");
    expect(formatWaterVolume(loggedOz, before.unitPreferences.volumeUnit)).toBe("24 oz");
    expect(formatWaterVolume(loggedOz, after.unitPreferences.volumeUnit)).toBe("0.7 L");
  });
});
