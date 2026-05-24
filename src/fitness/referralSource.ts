export const REFERRAL_SOURCES = [
  "app_store",
  "tiktok",
  "youtube",
  "tv",
  "x",
  "instagram",
  "google",
  "facebook",
  "friend",
  "reddit",
  "podcast",
  "other",
] as const;

export type ReferralSource = (typeof REFERRAL_SOURCES)[number];

export function referralSourceLabel(source: ReferralSource): string {
  switch (source) {
    case "app_store":
      return "App Store";
    case "tiktok":
      return "TikTok";
    case "youtube":
      return "YouTube";
    case "tv":
      return "TV";
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
    case "podcast":
      return "Podcast";
    case "other":
      return "Other";
  }
}

export function normalizeReferralSource(raw: unknown): ReferralSource | undefined {
  return REFERRAL_SOURCES.includes(raw as ReferralSource) ? (raw as ReferralSource) : undefined;
}
