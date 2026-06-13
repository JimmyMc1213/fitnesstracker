import {
  FoodSearchError as ApiFoodSearchError,
  lookupFoodByBarcode as lookupFoodByBarcodeApi,
  searchFood as searchFoodApi,
} from "@newyouai/api-client";
import type { FoodSearchResult } from "@newyouai/types";

import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";

import { sanitizeFoodSearchQuery } from "./foodSearchGuards";

/** Max merged USDA + OFF rows returned to the UI (matches Edge Function cap). */
export const FOOD_SEARCH_RESULT_LIMIT = 20;

const searchCache = new Map<string, FoodSearchResult[]>();
const MAX_CACHE_ENTRIES = 32;

export function clearFoodSearchCache(): void {
  searchCache.clear();
}

function cacheResults(query: string, results: FoodSearchResult[]): FoodSearchResult[] {
  const limited = results.slice(0, FOOD_SEARCH_RESULT_LIMIT);
  const key = query.toLowerCase();
  searchCache.set(key, limited);
  if (searchCache.size > MAX_CACHE_ENTRIES) {
    const oldest = searchCache.keys().next().value;
    if (oldest !== undefined) searchCache.delete(oldest);
  }
  return limited;
}

export { ApiFoodSearchError as FoodSearchError };

/** E2E preview builds set EXPO_PUBLIC_E2E_MOCK_FOOD_SEARCH=true to avoid live Supabase calls. */
function e2eMockResults(query: string): FoodSearchResult[] | null {
  if (process.env.EXPO_PUBLIC_E2E_MOCK_FOOD_SEARCH !== "true") return null;
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  if (!q.includes("chicken")) return [];
  return [
    {
      id: "usda-e2e-1",
      name: "Grilled chicken breast",
      cal: 165,
      p: 31,
      c: 0,
      f: 3.6,
      defaultServing: "100 g",
      baseGrams: 100,
      source: "usda",
      externalId: "e2e-1",
      servings: [
        { label: "½ 100 g", multiplier: 0.5 },
        { label: "100 g", multiplier: 1 },
        { label: "2× 100 g", multiplier: 2 },
      ],
    },
  ];
}

function e2eMockBarcodeLookup(barcode: string): FoodSearchResult | null {
  if (process.env.EXPO_PUBLIC_E2E_MOCK_FOOD_SEARCH !== "true") return null;
  const digits = barcode.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return {
    id: "off-e2e-barcode",
    name: "E2E Barcode Product",
    cal: 200,
    p: 15,
    c: 20,
    f: 8,
    defaultServing: "1 bar",
    baseGrams: 60,
    source: "off",
    externalId: digits,
    servings: [
      { label: "½ 1 bar", multiplier: 0.5 },
      { label: "1 bar", multiplier: 1 },
      { label: "2× 1 bar", multiplier: 2 },
    ],
  };
}

/** Call Supabase Edge Function `food-search` (USDA + Open Food Facts). Requires sign-in. */
export async function searchFoods(query: string): Promise<FoodSearchResult[]> {
  const q = sanitizeFoodSearchQuery(query);
  if (!q) return [];

  const cacheKey = q.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  const mocked = e2eMockResults(q);
  if (mocked !== null) return cacheResults(q, mocked);

  if (!isSupabaseConfigured()) {
    throw new ApiFoodSearchError("Supabase is not configured. Check your .env file.", "unavailable");
  }

  const sb = getSupabase();
  if (!sb) {
    throw new ApiFoodSearchError("Supabase client unavailable.", "unavailable");
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session?.user) {
    throw new ApiFoodSearchError("Sign in to search the food database.", "auth_required");
  }

  const results = await searchFoodApi(sb, q);
  return cacheResults(q, results);
}

/** Look up a packaged food by UPC/EAN via Open Food Facts (direct client fetch). */
export async function lookupFoodByBarcode(barcode: string): Promise<FoodSearchResult | null> {
  const mocked = e2eMockBarcodeLookup(barcode);
  if (mocked !== null) return mocked;
  return lookupFoodByBarcodeApi(barcode);
}
