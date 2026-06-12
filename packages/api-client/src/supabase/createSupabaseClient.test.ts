import { describe, expect, it } from "vitest";

import {
  clientSupabaseKeyForFetch,
  createSupabaseClient,
  isSupabaseConfigured,
  type SupabaseEnv,
} from "./createSupabaseClient";

const validUrl = "https://example.supabase.co";
const validPublishable = "sb_publishable_abcdefghij";
const validAnonJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.test";

function env(overrides: Partial<SupabaseEnv> = {}): SupabaseEnv {
  return {
    url: validUrl,
    publishableKey: validPublishable,
    ...overrides,
  };
}

describe("clientSupabaseKeyForFetch", () => {
  it("prefers publishable key over anon JWT", () => {
    expect(
      clientSupabaseKeyForFetch(
        env({ publishableKey: validPublishable, anonKey: validAnonJwt }),
      ),
    ).toBe(validPublishable);
  });

  it("falls back to anon JWT when publishable is missing", () => {
    expect(clientSupabaseKeyForFetch(env({ publishableKey: "", anonKey: validAnonJwt }))).toBe(
      validAnonJwt,
    );
  });

  it("trims and strips surrounding quotes", () => {
    expect(
      clientSupabaseKeyForFetch(
        env({ publishableKey: `  "${validPublishable}"  `, anonKey: validAnonJwt }),
      ),
    ).toBe(validPublishable);
  });

  it("returns empty string when no keys are set", () => {
    expect(clientSupabaseKeyForFetch(env({ publishableKey: "", anonKey: "" }))).toBe("");
  });
});

describe("isSupabaseConfigured", () => {
  it("returns true for valid https url and key", () => {
    expect(isSupabaseConfigured(env())).toBe(true);
  });

  it("returns false when url is missing", () => {
    expect(isSupabaseConfigured(env({ url: "" }))).toBe(false);
  });

  it("returns false when url is not https", () => {
    expect(isSupabaseConfigured(env({ url: "http://example.supabase.co" }))).toBe(false);
  });

  it("returns false when key is too short", () => {
    expect(isSupabaseConfigured(env({ publishableKey: "short", anonKey: "" }))).toBe(false);
  });

  it("returns false when both keys are missing", () => {
    expect(isSupabaseConfigured(env({ publishableKey: "", anonKey: "" }))).toBe(false);
  });

  it("accepts anon JWT when publishable is absent", () => {
    expect(
      isSupabaseConfigured(env({ publishableKey: "", anonKey: validAnonJwt })),
    ).toBe(true);
  });

  it("trims quoted url values", () => {
    expect(
      isSupabaseConfigured(env({ url: ` "${validUrl}" `, publishableKey: validPublishable })),
    ).toBe(true);
  });
});

describe("createSupabaseClient", () => {
  it("returns null when env is not configured", () => {
    expect(createSupabaseClient(env({ url: "" }))).toBeNull();
  });

  it("creates a client when env is configured", () => {
    const client = createSupabaseClient(env(), { auth: { persistSession: false } });
    expect(client).not.toBeNull();
  });
});
