/** Subscription helpers shared by dashboard + integration pages. */

type SubRow = {
  is_active: boolean;
  product_id: string | null;
  raw?: unknown;
  updated_at?: string;
};

export function isTrialSubscription(row: SubRow): boolean {
  const pid = row.product_id?.toLowerCase() ?? "";
  if (pid.includes("trial") || pid.includes("intro")) return true;
  const event = (row.raw as { event?: { period_type?: string } } | null)?.event;
  if (event?.period_type === "TRIAL") return true;
  return false;
}

export function subscriptionStatus(row: SubRow | null | undefined): "active" | "trialing" | "expired" | "none" {
  if (!row) return "none";
  if (!row.is_active) return "expired";
  if (isTrialSubscription(row)) return "trialing";
  return "active";
}

export function planLabelFromProduct(productId: string | null, isActive: boolean): string {
  if (!isActive) return "—";
  if (!productId) return "Pro";
  const lower = productId.toLowerCase();
  if (/annual|year/.test(lower)) return "Annual";
  if (/month/.test(lower)) return "Monthly";
  if (isTrialSubscription({ is_active: isActive, product_id: productId })) return "Trial";
  return "Pro";
}

export function computeConversionStats(rows: SubRow[]): { pct: number; trials: number; paid: number } {
  const active = rows.filter((r) => r.is_active);
  const trials = active.filter(isTrialSubscription).length;
  const paid = active.length - trials;
  const denom = trials + paid;
  const pct = denom > 0 ? Math.round((paid / denom) * 1000) / 10 : 0;
  return { pct, trials, paid };
}

const PLAN_COLORS = ["#9C7C3E", "#CAA668", "#3F6193", "#75736A", "#A8493C"];

export function planMixFromSubscriptions(rows: SubRow[]): { label: string; count: number; color: string }[] {
  const active = rows.filter((r) => r.is_active);
  const buckets = new Map<string, number>();
  for (const row of active) {
    const label = planLabelFromProduct(row.product_id, true);
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([label, count], i) => ({
    label,
    count,
    color: PLAN_COLORS[i % PLAN_COLORS.length],
  }));
}
