import { describe, expect, it } from "vitest";

import { connectedAuthProviders, isAppleSignInOnly } from "./accountAuth";

describe("connectedAuthProviders", () => {
  it("reads providers from identities when present", () => {
    expect(
      connectedAuthProviders({
        user: {
          identities: [{ provider: "apple" }, { provider: "email" }],
        },
      }),
    ).toEqual(["apple", "email"]);
  });

  it("falls back to app_metadata.providers when identities are missing", () => {
    expect(
      connectedAuthProviders({
        user: {
          app_metadata: { providers: ["apple"] },
        },
      }),
    ).toEqual(["apple"]);
  });

  it("falls back to app_metadata.provider when providers array is missing", () => {
    expect(
      connectedAuthProviders({
        user: {
          app_metadata: { provider: "email" },
        },
      }),
    ).toEqual(["email"]);
  });
});

describe("isAppleSignInOnly", () => {
  it("is true for Apple-only users from app_metadata", () => {
    expect(
      isAppleSignInOnly({
        user: {
          app_metadata: { provider: "apple", providers: ["apple"] },
        },
      }),
    ).toBe(true);
  });

  it("is false when the user also has an email identity", () => {
    expect(
      isAppleSignInOnly({
        user: {
          identities: [{ provider: "apple" }, { provider: "email" }],
        },
      }),
    ).toBe(false);
  });

  it("is false for email-only users", () => {
    expect(
      isAppleSignInOnly({
        user: {
          app_metadata: { provider: "email", providers: ["email"] },
        },
      }),
    ).toBe(false);
  });
});
