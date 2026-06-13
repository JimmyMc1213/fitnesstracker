import type { FoodSearchResult } from "@newyouai/types";

import { CURATED_FOODS, type CuratedFood } from "./curatedFoods";
import { FOOD_SEARCH_MIN_QUERY_LEN } from "./foodSearchGuards";

export function filterCuratedFoods(query: string): CuratedFood[] {
  const q = query.trim().toLowerCase();
  if (q.length < FOOD_SEARCH_MIN_QUERY_LEN) return [];
  return CURATED_FOODS.filter((food) => food.keywords.some((kw) => kw.toLowerCase().includes(q)));
}

export function curatedDefaultServingMacros(food: CuratedFood) {
  const factor = food.defaultServing.grams / 100;
  return {
    cal: Math.round(food.per100g.cal * factor),
    p: Math.round(food.per100g.p * factor * 10) / 10,
    c: Math.round(food.per100g.c * factor * 10) / 10,
    f: Math.round(food.per100g.f * factor * 10) / 10,
  };
}

export function curatedToSearchResult(food: CuratedFood): FoodSearchResult {
  return {
    id: food.id,
    name: food.name,
    defaultServing: food.defaultServing.label,
    baseGrams: 100,
    cal: food.per100g.cal,
    p: food.per100g.p,
    c: food.per100g.c,
    f: food.per100g.f,
    source: "curated",
    externalId: food.id,
    servings: [],
  };
}
