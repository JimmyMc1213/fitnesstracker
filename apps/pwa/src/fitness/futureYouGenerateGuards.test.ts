import { describe, expect, it } from "vitest";

import {
  isMotivationValidForProfile,
  validateFutureYouGenerateRequest,
} from "./futureYouGenerateGuards";

describe("futureYouGenerateGuards", () => {
  const userId = "11111111-2222-3333-4444-555555555555";
  const sourcePath = `users/${userId}/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.jpg`;

  const validBody = {
    sourcePath,
    motivationId: "cut_m_veins",
    profile: {
      goal: "cut",
      gender: "male",
      weightLbs: 190,
      goalWeightLbs: 175,
    },
    timeline: "3 months",
  };

  it("accepts a valid generate request", () => {
    const result = validateFutureYouGenerateRequest(validBody, userId);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.request.timeline).toBe("3 months");
    }
  });

  it("rejects source paths outside the user folder", () => {
    const result = validateFutureYouGenerateRequest(
      {
        ...validBody,
        sourcePath: "users/other-user/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.jpg",
      },
      userId,
    );
    expect(result.ok).toBe(false);
  });

  it("rejects motivations that do not match goal and gender", () => {
    const result = validateFutureYouGenerateRequest(
      {
        ...validBody,
        motivationId: "cut_f_wedding_dress",
      },
      userId,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/goal or gender/i);
    }
  });

  it("validates maintain motivations for maintain goal", () => {
    expect(
      isMotivationValidForProfile("maintain_generic_glow", "maintain", "female"),
    ).toBe(true);
    expect(isMotivationValidForProfile("cut_m_veins", "maintain", "male")).toBe(false);
  });

  it("requires a positive weight", () => {
    const result = validateFutureYouGenerateRequest(
      {
        ...validBody,
        profile: { ...validBody.profile, weightLbs: 0 },
      },
      userId,
    );
    expect(result.ok).toBe(false);
  });
});
