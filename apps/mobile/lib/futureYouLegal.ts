/** Privacy policy URL for Future You consent (override via EXPO_PUBLIC_PRIVACY_POLICY_URL). */
export const FUTURE_YOU_PRIVACY_POLICY_URL =
  String(process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? "").trim() || "https://newyouai.app/privacy";

export const PAYWALL_TERMS_URL =
  String(process.env.EXPO_PUBLIC_TERMS_URL ?? "").trim() || "https://newyouai.app/terms";
