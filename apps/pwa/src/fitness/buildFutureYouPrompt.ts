import { getFutureYouMotivationById } from "./futureYouMotivations";
import type { NutritionGoal, OnboardingProfile, UserGender } from "./types";

/** Profile fields required to assemble a Future You image prompt. */
export type FutureYouPromptProfile = {
  goal: NutritionGoal;
  gender: UserGender;
  weightLbs: number;
  goalWeightLbs?: number;
};

export type BuildFutureYouPromptInput = {
  profile: FutureYouPromptProfile;
  motivationId: string;
  /** Paywall / plan timeline copy, e.g. "3 months". Omitted when unknown. */
  timeline?: string;
};

/** Positive, natural-language description of the goal direction. */
const GOAL_PHRASE: Record<NutritionGoal, string> = {
  cut: "a leaner, more defined physique",
  bulk: "a more muscular, fuller physique",
  maintain: "a maintained, healthy physique",
};

export function futureYouPromptProfileFromOnboarding(
  profile: OnboardingProfile,
): FutureYouPromptProfile {
  if (!profile.goal) {
    throw new Error("Future You prompt requires onboarding goal");
  }
  if (!profile.gender) {
    throw new Error("Future You prompt requires onboarding gender");
  }
  return {
    goal: profile.goal,
    gender: profile.gender,
    weightLbs: profile.weightLbs,
    goalWeightLbs: profile.goalWeightLbs,
  };
}

function subjectFromGender(gender: UserGender): string {
  if (gender === "male") return "this man";
  if (gender === "female") return "this woman";
  return "this person";
}

/**
 * Assembles a short, positive maskless image-to-image prompt. Everything is
 * stated as what to preserve or produce — never as "don't" — so the model edits
 * the existing person rather than constraining a single generation with negatives.
 */
export function buildFutureYouPrompt(input: BuildFutureYouPromptInput): string {
  const motivation = getFutureYouMotivationById(input.motivationId);
  if (!motivation) {
    throw new Error(`Unknown Future You motivation id: ${input.motivationId}`);
  }

  const timeline = input.timeline?.trim() || "a few months";
  const goalPhrase = GOAL_PHRASE[input.profile.goal];
  const subject = subjectFromGender(input.profile.gender);

  const sentences = [
    "Keep this exact person — same face, hair, skin, and pose.",
    `Show a realistic, believable version of ${subject} after ${timeline} of training toward ${goalPhrase}.`,
    "Same lighting and setting.",
    "Photorealistic, natural, not an idealized fitness model.",
    motivation.promptFragment.trim(),
  ];

  return sentences.join(" ");
}
