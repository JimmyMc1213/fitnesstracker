/** Privacy policy URL for Future You consent (override via VITE_PRIVACY_POLICY_URL). */
export const FUTURE_YOU_PRIVACY_POLICY_URL =
  String(import.meta.env.VITE_PRIVACY_POLICY_URL ?? "").trim() || "https://gymmy.app/privacy";

/** Terms of service URL for paywall footer (override via VITE_TERMS_URL). */
export const PAYWALL_TERMS_URL =
  String(import.meta.env.VITE_TERMS_URL ?? "").trim() || "https://gymmy.app/terms";
