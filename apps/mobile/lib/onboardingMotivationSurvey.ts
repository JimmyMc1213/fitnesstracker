import {
  IconBarbell,
  IconBowlSpoon,
  IconCircleCheck,
  IconClipboardList,
  IconClock,
  IconFish,
  IconFlame,
  IconMeat,
  IconMilk,
  IconPlant2,
  IconSalad,
  IconScale,
  IconTrendingUp,
  IconWheat,
} from "@tabler/icons-react-native";
import type {
  DietaryRestriction,
  OnboardingBarrier,
  TrainingStyle,
} from "@newyouai/types";

import type { TablerIcon } from "@/lib/tablerIcon";

export const ONBOARDING_BARRIERS: OnboardingBarrier[] = [
  "falling_off",
  "eating",
  "no_plan",
  "life_busy",
  "no_results",
];

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

export function barrierIcon(barrier: OnboardingBarrier): TablerIcon {
  switch (barrier) {
    case "falling_off":
      return IconFlame;
    case "eating":
      return IconBowlSpoon;
    case "no_plan":
      return IconClipboardList;
    case "life_busy":
      return IconClock;
    case "no_results":
      return IconTrendingUp;
  }
}

export function dietaryRestrictionIcon(restriction: DietaryRestriction): TablerIcon {
  switch (restriction) {
    case "no_restrictions":
      return IconCircleCheck;
    case "no_red_meat":
      return IconMeat;
    case "pescatarian":
      return IconFish;
    case "vegetarian":
      return IconSalad;
    case "vegan":
      return IconPlant2;
    case "dairy_free":
      return IconMilk;
    case "gluten_free":
      return IconWheat;
  }
}

export function trainingStyleIcon(style: TrainingStyle): TablerIcon {
  switch (style) {
    case "directive":
      return IconClipboardList;
    case "flexible":
      return IconScale;
    case "accountable":
      return IconBarbell;
    case "beginner_guided":
      return IconPlant2;
  }
}
