import { appendNutritionLoggedItem, buildNutritionLoggedItem, newNutritionItemId } from "./nutritionLog";
import type {
  AppState,
  MacroTotals,
  NutritionLoggedItem,
  NutritionMeal,
  NutritionMealItem,
  NutritionPreset,
  NutritionUserFood,
} from "./types";

const MAX_NUTRITION_MEALS = 100;

function normalizeMealItem(raw: unknown, index: number): NutritionMealItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === "string" ? r.name.trim() : "";
  if (!name) return null;
  const id = typeof r.id === "string" && r.id ? r.id : `meal-item-${index}`;
  const servingLabel =
    typeof r.servingLabel === "string" && r.servingLabel.trim() ? r.servingLabel.trim() : undefined;
  const source = typeof r.source === "string" && r.source.trim() ? r.source.trim() : undefined;
  const externalId =
    typeof r.externalId === "string" && r.externalId.trim() ? r.externalId.trim() : undefined;
  return {
    id,
    name,
    cal: Number(r.cal) || 0,
    p: Number(r.p) || 0,
    c: Number(r.c) || 0,
    f: Number(r.f) || 0,
    ...(servingLabel ? { servingLabel } : {}),
    ...(source ? { source } : {}),
    ...(externalId ? { externalId } : {}),
  };
}

/** Normalize persisted meal library rows; invalid entries are dropped. */
export function normalizeNutritionMeals(raw: unknown): NutritionMeal[] {
  if (!Array.isArray(raw)) return [];
  const byId = new Map<string, NutritionMeal>();
  for (let i = 0; i < raw.length; i++) {
    const o = raw[i];
    if (!o || typeof o !== "object") continue;
    const r = o as Record<string, unknown>;
    const name = typeof r.name === "string" ? r.name.trim() : "";
    if (!name) continue;
    const id = typeof r.id === "string" && r.id ? r.id : `meal-${i}`;
    const createdAtMs = typeof r.createdAtMs === "number" ? r.createdAtMs : Date.now() - i * 1000;
    const updatedAtMs = typeof r.updatedAtMs === "number" ? r.updatedAtMs : undefined;
    const itemsRaw = Array.isArray(r.items) ? r.items : [];
    const items = itemsRaw
      .map((item, idx) => normalizeMealItem(item, idx))
      .filter((item): item is NutritionMealItem => item !== null);
    const meal: NutritionMeal = {
      id,
      name,
      items,
      createdAtMs,
      ...(updatedAtMs ? { updatedAtMs } : {}),
    };
    const prev = byId.get(id);
    const mealTs = meal.updatedAtMs ?? meal.createdAtMs;
    const prevTs = prev ? (prev.updatedAtMs ?? prev.createdAtMs) : -1;
    if (!prev || mealTs >= prevTs) byId.set(id, meal);
  }
  return [...byId.values()]
    .sort((a, b) => (b.updatedAtMs ?? b.createdAtMs) - (a.updatedAtMs ?? a.createdAtMs))
    .slice(0, MAX_NUTRITION_MEALS);
}

/** Sum macros across meal ingredients. */
export function sumMealMacros(items: NutritionMealItem[]): MacroTotals {
  return items.reduce(
    (acc, item) => ({
      cal: acc.cal + (Number(item.cal) || 0),
      p: acc.p + (Number(item.p) || 0),
      c: acc.c + (Number(item.c) || 0),
      f: acc.f + (Number(item.f) || 0),
    }),
    { cal: 0, p: 0, c: 0, f: 0 },
  );
}

/** Human-readable composite serving label for a logged meal row. */
export function formatMealServingLabel(items: NutritionMealItem[]): string | undefined {
  const count = items.length;
  if (count <= 0) return undefined;
  if (count === 1) return items[0]?.servingLabel?.trim() || "1 ingredient";
  return `${count} ingredients`;
}

export function mealItemFromUserFood(food: NutritionUserFood): NutritionMealItem {
  return {
    id: newNutritionItemId(),
    name: food.name.trim() || "Food",
    cal: Number(food.cal) || 0,
    p: Number(food.p) || 0,
    c: Number(food.c) || 0,
    f: Number(food.f) || 0,
    ...(food.servingLabel?.trim() ? { servingLabel: food.servingLabel.trim() } : {}),
    ...(food.source?.trim() ? { source: food.source.trim() } : {}),
    ...(food.externalId?.trim() ? { externalId: food.externalId.trim() } : {}),
  };
}

export function mealItemFromPreset(preset: NutritionPreset): NutritionMealItem {
  return {
    id: newNutritionItemId(),
    name: preset.name.trim() || "Food",
    cal: Number(preset.cal) || 0,
    p: Number(preset.p) || 0,
    c: Number(preset.c) || 0,
    f: Number(preset.f) || 0,
    ...(preset.servingLabel?.trim() ? { servingLabel: preset.servingLabel.trim() } : {}),
  };
}

export function upsertNutritionMeal(
  meals: NutritionMeal[],
  input: Omit<NutritionMeal, "createdAtMs" | "updatedAtMs"> & { id?: string; createdAtMs?: number },
): NutritionMeal[] {
  const now = Date.now();
  const id = input.id ?? newNutritionItemId();
  const existing = meals.find((m) => m.id === id);
  const row: NutritionMeal = {
    id,
    name: input.name.trim() || "Meal",
    items: input.items ?? [],
    createdAtMs: existing?.createdAtMs ?? input.createdAtMs ?? now,
    updatedAtMs: now,
  };
  const next = [row, ...meals.filter((m) => m.id !== id)];
  next.sort((a, b) => (b.updatedAtMs ?? b.createdAtMs) - (a.updatedAtMs ?? a.createdAtMs));
  return next.slice(0, MAX_NUTRITION_MEALS);
}

export function appendNutritionMeal(
  state: AppState,
  meal: Omit<NutritionMeal, "createdAtMs" | "updatedAtMs"> & { createdAtMs?: number },
): AppState {
  return {
    ...state,
    nutritionMeals: upsertNutritionMeal(state.nutritionMeals ?? [], meal),
  };
}

export function updateNutritionMeal(
  state: AppState,
  mealId: string,
  patch: Partial<Pick<NutritionMeal, "name" | "items">>,
): AppState {
  const existing = (state.nutritionMeals ?? []).find((m) => m.id === mealId);
  if (!existing) return state;
  return appendNutritionMeal(state, {
    id: mealId,
    name: typeof patch.name === "string" ? patch.name : existing.name,
    items: patch.items ?? existing.items,
  });
}

export function removeNutritionMeal(state: AppState, mealId: string): AppState {
  return {
    ...state,
    nutritionMeals: (state.nutritionMeals ?? []).filter((m) => m.id !== mealId),
  };
}

export function buildLoggedItemFromMeal(meal: NutritionMeal): NutritionLoggedItem {
  const macros = sumMealMacros(meal.items);
  const servingLabel = formatMealServingLabel(meal.items);
  return buildNutritionLoggedItem(macros, meal.name.trim() || "Meal", {
    loggedAtMs: Date.now(),
    ...(servingLabel ? { servingLabel } : {}),
    source: "meal",
  });
}

/** Log a saved meal as one composite fuel row for today. */
export function logNutritionMealToDay(state: AppState, dateKey: string, meal: NutritionMeal): AppState {
  return appendNutritionLoggedItem(state, dateKey, buildLoggedItemFromMeal(meal));
}

export function mergeNutritionMeals(a: NutritionMeal[], b: NutritionMeal[]): NutritionMeal[] {
  const byId = new Map<string, NutritionMeal>();
  for (const m of [...a, ...b]) {
    const prev = byId.get(m.id);
    const mTs = m.updatedAtMs ?? m.createdAtMs;
    const prevTs = prev ? (prev.updatedAtMs ?? prev.createdAtMs) : -1;
    if (!prev || mTs >= prevTs) byId.set(m.id, m);
  }
  return [...byId.values()]
    .sort((x, y) => (y.updatedAtMs ?? y.createdAtMs) - (x.updatedAtMs ?? x.createdAtMs))
    .slice(0, MAX_NUTRITION_MEALS);
}
