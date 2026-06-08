import { describe, expect, it } from "vitest";

import {
  cmFromInches,
  DEFAULT_UNIT_PREFERENCES,
  formatHeightFromInches,
  formatSetWeight,
  formatWeightDeltaLbs,
  formatWeightFromLbs,
  formatWeeklyRateLbsPerWeek,
  heightUnitLabel,
  inchesFromCm,
  isValidWeighInLbs,
  lbsFromWeightInputText,
  LBS_PER_KG,
  weighInRangeHint,
  normalizeUnitPreferences,
  parseSetWeightInput,
  parseWeightToLbs,
  volumeUnitLabel,
  weightUnitLabel,
} from "./unitPreferences";
import { formatPersonalRecordSet } from "./personalRecordsBoard";

describe("normalizeUnitPreferences", () => {
  it("returns defaults for nullish or non-object input", () => {
    expect(normalizeUnitPreferences(null)).toEqual(DEFAULT_UNIT_PREFERENCES);
    expect(normalizeUnitPreferences(undefined)).toEqual(DEFAULT_UNIT_PREFERENCES);
    expect(normalizeUnitPreferences("lbs")).toEqual(DEFAULT_UNIT_PREFERENCES);
    expect(normalizeUnitPreferences([])).toEqual(DEFAULT_UNIT_PREFERENCES);
  });

  it("accepts valid units and defaults missing fields to imperial", () => {
    expect(normalizeUnitPreferences({ weightUnit: "kg", heightUnit: "cm", volumeUnit: "L" })).toEqual({
      weightUnit: "kg",
      heightUnit: "cm",
      volumeUnit: "L",
    });
  });

  it("rejects unknown unit strings", () => {
    expect(normalizeUnitPreferences({ weightUnit: "stone", heightUnit: "m", volumeUnit: "ml" })).toEqual({
      weightUnit: "lbs",
      heightUnit: "ft_in",
      volumeUnit: "oz",
    });
  });
});

describe("unit labels", () => {
  it("returns stable display labels", () => {
    expect(weightUnitLabel("lbs")).toBe("lbs");
    expect(weightUnitLabel("kg")).toBe("kg");
    expect(heightUnitLabel("ft_in")).toBe("ft + in");
    expect(heightUnitLabel("cm")).toBe("cm");
    expect(volumeUnitLabel("oz")).toBe("oz");
    expect(volumeUnitLabel("L")).toBe("L");
  });
});

describe("weight conversions", () => {
  const canonicalCases = [
    { lbs: 180, kg: 81.6 },
    { lbs: 150, kg: 68.0 },
    { lbs: 225, kg: 102.1 },
    { lbs: 45, kg: 20.4 },
  ] as const;

  it.each(canonicalCases)("round-trips $lbs lbs through kg display", ({ lbs, kg }) => {
    expect(parseWeightToLbs(parseFloat(formatWeightFromLbs(lbs, "kg")), "kg")).toBeCloseTo(lbs, 0);
    expect(formatWeightFromLbs(lbs, "kg")).toBe(kg.toFixed(1));
    expect(parseWeightToLbs(lbs, "lbs")).toBe(lbs);
    expect(formatWeightFromLbs(lbs, "lbs")).toBe(lbs.toFixed(1));
  });

  it("uses the standard conversion constant", () => {
    expect(parseWeightToLbs(1, "kg")).toBeCloseTo(LBS_PER_KG, 6);
    expect(parseWeightToLbs(100, "kg")).toBeCloseTo(100 * LBS_PER_KG, 4);
  });

  it("handles invalid weight input", () => {
    expect(parseWeightToLbs(NaN, "kg")).toBeNaN();
    expect(parseWeightToLbs(Infinity, "lbs")).toBeNaN();
    expect(formatWeightFromLbs(NaN, "lbs")).toBe(", ");
  });

  it("validates weigh-in range in canonical lbs", () => {
    expect(isValidWeighInLbs(70)).toBe(true);
    expect(isValidWeighInLbs(450)).toBe(true);
    expect(isValidWeighInLbs(69.9)).toBe(false);
    expect(isValidWeighInLbs(450.1)).toBe(false);
    expect(isValidWeighInLbs(NaN)).toBe(false);
  });

  it("parses onboarding weight text synchronously", () => {
    expect(lbsFromWeightInputText("", "lbs")).toBe(0);
    expect(lbsFromWeightInputText(".", "lbs")).toBe(0);
    expect(lbsFromWeightInputText("180", "lbs")).toBe(180);
    expect(lbsFromWeightInputText("180.", "lbs")).toBe(180);
    expect(lbsFromWeightInputText("80", "kg")).toBeCloseTo(80 * LBS_PER_KG, 2);
  });

  it("shows unit-aware weigh-in hints", () => {
    expect(weighInRangeHint("lbs")).toContain("70");
    expect(weighInRangeHint("lbs")).toContain("450 lbs");
    expect(weighInRangeHint("kg")).toContain("kg");
  });
});

describe("workout set weight input", () => {
  it("stores lbs directly when entered in lbs", () => {
    expect(parseSetWeightInput("135", "lbs")).toBe(135);
    expect(formatSetWeight(135, "lbs")).toBe("135");
  });

  it("converts kg input to canonical lbs", () => {
    expect(parseSetWeightInput("60", "kg")).toBeCloseTo(60 * LBS_PER_KG, 4);
    expect(formatSetWeight(60 * LBS_PER_KG, "kg")).toBe("60.0");
  });

  it("rejects invalid set input", () => {
    expect(parseSetWeightInput("", "lbs")).toBe(0);
    expect(parseSetWeightInput("abc", "kg")).toBe(0);
    expect(parseSetWeightInput("-5", "lbs")).toBe(0);
    expect(formatSetWeight(0, "lbs")).toBe("");
    expect(formatSetWeight(-10, "kg")).toBe("");
  });

  it("formats personal records in the selected weight unit", () => {
    expect(formatPersonalRecordSet(225, 5, "lbs")).toBe("225 lbs × 5");
    expect(formatPersonalRecordSet(225, 5, "kg")).toBe("102.1 kg × 5");
    expect(formatPersonalRecordSet(0, 12, "kg")).toBe("12 reps");
  });
});

describe("weight delta and rate formatting", () => {
  it("formats weekly rate in lbs and kg", () => {
    expect(formatWeeklyRateLbsPerWeek(-1.5, "lbs")).toBe("-1.50 lb/wk");
    expect(formatWeeklyRateLbsPerWeek(-1.5, "kg")).toBe("-0.68 kg/wk");
    expect(formatWeeklyRateLbsPerWeek(2, "lbs")).toBe("2.00 lb/wk");
  });

  it("formats signed weight deltas", () => {
    expect(formatWeightDeltaLbs(3.2, "lbs")).toBe("+3.2 lbs");
    expect(formatWeightDeltaLbs(-4.4, "lbs")).toBe("-4.4 lbs");
    expect(formatWeightDeltaLbs(3.2, "kg")).toBe("+1.5 kg");
    expect(formatWeightDeltaLbs(-4.4, "kg")).toBe("-2.0 kg");
  });
});

describe("height conversions", () => {
  it("formats ft+in from canonical inches", () => {
    expect(formatHeightFromInches(70, "ft_in")).toBe(`5'10"`);
    expect(formatHeightFromInches(72, "ft_in")).toBe(`6'0"`);
    expect(formatHeightFromInches(68, "ft_in")).toBe(`5'8"`);
  });

  it("formats cm from canonical inches", () => {
    expect(formatHeightFromInches(70, "cm")).toBe("178");
    expect(formatHeightFromInches(72, "cm")).toBe("183");
  });

  it("round-trips cm through canonical inches", () => {
    for (const cm of [150, 165, 178, 190, 200]) {
      const inches = inchesFromCm(cm);
      expect(inches).not.toBeNull();
      expect(Math.round(cmFromInches(inches!))).toBe(cm);
    }
  });

  it("rejects invalid height values", () => {
    expect(formatHeightFromInches(0, "cm")).toBe(", ");
    expect(formatHeightFromInches(-10, "ft_in")).toBe(", ");
    expect(inchesFromCm(0)).toBeNull();
    expect(inchesFromCm(-5)).toBeNull();
  });
});

describe("unit switching preserves canonical weight", () => {
  it("shows equivalent values when toggling lbs ↔ kg without changing stored lbs", () => {
    const storedLbs = 172.4;

    const asLbs = formatWeightFromLbs(storedLbs, "lbs");
    const asKg = formatWeightFromLbs(storedLbs, "kg");

    expect(asLbs).toBe("172.4");
    expect(asKg).toBe("78.2");

    expect(parseWeightToLbs(parseFloat(asLbs), "lbs")).toBeCloseTo(storedLbs, 4);
    expect(parseWeightToLbs(parseFloat(asKg), "kg")).toBeCloseTo(storedLbs, 1);
  });

  it("shows equivalent height when toggling ft+in ↔ cm without changing stored inches", () => {
    const storedInches = 69;

    expect(formatHeightFromInches(storedInches, "ft_in")).toBe(`5'9"`);
    expect(formatHeightFromInches(storedInches, "cm")).toBe("175");

    const fromCm = inchesFromCm(175);
    expect(fromCm).not.toBeNull();
    expect(Math.round(fromCm!)).toBe(storedInches);
  });
});
