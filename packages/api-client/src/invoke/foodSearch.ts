import type { SupabaseClient } from "@supabase/supabase-js";
import type { FoodSearchErrorResponse, FoodSearchResponse, FoodSearchResult } from "@newyouai/types";

import { invokeErrorMessage } from "./invokeErrorMessage";
import { invokeEdgeFunction } from "./invokeEdgeFunction";

export class FoodSearchError extends Error {
  constructor(
    message: string,
    readonly code?: "auth_required" | "rate_limited" | "unavailable",
  ) {
    super(message);
    this.name = "FoodSearchError";
  }
}

function parseResults(data: unknown): FoodSearchResult[] {
  if (!data || typeof data !== "object") return [];
  const err = data as FoodSearchErrorResponse;
  if (typeof err.error === "string" && err.error.trim()) {
    throw new FoodSearchError(err.error.trim());
  }
  const body = data as FoodSearchResponse;
  if (!Array.isArray(body.results)) return [];
  return body.results.filter(
    (row) => row && typeof row.name === "string" && typeof row.externalId === "string",
  ) as FoodSearchResult[];
}

function parseInvokeError(data: unknown, invokeError: unknown): never {
  const body = data && typeof data === "object" ? (data as FoodSearchErrorResponse) : null;
  const message = body?.error?.trim() || invokeErrorMessage(invokeError) || "Food search failed.";

  if (/sign in to search/i.test(message)) {
    throw new FoodSearchError(message, "auth_required");
  }
  if (/too many food searches/i.test(message)) {
    throw new FoodSearchError(message, "rate_limited");
  }
  throw new FoodSearchError(message, "unavailable");
}

/** Call Edge Function `food-search` (USDA + Open Food Facts). Caller must ensure auth. */
export async function searchFood(
  client: SupabaseClient,
  query: string,
): Promise<FoodSearchResult[]> {
  const { data, error } = await invokeEdgeFunction<unknown>(client, "food-search", {
    query,
  });

  if (
    error ||
    (data &&
      typeof data === "object" &&
      "error" in data &&
      typeof (data as FoodSearchErrorResponse).error === "string")
  ) {
    parseInvokeError(data, error);
  }

  return parseResults(data);
}
