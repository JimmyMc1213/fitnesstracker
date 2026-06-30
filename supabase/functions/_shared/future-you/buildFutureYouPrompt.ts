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

const HEAVY_CUT_WEIGHT_THRESHOLD_LBS = 200;
const MODEST_HEAVY_CUT_DELTA_LBS = 20;

const HEAVY_CUT_GOAL_PHRASE =
  "a healthier, slightly leaner physique with natural muscle tone — fit and strong without extreme leanness";

const HEAVY_CUT_CLOSING =
  "Photorealistic, same person — believable progress for their age and goal weight; healthy and motivating, not an idealized fitness model.";

function isHeavyCut(profile: FutureYouPromptProfile): boolean {
  return profile.goal === "cut" && profile.weightLbs > HEAVY_CUT_WEIGHT_THRESHOLD_LBS;
}

function weightDeltaLbs(profile: FutureYouPromptProfile): number | null {
  if (profile.goalWeightLbs == null || !Number.isFinite(profile.goalWeightLbs)) return null;
  return Math.abs(profile.weightLbs - profile.goalWeightLbs);
}

function goalPhraseForProfile(profile: FutureYouPromptProfile): string {
  if (isHeavyCut(profile)) return HEAVY_CUT_GOAL_PHRASE;
  return GOAL_PHRASE[profile.goal];
}

function bodyDirectiveForProfile(profile: FutureYouPromptProfile): string {
  if (!isHeavyCut(profile)) return GOAL_BODY_DIRECTIVE[profile.goal];

  const delta = weightDeltaLbs(profile);
  if (delta != null && delta <= MODEST_HEAVY_CUT_DELTA_LBS) {
    return `Show a modest, believable slim-down matching about ${Math.round(delta)} pounds lost — slightly less midsection softness, a gently tighter waist, and healthy tone in chest and shoulders. Keep a solid, natural build with comfortable body fat; no six-pack or fitness-model definition.`;
  }

  return "Show a realistic slim-down toward their goal weight — less softness through the midsection and waist, healthier muscle tone, and a stronger fit appearance. Keep a natural, athletic build without extreme leanness or shredded definition.";
}

function closingLineForProfile(profile: FutureYouPromptProfile): string {
  if (isHeavyCut(profile)) return HEAVY_CUT_CLOSING;
  return "Photorealistic, same person — make the physique upgrade obvious and motivating; believable gym progress, not a different face.";
}

function weightContextForProfile(profile: FutureYouPromptProfile): string | null {
  if (!isHeavyCut(profile) || profile.goalWeightLbs == null) return null;
  return `Scale the visible change to reaching about ${Math.round(profile.goalWeightLbs)} lbs from ${Math.round(profile.weightLbs)} lbs — proportional to that shift, not a dramatic shred.`;
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
  const goalPhrase = goalPhraseForProfile(input.profile);
  const subject = subjectFromGender(input.profile.gender);
  const weightContext = weightContextForProfile(input.profile);

  const sentences = [
    "Keep this exact person — same face, hair, skin, and pose.",
    `Show a realistic, believable version of ${subject} after ${timeline} of training toward ${goalPhrase}.`,
    bodyDirectiveForProfile(input.profile),
    ...(weightContext ? [weightContext] : []),
    "Same lighting and setting.",
    closingLineForProfile(input.profile),
    motivation.promptFragment.trim(),
  ];

  return sentences.join(" ");
}
