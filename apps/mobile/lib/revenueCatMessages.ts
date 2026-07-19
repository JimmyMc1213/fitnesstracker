/** App Store Connect product IDs — must match RevenueCat dashboard + ASC exactly. */
export const REVENUECAT_PRODUCT_IDS = {
  monthly: "newyouai_pro_monthly",
  yearly: "newyouai_pro_yearly",
} as const;

export const REVENUECAT_ENTITLEMENT_ID = "pro";

const REVENUECAT_PRODUCT_ID_SET = new Set<string>(Object.values(REVENUECAT_PRODUCT_IDS));

export function isKnownProProductId(productId: string): boolean {
  return REVENUECAT_PRODUCT_ID_SET.has(productId);
}

export const PAYWALL_ENTITLEMENT_NOT_GRANTED_MESSAGE =
  "We couldn't confirm your subscription. Try Restore Purchases, or email support@newyouai.app if you were charged.";

/** True when RevenueCat reports pro access via entitlement, active sub, or unexpired product. */
export function customerInfoGrantsPro(
  activeEntitlementIds: readonly string[],
  activeSubscriptionIds: readonly string[],
  expirationDatesByProductId: Readonly<Record<string, string | null>> = {},
): boolean {
  if (activeEntitlementIds.includes(REVENUECAT_ENTITLEMENT_ID)) return true;

  if (activeSubscriptionIds.some((id) => isKnownProProductId(id))) return true;

  const now = Date.now();
  for (const productId of Object.values(REVENUECAT_PRODUCT_IDS)) {
    const expiresAt = expirationDatesByProductId[productId];
    if (expiresAt && new Date(expiresAt).getTime() > now) return true;
  }

  return false;
}

/** User-facing copy when StoreKit / RevenueCat products are unavailable. */
export const PAYWALL_STORE_UNAVAILABLE_MESSAGE =
  "Subscriptions aren't available right now. Make sure you're online and try again in a few minutes.";

export const PAYWALL_STORE_SETUP_MESSAGE =
  "We're finishing subscription setup. Please try again shortly or email support@newyouai.app.";

/** Dev-only stub purchases when RevenueCat or the native module is unavailable. */
export function isRevenueCatStubAllowed(): boolean {
  return typeof __DEV__ !== "undefined" && __DEV__;
}

/** Paywall may proceed when the store is live or when dev stub mode is explicitly allowed. */
export function isPaywallStoreReady(ready: boolean, stub: boolean): boolean {
  return ready && (!stub || isRevenueCatStubAllowed());
}

/** Strip RevenueCat SDK noise before showing errors in the paywall UI. */
export function sanitizeRevenueCatError(message: string): string | null {
  const trimmed = message.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (lower.includes("cancelled") || lower.includes("canceled") || lower.includes("user cancelled")) {
    return null;
  }

  if (
    lower.includes("configuration") ||
    lower.includes("could be fetched") ||
    lower.includes("offerings-empty") ||
    lower.includes("why-are-offerings-empty") ||
    lower.includes("sdk-troubleshooting")
  ) {
    return PAYWALL_STORE_SETUP_MESSAGE;
  }

  if (lower.includes("no subscription packages available")) {
    return PAYWALL_STORE_UNAVAILABLE_MESSAGE;
  }

  if (lower.includes("network") || lower.includes("offline") || lower.includes("internet")) {
    return PAYWALL_STORE_UNAVAILABLE_MESSAGE;
  }

  return trimmed;
}
