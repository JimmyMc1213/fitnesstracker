/** App Store Connect product IDs — must match RevenueCat dashboard + ASC exactly. */
export const REVENUECAT_PRODUCT_IDS = {
  monthly: "newyouai_pro_monthly",
  yearly: "newyouai_pro_yearly",
} as const;

export const REVENUECAT_ENTITLEMENT_ID = "pro";

/** User-facing copy when StoreKit / RevenueCat products are unavailable. */
export const PAYWALL_STORE_UNAVAILABLE_MESSAGE =
  "Subscriptions aren't available right now. Make sure you're online and try again in a few minutes.";

export const PAYWALL_STORE_SETUP_MESSAGE =
  "We're finishing subscription setup. Please try again shortly or email support@newyouai.app.";

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
