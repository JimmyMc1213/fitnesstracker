import type { DashboardData } from "./types";

/** Zeroed dashboard shape — used when Supabase is unavailable or queries return nothing. */
export const EMPTY_DASHBOARD: DashboardData = {
  kpis: { totalUsers: 0, activeSubscriptions: 0, newSignups7d: 0, openReports: 0 },
  signups: Array.from({ length: 12 }, () => 0),
  jobBars: [
    { label: "Ready", count: 0, color: "#3C7A4E" },
    { label: "Queued", count: 0, color: "#CAA668" },
    { label: "Generating", count: 0, color: "#3F6193" },
    { label: "Failed", count: 0, color: "#A8493C" },
  ],
  conversion: { pct: 0, trials: 0, paid: 0 },
  recentAudit: [],
};

export const EMPTY_REVENUECAT = {
  kpis: [] as { label: string; value: string; foot?: string }[],
  mrrSeries: [] as number[],
  planMix: [] as { label: string; count: number; color: string }[],
};

export const EMPTY_APPSTORE = {
  downloads7d: 0,
  units30d: 0,
  averageRating: 0,
  ratingsCount: 0,
  downloadsSeries: [] as number[],
  ratingBreakdown: [
    { stars: 5, pct: 0 },
    { stars: 4, pct: 0 },
    { stars: 3, pct: 0 },
    { stars: 2, pct: 0 },
    { stars: 1, pct: 0 },
  ],
  reviews: [] as {
    rating: number;
    title: string;
    body: string;
    territory: string;
    date: string;
    author: string;
  }[],
};
