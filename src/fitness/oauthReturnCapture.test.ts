import { describe, expect, it } from "vitest";

import { shouldClearStaleSaveProgressSession } from "./oauthReturnCapture";

describe("shouldClearStaleSaveProgressSession", () => {
  it("does not clear during OAuth return", () => {
    expect(
      shouldClearStaleSaveProgressSession({
        oauthReturn: true,
        saveProgressAuthPending: false,
        signedInEmail: "user@example.com",
        alreadyCleared: false,
      }),
    ).toBe(false);
  });

  it("does not clear when save-progress auth is pending", () => {
    expect(
      shouldClearStaleSaveProgressSession({
        oauthReturn: false,
        saveProgressAuthPending: true,
        signedInEmail: "user@example.com",
        alreadyCleared: false,
      }),
    ).toBe(false);
  });

  it("clears a stale session when user lands signed-in without OAuth context", () => {
    expect(
      shouldClearStaleSaveProgressSession({
        oauthReturn: false,
        saveProgressAuthPending: false,
        signedInEmail: "user@example.com",
        alreadyCleared: false,
      }),
    ).toBe(true);
  });

  it("does not clear twice or when unsigned in", () => {
    expect(
      shouldClearStaleSaveProgressSession({
        oauthReturn: false,
        saveProgressAuthPending: false,
        signedInEmail: "",
        alreadyCleared: false,
      }),
    ).toBe(false);
    expect(
      shouldClearStaleSaveProgressSession({
        oauthReturn: false,
        saveProgressAuthPending: false,
        signedInEmail: "user@example.com",
        alreadyCleared: true,
      }),
    ).toBe(false);
  });
});
