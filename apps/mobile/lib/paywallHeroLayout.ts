export type PaywallHeroLayoutTier = "regular" | "compact" | "tight";

/** Space consumed by billing footer (picker + CTA + legal links). */
const PAYWALL_FOOTER_RESERVE_PX = 236;

/** Title block above the hero image ("Future You" + timeline row). */
const PAYWALL_HERO_HEADER_RESERVE_PX = 56;

/** Goal label + weight delta + gaps below the image. */
const PAYWALL_HERO_GOAL_RESERVE_BY_TIER: Record<PaywallHeroLayoutTier, number> = {
  regular: 128,
  compact: 112,
  tight: 100,
};

export function paywallHeroLayoutTier(
  screenHeight: number,
  safeAreaTop: number,
  safeAreaBottom: number,
): { tier: PaywallHeroLayoutTier; availableHeight: number } {
  const availableHeight =
    screenHeight -
    safeAreaTop -
    PAYWALL_HERO_HEADER_RESERVE_PX -
    PAYWALL_FOOTER_RESERVE_PX -
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
): { width: number; height: number } {
  const maxWidth =
    tier === "regular" ? 275 : tier === "compact" ? 220 : 196;
  const widthRatio = tier === "regular" ? 0.72 : tier === "compact" ? 0.62 : 0.56;
  const heightRatio = tier === "regular" ? 4 / 3 : tier === "compact" ? 3.5 / 3 : 3.2 / 3;

  const width = Math.min(maxWidth, screenWidth * widthRatio);
  const naturalHeight = width * heightRatio;
  const goalReserve = PAYWALL_HERO_GOAL_RESERVE_BY_TIER[tier];
  const maxImageHeight = Math.max(160, availableHeight - goalReserve);
  const height = Math.min(naturalHeight, maxImageHeight);
  const adjustedWidth = height < naturalHeight ? height / heightRatio : width;

  return { width: adjustedWidth, height };
}
