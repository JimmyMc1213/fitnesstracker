import type { ReferralSource } from "@newyouai/types";

/** Fitness-first ordering, matches PWA referralSource.ts */
export const REFERRAL_SOURCES: ReferralSource[] = [
  "friend",
  "instagram",
  "tiktok",
  "youtube",
  "reddit",
  "google",
  "app_store",
  "facebook",
  "x",
  "other",
];

export function referralSourceLabel(source: ReferralSource): string {
  switch (source) {
    case "app_store":
      return "App Store";
    case "tiktok":
      return "TikTok";
    case "youtube":
      return "YouTube";
    case "x":
      return "X";
    case "instagram":
      return "Instagram";
    case "google":
      return "Google";
    case "facebook":
      return "Facebook";
    case "friend":
      return "Friend or family";
    case "reddit":
      return "Reddit";
    case "other":
      return "Other";
  }
}