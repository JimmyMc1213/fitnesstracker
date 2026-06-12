import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { invokeEdgeFunction } from "./invokeEdgeFunction";

function mockClient(invoke: ReturnType<typeof vi.fn>): SupabaseClient {
  return {
    functions: { invoke },
  } as unknown as SupabaseClient;
}

describe("invokeEdgeFunction", () => {
  it("forwards function name, body, and options to the client", async () => {
    const invoke = vi.fn().mockResolvedValue({ data: { ok: true }, error: null });
    const client = mockClient(invoke);

    const result = await invokeEdgeFunction<{ ok: boolean }>(client, "food-search", { query: "egg" }, {
      method: "POST",
      headers: { "x-test": "1" },
    });

    expect(invoke).toHaveBeenCalledWith("food-search", {
      body: { query: "egg" },
      method: "POST",
      headers: { "x-test": "1" },
    });
    expect(result).toEqual({ data: { ok: true }, error: null });
  });

  it("returns null data and preserves invoke errors", async () => {
    const invokeError = new Error("Network down");
    const invoke = vi.fn().mockResolvedValue({ data: null, error: invokeError });
    const client = mockClient(invoke);

    const result = await invokeEdgeFunction(client, "future-you-delete", {});

    expect(result.data).toBeNull();
    expect(result.error).toBe(invokeError);
  });
});
