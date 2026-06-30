import "server-only";

import { getProviderCredentials, isProviderConnected } from "./store";
import { EMPTY_APPSTORE } from "../empty";
import { maskKey, type AppStoreMetrics } from "./metrics";

async function makeAppStoreJwt(creds: Record<string, string>): Promise<string> {
  const { importPKCS8, SignJWT } = await import("jose");
  const key = await importPKCS8(creds.privateKey, "ES256");
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: creds.keyId, typ: "JWT" })
    .setIssuer(creds.issuerId)
    .setIssuedAt()
    .setExpirationTime("18m")
    .setAudience("appstoreconnect-v1")
    .sign(key);
}

type AscReviewsResponse = {
  data?: {
    id: string;
    attributes?: {
      rating?: number;
      title?: string;
      body?: string;
      reviewerNickname?: string;
      createdDate?: string;
      territory?: string;
    };
  }[];
};

async function fetchReviews(token: string, appId: string): Promise<AppStoreMetrics["reviews"]> {
  const res = await fetch(
    `https://api.appstoreconnect.apple.com/v1/apps/${appId}/customerReviews?sort=-createdDate&limit=20`,
    { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 600 } },
  );
  if (!res.ok) throw new Error(`App Store Connect reviews ${res.status}`);
  const json = (await res.json()) as AscReviewsResponse;
  return (json.data ?? []).map((r) => ({
    rating: r.attributes?.rating ?? 0,
    title: r.attributes?.title ?? "",
    body: r.attributes?.body ?? "",
    territory: r.attributes?.territory ?? "",
    date: r.attributes?.createdDate
      ? new Date(r.attributes.createdDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
    author: r.attributes?.reviewerNickname ?? "",
  }));
}

function ratingBreakdownFromReviews(reviews: AppStoreMetrics["reviews"]): AppStoreMetrics["ratingBreakdown"] {
  if (reviews.length === 0) return EMPTY_APPSTORE.ratingBreakdown;
  const counts = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1] += 1;
  }
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    pct: Math.round((counts[stars - 1] / total) * 100),
  }));
}

export async function getAppStoreMetrics(): Promise<AppStoreMetrics> {
  const connected = await isProviderConnected("appstore");
  const creds = await getProviderCredentials("appstore");
  const maskedKey = maskKey(creds?.keyId);
  const issuerMasked = maskKey(creds?.issuerId);

  if (!connected || !creds?.privateKey || !creds?.keyId || !creds?.issuerId || !creds?.appId) {
    return { connected: false, maskedKey, issuerMasked, ...EMPTY_APPSTORE };
  }

  try {
    const token = await makeAppStoreJwt(creds);
    const reviews = await fetchReviews(token, creds.appId);
    const avg =
      reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    return {
      connected: true,
      maskedKey,
      issuerMasked,
      downloads7d: 0,
      units30d: 0,
      averageRating: Math.round(avg * 10) / 10,
      ratingsCount: reviews.length,
      downloadsSeries: [],
      ratingBreakdown: ratingBreakdownFromReviews(reviews),
      reviews,
    };
  } catch {
    return { connected: false, maskedKey, issuerMasked, ...EMPTY_APPSTORE };
  }
}
