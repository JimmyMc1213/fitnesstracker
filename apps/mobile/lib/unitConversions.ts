import type { HeightDisplayUnit, WeightUnit } from "@newyouai/types";

export const LBS_PER_KG = 2.2046226218;
const IN_PER_CM = 0.3937007874;

export function isValidWeighInLbs(lbs: number): boolean {
  return Number.isFinite(lbs) && lbs >= 70 && lbs <= 450;
}

export function parseWeightToLbs(value: number, unit: WeightUnit): number {
  if (!Number.isFinite(value)) return NaN;
  return unit === "kg" ? value * LBS_PER_KG : value;
}

export function formatWeightFromLbs(lbs: number, unit: WeightUnit, decimals = 1): string {
  if (!Number.isFinite(lbs)) return "";
  if (unit === "kg") {
    return (lbs / LBS_PER_KG).toFixed(decimals);
  }
  return lbs.toFixed(decimals);
}

export function lbsFromWeightInputText(text: string, unit: WeightUnit): number {
  if (text === "" || text === ".") return 0;
  const n = parseFloat(text);
  if (!Number.isFinite(n)) return 0;
  const lbs = parseWeightToLbs(n, unit);
  return Number.isFinite(lbs) ? lbs : 0;
}

export function inchesFromCm(cm: number): number | null {
  if (!Number.isFinite(cm) || cm <= 0) return null;
  return cm * IN_PER_CM;
}

export function cmFromInches(inches: number): number {
  return inches / IN_PER_CM;
}

export function isValidOnboardingHeightIn(heightIn: number): boolean {
  return heightIn >= 48 && heightIn <= 96;
}

export const DEFAULT_ONBOARDING_CURRENT_WEIGHT_LBS = 160;
