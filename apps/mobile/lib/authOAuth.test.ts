import { describe, expect, it } from "vitest";

import {
  parseAuthRedirectParams,
  parseOAuthRedirectUrl,
} from "./authOAuth";

describe("parseAuthRedirectParams", () => {
  it("merges query and hash params", () => {
    expect(
      parseAuthRedirectParams("newyouai://auth/callback?type=recovery#access_token=abc&refresh_token=def"),
    ).toEqual({
      type: "recovery",
      access_token: "abc",
      refresh_token: "def",
    });
  });
});

describe("parseOAuthRedirectUrl", () => {
  it("marks recovery links from Supabase password reset emails", () => {
    const result = parseOAuthRedirectUrl(
      "newyouai://auth/callback#access_token=abc&refresh_token=def&type=recovery",
    );

    expect(result).toEqual({
      ok: true,
      mode: "session",
      tokens: { accessToken: "abc", refreshToken: "def" },
      recovery: true,
    });
  });

  it("leaves recovery false for standard OAuth callbacks", () => {
    const result = parseOAuthRedirectUrl(
      "newyouai://auth/callback#access_token=abc&refresh_token=def",
    );

    expect(result).toEqual({
      ok: true,
      mode: "session",
      tokens: { accessToken: "abc", refreshToken: "def" },
      recovery: false,
    });
  });

  it("parses PKCE code redirects", () => {
    expect(parseOAuthRedirectUrl("newyouai://auth/callback?code=pkce-code&type=recovery")).toEqual({
      ok: true,
      mode: "code",
      code: "pkce-code",
      recovery: true,
    });
  });

  it("parses token_hash recovery redirects", () => {
    expect(
      parseOAuthRedirectUrl("newyouai://auth/callback?token_hash=hash123&type=recovery"),
    ).toEqual({
      ok: true,
      mode: "token_hash",
      tokenHash: "hash123",
      otpType: "recovery",
      recovery: true,
    });
  });
});
