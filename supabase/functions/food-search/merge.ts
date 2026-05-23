/** Merge/rank helpers for food-search edge function (mirrors src/fitness/foodSearchMerge.ts). */

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
  servings: { label: string; multiplier: number }[];
};

const MAX_RESULTS = 20;

function normalizeFoodName(name: string): string {
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

function areSimilarFoodNames(a: string, b: string): boolean {
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

function areSimilarFoods(a: FoodSearchResult, b: FoodSearchResult): boolean {
  if (a.externalId === b.externalId && a.source === b.source) return true;
  if (!areSimilarFoodNames(a.name, b.name)) return false;
  const brandA = (a.brand ?? "").trim().toLowerCase();
  const brandB = (b.brand ?? "").trim().toLowerCase();
  if (brandA && brandB) return brandA === brandB || brandA.includes(brandB) || brandB.includes(brandA);
  return true;
}

function brandedBoost(result: FoodSearchResult, query: string): number {
  const brand = (result.brand ?? "").trim();
  if (!brand) return 0;
  const q = query.trim().toLowerCase();
  const b = brand.toLowerCase();
  if (q && (b.includes(q) || q.includes(b))) return 3;
  return result.source === "off" ? 2 : 1;
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

function rankFoodSearchResults(results: FoodSearchResult[], query: string): FoodSearchResult[] {
  return [...results].sort((a, b) => {
    const scoreA = queryRelevance(a, query) + brandedBoost(a, query) + (a.source === "off" && a.brand ? 0.5 : 0);
    const scoreB = queryRelevance(b, query) + brandedBoost(b, query) + (b.source === "off" && b.brand ? 0.5 : 0);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.name.localeCompare(b.name);
  });
}

export function mergeFoodSearchResults(
  usda: FoodSearchResult[],
  off: FoodSearchResult[],
  query: string,
): FoodSearchResult[] {
  const combined = [...off, ...usda];
  const kept: FoodSearchResult[] = [];

  for (const candidate of combined) {
    const dupeIdx = kept.findIndex((existing) => areSimilarFoods(existing, candidate));
    if (dupeIdx < 0) {
      kept.push(candidate);
      continue;
    }
    const existing = kept[dupeIdx];
    const preferCandidate =
      (candidate.brand && !existing.brand) ||
      (candidate.brand && existing.brand && candidate.source === "off" && existing.source !== "off") ||
      brandedBoost(candidate, query) > brandedBoost(existing, query);
    if (preferCandidate) kept[dupeIdx] = candidate;
  }

  return rankFoodSearchResults(kept, query).slice(0, MAX_RESULTS);
}
