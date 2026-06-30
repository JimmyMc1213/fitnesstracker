import "server-only";

import { currency, numberWithCommas } from "../format";
import { getSubscriptionRows } from "../data";
import { planMixFromSubscriptions } from "../subscriptions";
import { getProviderCredentials, isProviderConnected } from "./store";
import { EMPTY_REVENUECAT } from "../empty";
import { maskKey, type Kpi, type RevenueCatMetrics } from "./metrics";

type RcOverviewMetric = { id: string; name?: string; value: number; unit?: string };
type RcOverviewResponse = { metrics?: RcOverviewMetric[] };

/** Local DB fallback KPIs when RevenueCat API is not connected. */
async function dbFallbackMetrics(): Promise<Pick<RevenueCatMetrics, "kpis" | "planMix">> {
  const rows = await getSubscriptionRows();
  const active = rows.filter((r) => r.is_active);
  const trials = active.filter((r) => {
    const pid = r.product_id?.toLowerCase() ?? "";
    return pid.includes("trial") || pid.includes("intro");
  }).length;
  return {
    kpis: [
      { label: "Active subscriptions", value: numberWithCommas(active.length), foot: "from subscriptions table" },
      { label: "Active trials", value: numberWithCommas(trials), foot: "from subscriptions table" },
      { label: "Paid subscribers", value: numberWithCommas(active.length - trials), foot: "from subscriptions table" },
    ],
    planMix: planMixFromSubscriptions(rows),
  };
}

export async function getRevenueCatMetrics(): Promise<RevenueCatMetrics> {
  const connected = await isProviderConnected("revenuecat");
  const creds = await getProviderCredentials("revenuecat");
  const maskedKey = maskKey(creds?.secretApiKey);
  const dbFallback = await dbFallbackMetrics();

  if (!connected || !creds?.secretApiKey || !creds?.projectId) {
    return { connected: false, maskedKey, ...EMPTY_REVENUECAT, ...dbFallback };
  }

  try {
    const res = await fetch(
      `https://api.revenuecat.com/v2/projects/${encodeURIComponent(creds.projectId)}/metrics/overview`,
      {
        headers: { Authorization: `Bearer ${creds.secretApiKey}`, Accept: "application/json" },
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) throw new Error(`RevenueCat ${res.status}`);
    const json = (await res.json()) as RcOverviewResponse;
    const byId = new Map((json.metrics ?? []).map((m) => [m.id, m] as const));
    const val = (id: string) => byId.get(id)?.value ?? 0;

    const kpis: Kpi[] = [
      { label: "MRR", value: currency(val("mrr")), foot: "monthly recurring" },
      { label: "Active subscriptions", value: numberWithCommas(val("active_subscriptions")), foot: "paid + trial" },
      { label: "Active trials", value: numberWithCommas(val("active_trials")), foot: "current trials" },
      { label: "Revenue (28d)", value: currency(val("revenue")), foot: "last 28 days" },
    ];

    const mrr = val("mrr");
    return {
      connected: true,
      maskedKey,
      kpis,
      mrrSeries: mrr > 0 ? [mrr] : [],
      planMix: dbFallback.planMix.length ? dbFallback.planMix : EMPTY_REVENUECAT.planMix,
    };
  } catch {
    return { connected: false, maskedKey, ...EMPTY_REVENUECAT, ...dbFallback };
  }
}
