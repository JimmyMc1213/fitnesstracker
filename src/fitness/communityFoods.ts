import {
  computeServingMultiplier,
  getBaseGrams,
  inferMeasurementFromServing,
  parseServingLabel,
} from "./foodMeasurements";
import { normalizeBarcodeDigits } from "./foodSearchService";
import { scaleMacros } from "./foodSearchMacros";
import type { FoodSearchResult } from "./foodSearchTypes";
import { getServingDefault } from "./servingDefaults";
import { getSupabase, isSupabaseConfigured } from "./supabaseClient";

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

async function upsertCommunityFood(barcode: string, food: FoodSearchResult): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const sb = getSupabase();
  if (!sb) return;

  const {
    data: { session },
  } = await sb.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return;

  const row = communityFoodRowFromSearchResult(barcode, food);
  if (!row) return;

  await sb.from("community_foods").upsert({ ...row, submitted_by: userId }, { onConflict: "barcode" });
}

/** Fire-and-forget upsert into community_foods after a successful OFF barcode lookup. */
export function submitCommunityFoodFromBarcodeScan(barcode: string, food: FoodSearchResult): void {
  void upsertCommunityFood(barcode, food).catch(() => {
    /* silent background write */
  });
}
