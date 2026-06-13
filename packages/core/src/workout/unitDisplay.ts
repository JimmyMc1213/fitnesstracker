import type { WeightUnit } from "@newyouai/types";

export const LBS_PER_KG = 2.2046226218;

export function weightUnitLabel(unit: WeightUnit): string {
  return unit === "kg" ? "kg" : "lbs";
}

function formatWeightFromLbs(lbs: number, unit: WeightUnit, decimals = 1): string {
  if (!Number.isFinite(lbs)) return ", ";
  if (unit === "kg") return (lbs / LBS_PER_KG).toFixed(decimals);
  return lbs.toFixed(decimals);
}

/** Format canonical lbs for display in the user's weight unit. */
export function formatSetWeight(wLbs: number, unit: WeightUnit): string {
  if (!Number.isFinite(wLbs) || wLbs <= 0) return "";
  return formatWeightFromLbs(wLbs, unit, unit === "kg" ? 1 : 0);
}

export function formatWeeklyRateLbsPerWeek(lbsPerWeek: number, unit: WeightUnit): string {
  if (unit === "kg") {
    const kg = lbsPerWeek / LBS_PER_KG;
    return `${kg.toFixed(2)} kg/wk`;
  }
  return `${lbsPerWeek.toFixed(2)} lb/wk`;
}
