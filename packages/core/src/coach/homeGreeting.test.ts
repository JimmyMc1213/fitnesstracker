import { describe, expect, it } from "vitest";

import { greetingFirstName, homeGreetingTitle, timeOfDayBucket } from "./homeGreeting";

describe("timeOfDayBucket", () => {
  it("buckets morning hours", () => {
    expect(timeOfDayBucket(new Date("2026-06-12T08:00:00"))).toBe("morning");
  });

  it("buckets afternoon hours", () => {
    expect(timeOfDayBucket(new Date("2026-06-12T14:00:00"))).toBe("afternoon");
  });

  it("buckets evening hours", () => {
    expect(timeOfDayBucket(new Date("2026-06-12T20:00:00"))).toBe("evening");
  });
});

describe("greetingFirstName", () => {
  it("returns first token", () => {
    expect(greetingFirstName("Jimmy McCarthy")).toBe("Jimmy");
  });

  it("returns empty for blank name", () => {
    expect(greetingFirstName("   ")).toBe("");
  });
});

describe("homeGreetingTitle", () => {
  it("includes first name when present", () => {
    expect(homeGreetingTitle("Jimmy", new Date("2026-06-12T08:00:00"))).toBe("Good morning, Jimmy");
  });

  it("omits name when absent", () => {
    expect(homeGreetingTitle("", new Date("2026-06-12T20:00:00"))).toBe("Good evening");
  });
});
