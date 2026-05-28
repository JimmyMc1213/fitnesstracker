/** Merge/rank helpers for food-search edge function (mirrors src/fitness/foodSearchMerge.ts). */

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
  servings: { label: string; multiplier: number }[];
};

const MAX_RESULTS = 20;
const COMMUNITY_SOURCE_BOOST = 100;

function sourceBoost(item: FoodSearchResult): number {
  return item.source === "community" ? COMMUNITY_SOURCE_BOOST : 0;
}

function totalScore(item: FoodSearchResult, query: string): number {
  return scoreResult(item, query) + brandQueryBoost(item, query) + sourceBoost(item);
}

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

function resolveDataType(item: FoodSearchResult): string | undefined {
  if (item.dataType?.trim()) return item.dataType.trim();
  if ((item.brand ?? "").trim()) return "Branded";
  if (item.source === "usda") return "SR Legacy";
  return undefined;
}

function scoreResult(item: FoodSearchResult, query: string): number {
  const desc = [item.name, item.brand].filter(Boolean).join(" ").toLowerCase();
  const q = query.toLowerCase().trim();
  const qWords = q.split(" ").filter((word) => word.length > 0);
  let score = 0;

  if (desc.startsWith(q)) score += 200;
  else if (qWords.every((word) => desc.includes(word))) score += 80;
  else if (qWords.some((word) => desc.includes(word))) score += 20;

  const practicalWords = [
    "breast",
    "thigh",
    "wing",
    "drumstick",
    "ground",
    "fillet",
    "whole",
    "raw",
    "cooked",
    "grilled",
    "baked",
    "roasted",
    "boiled",
  ];
  if (practicalWords.some((w) => desc.includes(w))) score += 40;

  if (desc.length < 25) score += 30;
  else if (desc.length < 40) score += 10;
  else if (desc.length > 60) score -= 30;
  else if (desc.length > 80) score -= 60;

  const dataType = resolveDataType(item);
  if (dataType === "Foundation") score += 50;
  else if (dataType === "SR Legacy") score += 35;
  else if (dataType === "Survey (FNDDS)") score -= 20;
  else if (dataType === "Branded") score -= 10;

  const penaltyWords = [
    "spread",
    "feet",
    "canned",
    "bologna",
    "pork",
    "meatless",
    "fat free",
    "flavored",
    "seasoned",
    "style",
    "frozen",
    "microwaved",
    "nuggets",
    "strips",
    "tenders",
    "patty",
    "substitute",
    "imitation",
    "fast food",
    "restaurant",
    "baby food",
    "strained",
    "junior",
    "ns as to",
  ];
  const penaltyCount = penaltyWords.filter((w) => desc.includes(w)).length;
  score -= penaltyCount * 35;

  return score;
}

function dataTypeTiebreak(item: FoodSearchResult): number {
  const dataType = resolveDataType(item);
  if (dataType === "Foundation") return 3;
  if (dataType === "SR Legacy") return 2;
  if (dataType === "Survey (FNDDS)") return 1;
  if (dataType === "Branded") return 0;
  return 1;
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

  const candidateScore = totalScore(candidate, query);
  const existingScore = totalScore(existing, query);
  if (candidateScore !== existingScore) {
    return candidateScore > existingScore ? candidate : existing;
  }

  const candidateType = dataTypeTiebreak(candidate);
  const existingType = dataTypeTiebreak(existing);
  if (candidateType !== existingType) {
    return candidateType > existingType ? candidate : existing;
  }

  return existing;
}

function rankFoodSearchResults(results: FoodSearchResult[], query: string): FoodSearchResult[] {
  return [...results].sort((a, b) => {
    const scoreA = totalScore(a, query);
    const scoreB = totalScore(b, query);
    if (scoreB !== scoreA) return scoreB - scoreA;

    const tieA = dataTypeTiebreak(a);
    const tieB = dataTypeTiebreak(b);
    if (tieB !== tieA) return tieB - tieA;

    return a.name.localeCompare(b.name);
  });
}

export function mergeFoodSearchResults(
  usda: FoodSearchResult[],
  off: FoodSearchResult[],
  query: string,
  community: FoodSearchResult[] = [],
): FoodSearchResult[] {
  const combined = [...usda, ...off, ...community];
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
