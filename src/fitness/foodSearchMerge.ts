import type { FoodSearchResult } from "./foodSearchTypes";

const MAX_RESULTS = 20;

/** Lowercase alphanumeric tokens for fuzzy name comparison. */
export function normalizeFoodName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(name: string): Set<string> {
  const n = normalizeFoodName(name);
  if (!n) return new Set();
  return new Set(n.split(" ").filter((t) => t.length > 1));
}

/** True when names share enough tokens to treat as the same food. */
export function areSimilarFoodNames(a: string, b: string): boolean {
  const na = normalizeFoodName(a);
  const nb = normalizeFoodName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;

  const ta = tokenSet(a);
  const tb = tokenSet(b);
  if (!ta.size || !tb.size) return false;
  let overlap = 0;
  for (const t of ta) {
    if (tb.has(t)) overlap++;
  }
  const minSize = Math.min(ta.size, tb.size);
  return overlap >= minSize && overlap / minSize >= 0.75;
}

export function areSimilarFoods(a: FoodSearchResult, b: FoodSearchResult): boolean {
  if (a.externalId === b.externalId && a.source === b.source) return true;
  if (!areSimilarFoodNames(a.name, b.name)) return false;
  const brandA = (a.brand ?? "").trim().toLowerCase();
  const brandB = (b.brand ?? "").trim().toLowerCase();
  if (brandA && brandB) return brandA === brandB || brandA.includes(brandB) || brandB.includes(brandA);
  return true;
}

/** Strong boost when the user is clearly searching for a brand name. */
function brandQueryBoost(result: FoodSearchResult, query: string): number {
  const brand = (result.brand ?? "").trim();
  if (!brand) return 0;
  const q = normalizeFoodName(query);
  const b = normalizeFoodName(brand);
  if (!q || !b) return 0;
  if (b.includes(q) || q.includes(b)) return 15;
  return 0;
}

function isBrandSearch(query: string, results: FoodSearchResult[]): boolean {
  return results.some((r) => brandQueryBoost(r, query) > 0);
}

/** For basic ingredient searches, prefer unbranded reference foods over packaged brands. */
function genericPreferenceBoost(
  result: FoodSearchResult,
  query: string,
  results: FoodSearchResult[],
): number {
  if (isBrandSearch(query, results)) return 0;
  const brand = (result.brand ?? "").trim();
  if (brand) return -3;
  return result.source === "usda" ? 5 : 2;
}

function queryRelevance(result: FoodSearchResult, query: string): number {
  const q = normalizeFoodName(query);
  const name = normalizeFoodName(result.name);
  if (!q || !name) return 0;
  if (name === q) return 10;
  if (name.startsWith(q)) return 8;
  if (name.includes(q)) return 6;
  const brand = normalizeFoodName(result.brand ?? "");
  if (brand && (brand.includes(q) || q.includes(brand))) return 5;
  return 0;
}

function foodSearchScore(result: FoodSearchResult, query: string, results: FoodSearchResult[]): number {
  return (
    queryRelevance(result, query) +
    brandQueryBoost(result, query) +
    genericPreferenceBoost(result, query, results)
  );
}

function pickPreferredDuplicate(
  existing: FoodSearchResult,
  candidate: FoodSearchResult,
  query: string,
): FoodSearchResult {
  const candidateBrandBoost = brandQueryBoost(candidate, query);
  const existingBrandBoost = brandQueryBoost(existing, query);
  if (candidateBrandBoost !== existingBrandBoost) {
    return candidateBrandBoost > existingBrandBoost ? candidate : existing;
  }

  const candidateBranded = Boolean((candidate.brand ?? "").trim());
  const existingBranded = Boolean((existing.brand ?? "").trim());
  if (candidateBranded !== existingBranded) {
    return candidateBranded ? existing : candidate;
  }

  if (candidateBranded && existingBranded) {
    if (candidate.source === "off" && existing.source !== "off") return candidate;
    if (existing.source === "off" && candidate.source !== "off") return existing;
  }

  const candidateRelevance = queryRelevance(candidate, query);
  const existingRelevance = queryRelevance(existing, query);
  if (candidateRelevance !== existingRelevance) {
    return candidateRelevance > existingRelevance ? candidate : existing;
  }

  return existing;
}

/** Sort merged results: query match, then unbranded USDA reference foods, then brands. */
export function rankFoodSearchResults(results: FoodSearchResult[], query: string): FoodSearchResult[] {
  return [...results].sort((a, b) => {
    const scoreA = foodSearchScore(a, query, results);
    const scoreB = foodSearchScore(b, query, results);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Merge USDA + OFF lists: dedupe similar names, prefer unbranded reference foods for basic searches.
 */
export function mergeFoodSearchResults(
  usda: FoodSearchResult[],
  off: FoodSearchResult[],
  query: string,
): FoodSearchResult[] {
  const combined = [...usda, ...off];
  const kept: FoodSearchResult[] = [];

  for (const candidate of combined) {
    const dupeIdx = kept.findIndex((existing) => areSimilarFoods(existing, candidate));
    if (dupeIdx < 0) {
      kept.push(candidate);
      continue;
    }
    kept[dupeIdx] = pickPreferredDuplicate(kept[dupeIdx], candidate, query);
  }

  return rankFoodSearchResults(kept, query).slice(0, MAX_RESULTS);
}
