import { describe, expect, it } from "vitest";

import { displayNameFromUser } from "./displayNameFromUser";

describe("displayNameFromUser", () => {
  it("reads full_name from user metadata", () => {
    expect(
      displayNameFromUser({
        id: "1",
        user_metadata: { full_name: "  Alex  " },
      } as never),
    ).toBe("Alex");
  });

  it("falls back to name metadata", () => {
    expect(
      displayNameFromUser({
        id: "1",
        user_metadata: { name: "Jordan" },
      } as never),
    ).toBe("Jordan");
  });

  it("joins first_name and last_name when full_name is missing", () => {
    expect(
      displayNameFromUser({
        id: "1",
        user_metadata: { first_name: "Jim", last_name: "McCarthy" },
      } as never),
    ).toBe("Jim McCarthy");
  });

  it("returns null when metadata is missing", () => {
    expect(displayNameFromUser(null)).toBeNull();
    expect(displayNameFromUser({ id: "1", user_metadata: {} } as never)).toBeNull();
  });
});
