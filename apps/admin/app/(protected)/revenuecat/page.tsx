import Link from "next/link";

import { AreaChart, HBars } from "../../../components/charts";
import { KpiCard } from "../../../components/KpiCard";
import { getRevenueCatMetrics } from "../../../lib/integrations/revenuecat";

export const dynamic = "force-dynamic";

export default async function RevenueCatPage() {
  const m = await getRevenueCatMetrics();

  return (
    <>
      <div className="row spread" style={{ marginBottom: 16 }}>
        {m.connected ? (
          <span className="chip cgreen">
            <i className="ph ph-check-circle" />
            Connected{m.maskedKey ? ` · key ${m.maskedKey}` : ""}
          </span>
        ) : (
          <span className="chip camber">
            <i className="ph ph-warning" />
            Not connected · using local subscriptions table
          </span>
        )}
        <span className="lab" style={{ fontSize: 12 }}>
          cross-referenced with local subscriptions table
        </span>
      </div>

      {!m.connected && (
        <div className="demobar" style={{ marginBottom: 16 }}>
          <i className="ph ph-plugs-connected" />
          Add a RevenueCat secret API key + project ID in Integrations to pull live MRR, trials and churn.
          <Link href="/integrations" className="btn dark sm" style={{ marginLeft: "auto" }}>
            Open Integrations
          </Link>
        </div>
      )}

      {m.kpis.length > 0 ? (
        <div className="kpis" style={{ marginBottom: 16 }}>
          {m.kpis.map((k) => (
            <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} deltaUp={k.deltaUp} foot={k.foot} />
          ))}
        </div>
      ) : (
        <div className="card pad" style={{ marginBottom: 16 }}>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            No subscription data yet. Connect RevenueCat in Integrations or wait for webhook events.
          </p>
        </div>
      )}

      {(m.mrrSeries.length > 0 || m.planMix.length > 0) && (
        <div className="grid2">
          {m.mrrSeries.length > 0 && (
            <div className="card">
              <div className="cardhd">
                <div>
                  <h3>Monthly recurring revenue</h3>
                  <div className="hsub">Current MRR from RevenueCat</div>
                </div>
                <span className="chip cgold">
                  <i className="ph ph-trend-up" />
                  MRR
                </span>
              </div>
              <div className="pad" style={{ paddingTop: 0 }}>
                <AreaChart data={m.mrrSeries} width={560} height={160} gradientId="gm" />
              </div>
            </div>
          )}
          {m.planMix.length > 0 && (
            <div className="card">
              <div className="cardhd">
                <div>
                  <h3>Plan mix</h3>
                  <div className="hsub">Active subs · local subscriptions table</div>
                </div>
              </div>
              <HBars bars={m.planMix} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
