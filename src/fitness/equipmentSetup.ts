import type { EquipmentSetup } from "./types";

export const DEFAULT_EQUIPMENT_SETUP: EquipmentSetup = "full_gym";

export const EQUIPMENT_SETUP_OPTIONS: EquipmentSetup[] = [
  "full_gym",
  "home_gym",
  "dumbbells_only",
  "bodyweight_only",
];

export const EQUIPMENT_SETUP_LABELS: Record<EquipmentSetup, string> = {
  full_gym: "Full gym",
  home_gym: "Home gym",
  dumbbells_only: "Dumbbells only",
  bodyweight_only: "Bodyweight only",
};

export const EQUIPMENT_SETUP_DESCRIPTIONS: Record<EquipmentSetup, string> = {
  full_gym: "Barbells, machines, cables, and free weights",
  home_gym: "Rack, barbell, dumbbells, and bench — no large machines",
  dumbbells_only: "Adjustable or fixed dumbbells and a bench",
  bodyweight_only: "No equipment — bodyweight and pull-up bar if available",
};

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
