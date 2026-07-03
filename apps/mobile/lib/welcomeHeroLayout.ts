/** Total rendered height of the welcome phone mockup at scale 1 (screen + bezels). */
export const WELCOME_PHONE_INNER_HEIGHT = 500;
export const WELCOME_PHONE_COMPACT_INNER_HEIGHT = 470;
const PHONE_CHROME_HEIGHT = 28;

export function welcomePhoneBaseHeight(compact = false): number {
  return (compact ? WELCOME_PHONE_COMPACT_INNER_HEIGHT : WELCOME_PHONE_INNER_HEIGHT) + PHONE_CHROME_HEIGHT;
}

/** Extra px reserved so content never clips on the first layout pass. */
const LAYOUT_SAFETY_BUFFER = 20;

type WelcomeLayoutOptions = {
  phase?: "landing" | "auth";
  compact?: boolean;
  iconOnlyBrand?: boolean;
  singleLineHeadline?: boolean;
};

/** Fixed vertical space used by welcome chrome outside the phone hero (px). */
export function welcomeFixedContentHeight(
  insets: { top: number; bottom: number },
  options: WelcomeLayoutOptions = {},
): number {
  const phase = options.phase ?? "landing";
  const compact = options.compact ?? false;
  const iconOnlyBrand = options.iconOnlyBrand ?? true;
  const singleLineHeadline = options.singleLineHeadline ?? true;

  const logoSize = compact ? 48 : 52;
  const logoBlock = iconOnlyBrand ? logoSize + 4 : logoSize + 12 + 34 + 4;
  const copyBlock = singleLineHeadline ? 32 + 10 + 21 : 32 + 46 + 2 + 10 + 21;
  const landingActions = compact ? 12 + 48 : 16 + 52;
  const authActions = compact ? 12 + 48 + 10 + 48 + 10 + 48 + 8 + 20 : 16 + 52 + 12 + 52 + 12 + 52 + 10 + 24;
  const actionsBlock = phase === "auth" ? authActions : landingActions;
  const shellPadding = compact ? 8 + 12 : 12 + 16;
  const heroMargin = compact ? 4 : 8;
  const bottomGap = compact ? 6 : 8;

  return (
    insets.top +
    insets.bottom +
    shellPadding +
    logoBlock +
    heroMargin +
    bottomGap +
    copyBlock +
    actionsBlock +
    LAYOUT_SAFETY_BUFFER
  );
}

/** Scale the welcome phone mockup so the full screen fits without scrolling. */
export function welcomePhoneScale(
  screenWidth: number,
  screenHeight: number,
  insets: { top: number; bottom: number },
  size: "default" | "hero" = "hero",
  options: WelcomeLayoutOptions = {},
): number {
  const BASE_WIDTH = 270;
  const fallbackWidth = size === "hero" ? 240 : 176;
  if (screenWidth <= 0 || screenHeight <= 0) {
    return fallbackWidth / BASE_WIDTH;
  }

  const fixedHeight = welcomeFixedContentHeight(insets, options);
  const maxPhoneHeight = Math.max(140, screenHeight - fixedHeight);
  const baseHeight = welcomePhoneBaseHeight(options.compact);

  const widthCap = size === "hero" ? Math.min(BASE_WIDTH, screenWidth * 0.68) : Math.min(176, screenWidth * 0.46);
  const scaleFromWidth = widthCap / BASE_WIDTH;
  const scaleFromHeight = maxPhoneHeight / baseHeight;
  const minScale = size === "hero" ? 0.32 : 0.42;

  return Math.max(minScale, Math.min(scaleFromWidth, scaleFromHeight));
}

/** True when the welcome screen needs tighter typography and spacing. */
export function isWelcomeCompactLayout(
  screenHeight: number,
  insets: { top: number; bottom: number },
  phase: "landing" | "auth" = "landing",
): boolean {
  const fixedHeight = welcomeFixedContentHeight(insets, { phase, compact: false, iconOnlyBrand: false });
  const maxPhoneHeight = screenHeight - fixedHeight;
  return maxPhoneHeight < welcomePhoneBaseHeight(false) * 0.78;
}
