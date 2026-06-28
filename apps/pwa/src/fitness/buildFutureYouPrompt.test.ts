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

describe("buildFutureYouPrompt", () => {
  it("opens with the identity-preservation line for every goal", () => {
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
      expect(prompt).toContain("Keep this exact person — same face, hair, skin, and pose.");
      expect(prompt).toContain("Photorealistic, natural, not an idealized fitness model.");
      expect(prompt).toContain("Same lighting and setting.");
    }
  });

  it("uses the goal-specific physique phrase", () => {
    const cut = buildFutureYouPrompt({ profile: cutMaleProfile, motivationId: "cut_generic_lean" });
    const bulk = buildFutureYouPrompt({
      profile: { goal: "bulk", gender: "male", weightLbs: 160, goalWeightLbs: 180 },
      motivationId: "bulk_generic_strong",
    });
    const maintain = buildFutureYouPrompt({
      profile: { goal: "maintain", gender: "other", weightLbs: 170 },
      motivationId: "maintain_generic_glow",
    });
    expect(cut).toContain("a leaner, more defined physique");
    expect(bulk).toContain("a more muscular, fuller physique");
    expect(maintain).toContain("a maintained, healthy physique");
  });

  it("addresses the subject by gender", () => {
    const male = buildFutureYouPrompt({ profile: cutMaleProfile, motivationId: "cut_generic_lean" });
    const female = buildFutureYouPrompt({
      profile: { goal: "cut", gender: "female", weightLbs: 150, goalWeightLbs: 135 },
      motivationId: "cut_generic_lean",
    });
    const other = buildFutureYouPrompt({
      profile: { goal: "maintain", gender: "other", weightLbs: 170 },
      motivationId: "maintain_generic_glow",
    });
    expect(male).toContain("version of this man after");
    expect(female).toContain("version of this woman after");
    expect(other).toContain("version of this person after");
  });

  it("includes the timeline when provided and falls back otherwise", () => {
    const withTimeline = buildFutureYouPrompt({
      profile: cutMaleProfile,
      motivationId: "cut_generic_lean",
      timeline: "3 months",
    });
    const withoutTimeline = buildFutureYouPrompt({
      profile: cutMaleProfile,
      motivationId: "cut_generic_lean",
    });
    expect(withTimeline).toContain("after 3 months of training");
    expect(withoutTimeline).toContain("after a few months of training");
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
    expect(veins).toContain("vascularity");
    expect(wedding).not.toBe(veins);
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
