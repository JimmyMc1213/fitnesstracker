/** Keep in sync with src/fitness/foodSearchGuards.ts */

export const FOOD_SEARCH_MIN_QUERY_LEN = 2;
export const FOOD_SEARCH_MAX_QUERY_LEN = 100;
export const FOOD_SEARCH_RATE_LIMIT_WINDOW_MS = 60_000;
export const FOOD_SEARCH_RATE_LIMIT_MAX = 40;

export type FoodSearchRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

export function sanitizeFoodSearchQuery(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length < FOOD_SEARCH_MIN_QUERY_LEN) return null;
  if (trimmed.length <= FOOD_SEARCH_MAX_QUERY_LEN) return trimmed;
  return trimmed.slice(0, FOOD_SEARCH_MAX_QUERY_LEN);
}

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
}

const rateLimiter = new FoodSearchRateLimiter();

export function checkFoodSearchRateLimit(userId: string): FoodSearchRateLimitResult {
  return rateLimiter.check(userId);
}

function jsonResponse(body: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

export function unauthorizedResponse(corsHeaders: Record<string, string>): Response {
  return jsonResponse({ error: "Sign in to search the food database." }, 401, corsHeaders);
}

export function rateLimitedResponse(retryAfterSec: number, corsHeaders: Record<string, string>): Response {
  return jsonResponse(
    { error: "Too many food searches. Wait a moment and try again." },
    429,
    { ...corsHeaders, "Retry-After": String(retryAfterSec) },
  );
}

export function badQueryResponse(corsHeaders: Record<string, string>): Response {
  return jsonResponse({ results: [] }, 200, corsHeaders);
}
