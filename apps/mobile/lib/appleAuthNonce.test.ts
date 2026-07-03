import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("expo-crypto", () => ({
  randomUUID: () => "raw-nonce-123",
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
  digestStringAsync: vi.fn(async (_algo: string, value: string) => `hash:${value}`),
}));

import * as Crypto from "expo-crypto";

import { createAppleAuthNonce } from "./appleAuthNonce";

describe("createAppleAuthNonce", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns raw and SHA-256 hashed nonce for Apple + Supabase", async () => {
    const result = await createAppleAuthNonce();
    expect(result.rawNonce).toBe("raw-nonce-123");
    expect(result.hashedNonce).toBe("hash:raw-nonce-123");
    expect(Crypto.digestStringAsync).toHaveBeenCalledWith("SHA-256", "raw-nonce-123");
  });
});
