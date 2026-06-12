import type { MacroTotals } from "./macros";

/** One selectable portion for a catalog food (multiplier scales base macros). */
export type FoodServing = {
  label: string;
  multiplier: number;
};

/** One measurement unit the user can log food in (g, oz, cup, etc.). */
export type FoodMeasurement = {
  id: string;
  label: string;
  unitSuffix: string;
  /** Gram weight represented by one unit of this measurement. */
  gramsPerUnit: number;
  defaultQuantity: number;
};

/** Normalized row from USDA (via Edge Function). */
export type FoodSearchResult = MacroTotals & {
  id: string;
  name: string;
  brand?: string;
  defaultServing: string;
  /** Gram weight that base macros refer to (defaults from defaultServing). */
  baseGrams?: number;
  /** Extra portion labels from USDA (e.g. household serving text). */
  portionLabels?: string[];
  source: string;
  externalId: string;
  servings: FoodServing[];
};

export type FoodSearchResponse = {
  results: FoodSearchResult[];
};

export type FoodSearchErrorResponse = {
  error: string;
};
