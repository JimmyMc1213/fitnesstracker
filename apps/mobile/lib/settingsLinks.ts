import {
  FUTURE_YOU_PRIVACY_POLICY_URL,
  PAYWALL_TERMS_URL,
} from "@/lib/futureYouLegal";

export { FUTURE_YOU_PRIVACY_POLICY_URL as SETTINGS_PRIVACY_POLICY_URL, PAYWALL_TERMS_URL as SETTINGS_TERMS_URL };

export const SETTINGS_SUPPORT_EMAIL = "support@newyouai.app";

export const SETTINGS_INSTAGRAM_URL =
  String(process.env.EXPO_PUBLIC_INSTAGRAM_URL ?? "").trim() || "https://www.instagram.com/newyouai";

export const SETTINGS_TIKTOK_URL =
  String(process.env.EXPO_PUBLIC_TIKTOK_URL ?? "").trim() || "https://www.tiktok.com/@newyouai";

export const SETTINGS_X_URL =
  String(process.env.EXPO_PUBLIC_X_URL ?? "").trim() || "https://x.com/newyouai";
