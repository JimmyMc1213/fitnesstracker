import type { TextProps } from "react-native";

/** Paywall typography ignores iOS Dynamic Type / Android font size. */
export const PAYWALL_NO_FONT_SCALE: Pick<TextProps, "allowFontScaling" | "maxFontSizeMultiplier"> = {
  allowFontScaling: false,
  maxFontSizeMultiplier: 1,
};

/** Fixed paywall type sizes — do not vary with accessibility settings. */
export const PAYWALL_TYPOGRAPHY = {
  heroTitle: { fontSize: 34, lineHeight: 36, fontWeight: "700" as const, letterSpacing: -0.5 },
  heroTimeline: { fontSize: 20, lineHeight: 24, fontWeight: "500" as const },
  heroGoal: { fontSize: 20, lineHeight: 24, fontWeight: "600" as const },
  heroDelta: { fontSize: 18, lineHeight: 24, fontWeight: "600" as const },
  heroLockPill: { fontSize: 11, lineHeight: 13, fontWeight: "600" as const, letterSpacing: 0.2 },
  heroRevealHint: { fontSize: 10, lineHeight: 13, fontWeight: "500" as const, letterSpacing: 0.1 },
  heroLoading: { fontSize: 14, lineHeight: 18, fontWeight: "600" as const },
  planLabel: { fontSize: 16, lineHeight: 20, fontWeight: "700" as const },
  /** Total billed amount — must stay the largest plan price (Apple 3.1.2c). */
  planPrice: { fontSize: 20, lineHeight: 24, fontWeight: "700" as const },
  planTrial: { fontSize: 10, lineHeight: 14, fontWeight: "400" as const },
  /** Subordinate monthly-equivalent / calculated pricing. */
  planBilling: { fontSize: 12, lineHeight: 16, fontWeight: "500" as const },
  planBadge: { fontSize: 11, lineHeight: 13, fontWeight: "700" as const },
  planCheck: { fontSize: 10, lineHeight: 12, fontWeight: "700" as const },
  cta: { fontSize: 17, lineHeight: 20, fontWeight: "700" as const, letterSpacing: -0.2 },
  legal: { fontSize: 14, lineHeight: 18, fontWeight: "400" as const },
  error: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
} as const;
