import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { FoodSearchError, searchFood } from "./foodSearch";

function mockClient(invoke: ReturnType<typeof vi.fn>): SupabaseClient {
  return {
    functions: { invoke },
  } as unknown as SupabaseClient;
}

describe("searchFood", () => {
  it("maps invoke results", async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: {
        results: [
          {
            id: "usda-123",
            name: "Chicken breast",
            cal: 165,
            p: 31,
            c: 0,
            f: 3.6,
            defaultServing: "100 g",
            source: "usda",
            externalId: "123",
            servings: [{ label: "1 serving", multiplier: 1 }],
          },
        ],
      },
      error: null,
    });

    const rows = await searchFood(mockClient(invoke), "chicken");
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Chicken breast");
    expect(invoke).toHaveBeenCalledWith("food-search", { body: { query: "chicken" } });
  });

  it("throws FoodSearchError on API error payload", async () => {
    const invoke = vi.fn().mockResolvedValue({ data: { error: "USDA unavailable" }, error: null });
    await expect(searchFood(mockClient(invoke), "egg")).rejects.toThrow(FoodSearchError);
  });

  it("maps rate-limit responses", async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: { error: "Too many food searches. Wait a moment and try again." },
      error: null,
    });
    await expect(searchFood(mockClient(invoke), "egg")).rejects.toMatchObject({
      code: "rate_limited",
    });
  });

  it("throws FoodSearchError on invoke failure", async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: null,
      error: new Error("Network down"),
    });
    await expect(searchFood(mockClient(invoke), "egg")).rejects.toThrow(/Network down/);
  });
});
