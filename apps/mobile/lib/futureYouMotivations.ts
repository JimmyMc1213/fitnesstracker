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
      "Show a healthier, slightly leaner version of this exact person — modest waist slimming, natural tone in chest shoulders and arms. Body changes only; do not alter the face. Believable for the stated timeline; motivating but never fantasy abs or airbrushed leanness.",
    loadingPhrase: "Polishing your look…",
    isGeneric: true,
    goals: ["cut"],
    genders: ["male", "female", "other"],
  },
  {
    id: "cut_generic_lean",
    label: "Lean & defined",
    promptFragment:
      "Show a leaner body with a tighter, smoother waist — love handles reduced or gone, flatter belly, natural tone in chest and shoulders. Match the stated weight loss — fit and leaner, not stage-ready and not 'ripped fat'.",
    loadingPhrase: "Sharpening definition…",
    isGeneric: true,
    goals: ["cut"],
    genders: ["male", "female", "other"],
  },
  {
    id: "cut_generic_confident",
    label: "Feel confident",
    promptFragment:
      "Project a confident, fit appearance — leaner frame, natural tone in shoulders and arms.",
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
      "Highlight lean, toned upper arms and shoulders — visible definition without looking overly muscular.",
    loadingPhrase: "Toning your arms…",
    isGeneric: false,
    goals: ["cut"],
    genders: ["female"],
  },
  {
    id: "cut_f_beach_ready",
    label: "Beach-ready",
    promptFragment:
      "Show a sun-ready, lean physique — flat midsection, toned legs, and an athletic but feminine silhouette.",
    loadingPhrase: "Getting beach-ready…",
    isGeneric: false,
    goals: ["cut"],
    genders: ["female"],
  },
  {
    id: "cut_f_abs",
    label: "Visible abs",
    promptFragment:
      "Emphasize a tighter core only if already plausible — otherwise a flatter belly and slimmer waistline without sharp abdominal lines.",
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
      "Emphasize lean, naturally visible vascularity on forearms and arms — realistic gym-lean look with subtle vein detail, not stage-ready bodybuilding dryness.",
    loadingPhrase: "Enhancing arm definition…",
    isGeneric: false,
    goals: ["cut"],
    genders: ["male"],
  },
  {
    id: "cut_m_abs",
    label: "Visible abs",
    promptFragment:
      "If the source already shows abs, modest additional core tone only. If not, show a flatter belly and slimmer waist — never invent sharp six-pack lines or fake ab definition.",
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
      "Show a leaner, beach-ready look — slimmer waist, natural tone in chest and shoulders, healthier skin. Flat midsection is fine; do not add carved abs unless already plausible in the source.",
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
      "Show a slightly fuller, stronger build below the collarbone only — modest added muscle under the same clothes, with a bit more chest and arm shape while staying proportional. Keep the exact same shirt and outfit. Do not alter the face. Same person, not a fitness model swap.",
    loadingPhrase: "Filling out your frame…",
    isGeneric: true,
    goals: ["bulk"],
    genders: ["male", "female", "other"],
  },
  {
    id: "bulk_generic_athletic",
    label: "Athletic physique",
    promptFragment:
      "Emphasize an athletic, muscular build — balanced upper and lower body with visible muscle without excess fat.",
    loadingPhrase: "Building your athletic look…",
    isGeneric: true,
    goals: ["bulk"],
    genders: ["male", "female", "other"],
  },
  {
    id: "bulk_generic_powerful",
    label: "Feel powerful",
    promptFragment:
      "Project power and presence — broader shoulders, fuller muscles, and a confident, strong posture.",
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
      "Emphasize wider shoulders and a thicker upper body — capped delts, fuller chest, and a V-taper silhouette.",
    loadingPhrase: "Broadening your shoulders…",
    isGeneric: false,
    goals: ["bulk"],
    genders: ["male"],
  },
  {
    id: "bulk_m_arms",
    label: "Bigger arms",
    promptFragment:
      "Highlight fuller biceps and triceps with added arm size while keeping the rest of the physique proportionate.",
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
      "Show a stronger, fuller physique with toned curves — fuller glutes and legs, defined shoulders, and athletic shape.",
    loadingPhrase: "Sculpting your strong look…",
    isGeneric: false,
    goals: ["bulk"],
    genders: ["female"],
  },
  {
    id: "bulk_f_glutes",
    label: "Stronger glutes & legs",
    promptFragment:
      "Emphasize fuller, toned glutes and legs with a strong lower body while keeping a balanced upper body.",
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
      "Show a muscular, performance-ready build — added lean mass, strong posture, and an capable athlete look.",
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
      "Show a subtly healthier version — almost imperceptible improvements: slightly refreshed complexion, a touch more tone, same overall size and body fat.",
    loadingPhrase: "Refreshing your look…",
    isGeneric: true,
    goals: ["maintain"],
    genders: ["male", "female", "other"],
  },
  {
    id: "maintain_generic_energy",
    label: "More energy",
    promptFragment:
      "Project vibrant health and energy — barely noticeable leaner frame, brighter complexion, and an alert look. Same weight class and clothing fit.",
    loadingPhrase: "Brightening your look…",
    isGeneric: true,
    goals: ["maintain"],
    genders: ["male", "female", "other"],
  },
  {
    id: "maintain_generic_glow",
    label: "Subtle glow-up",
    promptFragment:
      "Show a subtle glow-up — slightly tighter waist, a touch more shoulder and arm tone, healthier complexion. Same weight class; gentle visible improvement, a little closer to early cut progress but still clearly maintain.",
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
      "Emphasize a minor tone-up only — barely tighter midsection, slightly more definition, same overall size and body fat.",
    loadingPhrase: "Toning up subtly…",
    isGeneric: false,
    goals: ["maintain"],
    genders: ["male", "female", "other"],
  },
  {
    id: "maintain_kids_energy",
    label: "Keep up with my kids",
    promptFragment:
      "Show a fitter, energetic parent look — healthier complexion, slightly leaner, and ready for an active lifestyle.",
    loadingPhrase: "Boosting your energy look…",
    isGeneric: false,
    goals: ["maintain"],
    genders: ["male", "female", "other"],
  },
  {
    id: "maintain_posture",
    label: "Stand taller & stronger",
    promptFragment:
      "Emphasize improved posture and subtle muscle tone — upright stance, slightly tighter core, same weight class.",
    loadingPhrase: "Refining your posture…",
    isGeneric: false,
    goals: ["maintain"],
    genders: ["male", "female", "other"],
  },
  {
    id: "maintain_f_definition",
    label: "A little more definition",
    promptFragment:
      "Show slightly more muscle definition in arms and legs while keeping the same overall weight and proportions.",
    loadingPhrase: "Adding subtle definition…",
    isGeneric: false,
    goals: ["maintain"],
    genders: ["female"],
  },
  {
    id: "maintain_m_definition",
    label: "A little more definition",
    promptFragment:
      "Show slightly more muscle definition in chest and arms while keeping the same overall weight and proportions.",
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
