import { LBS_PER_KG } from "@newyouai/core";
import type { WeightUnit } from "@newyouai/types";

function parseWeightToLbs(value: number, unit: WeightUnit): number {
  return unit === "kg" ? value * LBS_PER_KG : value;
}

export function parseSetWeightInput(raw: string, unit: WeightUnit): number {
  const n = parseFloat(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return unit === "kg" ? parseWeightToLbs(n, "kg") : n;
}
