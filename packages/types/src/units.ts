export type WeightUnit = "lbs" | "kg";

/** Height entry/display mode, canonical storage is always inches (`heightIn`). */
export type HeightDisplayUnit = "ft_in" | "cm";

/** Hydration entry/display mode, canonical storage is always fluid ounces (`amountOz`). */
export type VolumeUnit = "oz" | "L";

export type UnitPreferences = {
  weightUnit: WeightUnit;
  heightUnit: HeightDisplayUnit;
  volumeUnit: VolumeUnit;
};
