import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

import {
  badQueryResponse,
  checkFoodSearchRateLimit,
  FOOD_SEARCH_RATE_LIMIT_MAX,
  FOOD_SEARCH_RATE_LIMIT_WINDOW_MS,
  type FoodSearchRateLimitResult,
  rateLimitedResponse,
  sanitizeFoodSearchQuery,
  unauthorizedResponse,
} from "./guards.ts";
import { mergeFoodSearchResults } from "./merge.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type FoodServing = { label: string; multiplier: number };

type FoodSearchResult = {
  id: string;
  name: string;
  brand?: string;
  dataType?: string;
  cal: number;
  p: number;
  c: number;
  f: number;
  defaultServing: string;
  baseGrams?: number;
  portionLabels?: string[];
  source: string;
  externalId: string;
  servings: FoodServing[];
};

type CommunityFoodRow = {
  barcode: string;
  name: string;
  brand: string | null;
  serving_label: string;
  serving_grams: number;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
};

const NUTRIENT_KCAL = new Set([1008, 2047, 2048]);
const NUTRIENT_PROTEIN = 1003;
const NUTRIENT_CARBS = 1005;
const NUTRIENT_FAT = 1004;
const OZ_TO_G = 28.3495;

function nutrientAmount(
  nutrients: { nutrientId?: number; nutrientNumber?: string; value?: number }[] | undefined,
  ids: number | Set<number>,
): number {
  if (!nutrients?.length) return 0;
  for (const n of nutrients) {
    const id = n.nutrientId ?? (n.nutrientNumber ? Number(n.nutrientNumber) : NaN);
    if (typeof ids === "number" ? id === ids : ids.has(id)) {
      const v = Number(n.value);
      return Number.isFinite(v) ? v : 0;
    }
  }
  return 0;
}

function mapUsdaFood(raw: Record<string, unknown>): FoodSearchResult | null {
  const fdcId = raw.fdcId ?? raw.fdc_id;
  const externalId = fdcId != null ? String(fdcId) : "";
  const name = typeof raw.description === "string" ? raw.description.trim() : "";
  if (!externalId || !name) return null;

  const brand =
    typeof raw.brandName === "string" && raw.brandName.trim()
      ? raw.brandName.trim()
      : typeof raw.brandOwner === "string" && raw.brandOwner.trim()
        ? raw.brandOwner.trim()
        : undefined;

  const dataType = typeof raw.dataType === "string" && raw.dataType.trim() ? raw.dataType.trim() : undefined;

  const nutrients = raw.foodNutrients as { nutrientId?: number; nutrientNumber?: string; value?: number }[] | undefined;
  const cal = Math.round(nutrientAmount(nutrients, NUTRIENT_KCAL));
  const p = Math.round(nutrientAmount(nutrients, NUTRIENT_PROTEIN) * 10) / 10;
  const c = Math.round(nutrientAmount(nutrients, NUTRIENT_CARBS) * 10) / 10;
  const f = Math.round(nutrientAmount(nutrients, NUTRIENT_FAT) * 10) / 10;

  const servingSize = Number(raw.servingSize);
  const servingUnit = typeof raw.servingSizeUnit === "string" ? raw.servingSizeUnit.trim() : "";
  const defaultServing =
    Number.isFinite(servingSize) && servingSize > 0 && servingUnit
      ? `${servingSize} ${servingUnit}`
      : "100 g";

  const householdServing =
    typeof raw.householdServingFullText === "string" && raw.householdServingFullText.trim()
      ? raw.householdServingFullText.trim()
      : undefined;

  const parsedDefault = parseServingLabel(defaultServing);
  const baseGrams = parsedDefault?.grams && parsedDefault.grams > 0 ? parsedDefault.grams : 100;

  const portionLabels: string[] = [];
  if (householdServing && householdServing.toLowerCase() !== defaultServing.toLowerCase()) {
    portionLabels.push(householdServing);
  }

  const servings: FoodServing[] = [
    { label: `½ ${defaultServing}`, multiplier: 0.5 },
    { label: defaultServing, multiplier: 1 },
    { label: `2× ${defaultServing}`, multiplier: 2 },
  ];

  return {
    id: `usda-${externalId}`,
    name,
    ...(brand ? { brand } : {}),
    ...(dataType ? { dataType } : {}),
    cal,
    p,
    c,
    f,
    defaultServing,
    baseGrams,
    ...(portionLabels.length ? { portionLabels } : {}),
    source: "usda",
    externalId,
    servings,
  };
}

function offNum(raw: unknown): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Open Food Facts records nutriments either per 100g/100ml or per serving
 * (`nutrition_data_per`). When it is "serving", the `_value` fields already hold
 * per-serving numbers — and OFF frequently mirrors that same per-serving number
 * into the `_100g` slot. Scaling that by baseGrams/100 triple-counts a drink
 * (e.g. a 330 ml coconut water at 60 kcal reports 198).
 */
function offIsPerServingBasis(raw: Record<string, unknown>): boolean {
  const basis =
    typeof raw.nutrition_data_per === "string" ? raw.nutrition_data_per.trim().toLowerCase() : "";
  return basis === "serving";
}

function parseServingLabel(label: string): { quantity: number; unit: string; grams: number | null } | null {
  const trimmed = label.trim();
  if (!trimmed) return null;

  const parenGrams = trimmed.match(/\(\s*([\d.]+)\s*g\s*\)/i);
  if (parenGrams) {
    const grams = parseFloat(parenGrams[1]);
    if (Number.isFinite(grams) && grams > 0) {
      const qtyMatch = trimmed.match(/^([\d.]+)/);
      const quantity = qtyMatch ? parseFloat(qtyMatch[1]) : 1;
      return {
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
        unit: "serving",
        grams,
      };
    }
  }

  const compactGram = trimmed.match(/^([\d.]+)\s*g$/i);
  if (compactGram) {
    const quantity = parseFloat(compactGram[1]);
    if (Number.isFinite(quantity) && quantity > 0) {
      return { quantity, unit: "g", grams: quantity };
    }
  }

  const numericOnly = trimmed.match(/^([\d.]+)$/);
  if (numericOnly) {
    const quantity = parseFloat(numericOnly[1]);
    if (Number.isFinite(quantity) && quantity > 0) {
      return { quantity, unit: "g", grams: quantity };
    }
  }

  const match = trimmed.match(/^([\d.]+)\s*(.+)$/i);
  if (!match) return null;
  const quantity = parseFloat(match[1]);
  const unit = match[2].trim().toLowerCase();
  if (!Number.isFinite(quantity) || quantity <= 0 || !unit) return null;
  let grams: number | null = null;
  if (unit === "g" || unit === "gram" || unit === "grams") grams = quantity;
  else if (unit === "oz" || unit === "ounce" || unit === "ounces") grams = quantity * OZ_TO_G;
  return { quantity, unit, grams };
}

function extractGramsFromServingText(text: string): number | null {
  const parsed = parseServingLabel(text);
  return parsed?.grams && parsed.grams > 0 ? parsed.grams : null;
}

function resolveOffServing(raw: Record<string, unknown>): { defaultServing: string; baseGrams: number } {
  const servingSizeRaw = typeof raw.serving_size === "string" ? raw.serving_size.trim() : "";
  const servingQuantity = offNum(raw.serving_quantity);
  const servingUnit = (
    typeof raw.serving_quantity_unit === "string" ? raw.serving_quantity_unit.trim() : "g"
  ).toLowerCase();

  let defaultServing = "100 g";
  let baseGrams = 100;

  if (servingSizeRaw) {
    defaultServing = servingSizeRaw;
    const grams = extractGramsFromServingText(servingSizeRaw);
    if (grams) baseGrams = grams;
  }

  if (baseGrams === 100 && servingQuantity > 0) {
    if (servingUnit === "g" || servingUnit === "gram" || servingUnit === "grams") {
      baseGrams = servingQuantity;
      if (!servingSizeRaw) defaultServing = `${servingQuantity} g`;
    } else if (servingUnit === "ml") {
      baseGrams = servingQuantity;
      if (!servingSizeRaw) defaultServing = `${servingQuantity} ml`;
    } else {
      const combined = `${servingQuantity} ${servingUnit}`;
      const grams = extractGramsFromServingText(combined);
      if (grams) baseGrams = grams;
      if (!servingSizeRaw) defaultServing = combined;
    }
  }

  return { defaultServing, baseGrams };
}

function resolveOffMacros(
  nutriments: Record<string, unknown>,
  baseGrams: number,
  perServingBasis: boolean,
): { cal: number; p: number; c: number; f: number } {
  const calServing = offNum(nutriments["energy-kcal_serving"]) || offNum(nutriments.energy_kcal_serving);
  const pServing = offNum(nutriments.proteins_serving);
  const cServing = offNum(nutriments.carbohydrates_serving);
  const fServing = offNum(nutriments.fat_serving);

  // 1. Explicit per-serving nutriments are always the most reliable.
  if (calServing > 0) {
    return {
      cal: Math.round(calServing),
      p: round1(pServing),
      c: round1(cServing),
      f: round1(fServing),
    };
  }

  // 2. No explicit per-serving fields, but OFF says the data is entered per
  //    serving: the `_value` (raw entered) fields are per serving. Do NOT scale
  //    them by baseGrams/100 — that is the source of the ~3x inflation.
  if (perServingBasis) {
    const calValue = offNum(nutriments["energy-kcal_value"]) || offNum(nutriments["energy-kcal"]);
    if (calValue > 0) {
      return {
        cal: Math.round(calValue),
        p: round1(offNum(nutriments.proteins_value) || offNum(nutriments.proteins)),
        c: round1(offNum(nutriments.carbohydrates_value) || offNum(nutriments.carbohydrates)),
        f: round1(offNum(nutriments.fat_value) || offNum(nutriments.fat)),
      };
    }
  }

  // 3. Genuine per-100g/100ml data: scale to the serving weight.
  const cal100 = offNum(nutriments["energy-kcal_100g"]) || offNum(nutriments.energy_kcal_100g);
  const p100 = offNum(nutriments.proteins_100g);
  const c100 = offNum(nutriments.carbohydrates_100g);
  const f100 = offNum(nutriments.fat_100g);

  const mult = baseGrams / 100;
  return {
    cal: Math.round(cal100 * mult),
    p: round1(p100 * mult),
    c: round1(c100 * mult),
    f: round1(f100 * mult),
  };
}

function inferOffBaseGrams(nutriments: Record<string, unknown>, baseGrams: number): number {
  if (baseGrams !== 100) return baseGrams;

  const calServing = offNum(nutriments["energy-kcal_serving"]) || offNum(nutriments.energy_kcal_serving);
  const cal100 = offNum(nutriments["energy-kcal_100g"]) || offNum(nutriments.energy_kcal_100g);
  if (calServing <= 0 || cal100 <= 0) return baseGrams;

  const implied = Math.round((calServing / cal100) * 100);
  if (implied >= 15 && implied <= 800) return implied;
  return baseGrams;
}

function mapOffProduct(raw: Record<string, unknown>): FoodSearchResult | null {
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
  const perServingBasis = offIsPerServingBasis(raw);
  const { defaultServing, baseGrams: servingGrams } = resolveOffServing(raw);
  const baseGrams = inferOffBaseGrams(nutriments, servingGrams);
  const { cal: servingCal, p: servingP, c: servingC, f: servingF } = resolveOffMacros(
    nutriments,
    baseGrams,
    perServingBasis,
  );

  const servings: FoodServing[] = [
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

async function searchUsda(query: string, apiKey: string, dataType: string, pageSize: number): Promise<FoodSearchResult[]> {
  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("query", query);
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("dataType", dataType);

  const usdaRes = await fetch(url.toString());
  if (!usdaRes.ok) {
    const detail = await usdaRes.text().catch(() => "");
    console.error("USDA search failed", usdaRes.status, detail.slice(0, 200));
    throw new Error("usda_failed");
  }

  const payload = await usdaRes.json();
  const foods = Array.isArray(payload?.foods) ? payload.foods : [];
  const results: FoodSearchResult[] = [];
  for (const food of foods) {
    if (!food || typeof food !== "object") continue;
    const mapped = mapUsdaFood(food as Record<string, unknown>);
    if (mapped) results.push(mapped);
  }
  return results;
}

async function searchUsdaAll(query: string, apiKey: string): Promise<FoodSearchResult[]> {
  const [generic, branded] = await Promise.all([
    searchUsda(query, apiKey, "Foundation,SR Legacy", 15).catch(() => [] as FoodSearchResult[]),
    searchUsda(query, apiKey, "Branded", 10).catch(() => [] as FoodSearchResult[]),
  ]);
  return [...generic, ...branded];
}

async function searchOff(query: string): Promise<FoodSearchResult[]> {
  const url = new URL("https://world.openfoodfacts.org/api/v2/search");
  url.searchParams.set("search_terms", query);
  url.searchParams.set("page_size", "20");
  url.searchParams.set("fields", "code,product_name,product_name_en,brands,serving_size,serving_quantity,serving_quantity_unit,nutrition_data_per,nutriments");

  const offRes = await fetch(url.toString(), {
    headers: { "User-Agent": "Fitcoach/1.0 (nutrition food search)" },
  });
  if (!offRes.ok) {
    console.error("OFF search failed", offRes.status);
    throw new Error("off_failed");
  }

  const payload = await offRes.json();
  const products = Array.isArray(payload?.products) ? payload.products : [];
  const results: FoodSearchResult[] = [];
  for (const product of products) {
    if (!product || typeof product !== "object") continue;
    const mapped = mapOffProduct(product as Record<string, unknown>);
    if (mapped) results.push(mapped);
  }
  return results;
}

function escapeIlikeTerm(term: string): string {
  return term.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function mapCommunityFood(raw: CommunityFoodRow): FoodSearchResult | null {
  const barcode = typeof raw.barcode === "string" ? raw.barcode.trim() : "";
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!barcode || !name) return null;

  const servingLabel =
    typeof raw.serving_label === "string" && raw.serving_label.trim()
      ? raw.serving_label.trim()
      : "1 serving";
  const servingGrams = Number(raw.serving_grams);
  const baseGrams = Number.isFinite(servingGrams) && servingGrams > 0 ? servingGrams : 100;
  const brand = typeof raw.brand === "string" && raw.brand.trim() ? raw.brand.trim() : undefined;

  return {
    id: `community-${barcode}`,
    name,
    ...(brand ? { brand } : {}),
    cal: Math.round(Number(raw.cal) || 0),
    p: Math.round((Number(raw.protein) || 0) * 10) / 10,
    c: Math.round((Number(raw.carbs) || 0) * 10) / 10,
    f: Math.round((Number(raw.fat) || 0) * 10) / 10,
    defaultServing: servingLabel,
    baseGrams,
    source: "community",
    externalId: barcode,
    servings: [
      { label: `½ ${servingLabel}`, multiplier: 0.5 },
      { label: servingLabel, multiplier: 1 },
      { label: `2× ${servingLabel}`, multiplier: 2 },
    ],
  };
}

async function searchCommunityFoods(
  userClient: ReturnType<typeof createClient>,
  query: string,
): Promise<FoodSearchResult[]> {
  const pattern = `%${escapeIlikeTerm(query)}%`;
  const { data, error } = await userClient
    .from("community_foods")
    .select("barcode,name,brand,serving_label,serving_grams,cal,protein,carbs,fat")
    .or(`name.ilike.${pattern},brand.ilike.${pattern}`)
    .limit(20);

  if (error) {
    console.error("community_foods search failed", error);
    return [];
  }

  const results: FoodSearchResult[] = [];
  for (const row of data ?? []) {
    if (!row || typeof row !== "object") continue;
    const mapped = mapCommunityFood(row as CommunityFoodRow);
    if (mapped) results.push(mapped);
  }
  return results;
}

/**
 * Durable, cross-instance rate limit backed by Postgres (migration 013). Falls
 * back to the per-instance in-memory limiter if the DB function is unavailable,
 * so a transient DB issue can never hard-fail food search.
 */
async function enforceFoodSearchRateLimit(
  userClient: ReturnType<typeof createClient>,
  userId: string,
): Promise<FoodSearchRateLimitResult> {
  try {
    const { data, error } = await userClient.rpc("check_food_search_rate_limit", {
      p_max: FOOD_SEARCH_RATE_LIMIT_MAX,
      p_window_ms: FOOD_SEARCH_RATE_LIMIT_WINDOW_MS,
    });
    if (error) throw error;
    if (data === false) {
      return { allowed: false, retryAfterSec: Math.ceil(FOOD_SEARCH_RATE_LIMIT_WINDOW_MS / 1000) };
    }
    return { allowed: true };
  } catch (e) {
    console.error("food-search: durable rate limit unavailable, using in-memory", e);
    return checkFoodSearchRateLimit(userId);
  }
}

async function resolveAuthenticatedUserClient(
  req: Request,
): Promise<{ userId: string; client: ReturnType<typeof createClient> } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
  if (!supabaseUrl || !anonKey) {
    console.error("food-search: missing Supabase env");
    return null;
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();
  if (error || !user) return null;
  return { userId: user.id, client: userClient };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const auth = await resolveAuthenticatedUserClient(req);
    if (!auth) {
      return unauthorizedResponse(corsHeaders);
    }
    const { userId, client: userClient } = auth;

    const rateLimit = await enforceFoodSearchRateLimit(userClient, userId);
    if (!rateLimit.allowed) {
      return rateLimitedResponse(rateLimit.retryAfterSec, corsHeaders);
    }

    let rawQuery = "";
    if (req.method === "GET") {
      rawQuery = new URL(req.url).searchParams.get("query") ?? "";
    } else {
      const body = await req.json().catch(() => ({}));
      rawQuery = typeof body?.query === "string" ? body.query : "";
    }

    const query = sanitizeFoodSearchQuery(rawQuery);
    if (!query) {
      return badQueryResponse(corsHeaders);
    }

    const apiKey = Deno.env.get("USDA_FDC_API_KEY")?.trim();
    const usdaPromise = apiKey
      ? searchUsdaAll(query, apiKey).catch((e) => {
          console.error("USDA error", e);
          return [] as FoodSearchResult[];
        })
      : Promise.resolve([] as FoodSearchResult[]);

    const offPromise = searchOff(query).catch((e) => {
      console.error("OFF error", e);
      return [] as FoodSearchResult[];
    });

    const communityPromise = searchCommunityFoods(userClient, query).catch((e) => {
      console.error("community_foods error", e);
      return [] as FoodSearchResult[];
    });

    const [usdaResults, offResults, communityResults] = await Promise.all([
      usdaPromise,
      offPromise,
      communityPromise,
    ]);

    if (!apiKey && usdaResults.length === 0 && offResults.length === 0 && communityResults.length === 0) {
      return new Response(JSON.stringify({ error: "Food search temporarily unavailable. Try again." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = mergeFoodSearchResults(usdaResults, offResults, query, communityResults);

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("food-search error", e);
    return new Response(JSON.stringify({ error: "Food search failed. Try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
