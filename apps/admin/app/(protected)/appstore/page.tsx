import Link from "next/link";

import { AreaChart, PercentBars, Stars } from "../../../components/charts";
import { KpiCard } from "../../../components/KpiCard";
import { numberWithCommas } from "../../../lib/format";
import { getAppStoreMetrics } from "../../../lib/integrations/appstore";

export const dynamic = "force-dynamic";

export default async function AppStorePage() {
  const m = await getAppStoreMetrics();

  return (
    <>
      <div className="row spread" style={{ marginBottom: 16 }}>
        {m.connected ? (
          <span className="chip cgreen">
            <i className="ph ph-check-circle" />
            Connected · key {m.maskedKey} · read-only
          </span>
        ) : (
          <span className="chip camber">
            <i className="ph ph-warning" />
            Not connected
          </span>
        )}
        <span className="lab" style={{ fontSize: 12 }}>
          App Store Connect · JWT auth{m.issuerMasked ? ` · issuer ${m.issuerMasked}` : ""}
        </span>
      </div>

      {!m.connected && (
        <div className="demobar" style={{ marginBottom: 16 }}>
          <i className="ph ph-apple-logo" />
          Add your issuer ID, key ID and .p8 private key in Integrations to pull live ratings and reviews.
          <Link href="/integrations" className="btn dark sm" style={{ marginLeft: "auto" }}>
            Open Integrations
          </Link>
        </div>
      )}

      <div className="kpis" style={{ marginBottom: 16 }}>
        <KpiCard label="Downloads · 7d" value={numberWithCommas(m.downloads7d)} icon="ph ph-download-simple" foot="first-time units" />
        <KpiCard label="Units · 30d" value={numberWithCommas(m.units30d)} icon="ph ph-stack" foot="incl. redownloads" />
        <div className="card kpi">
          <div className="kpitop">
            <div className="kpilab">Average rating</div>
            <div className="iconchip">
              <i className="ph-fill ph-star" />
            </div>
          </div>
          <div className="row" style={{ gap: 10, alignItems: "center" }}>
            <div className="kpival">{m.averageRating.toFixed(1)}</div>
            <Stars rating={Math.round(m.averageRating)} />
          </div>
          <div className="kpifoot">
            <span>all versions · App Store</span>
          </div>
        </div>
        <KpiCard label="Ratings count" value={numberWithCommas(m.ratingsCount)} icon="ph ph-users" foot="all territories" />
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardhd">
            <div>
              <h3>Downloads</h3>
              <div className="hsub">
                {m.downloadsSeries.length > 0
                  ? `Units · last ${m.downloadsSeries.length} weeks`
                  : "Sales reports not wired yet — connect vendor number in Integrations"}
              </div>
            </div>
            {m.downloadsSeries.length > 0 && (
              <span className="chip cgold">
                <i className="ph ph-trend-up" />
                units
              </span>
            )}
          </div>
          <div className="pad" style={{ paddingTop: 0 }}>
            {m.downloadsSeries.length > 0 ? (
              <AreaChart data={m.downloadsSeries} width={560} height={160} gradientId="gap2" />
            ) : (
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                Download units require App Store Connect sales reports (vendor number + TSV parser). Reviews and
                ratings below are live when connected.
              </p>
            )}
          </div>
        </div>
        <div className="card">
          <div className="cardhd">
            <div>
              <h3>Ratings breakdown</h3>
              <div className="hsub">{numberWithCommas(m.ratingsCount)} ratings</div>
            </div>
          </div>
          <PercentBars
            bars={m.ratingBreakdown.map((r) => ({
              label: `${r.stars} star`,
              pct: r.pct,
              color: r.stars >= 5 ? "#9C7C3E" : r.stars === 4 ? "#CAA668" : r.stars === 3 ? "#75736A" : "#A8493C",
            }))}
          />
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="cardhd">
          <div>
            <h3>Customer reviews</h3>
            <div className="hsub">Latest from App Store Connect · read-only</div>
          </div>
          <span className="chip cgray">
            <i className="ph ph-lock-simple" />
            read-only
          </span>
        </div>
        <div>
          {m.reviews.length === 0 ? (
            <div className="lab" style={{ padding: "18px", fontSize: 13 }}>
              No reviews returned yet.
            </div>
          ) : (
            m.reviews.map((r, i) => (
            <div className="rev" key={i}>
              <div className="revtop">
                <Stars rating={r.rating} />
                <span className="revtitle">{r.title}</span>
              </div>
              <div className="revbody">{r.body}</div>
              <div className="revmeta">
                {r.territory} · {r.date} · @{r.author}
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
