import type { AppTheme } from "@newyouai/types";

export type GradientStop = { color: string; offset: number };

export type CardShadow = {
  color: string;
  offset: { width: number; height: number };
  opacity: number;
  radius: number;
  elevation: number;
};

/** PWA onboarding CSS vars (`--ob-*`) mirrored for React Native. */
export type OnboardingThemeTokens = {
  headline: string;
  helper: string;
  /** Secondary copy on pills, option lists, and inline hints (`--ob-muted-fg`). */
  mutedFg: string;
  /** Description line on a selected onboarding pill. */
  pillSelectedSubtext: string;
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
  /** `--ob-gradient-card-bg` (168deg linear gradient stops). */
  gradientCardStops: GradientStop[];
  /** `--ob-gradient-card-shadow` outer drop shadow. */
  gradientCardShadow: CardShadow;
  /** Inset top hairline approximation for the gradient card. */
  cardTopHighlight: string;
  /** `--border` rendered at 0.5px for cards. */
  cardBorder: string;
  /** `--faint` resting background for inline number pills. */
  inputFaint: string;
  /** `--ob-input-bg` activated input background. */
  inputBg: string;
  /** `--ob-input-border` activated input border. */
  inputBorder: string;
  /** `--macro-protein` / `--macro-carbs` / `--macro-fat`. */
  macroProtein: string;
  macroCarbs: string;
  macroFat: string;
  /** `--coach-blue-label`. */
  coachBlueLabel: string;
  /** `--ob-paywall-fy-reveal-hint-fg` on the blurred Future You teaser. */
  paywallRevealHintFg: string;
  /** Text shadow color for the paywall reveal hint. */
  paywallRevealHintShadow: string;
};

/** 168deg gradient ≈ near-vertical top→bottom; approximated as straight vertical for RN SVG. */
export const GRADIENT_CARD_ANGLE_DEG = 168;

const darkOnboardingTheme: OnboardingThemeTokens = {
  headline: "#ffffff",
  helper: "rgba(255, 255, 255, 0.55)",
  mutedFg: "rgba(255, 255, 255, 0.55)",
  pillSelectedSubtext: "rgba(6, 6, 8, 0.72)",
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
  /** Solid stops — PWA uses rgba sheen; RN SVG needs opaque composited tones. */
  gradientCardStops: [
    { color: "#1c1c20", offset: 0 },
    { color: "#161616", offset: 0.38 },
    { color: "#0a0a0c", offset: 1 },
  ],
  gradientCardShadow: {
    color: "#000000",
    offset: { width: 0, height: 10 },
    opacity: 0.28,
    radius: 24,
    elevation: 8,
  },
  cardTopHighlight: "rgba(255, 255, 255, 0.035)",
  cardBorder: "#2a2a2a",
  inputFaint: "rgba(255, 255, 255, 0.08)",
  inputBg: "transparent",
  inputBorder: "rgba(255, 255, 255, 0.14)",
  macroProtein: "#c9a876",
  macroCarbs: "#e85d5d",
  macroFat: "#6db88a",
  coachBlueLabel: "rgba(10, 132, 255, 0.75)",
  paywallRevealHintFg: "rgba(220, 220, 226, 0.94)",
  paywallRevealHintShadow: "rgba(0, 0, 0, 0.58)",
};

const lightOnboardingTheme: OnboardingThemeTokens = {
  headline: "#000000",
  helper: "#636366",
  mutedFg: "#636366",
  pillSelectedSubtext: "rgba(255, 255, 255, 0.72)",
  stepMeta: "#8e8e93",
  progressTrack: "#e5e5ea",
  progressFill: "#000000",
  pillBg: "#e5e5ea",
  pillBorder: "transparent",
  pillFg: "#000000",
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
  gradientCardStops: [
    { color: "#ffffff", offset: 0 },
    { color: "#f5f5f7", offset: 0.42 },
    { color: "#e8e8ed", offset: 1 },
  ],
  gradientCardShadow: {
    color: "#000000",
    offset: { width: 0, height: 10 },
    opacity: 0.06,
    radius: 20,
    elevation: 4,
  },
  cardTopHighlight: "rgba(255, 255, 255, 0.92)",
  cardBorder: "#e0e0e0",
  inputFaint: "rgba(0, 0, 0, 0.06)",
  inputBg: "#f2f2f7",
  inputBorder: "#e5e5ea",
  macroProtein: "#c9a876",
  macroCarbs: "#e85d5d",
  macroFat: "#6db88a",
  coachBlueLabel: "rgba(10, 132, 255, 0.75)",
  paywallRevealHintFg: "rgba(36, 36, 40, 0.84)",
  paywallRevealHintShadow: "rgba(255, 255, 255, 0.75)",
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

export function onboardingPillSubtextColor(ob: OnboardingThemeTokens, selected: boolean) {
  return selected ? ob.pillSelectedSubtext : ob.mutedFg;
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
export const ONBOARDING_CONTINUE_HEIGHT = 54;
export const ONBOARDING_PILL_MIN_HEIGHT = 52;
/** PWA `--ob-option-min-height` for referral / survey option lists. */
export const ONBOARDING_OPTION_MIN_HEIGHT = 56;
export const ONBOARDING_OPTION_GAP = 10;
export const ONBOARDING_OPTION_ICON_GAP = 14;
