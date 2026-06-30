export type NavItem = {
  href: string;
  label: string;
  icon: string;
  /** Key into the badge-counts map provided by the layout. */
  badgeKey?: "users" | "futureYou" | "issues";
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/", label: "Dashboard", icon: "ph ph-squares-four" }],
  },
  {
    label: "Data",
    items: [
      { href: "/users", label: "Users", icon: "ph ph-users-three", badgeKey: "users" },
      { href: "/future-you", label: "Future You", icon: "ph ph-sparkle", badgeKey: "futureYou" },
      { href: "/community-foods", label: "Community Foods", icon: "ph ph-fork-knife" },
      { href: "/issues", label: "Issue Reports", icon: "ph ph-warning-circle", badgeKey: "issues" },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/revenuecat", label: "RevenueCat", icon: "ph ph-chart-line-up" },
      { href: "/appstore", label: "App Store", icon: "ph ph-apple-logo" },
      { href: "/googleplay", label: "Google Play", icon: "ph ph-google-play-logo" },
      { href: "/instagram", label: "Instagram", icon: "ph ph-instagram-logo" },
      { href: "/tiktok", label: "TikTok", icon: "ph ph-tiktok-logo" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/integrations", label: "Integrations", icon: "ph ph-plugs-connected" },
      { href: "/audit", label: "Audit Log", icon: "ph ph-scroll" },
    ],
  },
];

export const PAGE_META: Record<string, { title: string; sub: string }> = {
  "/": { title: "Dashboard", sub: "Live overview · derived from Supabase" },
  "/users": { title: "Users", sub: "Full read + edit + delete" },
  "/future-you": { title: "Future You", sub: "Generation queue & report moderation" },
  "/community-foods": { title: "Community Foods", sub: "User-contributed food database" },
  "/issues": { title: "Issue Reports", sub: "Bug reports & feature requests" },
  "/revenuecat": { title: "RevenueCat", sub: "Subscription & revenue metrics" },
  "/appstore": { title: "App Store", sub: "Apple App Store Connect · read-only" },
  "/googleplay": { title: "Google Play", sub: "Android · adapter scaffolded, stubbed" },
  "/instagram": { title: "Instagram", sub: "Audience & content performance" },
  "/tiktok": { title: "TikTok", sub: "Audience & content performance" },
  "/integrations": { title: "Integrations", sub: "Credentials & provider connections" },
  "/audit": { title: "Audit Log", sub: "Every admin write, before & after" },
};
