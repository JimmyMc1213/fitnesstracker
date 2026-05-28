import { parseServingLabel } from "./foodMeasurements";
import { getSupabase, isSupabaseConfigured } from "./supabaseClient";
import { sanitizeFoodSearchQuery } from "./foodSearchGuards";
import type { FoodSearchErrorResponse, FoodSearchResponse, FoodSearchResult } from "./foodSearchTypes";

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

export class FoodSearchError extends Error {
  constructor(
    message: string,
    readonly code?: "auth_required" | "rate_limited" | "unavailable",
  ) {
    super(message);
    this.name = "FoodSearchError";
  }
}

function parseResults(data: unknown): FoodSearchResult[] {
  if (!data || typeof data !== "object") return [];
  const err = data as FoodSearchErrorResponse;
  if (typeof err.error === "string" && err.error.trim()) {
    throw new FoodSearchError(err.error.trim());
  }
  const body = data as FoodSearchResponse;
  if (!Array.isArray(body.results)) return [];
  return body.results.filter(
    (row) => row && typeof row.name === "string" && typeof row.externalId === "string",
  ) as FoodSearchResult[];
}

/** E2E preview builds set VITE_E2E_MOCK_FOOD_SEARCH=true to avoid live Supabase calls. */
function e2eMockResults(query: string): FoodSearchResult[] | null {
  if (import.meta.env.VITE_E2E_MOCK_FOOD_SEARCH !== "true") return null;
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

function parseInvokeError(data: unknown, invokeError: { message?: string } | null): never {
  const body = data && typeof data === "object" ? (data as FoodSearchErrorResponse) : null;
  const message = body?.error?.trim() || invokeError?.message?.trim() || "Food search failed.";

  if (/sign in to search/i.test(message)) {
    throw new FoodSearchError(message, "auth_required");
  }
  if (/too many food searches/i.test(message)) {
    throw new FoodSearchError(message, "rate_limited");
  }
  throw new FoodSearchError(message, "unavailable");
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
    throw new FoodSearchError("Supabase is not configured. Check your .env file.", "unavailable");
  }

  const sb = getSupabase();
  if (!sb) {
    throw new FoodSearchError("Supabase client unavailable.", "unavailable");
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session?.user) {
    throw new FoodSearchError("Sign in to search the food database.", "auth_required");
  }

  const { data, error } = await sb.functions.invoke("food-search", {
    body: { query: q },
  });

  if (error || (data && typeof data === "object" && "error" in data && typeof (data as FoodSearchErrorResponse).error === "string")) {
    parseInvokeError(data, error);
  }

  return cacheResults(q, parseResults(data));
}

function offNum(raw: unknown): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function mapOffProduct(raw: Record<string, unknown>): FoodSearchResult | null {
  const code = raw.code ?? raw._id;
  const externalId = code != null ? String(code) : "";
  const name =
    (typeof raw.product_name === "string" && raw.product_name.trim()) ||
    (typeof raw.product_name_en === "string" && raw.product_name_en.trim()) ||
    "";
  if (!externalId || !name) return null;

  const brandsRaw = typeof raw.brands === "string" ? raw.brands.trim() : "";
  const brand = brandsRaw ? brandsRaw.split(",")[0]?.trim() : undefined;

  const nutriments = (raw.nutriments ?? {}) as Record<string, unknown>;
  const per100g = offNum(nutriments["energy-kcal_100g"]) || offNum(nutriments.energy_kcal_100g);
  const cal = Math.round(per100g);
  const p = Math.round(offNum(nutriments.proteins_100g) * 10) / 10;
  const c = Math.round(offNum(nutriments.carbohydrates_100g) * 10) / 10;
  const f = Math.round(offNum(nutriments.fat_100g) * 10) / 10;

  const servingSizeRaw = typeof raw.serving_size === "string" ? raw.serving_size.trim() : "";
  const servingQuantity = offNum(raw.serving_quantity);
  const servingUnit = typeof raw.serving_quantity_unit === "string" ? raw.serving_quantity_unit.trim() : "g";

  let defaultServing = "100 g";
  let baseGrams = 100;
  if (servingSizeRaw) {
    defaultServing = servingSizeRaw;
    const parsed = parseServingLabel(servingSizeRaw);
    if (parsed?.grams && parsed.grams > 0) baseGrams = parsed.grams;
  } else if (servingQuantity > 0) {
    defaultServing = `${servingQuantity} ${servingUnit}`;
    const parsed = parseServingLabel(defaultServing);
    if (parsed?.grams && parsed.grams > 0) baseGrams = parsed.grams;
  }

  const multiplierFrom100g = baseGrams / 100;
  const servingCal = Math.round(cal * multiplierFrom100g);
  const servingP = Math.round(p * multiplierFrom100g * 10) / 10;
  const servingC = Math.round(c * multiplierFrom100g * 10) / 10;
  const servingF = Math.round(f * multiplierFrom100g * 10) / 10;

  const servings = [
    { label: `½ ${defaultServing}`, multiplier: 0.5 },
    { label: defaultServing, multiplier: 1 },
    { label: `2× ${defaultServing}`, multiplier: 2 },
  ];

  return {
    id: `off-${externalId}`,
    name: name.trim(),
    ...(brand ? { brand } : {}),
    cal: servingCal,
    p: servingP,
    c: servingC,
    f: servingF,
    defaultServing,
    baseGrams,
    source: "off",
    externalId,
    servings,
  };
}

/** Look up a packaged food by UPC/EAN via Open Food Facts. */
export async function lookupFoodByBarcode(barcode: string): Promise<FoodSearchResult | null> {
  const code = barcode.trim().replace(/\s/g, "");
  if (code.length < 8) return null;

  const url = new URL(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}`);
  url.searchParams.set(
    "fields",
    "code,product_name,product_name_en,brands,serving_size,serving_quantity,serving_quantity_unit,nutriments",
  );

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "Fitcoach/1.0 (barcode lookup)" },
  });
  if (!res.ok) return null;

  const payload = (await res.json()) as { status?: number; product?: Record<string, unknown> };
  if (payload.status !== 1 || !payload.product) return null;
  return mapOffProduct(payload.product);
}

/** Debounce helper for search input (~300ms). */
export function debounceFoodSearch<T extends (...args: [string]) => void>(
  fn: T,
  ms = 300,
): T & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const wrapped = ((query: string) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(query), ms);
  }) as T & { cancel: () => void };
  wrapped.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
  };
  return wrapped;
}
