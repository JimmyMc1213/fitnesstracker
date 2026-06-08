/** Shared food-search limits (mirrored in supabase/functions/food-search/guards.ts). */

export const FOOD_SEARCH_MIN_QUERY_LEN = 2;
export const FOOD_SEARCH_MAX_QUERY_LEN = 100;
export const FOOD_SEARCH_RATE_LIMIT_WINDOW_MS = 60_000;
export const FOOD_SEARCH_RATE_LIMIT_MAX = 40;

export type FoodSearchRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

/** Trim and cap query length; null when too short to search. */
export function sanitizeFoodSearchQuery(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length < FOOD_SEARCH_MIN_QUERY_LEN) return null;
  if (trimmed.length <= FOOD_SEARCH_MAX_QUERY_LEN) return trimmed;
  return trimmed.slice(0, FOOD_SEARCH_MAX_QUERY_LEN);
}

/** Sliding-window rate limiter keyed by caller id (e.g. auth user id). */
export class FoodSearchRateLimiter {
  private buckets = new Map<string, { count: number; windowStartMs: number }>();

  constructor(
    private readonly windowMs = FOOD_SEARCH_RATE_LIMIT_WINDOW_MS,
    private readonly maxRequests = FOOD_SEARCH_RATE_LIMIT_MAX,
    private readonly nowMs: () => number = () => Date.now(),
  ) {}

  check(key: string): FoodSearchRateLimitResult {
    const now = this.nowMs();
    const bucket = this.buckets.get(key);

    if (!bucket || now - bucket.windowStartMs >= this.windowMs) {
      this.buckets.set(key, { count: 1, windowStartMs: now });
      return { allowed: true };
    }

    if (bucket.count >= this.maxRequests) {
      const retryAfterMs = this.windowMs - (now - bucket.windowStartMs);
      return { allowed: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
    }

    bucket.count += 1;
    return { allowed: true };
  }

  reset(key?: string): void {
    if (key === undefined) {
      this.buckets.clear();
      return;
    }
    this.buckets.delete(key);
  }
}
