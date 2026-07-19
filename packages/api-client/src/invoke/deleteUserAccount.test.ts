import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { invokeDeleteUserAccount } from "./deleteUserAccount";

const validUrl = "https://example.supabase.co";
const validPublishable = "sb_publishable_test";
const validAnonJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.test";

function mockClient(session: { access_token: string } | null): SupabaseClient {
  return {
    auth: {
      refreshSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session } }),
    },
  } as unknown as SupabaseClient;
}

describe("invokeDeleteUserAccount", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requires a signed-in session", async () => {
    const result = await invokeDeleteUserAccount(
      mockClient(null),
      { url: validUrl, publishableKey: validPublishable, anonKey: validAnonJwt },
    );

    expect(result.error?.message).toBe("Sign in to delete your account.");
  });

  it("uses anon JWT as apikey when both keys are configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await invokeDeleteUserAccount(
      mockClient({ access_token: "user-jwt" }),
      { url: validUrl, publishableKey: validPublishable, anonKey: validAnonJwt },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      `${validUrl}/functions/v1/delete-user`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer user-jwt",
          apikey: validAnonJwt,
        }),
      }),
    );
  });

  it("returns server error text on non-2xx responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Could not delete your account. Try again.", step: "auth_delete" }), {
          status: 500,
        }),
      ),
    );

    const result = await invokeDeleteUserAccount(
      mockClient({ access_token: "user-jwt" }),
      { url: validUrl, publishableKey: validPublishable, anonKey: validAnonJwt },
    );

    expect(result.error?.message).toBe("Could not delete your account. Try again.");
    expect(result.data).toEqual({
      error: "Could not delete your account. Try again.",
      step: "auth_delete",
    });
  });
});
