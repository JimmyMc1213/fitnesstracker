import type { HeightDisplayUnit, UnitPreferences, WeightUnit } from "./types";

export const LBS_PER_KG = 2.2046226218;
const IN_PER_CM = 0.3937007874;

export const DEFAULT_UNIT_PREFERENCES: UnitPreferences = {
  weightUnit: "lbs",
  heightUnit: "ft_in",
};

export function normalizeUnitPreferences(raw: unknown): UnitPreferences {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_UNIT_PREFERENCES };
  const o = raw as Record<string, unknown>;
  const weightUnit = o.weightUnit === "kg" ? "kg" : "lbs";
  const heightUnit = o.heightUnit === "cm" ? "cm" : "ft_in";
  return { weightUnit, heightUnit };
}

export function weightUnitLabel(unit: WeightUnit): string {
  return unit === "kg" ? "kg" : "lbs";
}

export function heightUnitLabel(unit: HeightDisplayUnit): string {
  return unit === "cm" ? "cm" : "ft + in";
}

/** Format canonical lbs for display in the user's weight unit. */
export function formatWeightFromLbs(lbs: number, unit: WeightUnit, decimals = 1): string {
  if (!Number.isFinite(lbs)) return "—";
  if (unit === "kg") return (lbs / LBS_PER_KG).toFixed(decimals);
  return lbs.toFixed(decimals);
}

/** Parse user-entered weight in their unit → canonical lbs. */
export function parseWeightToLbs(value: number, unit: WeightUnit): number {
  if (!Number.isFinite(value)) return NaN;
  return unit === "kg" ? value * LBS_PER_KG : value;
}

/** Valid display-range for weigh-in input (roughly 70–450 lb). */
export function isValidWeighInLbs(lbs: number): boolean {
  return Number.isFinite(lbs) && lbs >= 70 && lbs <= 450;
}

export function formatHeightFromInches(inches: number, unit: HeightDisplayUnit): string {
  if (!Number.isFinite(inches) || inches <= 0) return "—";
  if (unit === "cm") return String(Math.round(inches / IN_PER_CM));
  const ft = Math.floor(inches / 12);
  const inch = Math.round(inches % 12);
  return `${ft}'${inch}"`;
}

export function inchesFromCm(cm: number): number | null {
  if (!Number.isFinite(cm) || cm <= 0) return null;
  return cm * IN_PER_CM;
}

export function cmFromInches(inches: number): number {
  return inches / IN_PER_CM;
}

export function formatSetWeight(wLbs: number, unit: WeightUnit): string {
  if (!Number.isFinite(wLbs) || wLbs <= 0) return "";
  return formatWeightFromLbs(wLbs, unit, unit === "kg" ? 1 : 0);
}

export function parseSetWeightInput(raw: string, unit: WeightUnit): number {
  const n = parseFloat(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return unit === "kg" ? parseWeightToLbs(n, "kg") : n;
}

export function formatWeeklyRateLbsPerWeek(lbsPerWeek: number, unit: WeightUnit): string {
  if (unit === "kg") {
    const kg = lbsPerWeek / LBS_PER_KG;
    return `${kg >= 0 ? "" : ""}${kg.toFixed(2)} kg/wk`;
  }
  return `${lbsPerWeek.toFixed(2)} lb/wk`;
}

export function formatWeightDeltaLbs(deltaLbs: number, unit: WeightUnit): string {
  const sign = deltaLbs >= 0 ? "+" : "";
  if (unit === "kg") {
    return `${sign}${(deltaLbs / LBS_PER_KG).toFixed(1)} kg`;
  }
  return `${sign}${deltaLbs.toFixed(1)} lbs`;
}
