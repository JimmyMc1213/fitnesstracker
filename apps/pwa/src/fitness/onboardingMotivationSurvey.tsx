import type {
  DietaryRestriction,
  OnboardingBarrier,
  TrainingStyle,
} from "./types";

export const ONBOARDING_BARRIERS: OnboardingBarrier[] = [
  "falling_off",
  "eating",
  "no_plan",
  "life_busy",
  "no_results",
];

const LEGACY_OBSTACLE_TO_BARRIER: Record<string, OnboardingBarrier> = {
  lack_of_consistency: "falling_off",
  unhealthy_eating: "eating",
  lack_of_support: "no_plan",
  busy_schedule: "life_busy",
  lack_of_meal_inspiration: "eating",
};

export const DIETARY_RESTRICTIONS: DietaryRestriction[] = [
  "no_restrictions",
  "no_red_meat",
  "pescatarian",
  "vegetarian",
  "vegan",
  "dairy_free",
  "gluten_free",
];

export const TRAINING_STYLES: TrainingStyle[] = [
  "directive",
  "flexible",
  "accountable",
  "beginner_guided",
];

const LEGACY_DIET_TO_RESTRICTIONS: Record<string, DietaryRestriction[]> = {
  classic: ["no_restrictions"],
  pescatarian: ["pescatarian"],
  vegetarian: ["vegetarian"],
  vegan: ["vegan"],
};

export function barrierLabel(barrier: OnboardingBarrier): string {
  switch (barrier) {
    case "falling_off":
      return "Starting strong then falling off";
    case "eating":
      return "Not knowing what to eat";
    case "no_plan":
      return "No structure or clear plan";
    case "life_busy":
      return "Life gets in the way";
    case "no_results":
      return "Not seeing results fast enough";
  }
}

export function dietaryRestrictionLabel(restriction: DietaryRestriction): string {
  switch (restriction) {
    case "no_restrictions":
      return "No restrictions. I eat everything";
    case "no_red_meat":
      return "No red meat";
    case "pescatarian":
      return "Pescatarian. No meat, fish is fine";
    case "vegetarian":
      return "Vegetarian. No meat or fish";
    case "vegan":
      return "Vegan. No animal products";
    case "dairy_free":
      return "Dairy free";
    case "gluten_free":
      return "Gluten free";
  }
}

export function trainingStyleLabel(style: TrainingStyle): string {
  switch (style) {
    case "directive":
      return "Tell me exactly what to do";
    case "flexible":
      return "Give me structure with some flexibility";
    case "accountable":
      return "I know my stuff, just keep me accountable";
    case "beginner_guided":
      return "I'm starting completely from scratch";
  }
}

export function toggleSurveySelection<T extends string>(selected: T[] | undefined, item: T): T[] {
  const current = selected ?? [];
  return current.includes(item) ? current.filter((x) => x !== item) : [...current, item];
}

export function toggleDietaryRestriction(
  selected: DietaryRestriction[] | undefined,
  item: DietaryRestriction,
): DietaryRestriction[] {
  const current = selected ?? [];
  if (item === "no_restrictions") {
    return current.includes(item) ? [] : ["no_restrictions"];
  }
  const withoutNone = current.filter((x) => x !== "no_restrictions");
  return withoutNone.includes(item)
    ? withoutNone.filter((x) => x !== item)
    : [...withoutNone, item];
}

function normalizeBarrierId(raw: unknown): OnboardingBarrier | null {
  if (typeof raw !== "string") return null;
  if (ONBOARDING_BARRIERS.includes(raw as OnboardingBarrier)) return raw as OnboardingBarrier;
  return LEGACY_OBSTACLE_TO_BARRIER[raw] ?? null;
}

export function normalizeBarriers(raw: unknown): OnboardingBarrier[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: OnboardingBarrier[] = [];
  for (const item of raw) {
    const barrier = normalizeBarrierId(item);
    if (barrier && !out.includes(barrier)) out.push(barrier);
  }
  return out.length > 0 ? out : undefined;
}

export function normalizeDietaryRestrictions(raw: unknown): DietaryRestriction[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out = raw.filter((item): item is DietaryRestriction =>
    DIETARY_RESTRICTIONS.includes(item as DietaryRestriction),
  );
  if (out.includes("no_restrictions") && out.length > 1) {
    return out.filter((x) => x !== "no_restrictions");
  }
  return out.length > 0 ? out : undefined;
}

/** Migrate legacy single-select `dietPreference` when `dietaryRestrictions` is absent. */
export function migrateDietaryRestrictions(
  dietaryRestrictions: DietaryRestriction[] | undefined,
  legacyDietPreference: unknown,
): DietaryRestriction[] | undefined {
  if (dietaryRestrictions?.length) return dietaryRestrictions;
  if (typeof legacyDietPreference !== "string") return undefined;
  return LEGACY_DIET_TO_RESTRICTIONS[legacyDietPreference];
}

export function normalizeTrainingStyle(raw: unknown): TrainingStyle | undefined {
  return TRAINING_STYLES.includes(raw as TrainingStyle) ? (raw as TrainingStyle) : undefined;
}

export function barrierEmoji(barrier: OnboardingBarrier): string {
  switch (barrier) {
    case "falling_off":
      return "🔥";
    case "eating":
      return "🍽️";
    case "no_plan":
      return "📋";
    case "life_busy":
      return "⏰";
    case "no_results":
      return "📈";
  }
}

export function dietaryRestrictionEmoji(restriction: DietaryRestriction): string {
  switch (restriction) {
    case "no_restrictions":
      return "✅";
    case "no_red_meat":
      return "🥩";
    case "pescatarian":
      return "🐟";
    case "vegetarian":
      return "🥦";
    case "vegan":
      return "🌱";
    case "dairy_free":
      return "🥛";
    case "gluten_free":
      return "🌾";
  }
}

export function trainingStyleEmoji(style: TrainingStyle): string {
  switch (style) {
    case "directive":
      return "📋";
    case "flexible":
      return "⚖️";
    case "accountable":
      return "💪";
    case "beginner_guided":
      return "🌱";
  }
}
