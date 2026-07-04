export type PaywallHeroLayoutTier = "regular" | "compact" | "tight";

/** Space consumed by billing footer (picker + CTA + legal links). */
const PAYWALL_FOOTER_RESERVE_BASE_PX = 236;

/** Title block above the hero image ("Future You" + timeline row). */
const PAYWALL_HERO_HEADER_RESERVE_BASE_PX = 56;

function scaledPx(base: number, fontScale: number, cap = 1.5): number {
  return Math.round(base * Math.min(fontScale, cap));
}

/** Goal label + weight delta + gaps below the image. */
const PAYWALL_HERO_GOAL_RESERVE_BY_TIER: Record<PaywallHeroLayoutTier, number> = {
  regular: 96,
  compact: 88,
  tight: 80,
};

/** "Future You" title + blurred timeline row above the image. */
const PAYWALL_HERO_TITLE_RESERVE_BY_TIER: Record<PaywallHeroLayoutTier, number> = {
  regular: 68,
  compact: 64,
  tight: 58,
};

/** Portrait hero aspect (width:height = 3:4), matching the pre-layout paywall hero. */
const PORTRAIT_HEIGHT_PER_WIDTH = 4 / 3;

/** Horizontal padding on `OnboardingPaywall` (23px each side). */
const PAYWALL_HORIZONTAL_PADDING_PX = 46;

export function paywallHeroLayoutTier(
  screenHeight: number,
  safeAreaTop: number,
  safeAreaBottom: number,
  fontScale = 1,
): { tier: PaywallHeroLayoutTier; availableHeight: number } {
  const availableHeight =
    screenHeight -
    safeAreaTop -
    scaledPx(PAYWALL_HERO_HEADER_RESERVE_BASE_PX, fontScale) -
    scaledPx(PAYWALL_FOOTER_RESERVE_BASE_PX, fontScale) -
    Math.max(safeAreaBottom, 8);

  if (availableHeight < 340) {
    return { tier: "tight", availableHeight };
  }
  if (availableHeight < 470) {
    return { tier: "compact", availableHeight };
  }
  return { tier: "regular", availableHeight };
}

export function paywallHeroImageBoxSize(
  tier: PaywallHeroLayoutTier,
  screenWidth: number,
  availableHeight: number,
  fontScale = 1,
): { width: number; height: number } {
  const contentWidth = Math.max(0, screenWidth - PAYWALL_HORIZONTAL_PADDING_PX);
  const maxWidth =
    tier === "regular"
      ? Math.min(contentWidth, 310)
      : tier === "compact"
        ? Math.min(contentWidth, 292)
        : Math.min(contentWidth, 260);
  const widthRatio = tier === "regular" ? 0.87 : tier === "compact" ? 0.84 : 0.78;

  const width = Math.min(maxWidth, screenWidth * widthRatio);
  const naturalHeight = width * PORTRAIT_HEIGHT_PER_WIDTH;
  const goalReserve = scaledPx(PAYWALL_HERO_GOAL_RESERVE_BY_TIER[tier], fontScale, 1.4);
  const titleReserve = scaledPx(PAYWALL_HERO_TITLE_RESERVE_BY_TIER[tier], fontScale, 1.35);
  const maxImageHeight = Math.max(
    160,
    availableHeight - goalReserve - titleReserve,
  );
  const height = Math.min(naturalHeight, maxImageHeight);
  const adjustedWidth = height < naturalHeight ? (height * 3) / 4 : width;

  return { width: adjustedWidth, height };
}
