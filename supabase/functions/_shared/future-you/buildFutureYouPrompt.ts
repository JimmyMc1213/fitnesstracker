/** Keep in sync with src/fitness/buildFutureYouPrompt.ts */

import { getFutureYouMotivationById } from "./futureYouMotivations.ts";
import type { NutritionGoal, UserGender } from "./types.ts";

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
