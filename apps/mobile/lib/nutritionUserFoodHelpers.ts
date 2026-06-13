import type { FoodSearchResult, NutritionPreset, NutritionUserFood } from "@newyouai/types";

import { CURATED_FOODS, type CuratedFood } from "./curatedFoods";
import { curatedToSearchResult } from "./curatedFoodSearch";

export const DEFAULT_SERVING_LABEL = "1 serving";

export function userFoodToSearchResult(food: NutritionUserFood): FoodSearchResult {
  if (food.source === "curated" && food.externalId) {
    const curated = CURATED_FOODS.find((f) => f.id === food.externalId);
    if (curated) return curatedToSearchResult(curated);
  }

  return {
    id: food.id,
    name: food.name.trim() || "Food",
    cal: Number(food.cal) || 0,
    p: Number(food.p) || 0,
    c: Number(food.c) || 0,
    f: Number(food.f) || 0,
    defaultServing: food.servingLabel?.trim() || DEFAULT_SERVING_LABEL,
    source: food.source ?? "manual",
    externalId: food.externalId ?? food.id,
    servings: [],
  };
}

export function resolveCuratedForUserFood(food: NutritionUserFood): CuratedFood | undefined {
  if (food.source !== "curated" || !food.externalId) return undefined;
  return CURATED_FOODS.find((f) => f.id === food.externalId);
}

export function favoriteInputFromUserFood(food: NutritionUserFood) {
  return {
    name: food.name,
    cal: Number(food.cal) || 0,
    p: Number(food.p) || 0,
    c: Number(food.c) || 0,
    f: Number(food.f) || 0,
    servingLabel: food.servingLabel?.trim(),
  };
}

export function favoriteInputFromPreset(preset: NutritionPreset) {
  return {
    name: preset.name.trim() || "Food",
    cal: Number(preset.cal) || 0,
    p: Number(preset.p) || 0,
    c: Number(preset.c) || 0,
    f: Number(preset.f) || 0,
    servingLabel: preset.servingLabel?.trim(),
  };
}

export function formatUserFoodSubtitle(food: NutritionUserFood): string {
  const cal = Math.round(Number(food.cal) || 0);
  const serving = food.servingLabel?.trim() || DEFAULT_SERVING_LABEL;
  return `${cal} cal · ${serving}`;
}

export function formatPresetSubtitle(preset: NutritionPreset): string {
  const cal = Math.round(Number(preset.cal) || 0);
  const serving =
    preset.servingLabel?.trim() || `${Math.round(Number(preset.p) || 0)}g protein`;
  return `${cal} cal · ${serving}`;
}
