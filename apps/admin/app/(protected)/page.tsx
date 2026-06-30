import Link from "next/link";

import { AreaChart, HBars, Ring } from "../../components/charts";
import { KpiCard } from "../../components/KpiCard";
import { DemoBanner } from "../../components/DemoBanner";
import { getDashboard } from "../../lib/data";
import { auditIcon } from "../../lib/audit";
import { compactNumber, numberWithCommas, relativeTime } from "../../lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data, demo } = await getDashboard();
  const { kpis, signups, jobBars, conversion, recentAudit } = data;
  const signupTotal = signups.reduce((a, b) => a + b, 0);

  return (
    <>
      <DemoBanner show={demo} />

      <div className="kpis">
        <KpiCard label="Total users" value={numberWithCommas(kpis.totalUsers)} icon="ph ph-users-three" foot="all accounts" />
        <KpiCard
          label="Active subscriptions"
          value={numberWithCommas(kpis.activeSubscriptions)}
          icon="ph ph-seal-check"
          foot={`${kpis.totalUsers ? ((kpis.activeSubscriptions / kpis.totalUsers) * 100).toFixed(1) : "0"}% of users`}
        />
        <KpiCard label="New signups · 7d" value={numberWithCommas(kpis.newSignups7d)} icon="ph ph-user-plus" foot="last 7 days" />
        <KpiCard label="Open reports" value={numberWithCommas(kpis.openReports)} icon="ph ph-flag" foot="FY + issues" />
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardhd">
            <div>
              <h3>New signups</h3>
              <div className="hsub">Last 12 weeks · {numberWithCommas(signupTotal)} total</div>
            </div>
            <span className="chip cgold">
              <i className="ph ph-trend-up" />
              weekly
            </span>
          </div>
          <div className="pad" style={{ paddingTop: 0 }}>
            <AreaChart data={signups} width={660} height={200} gradientId="ga" />
          </div>
        </div>

        <div className="card">
          <div className="cardhd">
            <div>
              <h3>Future You jobs</h3>
              <div className="hsub">Generation queue</div>
            </div>
          </div>
          <HBars bars={jobBars} formatValue={(n) => compactNumber(n)} />
        </div>
      </div>

      <div className="grid2b">
        <div className="card kpiring">
          <Ring pct={conversion.pct} />
          <div>
            <div className="sect" style={{ marginBottom: 4 }}>
              Trial → paid conversion
            </div>
            <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
              Trials converting to paid within 7 days of the blurred-reveal paywall.
            </div>
            <div className="row" style={{ gap: 16, marginTop: 12 }}>
              <div>
                <div className="kpival" style={{ fontSize: 20 }}>
                  {numberWithCommas(conversion.trials)}
                </div>
                <div className="lab" style={{ fontSize: 11 }}>
                  on trial
                </div>
              </div>
              <div>
                <div className="kpival" style={{ fontSize: 20 }}>
                  {numberWithCommas(conversion.paid)}
                </div>
                <div className="lab" style={{ fontSize: 11 }}>
                  paid this wk
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cardhd">
            <div>
              <h3>Recent admin activity</h3>
              <div className="hsub">From audit log</div>
            </div>
            <Link className="btn sm" href="/audit">
              View all
              <i className="ph ph-arrow-right" />
            </Link>
          </div>
          <div style={{ padding: "2px 0 8px" }}>
            {recentAudit.length === 0 ? (
              <div className="lab" style={{ padding: "9px 18px", fontSize: 12 }}>
                No admin activity yet.
              </div>
            ) : (
              recentAudit.map((a) => (
                <div className="row" style={{ gap: 11, padding: "9px 18px" }} key={a.id}>
                  <div className="iconchip neu" style={{ width: 32, height: 32, borderRadius: 9 }}>
                    <i className={auditIcon(a.action)} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>
                      {a.detail ?? a.action} {a.targetId ? `— ${a.targetId}` : ""}
                    </div>
                    <div className="lab" style={{ fontSize: 11 }}>
                      {a.adminEmail}
                    </div>
                  </div>
                  <div className="lab" style={{ fontSize: 11, whiteSpace: "nowrap" }}>
                    {relativeTime(a.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
