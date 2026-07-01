import { FutureYouReports } from "../../../components/FutureYouReports";
import { DemoBanner } from "../../../components/DemoBanner";
import { getFutureYou } from "../../../lib/data";
import { relativeTime, statusChip } from "../../../lib/format";

export const revalidate = 60;

export default async function FutureYouPage() {
  const { data, demo } = await getFutureYou();
  const { jobs, reports } = data;

  const counts = {
    queued: jobs.filter((j) => j.status === "queued").length,
    generating: jobs.filter((j) => j.status === "generating").length,
    ready: jobs.filter((j) => j.status === "ready").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  };
  const openReports = reports.filter((r) => r.status === "open");

  return (
    <>
      <DemoBanner show={demo} />

      <div className="statstrip">
        <div className="card pad">
          <div className="kpilab">Queued</div>
          <div className="kpival" style={{ fontSize: 24, marginTop: 6 }}>
            {counts.queued}
          </div>
        </div>
        <div className="card pad">
          <div className="kpilab">Generating</div>
          <div className="kpival" style={{ fontSize: 24, marginTop: 6 }}>
            {counts.generating}
          </div>
        </div>
        <div className="card pad">
          <div className="kpilab">Ready</div>
          <div className="kpival" style={{ fontSize: 24, marginTop: 6 }}>
            {counts.ready}
          </div>
        </div>
        <div className="card pad">
          <div className="kpilab">Failed</div>
          <div className="kpival" style={{ fontSize: 24, marginTop: 6, color: "#A8493C" }}>
            {counts.failed}
          </div>
        </div>
      </div>

      <div className="card tblwrap">
        <div className="cardhd">
          <div>
            <h3>Generation queue</h3>
            <div className="hsub">future_you_jobs · newest first</div>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Job</th>
              <th>User</th>
              <th>Motivation</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td className="mono uid">{j.id}</td>
                <td>
                  <div className="umail" style={{ fontSize: 12.5 }}>
                    {j.userEmail}
                  </div>
                  <div className="uid">{j.userId}</div>
                </td>
                <td className="muted">{j.motivationId.replace(/_/g, " ")}</td>
                <td>
                  <span className={statusChip(j.status).cls}>{statusChip(j.status).label}</span>
                </td>
                <td className="mono muted">{j.durationLabel}</td>
                <td className="muted">{relativeTime(j.createdAt)}</td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={6} className="muted" style={{ textAlign: "center", padding: 24 }}>
                  No generation jobs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="sectit" style={{ marginTop: 26 }}>
        Reports · moderation
      </h2>
      <FutureYouReports reports={openReports} />
    </>
  );
}
