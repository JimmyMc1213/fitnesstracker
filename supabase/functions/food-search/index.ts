import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

const NUTRIENT_KCAL = new Set([1008, 2047, 2048]);
const NUTRIENT_PROTEIN = 1003;
const NUTRIENT_CARBS = 1005;
const NUTRIENT_FAT = 1004;

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

const OZ_TO_G = 28.3495;

function parseServingLabel(label: string): { quantity: number; unit: string; grams: number | null } | null {
  const trimmed = label.trim();
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
  url.searchParams.set("fields", "code,product_name,product_name_en,brands,serving_size,serving_quantity,serving_quantity_unit,nutriments");

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let query = "";
    if (req.method === "GET") {
      query = new URL(req.url).searchParams.get("query")?.trim() ?? "";
    } else {
      const body = await req.json().catch(() => ({}));
      query = typeof body?.query === "string" ? body.query.trim() : "";
    }

    if (query.length < 2) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    const [usdaResults, offResults] = await Promise.all([usdaPromise, offPromise]);

    if (!apiKey && usdaResults.length === 0 && offResults.length === 0) {
      return new Response(JSON.stringify({ error: "Food search temporarily unavailable. Try again." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = mergeFoodSearchResults(usdaResults, offResults, query);

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
