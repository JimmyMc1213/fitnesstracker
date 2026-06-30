import "server-only";

import { compactNumber } from "../format";
import { getProviderCredentials, isProviderConnected } from "./store";
import type { Kpi, SocialMetrics } from "./metrics";

/**
 * TikTok adapter — TikTok API for Business / Display API
 * (https://developers.tiktok.com/doc/). Reads creator/account stats. Falls back
 * to a not-connected state until client key/secret + access token exist.
 */

type TtUser = {
  data?: { user?: { follower_count?: number; following_count?: number; likes_count?: number; video_count?: number } };
};

export async function getTiktokMetrics(): Promise<SocialMetrics> {
  const connected = await isProviderConnected("tiktok");
  const creds = await getProviderCredentials("tiktok");

  if (!connected || !creds?.accessToken) {
    return { connected: false, kpis: [] };
  }

  try {
    const res = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count",
      { headers: { Authorization: `Bearer ${creds.accessToken}` }, next: { revalidate: 600 } },
    );
    if (!res.ok) throw new Error(`TikTok ${res.status}`);
    const json = (await res.json()) as TtUser;
    const u = json.data?.user ?? {};
    const kpis: Kpi[] = [
      { label: "Followers", value: compactNumber(u.follower_count ?? 0) },
      { label: "Likes", value: compactNumber(u.likes_count ?? 0) },
      { label: "Videos", value: compactNumber(u.video_count ?? 0) },
      { label: "Following", value: compactNumber(u.following_count ?? 0) },
    ];
    return { connected: true, kpis };
  } catch {
    return { connected: false, kpis: [] };
  }
}
