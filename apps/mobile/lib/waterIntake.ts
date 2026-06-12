import type { VolumeUnit } from "@newyouai/types";

export const DEFAULT_WATER_DAILY_TARGET_OZ = 64;

const FL_OZ_TO_L = 0.0295735;

export function formatWaterVolume(oz: number, unit: VolumeUnit): string {
  if (!Number.isFinite(oz)) return "—";
  if (unit === "L") return `${(oz * FL_OZ_TO_L).toFixed(1)} L`;
  return `${Math.round(oz)} oz`;
}
