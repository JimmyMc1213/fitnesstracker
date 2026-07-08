import { extractGramsFromServingText } from "@newyouai/core";
import type { FoodSearchResult } from "@newyouai/types";

function offNum(raw: unknown): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Open Food Facts records nutriments either per 100g/100ml or per serving
 * (`nutrition_data_per`). When it is "serving", the unsuffixed / `_value`
 * fields already hold per-serving numbers — and OFF frequently mirrors that
 * same per-serving number into the `_100g` slot. Scaling that by baseGrams/100
 * triple-counts a drink (e.g. a 330 ml coconut water at 60 kcal reports 198).
 */
function offIsPerServingBasis(raw: Record<string, unknown>): boolean {
  const basis =
    typeof raw.nutrition_data_per === "string" ? raw.nutrition_data_per.trim().toLowerCase() : "";
  return basis === "serving";
}

function resolveOffServing(
  raw: Record<string, unknown>,
): { defaultServing: string; baseGrams: number } {
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

function inferOffBaseGrams(
  nutriments: Record<string, unknown>,
  baseGrams: number,
): number {
  if (baseGrams !== 100) return baseGrams;

  const calServing = offNum(nutriments["energy-kcal_serving"]) || offNum(nutriments.energy_kcal_serving);
  const cal100 = offNum(nutriments["energy-kcal_100g"]) || offNum(nutriments.energy_kcal_100g);
  if (calServing <= 0 || cal100 <= 0) return baseGrams;

  const implied = Math.round((calServing / cal100) * 100);
  if (implied >= 15 && implied <= 800) return implied;
  return baseGrams;
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
  const perServingBasis = offIsPerServingBasis(raw);
  const { defaultServing, baseGrams: servingGrams } = resolveOffServing(raw);
  const baseGrams = inferOffBaseGrams(nutriments, servingGrams);
  const { cal: servingCal, p: servingP, c: servingC, f: servingF } = resolveOffMacros(
    nutriments,
    baseGrams,
    perServingBasis,
  );

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

/** Exact barcode product lookup — never use the OFF search endpoint for scans. */
export const OFF_BARCODE_PRODUCT_API = "https://world.openfoodfacts.org/api/v2/product";

export type OffBarcodeLookupPayload = {
  status?: number;
  status_verbose?: string;
  product?: Record<string, unknown> | null;
};

/** Normalize UPC/EAN digits so 12-digit UPC-A matches 13-digit EAN-13 with a leading zero. */
export function normalizeBarcodeDigits(code: string): string {
  const digits = code.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length <= 13) return digits.padStart(13, "0");
  return digits;
}

export function offBarcodesMatch(scanned: string, productCode: string): boolean {
  const a = normalizeBarcodeDigits(scanned);
  const b = normalizeBarcodeDigits(productCode);
  if (!a || !b) return false;
  return a === b;
}

function offBarcodeProductUrl(barcode: string): string {
  const url = new URL(`${OFF_BARCODE_PRODUCT_API}/${encodeURIComponent(barcode)}.json`);
  url.searchParams.set(
    "fields",
    "code,product_name,product_name_en,brands,serving_size,serving_quantity,serving_quantity_unit,nutrition_data_per,nutriments",
  );
  return url.toString();
}

/** Look up a packaged food by UPC/EAN via the OFF exact-product endpoint only. */
export async function lookupFoodByBarcode(barcode: string): Promise<FoodSearchResult | null> {
  const code = barcode.trim().replace(/\s/g, "");
  if (code.length < 8) return null;

  const res = await fetch(offBarcodeProductUrl(code), {
    headers: { "User-Agent": "Fitcoach/1.0 (barcode lookup)" },
  });
  if (!res.ok) return null;

  const payload = (await res.json()) as OffBarcodeLookupPayload;
  if (payload.status === 0 || payload.product == null) return null;
  if (payload.status !== 1) return null;

  const product = payload.product;
  const productCode = String(product.code ?? product._id ?? "").trim();
  if (productCode && !offBarcodesMatch(code, productCode)) return null;

  return mapOffProduct(product);
}
