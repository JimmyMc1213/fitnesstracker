/** Total rendered height of the welcome phone mockup at scale 1 (screen + bezels). */
export const WELCOME_PHONE_BASE_HEIGHT = 574;

/** Fixed vertical space used by welcome chrome outside the phone hero (px). */
export function welcomeFixedContentHeight(
  insets: { top: number; bottom: number },
  phase: "landing" | "auth" = "landing",
): number {
  const logoBlock = 56 + 12 + 34 + 4;
  const copyBlock = 32 + 46 + 2 + 10 + 21;
  const landingActions = 16 + 52;
  const authActions = 16 + 52 + 12 + 52 + 12 + 52 + 10 + 24;
  const actionsBlock = phase === "auth" ? authActions : landingActions;
  const shellPadding = 16 + 24 + 16;
  const heroMargin = 8;
  const bottomGap = 8;

  return (
    insets.top +
    insets.bottom +
    shellPadding +
    logoBlock +
    heroMargin +
    bottomGap +
    copyBlock +
    actionsBlock
  );
}

/** Scale the welcome phone mockup so the full screen fits without scrolling. */
export function welcomePhoneScale(
  screenWidth: number,
  screenHeight: number,
  insets: { top: number; bottom: number },
  size: "default" | "hero" = "hero",
  phase: "landing" | "auth" = "landing",
): number {
  const BASE_WIDTH = 270;
  const fallbackWidth = size === "hero" ? 240 : 176;
  if (screenWidth <= 0 || screenHeight <= 0) {
    return fallbackWidth / BASE_WIDTH;
  }

  const fixedHeight = welcomeFixedContentHeight(insets, phase);
  const maxPhoneHeight = Math.max(160, screenHeight - fixedHeight);

  const widthCap = size === "hero" ? Math.min(BASE_WIDTH, screenWidth * 0.72) : Math.min(176, screenWidth * 0.46);
  const scaleFromWidth = widthCap / BASE_WIDTH;
  const scaleFromHeight = maxPhoneHeight / WELCOME_PHONE_BASE_HEIGHT;
  const minScale = size === "hero" ? 0.35 : 0.45;

  return Math.max(minScale, Math.min(scaleFromWidth, scaleFromHeight));
}

/** True when the welcome screen needs tighter typography and spacing. */
export function isWelcomeCompactLayout(
  screenHeight: number,
  insets: { top: number; bottom: number },
  phase: "landing" | "auth" = "landing",
): boolean {
  const fixedHeight = welcomeFixedContentHeight(insets, phase);
  const maxPhoneHeight = screenHeight - fixedHeight;
  return maxPhoneHeight < WELCOME_PHONE_BASE_HEIGHT * 0.72;
}
