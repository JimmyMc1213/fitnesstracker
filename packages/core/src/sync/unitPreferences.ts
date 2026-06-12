import type { UnitPreferences } from "@newyouai/types";

export const DEFAULT_UNIT_PREFERENCES: UnitPreferences = {
  weightUnit: "lbs",
  heightUnit: "ft_in",
  volumeUnit: "oz",
};

export function normalizeUnitPreferences(raw: unknown): UnitPreferences {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_UNIT_PREFERENCES };
  const o = raw as Record<string, unknown>;
  const weightUnit = o.weightUnit === "kg" ? "kg" : "lbs";
  const heightUnit = o.heightUnit === "cm" ? "cm" : "ft_in";
  const volumeUnit = o.volumeUnit === "L" ? "L" : "oz";
  return { weightUnit, heightUnit, volumeUnit };
}
