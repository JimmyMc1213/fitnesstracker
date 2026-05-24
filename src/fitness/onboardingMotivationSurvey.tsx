import type { ReactNode } from "react";

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

function iconWrap(children: ReactNode) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="survey-option-icon">
      <rect width="24" height="24" rx="5" className="survey-option-icon__bg" />
      {children}
    </svg>
  );
}

export function barrierIcon(barrier: OnboardingBarrier): ReactNode {
  switch (barrier) {
    case "falling_off":
      return iconWrap(
        <path
          d="M12 6.5c-1.2 2.2-2.5 4.2-2.5 6.2a2.5 2.5 0 0 0 5 0c0-1.2-.6-2.4-1.3-3.6.4 1.6 1.3 3.1 2.3 4.4-.8-1.8-1.2-3.6-1.2-5.3 0-.6.4-1 1-1s1 .4 1 1c0 .8-.2 1.6-.5 2.5.8-1.2 1.8-2.2 2.8-3z"
          fill="currentColor"
        />,
      );
    case "eating":
      return iconWrap(
        <>
          <path
            d="M8 11.5c0-2.2 1.8-4 4-4s4 1.8 4 4v4.5H8V11.5z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <path d="M10 8.5c.5-1.2 1.2-2 2-2M14 8.5c-.5-1.2-1.2-2-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 7.5c.8-.8 1.8-1.2 3-1.2s2.2.4 3 1.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>,
      );
    case "no_plan":
      return iconWrap(
        <>
          <rect x="6.5" y="7" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="13" y="7" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="6.5" y="13.5" width="11" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </>,
      );
    case "life_busy":
      return iconWrap(
        <>
          <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 9v3.5l2.2 1.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>,
      );
    case "no_results":
      return iconWrap(
        <>
          <path d="M7 15.5l3.5-3.5 2.5 2 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 9h2.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>,
      );
  }
}

export function dietaryRestrictionIcon(restriction: DietaryRestriction): ReactNode {
  switch (restriction) {
    case "no_restrictions":
      return iconWrap(
        <path d="M7 12.5l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
      );
    case "no_red_meat":
      return iconWrap(
        <>
          <path d="M8 12c1.5-2 3.5-3 5-3s3.5 1 5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 16l12-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>,
      );
    case "pescatarian":
      return iconWrap(
        <path
          d="M7 12c2-3 5-4.5 8-4.5 1.5 3 .5 6.5-2 8.5-2.5-1.5-4-2.5-6-4z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />,
      );
    case "vegetarian":
      return iconWrap(
        <path d="M12 7v10M12 7c-1.5 2-2.5 4-2.5 6.5a2.5 2.5 0 0 0 5 0C14.5 11 13.5 9 12 7z" stroke="currentColor" strokeWidth="1.5" />,
      );
    case "vegan":
      return iconWrap(
        <path
          d="M12 6.5c-2 3.5-3 6-3 8.5a3 3 0 0 0 6 0c0-2.5-1-5-3-8.5z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />,
      );
    case "dairy_free":
      return iconWrap(
        <>
          <path d="M9 8.5h6v8H9z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 16l12-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>,
      );
    case "gluten_free":
      return iconWrap(
        <>
          <path d="M8 10c1-2 2.5-3 4-3s3 1 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 16l12-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>,
      );
  }
}

export function trainingStyleIcon(style: TrainingStyle): ReactNode {
  switch (style) {
    case "directive":
      return iconWrap(
        <>
          <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M17 16l1.5 1.5L21 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>,
      );
    case "flexible":
      return iconWrap(
        <>
          <path d="M6 16V8h4v8H6zM14 16V11h4v5h-4z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>,
      );
    case "accountable":
      return iconWrap(
        <>
          <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>,
      );
    case "beginner_guided":
      return iconWrap(
        <>
          <path d="M12 7v3M12 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 10c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5-1.5 2.5-3 4.5c-1.5-2-3-3-3-4.5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </>,
      );
  }
}
