import { describe, expect, it } from "vitest";

import {
  buildFutureYouPrompt,
  futureYouPromptProfileFromOnboarding,
} from "./buildFutureYouPrompt";

const cutMaleProfile = {
  goal: "cut" as const,
  gender: "male" as const,
  weightLbs: 200,
  goalWeightLbs: 180,
};

/** Critical guardrails — tests must fail if these lines are removed from the builder. */
const FACE_LOCK_MARKERS = [
  "face lock",
  "copy the face from the source photo exactly",
  "different person",
] as const;

const IDENTITY_MARKERS = [
  "recognizable identity",
  "below the collarbone",
  "scene lock",
  "hair lock",
  "anti-distortion",
] as const;

const MAINTAIN_MARKERS = [
  "maintain goal — subtle but visibly healthier",
  "same weight class",
  "no carved six-pack",
] as const;

const CUT_MARKERS = [
  "cut goal — realistic, motivating progress only",
  "love handles — important for weight loss",
  "abdominal realism",
  "no six-pack, no ab lines",
  "ripped fat",
] as const;

const BULK_MARKERS = [
  "bulk goal — realistic muscle gain only",
  "no model swap",
  "final check before finishing",
] as const;

describe("buildFutureYouPrompt", () => {
  it("always includes face lock and body-only scope for every goal", () => {
    const goals = ["cut", "bulk", "maintain"] as const;
    for (const goal of goals) {
      const prompt = buildFutureYouPrompt({
        profile: { goal, gender: "male", weightLbs: 180 },
        motivationId:
          goal === "cut"
            ? "cut_generic_lean"
            : goal === "bulk"
              ? "bulk_generic_strong"
              : "maintain_generic_glow",
      });
      for (const marker of FACE_LOCK_MARKERS) {
        expect(prompt.toLowerCase()).toContain(marker);
      }
      for (const marker of IDENTITY_MARKERS) {
        expect(prompt.toLowerCase()).toContain(marker);
      }
    }
  });

  it("injects maintain subtle guardrail regardless of motivation", () => {
    const prompt = buildFutureYouPrompt({
      profile: { goal: "maintain", gender: "other", weightLbs: 170 },
      motivationId: "maintain_generic_glow",
    });
    for (const marker of MAINTAIN_MARKERS) {
      expect(prompt.toLowerCase()).toContain(marker);
    }
  });

  it("omits maintain guardrail for cut and bulk goals", () => {
    const cutPrompt = buildFutureYouPrompt({
      profile: cutMaleProfile,
      motivationId: "cut_m_veins",
    });
    const bulkPrompt = buildFutureYouPrompt({
      profile: { goal: "bulk", gender: "male", weightLbs: 160, goalWeightLbs: 180 },
      motivationId: "bulk_generic_strong",
    });
    for (const marker of MAINTAIN_MARKERS) {
      expect(cutPrompt.toLowerCase()).not.toContain(marker);
      expect(bulkPrompt.toLowerCase()).not.toContain(marker);
    }
  });

  it("injects cut realism guardrail and timeline calibration", () => {
    const prompt = buildFutureYouPrompt({
      profile: cutMaleProfile,
      motivationId: "cut_generic_best",
      timeline: "3 months",
    });
    for (const marker of CUT_MARKERS) {
      expect(prompt.toLowerCase()).toContain(marker);
    }
    expect(prompt).toContain("Timeline calibration (≈3 months)");
  });

  it("uses longer-cut timeline calibration for 6 months", () => {
    const prompt = buildFutureYouPrompt({
      profile: cutMaleProfile,
      motivationId: "cut_generic_best",
      timeline: "6 months",
    });
    expect(prompt).toContain("Timeline calibration (≈6+ months)");
  });

  it("does not instruct face slimming in 3-month cut timeline", () => {
    const prompt = buildFutureYouPrompt({
      profile: cutMaleProfile,
      motivationId: "cut_generic_best",
      timeline: "3 months",
    });
    expect(prompt.toLowerCase()).not.toContain("slimmer face");
    expect(prompt.toLowerCase()).toContain("copy the face from the source photo exactly");
  });

  it("injects bulk guardrail, timeline calibration, and final face reminder", () => {
    const prompt = buildFutureYouPrompt({
      profile: { goal: "bulk", gender: "male", weightLbs: 170, goalWeightLbs: 185 },
      motivationId: "bulk_generic_strong",
      timeline: "6 months",
    });
    for (const marker of BULK_MARKERS) {
      expect(prompt.toLowerCase()).toContain(marker);
    }
    expect(prompt).toContain("Timeline calibration (≈6+ months)");
  });

  it("embeds distinct motivation fragments for wedding dress vs veins", () => {
    const wedding = buildFutureYouPrompt({
      profile: { goal: "cut", gender: "female", weightLbs: 160, goalWeightLbs: 140 },
      motivationId: "cut_f_wedding_dress",
    });
    const veins = buildFutureYouPrompt({
      profile: cutMaleProfile,
      motivationId: "cut_m_veins",
    });
    expect(wedding).toContain("fitted formal wear");
    expect(wedding).toContain("same clothing");
    expect(veins).toContain("vascularity");
    expect(wedding).not.toBe(veins);
  });

  it("includes timeline when provided", () => {
    const prompt = buildFutureYouPrompt({
      profile: cutMaleProfile,
      motivationId: "cut_generic_lean",
      timeline: "3 months",
    });
    expect(prompt).toContain("approximately 3 months");
  });

  it("omits timeline section when not provided", () => {
    const prompt = buildFutureYouPrompt({
      profile: cutMaleProfile,
      motivationId: "cut_generic_lean",
    });
    expect(prompt).not.toMatch(/timeframe:/i);
  });

  it("throws for unknown motivation id", () => {
    expect(() =>
      buildFutureYouPrompt({
        profile: cutMaleProfile,
        motivationId: "not_a_real_id",
      }),
    ).toThrow(/Unknown Future You motivation/);
  });
});

describe("futureYouPromptProfileFromOnboarding", () => {
  it("maps onboarding profile fields", () => {
    expect(
      futureYouPromptProfileFromOnboarding({
        goal: "cut",
        gender: "female",
        heightIn: 66,
        weightLbs: 150,
        age: 28,
        goalWeightLbs: 135,
      }),
    ).toEqual({
      goal: "cut",
      gender: "female",
      weightLbs: 150,
      goalWeightLbs: 135,
    });
  });

  it("throws when goal or gender is missing", () => {
    expect(() =>
      futureYouPromptProfileFromOnboarding({ gender: "male", heightIn: 70, weightLbs: 180, age: 30 }),
    ).toThrow(/goal/);
    expect(() =>
      futureYouPromptProfileFromOnboarding({ goal: "cut", heightIn: 70, weightLbs: 180, age: 30 }),
    ).toThrow(/gender/);
  });
});
