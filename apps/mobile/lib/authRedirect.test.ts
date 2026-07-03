import { describe, expect, it, vi } from "vitest";

vi.mock("expo-linking", () => ({
  createURL: (path: string) => `newyouai://${path}`,
}));

import { authEmailRedirectUrl } from "./authRedirect";

describe("authEmailRedirectUrl", () => {
  it("builds the app auth callback URL", () => {
    expect(authEmailRedirectUrl()).toBe("newyouai://auth/callback");
  });

  it("accepts a custom URL builder", () => {
    expect(authEmailRedirectUrl((path) => `exp://127.0.0.1:8081/--/${path}`)).toBe(
      "exp://127.0.0.1:8081/--/auth/callback",
    );
  });
});
