import Link from "next/link";

import { KpiCard } from "../../../components/KpiCard";
import { getInstagramMetrics } from "../../../lib/integrations/instagram";

export const dynamic = "force-dynamic";

export default async function InstagramPage() {
  const m = await getInstagramMetrics();

  if (!m.connected) {
    return (
      <div className="card">
        <div className="empty">
          <div className="iconchip">
            <i className="ph ph-instagram-logo" />
          </div>
          <h3>Connect Instagram</h3>
          <p>
            Add a long-lived Graph API token and business account ID to pull followers, reach, engagement and top
            posts. The adapter is coded against the documented endpoints and goes live the moment credentials exist.
          </p>
          <Link href="/integrations" className="btn dark" style={{ marginTop: 10 }}>
            <i className="ph ph-plugs-connected" />
            Open Integrations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="social-kpis">
      {m.kpis.map((k) => (
        <KpiCard key={k.label} label={k.label} value={k.value} foot={k.foot} />
      ))}
    </div>
  );
}
