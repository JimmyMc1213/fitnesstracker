import "server-only";

import { compactNumber } from "../format";
import { getProviderCredentials, isProviderConnected } from "./store";
import type { Kpi, SocialMetrics } from "./metrics";

/**
 * Instagram adapter — Graph API
 * (https://developers.facebook.com/docs/instagram-api). Reads followers and
 * insight metrics (reach, profile views, engagement). Falls back to a
 * not-connected state until a long-lived token + business account exist.
 */

type IgAccount = { followers_count?: number; media_count?: number };
type IgInsight = { name: string; values?: { value: number }[] };

export async function getInstagramMetrics(): Promise<SocialMetrics> {
  const connected = await isProviderConnected("instagram");
  const creds = await getProviderCredentials("instagram");

  if (!connected || !creds?.accessToken || !creds?.businessAccountId) {
    return { connected: false, kpis: [] };
  }

  try {
    const base = `https://graph.facebook.com/v21.0/${encodeURIComponent(creds.businessAccountId)}`;
    const token = encodeURIComponent(creds.accessToken);
    const acctRes = await fetch(`${base}?fields=followers_count,media_count&access_token=${token}`, {
      next: { revalidate: 600 },
    });
    if (!acctRes.ok) throw new Error(`Instagram account ${acctRes.status}`);
    const acct = (await acctRes.json()) as IgAccount;

    const insightsRes = await fetch(
      `${base}/insights?metric=reach,profile_views&period=days_28&access_token=${token}`,
      { next: { revalidate: 600 } },
    );
    const insights = insightsRes.ok ? ((await insightsRes.json()).data as IgInsight[]) : [];
    const insightVal = (name: string) =>
      insights.find((i) => i.name === name)?.values?.reduce((sum, v) => sum + (v.value ?? 0), 0) ?? 0;

    const kpis: Kpi[] = [
      { label: "Followers", value: compactNumber(acct.followers_count ?? 0) },
      { label: "Reach · 28d", value: compactNumber(insightVal("reach")) },
      { label: "Profile visits", value: compactNumber(insightVal("profile_views")) },
      { label: "Posts", value: compactNumber(acct.media_count ?? 0) },
    ];
    return { connected: true, kpis };
  } catch {
    return { connected: false, kpis: [] };
  }
}
