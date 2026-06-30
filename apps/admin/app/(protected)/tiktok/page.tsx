import Link from "next/link";

import { KpiCard } from "../../../components/KpiCard";
import { getTiktokMetrics } from "../../../lib/integrations/tiktok";

export const dynamic = "force-dynamic";

export default async function TiktokPage() {
  const m = await getTiktokMetrics();

  if (!m.connected) {
    return (
      <div className="card">
        <div className="empty">
          <div className="iconchip">
            <i className="ph ph-tiktok-logo" />
          </div>
          <h3>Connect TikTok</h3>
          <p>
            Add a client key, client secret and access token to pull audience, views and engagement on your top
            videos. Inert until tokens are added — no redeploy needed to connect.
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
