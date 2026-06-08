/** Shared onboarding layout tokens: dark Gymmy theme, golf-style rhythm. */
export const onboardingStyles = {
  maxWidth: 394,
  paddingX: 23,
  headlineSize: 32,
  headlineLineHeight: 1.12,
  headlineTracking: "-0.02em",
  helperSize: 11,
  helperColor: "rgba(255,255,255,0.34)",
  eyebrowSize: 14,
  eyebrowColor: "rgba(255,255,255,0.55)",
  accentColor: "rgba(255,255,255,0.92)",
  progressTrack: "rgba(255,255,255,0.1)",
  progressFill: "#ffffff",
  progressHeight: 6,
  pillMinHeight: 52,
  pillGap: 12,
  pillBorder: "rgba(255,255,255,0.14)",
  pillSelectedBg: "#ffffff",
  pillSelectedFg: "#060608",
  pillUnselectedFg: "rgba(255,255,255,0.78)",
  continueRadius: 9999,
  continueHeight: 52,
  inputRadius: 9999,
  inputHeight: 56,
  inputBorder: "rgba(255,255,255,0.14)",
  inputFocusBorder: "rgba(255,255,255,0.45)",
} as const;

export function onboardingShellPadding() {
  return {
    paddingTop: "max(0.5rem, env(safe-area-inset-top))",
    paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
    paddingLeft: onboardingStyles.paddingX,
    paddingRight: onboardingStyles.paddingX,
  };
}
