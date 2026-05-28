import { describe, expect, it, vi } from "vitest";

import { communityFoodRowFromSearchResult, submitCommunityFoodFromBarcodeScan } from "./communityFoods";
import type { FoodSearchResult } from "./foodSearchTypes";

const upsert = vi.fn();
const getUser = vi.fn();

vi.mock("./supabaseClient", () => ({
  isSupabaseConfigured: () => true,
  getSupabase: () => ({
    auth: { getUser },
    from: () => ({ upsert }),
  }),
}));

describe("communityFoods", () => {
  const offFood: FoodSearchResult = {
    id: "off-0012345678901",
    name: "Test cereal",
    brand: "Acme",
    cal: 150,
    p: 4,
    c: 30,
    f: 2,
    defaultServing: "40 g",
    baseGrams: 40,
    source: "off",
    externalId: "0012345678901",
    servings: [],
  };

  it("builds a normalized community food row from an OFF result", () => {
    const row = communityFoodRowFromSearchResult("12345678901", offFood);
    expect(row).toMatchObject({
      barcode: "0012345678901",
      name: "Test cereal",
      brand: "Acme",
      serving_label: "40 g",
      serving_grams: 40,
      cal: 150,
      protein: 4,
      carbs: 30,
      fat: 2,
    });
  });

  it("upserts silently when signed in", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-abc" } }, error: null });
    upsert.mockResolvedValue({ error: null });

    submitCommunityFoodFromBarcodeScan("12345678901", offFood);
    await Promise.resolve();
    await Promise.resolve();

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        barcode: "0012345678901",
        submitted_by: "user-abc",
      }),
      { onConflict: "barcode" },
    );
  });

  it("skips upsert when not signed in", async () => {
    upsert.mockClear();
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    submitCommunityFoodFromBarcodeScan("12345678901", offFood);
    await Promise.resolve();
    await Promise.resolve();

    expect(upsert).not.toHaveBeenCalled();
  });

  it("logs upsert failures", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    getUser.mockResolvedValue({ data: { user: { id: "user-abc" } }, error: null });
    upsert.mockResolvedValue({ error: { message: "new row violates row-level security policy" } });

    submitCommunityFoodFromBarcodeScan("12345678901", offFood);

    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalledWith(
        "[Fitcoach] community_foods save failed:",
        "new row violates row-level security policy",
      );
    });

    warn.mockRestore();
  });
});
