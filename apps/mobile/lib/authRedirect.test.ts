import { describe, expect, it, vi } from "vitest";

vi.mock("expo-linking", () => ({
  createURL: (path: string) => `newyouai://${path}`,
}));

import {
  AUTH_EMAIL_REDIRECT_BRIDGE_URL,
  authEmailRedirectUrl,
  authOAuthRedirectUrl,
} from "./authRedirect";

describe("authEmailRedirectUrl", () => {
  it("uses the hosted HTTPS bridge for Supabase auth emails", () => {
    expect(authEmailRedirectUrl()).toBe(AUTH_EMAIL_REDIRECT_BRIDGE_URL);
  });

  it("prefers EXPO_PUBLIC_AUTH_EMAIL_REDIRECT_URL when set", () => {
    vi.stubEnv("EXPO_PUBLIC_AUTH_EMAIL_REDIRECT_URL", "https://example.test/auth/callback");
    expect(authEmailRedirectUrl()).toBe("https://example.test/auth/callback");
    vi.unstubAllEnvs();
  });
});

describe("authOAuthRedirectUrl", () => {
  it("builds the in-app custom scheme callback", () => {
    expect(authOAuthRedirectUrl()).toBe("newyouai://auth/callback");
  });

  it("accepts a custom URL builder", () => {
    expect(authOAuthRedirectUrl((path) => `exp://127.0.0.1:8081/--/${path}`)).toBe(
      "exp://127.0.0.1:8081/--/auth/callback",
    );
  });
});
