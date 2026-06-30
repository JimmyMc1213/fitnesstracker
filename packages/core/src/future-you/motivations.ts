import type { NutritionGoal, UserGender } from "@newyouai/types";

export type FutureYouMotivation = {
  id: string;
  /** Chip label on step 10c */
  label: string;
  /** 1–2 sentences sent to OpenAI image prompt assembler */
  promptFragment: string;
  /** Rotating copy on the generation pill when this motivation is selected */
  loadingPhrase: string;
  /** Softer fragment when user picks a generic “why” */
  isGeneric: boolean;
  goals: NutritionGoal[];
  genders: UserGender[];
};

export const FUTURE_YOU_MOTIVATIONS: FutureYouMotivation[] = [
  // ── Cut — generics ──────────────────────────────────────────────────
  {
    id: "cut_generic_best",
    label: "Look my best",
    promptFragment:
      "Show a clearly leaner, tighter version — visible waist slimming, less body fat, and stronger tone in chest, shoulders, and arms. Body changes only; do not alter the face. Make the transformation obvious and motivating.",
    loadingPhrase: "Polishing your look…",
    isGeneric: true,
    goals: ["cut"],
    genders: ["male", "female", "other"],
  },
  {
    id: "cut_generic_lean",
    label: "Lean & defined",
    promptFragment:
      "Show a clearly leaner body — tighter waist, reduced love handles, flatter belly, and visible muscle definition in chest, shoulders, and arms.",
    loadingPhrase: "Sharpening definition…",
    isGeneric: true,
    goals: ["cut"],
    genders: ["male", "female", "other"],
  },
  {
    id: "cut_generic_confident",
    label: "Feel confident",
    promptFragment:
      "Project a confident, fit appearance — visibly leaner frame with defined shoulders, arms, and core.",
    loadingPhrase: "Building your confident look…",
    isGeneric: true,
    goals: ["cut"],
    genders: ["male", "female", "other"],
  },

  // ── Cut — female specifics ──────────────────────────────────────────
  {
    id: "cut_f_wedding_dress",
    label: "Fit my wedding dress",
    promptFragment:
      "Emphasize a slimmer, toned silhouette suited for fitted formal wear — narrower waist, toned arms, and elegant posture. Keep the same clothing from the source photo; do not add or change outfits.",
    loadingPhrase: "Sculpting for the big day…",
    isGeneric: false,
    goals: ["cut"],
    genders: ["female"],
  },
  {
    id: "cut_f_toned_arms",
    label: "Toned arms",
    promptFragment:
      "Highlight lean, toned upper arms and shoulders — clear muscle definition that reads athletic and strong.",
    loadingPhrase: "Toning your arms…",
    isGeneric: false,
    goals: ["cut"],
    genders: ["female"],
  },
  {
    id: "cut_f_beach_ready",
    label: "Beach-ready",
    promptFragment:
      "Show a sun-ready, lean physique — flat midsection, toned legs, visible muscle definition, and an athletic silhouette.",
    loadingPhrase: "Getting beach-ready…",
    isGeneric: false,
    goals: ["cut"],
    genders: ["female"],
  },
  {
    id: "cut_f_abs",
    label: "Visible abs",
    promptFragment:
      "Emphasize a tighter core and visible ab definition when plausible — flatter belly, slimmer waist, and clear midsection tone.",
    loadingPhrase: "Toning your core…",
    isGeneric: false,
    goals: ["cut"],
    genders: ["female"],
  },

  // ── Cut — male specifics ────────────────────────────────────────────
  {
    id: "cut_m_veins",
    label: "Visible veins & definition",
    promptFragment:
      "Emphasize lean, visible vascularity and arm definition — gym-lean look with clear muscle separation.",
    loadingPhrase: "Enhancing arm definition…",
    isGeneric: false,
    goals: ["cut"],
    genders: ["male"],
  },
  {
    id: "cut_m_abs",
    label: "Visible abs",
    promptFragment:
      "Show a flatter belly, slimmer waist, and visible core and ab definition — clear leanness in the midsection.",
    loadingPhrase: "Carving your core…",
    isGeneric: false,
    goals: ["cut"],
    genders: ["male"],
  },
  {
    id: "cut_m_jawline",
    label: "Sharper jawline",
    promptFragment:
      "Emphasize body recomposition only — a slightly leaner neck and under-chin area from body fat loss is OK, but do NOT reshape, slim, or alter the face, jaw bone structure, eyes, nose, or mouth. Facial features must remain identical to the source.",
    loadingPhrase: "Sharpening your jawline…",
    isGeneric: false,
    goals: ["cut"],
    genders: ["male"],
  },
  {
    id: "cut_m_beach_ready",
    label: "Beach-ready",
    promptFragment:
      "Show a leaner, beach-ready look — slimmer waist, defined chest and shoulders, tighter midsection, and healthier skin.",
    loadingPhrase: "Getting beach-ready…",
    isGeneric: false,
    goals: ["cut"],
    genders: ["male"],
  },

  // ── Cut — shared specifics (all genders incl. other) ────────────────
  {
    id: "cut_shared_energy",
    label: "More energy for my kids",
    promptFragment:
      "Show a healthier, leaner version with vibrant energy — fitter frame, brighter complexion, and an active-parent look.",
    loadingPhrase: "Boosting your energy look…",
    isGeneric: false,
    goals: ["cut"],
    genders: ["male", "female", "other"],
  },

  // ── Bulk — generics ─────────────────────────────────────────────────
  {
    id: "bulk_generic_strong",
    label: "Strong & filled out",
    promptFragment:
      "Show a clearly stronger, filled-out build below the neck — visibly bigger and fuller chest, shoulders, and arms with real added muscle size that fills out the same shirt and stretches the sleeves a little. Make the muscle gain obvious and motivating, like a dedicated natural lifter after consistent training, while keeping the body proportional and believable. Keep the exact same face, hair, and outfit — same person, just noticeably more muscular.",
    loadingPhrase: "Filling out your frame…",
    isGeneric: true,
    goals: ["bulk"],
    genders: ["male", "female", "other"],
  },
  {
    id: "bulk_generic_athletic",
    label: "Athletic physique",
    promptFragment:
      "Show a noticeably athletic, muscular build — well-developed chest, shoulders, arms, and back with clearly visible muscle and lean, low-to-moderate body fat, like a fit gym regular. Keep the same person and face.",
    loadingPhrase: "Building your athletic look…",
    isGeneric: true,
    goals: ["bulk"],
    genders: ["male", "female", "other"],
  },
  {
    id: "bulk_generic_powerful",
    label: "Feel powerful",
    promptFragment:
      "Project real power and presence — visibly broader shoulders, a thicker, fuller chest, and bigger, stronger muscles with a confident, powerful posture. Keep the same person and face.",
    loadingPhrase: "Adding power to your look…",
    isGeneric: true,
    goals: ["bulk"],
    genders: ["male", "female", "other"],
  },

  // ── Bulk — male specifics ───────────────────────────────────────────
  {
    id: "bulk_m_shoulders",
    label: "Broader shoulders",
    promptFragment:
      "Show clearly wider shoulders and a thicker, more developed upper body — capped, rounded delts, a fuller chest, and an obvious V-taper. Keep the same person and face.",
    loadingPhrase: "Broadening your shoulders…",
    isGeneric: false,
    goals: ["bulk"],
    genders: ["male"],
  },
  {
    id: "bulk_m_arms",
    label: "Bigger arms",
    promptFragment:
      "Show clearly bigger, fuller biceps and triceps with obvious added arm size and a stronger upper body, while keeping the physique proportional. Keep the same person and face.",
    loadingPhrase: "Growing your arms…",
    isGeneric: false,
    goals: ["bulk"],
    genders: ["male"],
  },

  // ── Bulk — female specifics ─────────────────────────────────────────
  {
    id: "bulk_f_curves",
    label: "Strong, filled-out look",
    promptFragment:
      "Show a clearly stronger, fuller physique with athletic curves — fuller, firmer glutes and legs, defined shoulders and arms, and a strong, toned shape. Keep the same person and face.",
    loadingPhrase: "Sculpting your strong look…",
    isGeneric: false,
    goals: ["bulk"],
    genders: ["female"],
  },
  {
    id: "bulk_f_glutes",
    label: "Stronger glutes & legs",
    promptFragment:
      "Show clearly fuller, firmer glutes and stronger, more developed legs with a powerful lower body, keeping a balanced, athletic upper body. Keep the same person and face.",
    loadingPhrase: "Building your lower body…",
    isGeneric: false,
    goals: ["bulk"],
    genders: ["female"],
  },

  // ── Bulk — shared specifics ─────────────────────────────────────────
  {
    id: "bulk_shared_performance",
    label: "Perform better",
    promptFragment:
      "Show a clearly muscular, performance-ready build — noticeable added lean mass across the whole body, strong posture, and a capable, athletic look. Keep the same person and face.",
    loadingPhrase: "Powering up your build…",
    isGeneric: false,
    goals: ["bulk"],
    genders: ["male", "female", "other"],
  },

  // ── Maintain — generics ─────────────────────────────────────────────
  {
    id: "maintain_generic_healthier",
    label: "Healthier overall",
    promptFragment:
      "Show a visibly healthier, tighter version — less body fat, more muscle tone, refreshed complexion, and a fitter frame at similar scale.",
    loadingPhrase: "Refreshing your look…",
    isGeneric: true,
    goals: ["maintain"],
    genders: ["male", "female", "other"],
  },
  {
    id: "maintain_generic_energy",
    label: "More energy",
    promptFragment:
      "Project vibrant health and energy — visibly leaner frame, stronger muscle tone, brighter complexion, and an alert, athletic look.",
    loadingPhrase: "Brightening your look…",
    isGeneric: true,
    goals: ["maintain"],
    genders: ["male", "female", "other"],
  },
  {
    id: "maintain_generic_glow",
    label: "Subtle glow-up",
    promptFragment:
      "Show a clear glow-up — tighter waist, stronger shoulder and arm definition, less softness, and a healthier, more muscular look.",
    loadingPhrase: "Adding a subtle glow…",
    isGeneric: true,
    goals: ["maintain"],
    genders: ["male", "female", "other"],
  },

  // ── Maintain — specifics ────────────────────────────────────────────
  {
    id: "maintain_tone_up",
    label: "Subtle tone-up",
    promptFragment:
      "Emphasize a visible tone-up — tighter midsection, clearer muscle definition, less body fat, stronger overall look.",
    loadingPhrase: "Toning up subtly…",
    isGeneric: false,
    goals: ["maintain"],
    genders: ["male", "female", "other"],
  },
  {
    id: "maintain_kids_energy",
    label: "Keep up with my kids",
    promptFragment:
      "Show a fitter, energetic parent look — leaner frame, visible muscle tone, healthier complexion, and an active lifestyle look.",
    loadingPhrase: "Boosting your energy look…",
    isGeneric: false,
    goals: ["maintain"],
    genders: ["male", "female", "other"],
  },
  {
    id: "maintain_posture",
    label: "Stand taller & stronger",
    promptFragment:
      "Emphasize improved posture and visible muscle tone — upright stance, tighter core, stronger shoulders, less body fat.",
    loadingPhrase: "Refining your posture…",
    isGeneric: false,
    goals: ["maintain"],
    genders: ["male", "female", "other"],
  },
  {
    id: "maintain_f_definition",
    label: "A little more definition",
    promptFragment:
      "Show clearly more muscle definition in arms and legs with a tighter waist and less body fat while staying the same person.",
    loadingPhrase: "Adding subtle definition…",
    isGeneric: false,
    goals: ["maintain"],
    genders: ["female"],
  },
  {
    id: "maintain_m_definition",
    label: "A little more definition",
    promptFragment:
      "Show clearly more muscle definition in chest and arms with a tighter waist and less body fat while staying the same person.",
    loadingPhrase: "Adding subtle definition…",
    isGeneric: false,
    goals: ["maintain"],
    genders: ["male"],
  },
];

const motivationById = new Map(FUTURE_YOU_MOTIVATIONS.map((m) => [m.id, m]));

export function getFutureYouMotivationById(id: string): FutureYouMotivation | undefined {
  return motivationById.get(id);
}

/** Motivations shown on step 10c for the user's goal and gender. */
export function getFutureYouMotivationsForPicker(
  goal: NutritionGoal,
  gender: UserGender,
): FutureYouMotivation[] {
  return FUTURE_YOU_MOTIVATIONS.filter(
    (m) => m.goals.includes(goal) && m.genders.includes(gender),
  );
}

export function getFutureYouGenericMotivations(
  goal: NutritionGoal,
  gender: UserGender,
): FutureYouMotivation[] {
  return getFutureYouMotivationsForPicker(goal, gender).filter((m) => m.isGeneric);
}

export function getFutureYouSpecificMotivations(
  goal: NutritionGoal,
  gender: UserGender,
): FutureYouMotivation[] {
  return getFutureYouMotivationsForPicker(goal, gender).filter((m) => !m.isGeneric);
}
