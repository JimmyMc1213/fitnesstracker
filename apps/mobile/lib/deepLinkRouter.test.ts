import { describe, expect, it } from "vitest";

import { resolveDeepLink } from "./deepLinkRouter";

describe("resolveDeepLink", () => {
  it("delegates OAuth callback URLs with tokens", () => {
    expect(resolveDeepLink("newyouai://auth/callback#access_token=abc&refresh_token=def")).toEqual({
      type: "oauth",
      url: "newyouai://auth/callback#access_token=abc&refresh_token=def",
    });
  });

  it("routes home path", () => {
    expect(resolveDeepLink("newyouai://home")).toEqual({
      type: "navigate",
      href: "/(tabs)/home",
    });
  });

  it("routes legacy settings account deep link to You panel", () => {
    expect(resolveDeepLink("newyouai://settings/account")).toEqual({
      type: "navigate",
      href: "/(tabs)/settings/you",
    });
  });

  it("routes settings hub", () => {
    expect(resolveDeepLink("newyouai://settings")).toEqual({
      type: "navigate",
      href: "/(tabs)/settings",
    });
  });

  it("routes stretch to home mobility stub", () => {
    expect(resolveDeepLink("newyouai://stretch")).toEqual({
      type: "navigate",
      href: { pathname: "/(tabs)/home", params: { mobility: "1" } },
    });
  });

  it("falls back for unknown paths", () => {
    expect(resolveDeepLink("newyouai://unknown-route")).toEqual({ type: "fallback" });
  });
});
