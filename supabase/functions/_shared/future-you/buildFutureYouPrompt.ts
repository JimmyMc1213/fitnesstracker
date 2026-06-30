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
  cut: "a visibly leaner, tighter physique with less body fat and clear muscle definition",
  bulk: "a noticeably bigger, more muscular physique with added lean mass",
  maintain: "a tighter, more defined physique with less body fat and more visible muscle",
};

/** Goal-specific body recomposition emphasis (always: more muscle tone, less fat). */
const GOAL_BODY_DIRECTIVE: Record<NutritionGoal, string> = {
  cut: "Visibly reduce body fat and bring out leanness — slimmer waist, tighter midsection, less softness, and sharper definition in chest, shoulders, arms, and legs.",
  bulk: "Visibly add muscle size — fuller chest, shoulders, and arms, thicker upper body, and a stronger build with less soft fat.",
  maintain: "Recompose toward less fat and more muscle — tighter midsection, stronger shoulders and arms, and clearer definition while staying the same person.",
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
    GOAL_BODY_DIRECTIVE[input.profile.goal],
    "Same lighting and setting.",
    "Photorealistic, same person — make the physique upgrade obvious and motivating; believable gym progress, not a different face.",
    motivation.promptFragment.trim(),
  ];

  return sentences.join(" ");
}
