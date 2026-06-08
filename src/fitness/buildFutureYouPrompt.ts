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

const OPENING =
  "BODY-ONLY EDIT: Adjust muscle and body fat on the torso, arms, and legs below the collarbone. The face, head, hair, neck, and background are locked — do not redraw, replace, slim, or beautify them.";

const FACE_LOCK_BLOCK =
  "FACE LOCK — HIGHEST PRIORITY, NON-NEGOTIABLE: Copy the face from the source photo exactly. Do not change the face, head, neck above the collarbone, or anything above the collarbone. Keep identical: facial structure, eyes, nose, mouth, lips, jaw shape, ears, hair, beard, mustache, eyebrows, skin texture on the face, facial expression, and apparent age. Do not beautify, de-age, slim, widen, smooth, or reshape the face. Do not alter teeth or smile. If the face looks even slightly different, airbrushed, or like a different person, the edit has failed.";

const HAIR_LOCK_BLOCK =
  "HAIR LOCK — keep the exact hairstyle from the source: same length, volume, curl pattern, messiness, bedhead, flyaways, part, and color. Do NOT comb, slick, neaten, groom, restyle, or 'fix' the hair. Messy or tousled hair must stay messy and tousled.";

const CLOTHING_LOCK_BLOCK =
  "CLOTHING LOCK — NON-NEGOTIABLE: Keep the exact same outfit from the source photo — same shirt, pants, underwear, shoes, and accessories. Never remove clothing, never go shirtless, never swap outfits, never change colors or fabric.";

const SCENE_LOCK_BLOCK =
  "SCENE LOCK: Keep the entire scene identical — background, skyline, walls, brick patterns, ground markings, room, mirror, props, lighting, shadows, camera angle, pose, hands, accessories, jewelry, watches, tattoos, and phone if visible. Do NOT clean up, sharpen, redraw, or 'fix' any background imperfections, blur, or uneven textures. Copy the environment exactly as-is.";

const ANTI_DISTORTION_BLOCK =
  "ANTI-DISTORTION: Do not warp, stretch, shorten, or twist limbs, torso, or proportions. Keep the same pose skeleton, hand positions, and natural body geometry. Only adjust muscle and fat distribution below the collarbone — never CGI-looking anatomy.";

const FINAL_REMINDER_BLOCK =
  "Final check before finishing: the face, head, exact messy hair, expression, entire background, pose, clothing, and lighting must match the source photo pixel-for-pixel above the collarbone and in the environment. Only the body below the collarbone should look different. Same person — not a fitness model swap.";

const IDENTITY_BLOCK =
  "Same person throughout — recognizable identity, same ethnicity and presentation. Edit the existing person in the photo only; do not replace them with a different person or stock fitness model.";

const BODY_EDIT_SCOPE =
  "Allowed changes ONLY: torso shape, belly, waist, chest, shoulders, arms, legs, and body fat or muscle distribution below the neck. Every other part of the image must match the source as closely as possible.";

const DISCLAIMER_BLOCK =
  "This is an illustrative fitness visualization only — not medical advice, not a guaranteed outcome, and not a prediction of health results. Keep the result realistic and attainable for the stated weight change and timeline — not hyper-idealized, airbrushed, competition-ready, or cartoon-like.";

const MAINTAIN_GUARDRAIL =
  "Maintain goal — subtle but visibly healthier (body only): modest waist slimming, a bit more muscle tone in shoulders and arms. Keep the same weight class and clothing fit. No face changes, no dramatic transformation, no carved six-pack, no major size change. Change should be gentle but noticeable — a little closer to early cut progress than identical, yet clearly less than a full cut goal.";

const CUT_GUARDRAIL =
  "Cut goal — realistic, motivating progress only (body below the neck): show a believable Future You that inspires someone to start, not a fitness magazine cover. Respect the starting body composition in the source photo — if the person carries more body fat, show a slimmer, smaller version of the same person with improved muscle shape in chest, shoulders, and arms; do NOT add fake, sharp, or CGI-looking six-pack abs. Visibly reduce or remove love handles and side waist fat so the torso looks smoother from the front and sides — no spare tire or muffin top. If they are already lean, show moderate additional definition only — never stage-ready or competition lean. Do not slim or reshape the face. Keep natural skin texture and soft midsection transitions. Scale visible change to the stated timeline — shorter timelines mean smaller differences.";

const CUT_LOVE_HANDLES_BLOCK =
  "Love handles — important for weight loss: if the source shows love handles, side waist fat, or a soft spare tire, the result should show them clearly reduced or gone — a tighter, smoother waist from every angle. Do not leave love handles while adding muscle definition elsewhere. Also avoid a 'ripped fat' look: no sharp oblique cuts, serratus lines, or carved side abs over remaining softness — leaner and smoother, not partially shredded.";

const CUT_ABS_REALISM =
  "Abdominal realism — critical for heavier builds: only show visible abs if the source photo already shows clear abdominal definition. If the source has a soft belly or higher body fat, keep a flat or soft front midsection — no six-pack, no ab lines, no carved core. Love handles and side fat should still come down on a cut; the front belly can stay soft while the waist and sides get tighter. Real people at higher body fat do not have abs, even after a successful cut.";

const BULK_GUARDRAIL =
  "Bulk goal — realistic muscle gain only (body below the collarbone): show the same person with modest added muscle mass — slightly fuller chest, shoulders, and arms under the same clothes — while staying proportional to their frame. Do NOT swap in a different person, stock fitness model, or generic gym-bro face. Do not change the face, jaw, or expression. Never remove the shirt or go shirtless. No bodybuilder physique, no extreme vascularity, no oiled competition look. Keep natural skin texture — no airbrushed or plastic skin. Scale visible size change to the stated weight gain and timeline; a 15 lb gain should look believable, not dramatic. Clothing may fit slightly fuller in the chest and sleeves, but the outfit stays the same.";

const GOAL_DIRECTION: Record<NutritionGoal, string> = {
  cut: "fat loss / leaning out",
  bulk: "muscle gain / filling out",
  maintain: "maintaining weight while improving health and tone",
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

function goalContextBlock(profile: FutureYouPromptProfile): string {
  const direction = GOAL_DIRECTION[profile.goal];
  const parts = [
    `Fitness goal: ${profile.goal} (${direction}).`,
    `Current weight context: approximately ${Math.round(profile.weightLbs)} lb.`,
  ];

  if (profile.goal !== "maintain" && profile.goalWeightLbs != null) {
    const delta = Math.round(Math.abs(profile.goalWeightLbs - profile.weightLbs));
    const change = profile.goal === "cut" ? "loss" : "gain";
    parts.push(
      `Target weight context: approximately ${Math.round(profile.goalWeightLbs)} lb (${delta} lb ${change} toward goal).`,
    );
  }

  parts.push(`Presentation context: ${profile.gender}.`);

  return parts.join(" ");
}

function cutTimelineBlock(timeline?: string): string | null {
  const trimmed = timeline?.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (/\b3\b/.test(lower) && !/\b6\b/.test(lower) && !/\b9\b/.test(lower) && !/\b12\b/.test(lower)) {
    return "Timeline calibration (≈3 months): show modest early body progress — slightly slimmer waist, love handles starting to come down, a bit more shape in shoulders and arms. The difference from the source should be noticeable but gentle on the body only, not a dramatic before/after. Do not change the face.";
  }
  if (/\b6\b/.test(lower) || /\b9\b/.test(lower) || /\b12\b/.test(lower) || lower.includes("year")) {
    return "Timeline calibration (≈6+ months): show clearer but still natural body progress — noticeably slimmer frame, love handles reduced or gone, improved muscle shape in chest shoulders and arms, flatter belly — but keep realistic body fat, soft front midsection if needed, and no visible abs unless the source already shows them. Do not change the face.";
  }

  return `Timeline calibration: scale visible transformation to approximately ${trimmed} of consistent training and nutrition — believable and motivating, not fantasy.`;
}

function bulkTimelineBlock(timeline?: string): string | null {
  const trimmed = timeline?.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (/\b3\b/.test(lower) && !/\b6\b/.test(lower) && !/\b9\b/.test(lower) && !/\b12\b/.test(lower)) {
    return "Timeline calibration (≈3 months): show modest early bulk progress — slightly fuller chest, shoulders, and arms. Keep the same person and face. The difference should be gentle, not a dramatic before/after.";
  }
  if (/\b6\b/.test(lower) || /\b9\b/.test(lower) || /\b12\b/.test(lower) || lower.includes("year")) {
    return "Timeline calibration (≈6+ months): show clearer but still natural bulk progress — noticeably fuller upper body and arms with added muscle shape. Keep the same person and face — no model swap. Believable for the stated weight gain, not bodybuilder level.";
  }

  return `Timeline calibration: scale visible muscle gain to approximately ${trimmed} of consistent training and nutrition — believable and motivating, not fantasy.`;
}

/**
 * Assembles the full OpenAI image-edit instruction from onboarding profile,
 * a curated motivation id, and an optional timeline string.
 */
export function buildFutureYouPrompt(input: BuildFutureYouPromptInput): string {
  const motivation = getFutureYouMotivationById(input.motivationId);
  if (!motivation) {
    throw new Error(`Unknown Future You motivation id: ${input.motivationId}`);
  }

  const timeline = input.timeline?.trim();
  const sections: string[] = [
    OPENING,
    FACE_LOCK_BLOCK,
    HAIR_LOCK_BLOCK,
    CLOTHING_LOCK_BLOCK,
    SCENE_LOCK_BLOCK,
    ANTI_DISTORTION_BLOCK,
    IDENTITY_BLOCK,
    BODY_EDIT_SCOPE,
    DISCLAIMER_BLOCK,
  ];

  if (input.profile.goal === "maintain") {
    sections.push(MAINTAIN_GUARDRAIL);
  }

  if (input.profile.goal === "cut") {
    sections.push(CUT_GUARDRAIL);
    sections.push(CUT_LOVE_HANDLES_BLOCK);
    sections.push(CUT_ABS_REALISM);
  }

  if (input.profile.goal === "bulk") {
    sections.push(BULK_GUARDRAIL);
  }

  sections.push(goalContextBlock(input.profile));

  if (timeline) {
    sections.push(
      `Timeframe: the visible change represents realistic progress over approximately ${timeline}.`,
    );
    if (input.profile.goal === "cut") {
      const calibration = cutTimelineBlock(timeline);
      if (calibration) sections.push(calibration);
    }
    if (input.profile.goal === "bulk") {
      const calibration = bulkTimelineBlock(timeline);
      if (calibration) sections.push(calibration);
    }
  }

  sections.push(`Personalization focus: ${motivation.promptFragment}`);
  sections.push(FINAL_REMINDER_BLOCK);

  return sections.join("\n\n");
}
