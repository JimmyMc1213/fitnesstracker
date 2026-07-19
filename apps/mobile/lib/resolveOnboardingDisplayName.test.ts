import { describe, expect, it } from "vitest";

import {
  onboardingDisplayNameForCopy,
  resolveOnboardingDisplayName,
} from "./resolveOnboardingDisplayName";

describe("resolveOnboardingDisplayName", () => {
  it("prefers wizard draft over auth metadata", () => {
    expect(
      resolveOnboardingDisplayName({
        wizardDisplayName: "Alex",
        sessionUser: { id: "1", user_metadata: { full_name: "Jordan" } } as never,
      }),
    ).toBe("Alex");
  });

  it("falls back to auth metadata when wizard name is blank", () => {
    expect(
      resolveOnboardingDisplayName({
        wizardDisplayName: "",
        sessionUser: { id: "1", user_metadata: { first_name: "Jim", last_name: "McCarthy" } } as never,
      }),
    ).toBe("Jim McCarthy");
  });

  it("treats Friend placeholder as empty and resolves from auth", () => {
    expect(
      resolveOnboardingDisplayName({
        wizardDisplayName: "Friend",
        sessionUser: { id: "1", user_metadata: { full_name: "Jimmy" } } as never,
      }),
    ).toBe("Jimmy");
  });

  it("falls back to fitness slice when wizard and auth are empty", () => {
    expect(
      resolveOnboardingDisplayName({
        wizardDisplayName: "",
        fitnessDisplayName: "Sam",
      }),
    ).toBe("Sam");
  });
});

describe("onboardingDisplayNameForCopy", () => {
  it("uses Friend only for display copy", () => {
    expect(onboardingDisplayNameForCopy("Jimmy")).toBe("Jimmy");
    expect(onboardingDisplayNameForCopy("")).toBe("Friend");
  });
});
