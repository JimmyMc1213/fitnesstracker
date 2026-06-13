/** Shared food-search limits (mirrored in supabase/functions/food-search/guards.ts). */

export const FOOD_SEARCH_MIN_QUERY_LEN = 2;
export const FOOD_SEARCH_MAX_QUERY_LEN = 100;

/** Trim and cap query length; null when too short to search. */
export function sanitizeFoodSearchQuery(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length < FOOD_SEARCH_MIN_QUERY_LEN) return null;
  if (trimmed.length <= FOOD_SEARCH_MAX_QUERY_LEN) return trimmed;
  return trimmed.slice(0, FOOD_SEARCH_MAX_QUERY_LEN);
}
