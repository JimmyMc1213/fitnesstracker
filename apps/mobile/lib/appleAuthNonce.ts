import * as Crypto from "expo-crypto";

/** Raw nonce for Supabase + SHA-256 hash for Apple's signInAsync. */
export async function createAppleAuthNonce(): Promise<{ rawNonce: string; hashedNonce: string }> {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );
  return { rawNonce, hashedNonce };
}
