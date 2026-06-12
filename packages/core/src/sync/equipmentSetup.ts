import type { EquipmentSetup } from "@newyouai/types";

export const DEFAULT_EQUIPMENT_SETUP: EquipmentSetup = "full_gym";

export function normalizeEquipmentSetup(raw: unknown): EquipmentSetup {
  if (
    raw === "full_gym" ||
    raw === "home_gym" ||
    raw === "dumbbells_only" ||
    raw === "bodyweight_only"
  ) {
    return raw;
  }
  return DEFAULT_EQUIPMENT_SETUP;
}
