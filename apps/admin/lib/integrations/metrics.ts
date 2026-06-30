import { currency, numberWithCommas } from "../format";

export type Kpi = { label: string; value: string; delta?: string; deltaUp?: boolean; foot?: string };

export type RevenueCatMetrics = {
  connected: boolean;
  maskedKey: string | null;
  kpis: Kpi[];
  mrrSeries: number[];
  planMix: { label: string; count: number; color: string }[];
};

export type AppStoreMetrics = {
  connected: boolean;
  maskedKey: string | null;
  issuerMasked: string | null;
  downloads7d: number;
  units30d: number;
  averageRating: number;
  ratingsCount: number;
  downloadsSeries: number[];
  ratingBreakdown: { stars: number; pct: number }[];
  reviews: { rating: number; title: string; body: string; territory: string; date: string; author: string }[];
};

export type SocialMetrics = {
  connected: boolean;
  kpis: Kpi[];
};

export function maskKey(value: string | null | undefined): string | null {
  if (!value) return null;
  return `••••${value.slice(-4)}`;
}

export function kpiFromDb(label: string, value: number, foot?: string): Kpi {
  return { label, value: numberWithCommas(value), foot };
}

export function kpiCurrency(label: string, value: number, foot?: string): Kpi {
  return { label, value: currency(value), foot };
}
