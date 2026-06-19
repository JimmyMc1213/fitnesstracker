import type { AppTheme } from "@newyouai/types";

/** PWA onboarding CSS vars (`--ob-*`) mirrored for React Native. */
export type OnboardingThemeTokens = {
  headline: string;
  helper: string;
  stepMeta: string;
  progressTrack: string;
  progressFill: string;
  pillBg: string;
  pillBorder: string;
  pillFg: string;
  pillSelectedBg: string;
  pillSelectedBorder: string;
  pillSelectedFg: string;
  optionBg: string;
  optionBorder: string;
  optionFg: string;
  optionSelectedBg: string;
  optionSelectedBorder: string;
  optionSelectedFg: string;
  continueBg: string;
  continueFg: string;
  continueDisabledBg: string;
  continueDisabledFg: string;
  continueDarkBg: string;
  continueDarkBorder: string;
  continueDarkFg: string;
  gold: string;
  goldMid: string;
  goldOn: string;
  accent: string;
  ghostFg: string;
  welcomeCtaBg: string;
  welcomeCtaFg: string;
};

const darkOnboardingTheme: OnboardingThemeTokens = {
  headline: "#ffffff",
  helper: "#555555",
  stepMeta: "rgba(255, 255, 255, 0.34)",
  progressTrack: "rgba(255, 255, 255, 0.1)",
  progressFill: "#ffffff",
  pillBg: "transparent",
  pillBorder: "rgba(255, 255, 255, 0.14)",
  pillFg: "rgba(255, 255, 255, 0.78)",
  pillSelectedBg: "#ffffff",
  pillSelectedBorder: "#ffffff",
  pillSelectedFg: "#060608",
  optionBg: "rgba(255, 255, 255, 0.04)",
  optionBorder: "rgba(255, 255, 255, 0.1)",
  optionFg: "rgba(255, 255, 255, 0.88)",
  optionSelectedBg: "#ffffff",
  optionSelectedBorder: "#ffffff",
  optionSelectedFg: "#060608",
  continueBg: "#ffffff",
  continueFg: "#060608",
  continueDisabledBg: "rgba(255, 255, 255, 0.2)",
  continueDisabledFg: "rgba(255, 255, 255, 0.35)",
  continueDarkBg: "rgba(255, 255, 255, 0.08)",
  continueDarkBorder: "#2a2a2a",
  continueDarkFg: "#ffffff",
  gold: "#c9a876",
  goldMid: "#d4b88a",
  goldOn: "#14110c",
  accent: "rgba(255, 255, 255, 0.92)",
  ghostFg: "rgba(255, 255, 255, 0.42)",
  welcomeCtaBg: "#ffffff",
  welcomeCtaFg: "#0a0a0a",
};

const lightOnboardingTheme: OnboardingThemeTokens = {
  headline: "#000000",
  helper: "#8e8e93",
  stepMeta: "#8e8e93",
  progressTrack: "#e5e5ea",
  progressFill: "#000000",
  pillBg: "transparent",
  pillBorder: "rgba(60, 60, 67, 0.22)",
  pillFg: "rgba(0, 0, 0, 0.78)",
  pillSelectedBg: "#000000",
  pillSelectedBorder: "#000000",
  pillSelectedFg: "#ffffff",
  optionBg: "#f2f2f7",
  optionBorder: "transparent",
  optionFg: "#000000",
  optionSelectedBg: "#000000",
  optionSelectedBorder: "#000000",
  optionSelectedFg: "#ffffff",
  continueBg: "#000000",
  continueFg: "#ffffff",
  continueDisabledBg: "#e5e5ea",
  continueDisabledFg: "#ffffff",
  continueDarkBg: "#f2f2f7",
  continueDarkBorder: "transparent",
  continueDarkFg: "#000000",
  gold: "#c9a876",
  goldMid: "#d4b88a",
  goldOn: "#14110c",
  accent: "#000000",
  ghostFg: "#8e8e93",
  welcomeCtaBg: "#000000",
  welcomeCtaFg: "#ffffff",
};

export function onboardingThemeFor(scheme: AppTheme): OnboardingThemeTokens {
  return scheme === "light" ? lightOnboardingTheme : darkOnboardingTheme;
}

export type OnboardingContinueTone = "default" | "dark" | "gold";

export function onboardingContinueColors(
  ob: OnboardingThemeTokens,
  tone: OnboardingContinueTone,
  disabled: boolean,
) {
  if (disabled) {
    return { backgroundColor: ob.continueDisabledBg, color: ob.continueDisabledFg, borderColor: "transparent" };
  }
  if (tone === "gold") {
    return { backgroundColor: ob.gold, color: ob.goldOn, borderColor: "transparent" };
  }
  if (tone === "dark") {
    return { backgroundColor: ob.continueDarkBg, color: ob.continueDarkFg, borderColor: ob.continueDarkBorder };
  }
  return { backgroundColor: ob.continueBg, color: ob.continueFg, borderColor: "transparent" };
}

export function onboardingPillColors(ob: OnboardingThemeTokens, selected: boolean) {
  return {
    borderColor: selected ? ob.pillSelectedBorder : ob.pillBorder,
    backgroundColor: selected ? ob.pillSelectedBg : ob.pillBg,
    color: selected ? ob.pillSelectedFg : ob.pillFg,
  };
}

/** Survey / referral list options — PWA `--ob-option-*` tokens. */
export function onboardingOptionColors(ob: OnboardingThemeTokens, selected: boolean) {
  return {
    borderColor: selected ? ob.optionSelectedBorder : ob.optionBorder,
    backgroundColor: selected ? ob.optionSelectedBg : ob.optionBg,
    color: selected ? ob.optionSelectedFg : ob.optionFg,
  };
}

export const ONBOARDING_PADDING_X = 23;
export const ONBOARDING_CONTINUE_HEIGHT = 52;
export const ONBOARDING_PILL_MIN_HEIGHT = 52;
/** PWA `--ob-option-min-height` for referral / survey option lists. */
export const ONBOARDING_OPTION_MIN_HEIGHT = 56;
export const ONBOARDING_OPTION_GAP = 10;
export const ONBOARDING_OPTION_ICON_GAP = 14;
