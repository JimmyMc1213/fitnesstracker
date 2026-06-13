import {
  computeServingMultiplier,
  getBaseGrams,
  getServingDefault,
  inferMeasurementFromServing,
  parseServingLabel,
  scaleMacros,
} from "@newyouai/core";
import { normalizeBarcodeDigits } from "@newyouai/api-client";
import type { FoodSearchResult } from "@newyouai/types";

import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export type CommunityFoodRow = {
  barcode: string;
  name: string;
  brand: string | null;
  serving_label: string;
  serving_grams: number;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  submitted_by: string;
};

/** Match the default serving used when logging a scanned food without opening the picker. */
export function communityFoodRowFromSearchResult(
  barcode: string,
  food: FoodSearchResult,
): Omit<CommunityFoodRow, "submitted_by"> | null {
  const normalizedBarcode = normalizeBarcodeDigits(barcode);
  if (!normalizedBarcode) return null;

  const baseGrams = getBaseGrams(food);
  const smart = getServingDefault(food.name);
  const measurement = smart
    ? inferMeasurementFromServing("smart-default", smart.label, smart.grams, smart.label)
    : (() => {
        const parsed = parseServingLabel(food.defaultServing);
        const grams = parsed?.grams && parsed.grams > 0 ? parsed.grams : baseGrams;
        const label = food.defaultServing.trim() || `${grams} g`;
        return inferMeasurementFromServing("primary-serving", label, grams, label);
      })();

  const quantity = measurement.defaultQuantity;
  const multiplier = computeServingMultiplier(measurement, quantity, baseGrams);
  const macros = scaleMacros(food, multiplier);
  const servingGrams = quantity * measurement.gramsPerUnit;
  if (!Number.isFinite(servingGrams) || servingGrams <= 0) return null;

  const servingLabel = smart?.label ?? (food.defaultServing.trim() || `${Math.round(servingGrams)} g`);

  return {
    barcode: normalizedBarcode,
    name: food.name.trim() || "Food",
    brand: food.brand?.trim() || null,
    serving_label: servingLabel,
    serving_grams: Math.round(servingGrams * 10) / 10,
    cal: macros.cal,
    protein: macros.p,
    carbs: macros.c,
    fat: macros.f,
  };
}

function logCommunityFoodSaveFailure(err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  console.warn("[Fitcoach] community_foods save failed:", msg);
}

async function upsertCommunityFood(barcode: string, food: FoodSearchResult): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const sb = getSupabase();
  if (!sb) return;

  const {
    data: { user },
    error: authError,
  } = await sb.auth.getUser();
  const userId = user?.id;
  if (authError || !userId) return;

  const row = communityFoodRowFromSearchResult(barcode, food);
  if (!row) return;

  const { error } = await sb
    .from("community_foods")
    .upsert({ ...row, submitted_by: userId }, { onConflict: "barcode" });

  if (error) throw new Error(error.message);
}

/** Fire-and-forget upsert into community_foods after a successful OFF barcode lookup. */
export function submitCommunityFoodFromBarcodeScan(barcode: string, food: FoodSearchResult): void {
  void upsertCommunityFood(barcode, food).catch((err) => {
    logCommunityFoodSaveFailure(err);
  });
}
