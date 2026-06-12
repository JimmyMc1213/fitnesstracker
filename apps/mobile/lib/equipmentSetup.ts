import type { EquipmentSetup } from "@newyouai/types";

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
  home_gym: "Rack, barbell, dumbbells, and bench, no large machines",
  dumbbells_only: "Adjustable or fixed dumbbells and a bench",
  bodyweight_only: "No equipment, bodyweight and pull-up bar if available",
};
