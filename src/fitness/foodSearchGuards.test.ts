import { afterEach, describe, expect, it } from "vitest";

import {
  FOOD_SEARCH_MAX_QUERY_LEN,
  FOOD_SEARCH_RATE_LIMIT_MAX,
  FoodSearchRateLimiter,
  sanitizeFoodSearchQuery,
} from "./foodSearchGuards";

describe("sanitizeFoodSearchQuery", () => {
  it("returns null for empty or single-character queries", () => {
    expect(sanitizeFoodSearchQuery("")).toBeNull();
    expect(sanitizeFoodSearchQuery("  a ")).toBeNull();
  });

  it("trims and accepts valid queries", () => {
    expect(sanitizeFoodSearchQuery("  chicken  ")).toBe("chicken");
  });

  it("caps queries at FOOD_SEARCH_MAX_QUERY_LEN", () => {
    const long = "x".repeat(FOOD_SEARCH_MAX_QUERY_LEN + 20);
    expect(sanitizeFoodSearchQuery(long)).toHaveLength(FOOD_SEARCH_MAX_QUERY_LEN);
  });
});

describe("FoodSearchRateLimiter", () => {
  afterEach(() => {
    limiter.reset();
  });

  let now = 0;
  const limiter = new FoodSearchRateLimiter(60_000, FOOD_SEARCH_RATE_LIMIT_MAX, () => now);

  it("allows requests up to the configured limit", () => {
    for (let i = 0; i < FOOD_SEARCH_RATE_LIMIT_MAX; i += 1) {
      expect(limiter.check("user-1")).toEqual({ allowed: true });
    }
    expect(limiter.check("user-1")).toEqual({ allowed: false, retryAfterSec: 60 });
  });

  it("tracks limits per user", () => {
    for (let i = 0; i < FOOD_SEARCH_RATE_LIMIT_MAX; i += 1) {
      limiter.check("user-a");
    }
    expect(limiter.check("user-a").allowed).toBe(false);
    expect(limiter.check("user-b")).toEqual({ allowed: true });
  });

  it("resets the window after it expires", () => {
    for (let i = 0; i < FOOD_SEARCH_RATE_LIMIT_MAX; i += 1) {
      limiter.check("user-1");
    }
    expect(limiter.check("user-1").allowed).toBe(false);

    now = 60_001;
    expect(limiter.check("user-1")).toEqual({ allowed: true });
  });
});
