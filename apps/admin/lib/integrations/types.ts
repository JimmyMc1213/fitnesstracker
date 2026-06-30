export type ProviderId = "revenuecat" | "appstore" | "instagram" | "tiktok" | "googleplay";

export type ProviderField = {
  key: string;
  label: string;
  /** Rendered as a password input and masked when stored. */
  secret?: boolean;
};

export type ProviderDef = {
  id: ProviderId;
  name: string;
  icon: string;
  depth: string;
  desc: string;
  fields: ProviderField[];
  /** Stubbed providers are scaffolded but intentionally inert for v1. */
  stub?: boolean;
};

export type ProviderState = {
  id: ProviderId;
  enabled: boolean;
  /** Which credential fields currently have a stored value (never the value itself). */
  configuredFields: string[];
};

export const PROVIDERS: ProviderDef[] = [
  {
    id: "revenuecat",
    name: "RevenueCat",
    icon: "ph ph-chart-line-up",
    depth: "Primary billing",
    desc: "Subscriptions, MRR, trials & churn. Cross-referenced with the local subscriptions table.",
    fields: [
      { key: "secretApiKey", label: "Secret API key", secret: true },
      { key: "projectId", label: "Project ID" },
    ],
  },
  {
    id: "appstore",
    name: "App Store",
    icon: "ph ph-apple-logo",
    depth: "Apple · read-only",
    desc: "App Store Connect — downloads/units, ratings & customer reviews. JWT auth from issuer ID + key ID + .p8. Read-only.",
    fields: [
      { key: "issuerId", label: "Issuer ID" },
      { key: "keyId", label: "Key ID" },
      { key: "privateKey", label: ".p8 private key", secret: true },
      { key: "appId", label: "App Store app ID" },
      { key: "vendorNumber", label: "Vendor number" },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "ph ph-instagram-logo",
    depth: "Social",
    desc: "Graph API — followers, reach, engagement, top posts.",
    fields: [
      { key: "accessToken", label: "Long-lived access token", secret: true },
      { key: "businessAccountId", label: "Business account ID" },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "ph ph-tiktok-logo",
    depth: "Social",
    desc: "TikTok API — audience, views, engagement on top videos.",
    fields: [
      { key: "clientKey", label: "Client key" },
      { key: "clientSecret", label: "Client secret", secret: true },
      { key: "accessToken", label: "Access token", secret: true },
    ],
  },
  {
    id: "googleplay",
    name: "Google Play",
    icon: "ph ph-google-play-logo",
    depth: "Android · stubbed",
    desc: "Android Publisher API via service-account JSON. Adapter interface scaffolded — stubbed for a later release.",
    fields: [{ key: "serviceAccountJson", label: "Service account JSON", secret: true }],
    stub: true,
  },
];

export function getProvider(id: ProviderId): ProviderDef {
  const p = PROVIDERS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown provider: ${id}`);
  return p;
}
