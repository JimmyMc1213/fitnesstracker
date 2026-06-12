import type { HeightDisplayUnit, VolumeUnit, WeightUnit } from "@newyouai/types";

export function weightUnitLabel(unit: WeightUnit): string {
  return unit === "kg" ? "kg" : "lbs";
}

export function heightUnitLabel(unit: HeightDisplayUnit): string {
  return unit === "cm" ? "cm" : "ft + in";
}

export function volumeUnitLabel(unit: VolumeUnit): string {
  return unit === "L" ? "L" : "oz";
}
