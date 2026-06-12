import type { MacroTotals } from "./macros";

/** One manually logged fuel row for a calendar day (Nutrition tab). */
export type NutritionLoggedItem = MacroTotals & {
  id: string;
  /** Optional label (e.g. meal or food name). */
  name: string;
  /** Human-readable portion (e.g. "1 cup"). */
  servingLabel?: string;
  /** Origin of the row (e.g. manual, catalog). */
  source?: string;
  /** Stable id from an external food database when linked. */
  externalId?: string;
  /** When the row was logged (ms since epoch); used for recency UI. */
  loggedAtMs?: number;
};

/** User-starred food for one-tap re-log (Favorite foods tab). */
export type NutritionPreset = MacroTotals & {
  id: string;
  name: string;
  /** When the user last logged this favorite. */
  lastUsedAtMs: number;
  /** When the user tapped the favorite button; required to appear in Favorite foods. */
  favoritedAtMs: number;
  servingLabel?: string;
  /** Optional coaching / portion notes (e.g. cooked vs raw weight). */
  notes?: string;
};

/** User-owned food library entry (manual or saved from search). */
export type NutritionUserFood = MacroTotals & {
  id: string;
  name: string;
  servingLabel?: string;
  source?: string;
  externalId?: string;
  savedAtMs: number;
  updatedAtMs?: number;
};

/** One ingredient in a saved meal prep recipe. */
export type NutritionMealItem = MacroTotals & {
  id: string;
  name: string;
  servingLabel?: string;
  source?: string;
  externalId?: string;
};

/** Saved meal prep recipe (composite of ingredients). */
export type NutritionMeal = {
  id: string;
  name: string;
  items: NutritionMealItem[];
  createdAtMs: number;
  updatedAtMs?: number;
};

export type FoodItem = MacroTotals & {
  id: string;
  name: string;
  qty: string;
};

/** One food entry in the day's log (order by `loggedAtMs`, newest first in UI). */
export type LoggedFood = FoodItem & {
  loggedAtMs: number;
};
