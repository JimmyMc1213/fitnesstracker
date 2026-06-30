"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import type { FutureYouReport } from "../lib/types";
import { relativeTime, statusChip } from "../lib/format";
import { useToast } from "./Toast";
import { deleteReport, moderateReport } from "../app/(protected)/actions";

export function FutureYouReports({ reports }: { reports: FutureYouReport[] }) {
  const router = useRouter();
  const { flash } = useToast();
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const res = await fn();
      flash(res.message);
      if (res.ok) router.refresh();
    });
  }

  if (reports.length === 0) {
    return (
      <div className="card">
        <div className="empty">
          <div className="iconchip">
            <i className="ph ph-check-circle" />
          </div>
          <h3>No open reports</h3>
          <p>Future You moderation is clear. Resolved and dismissed reports stay in the audit log.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
      {reports.map((r) => (
        <div className="card pad" key={r.id}>
          <div className="fy-compare" style={{ marginBottom: 13 }}>
            <div className="fy-half ph-img">
              <span className="fy-tag">Selfie</span>
              {r.sourceUrl ? <img className="gimg" src={r.sourceUrl} alt="selfie" /> : <span>signed URL</span>}
            </div>
            <div className="fy-half ph-img">
              <span className="fy-tag">Result</span>
              {r.resultUrl ? <img className="gimg" src={r.resultUrl} alt="result" /> : <span>signed URL</span>}
            </div>
          </div>
          <div className="row spread" style={{ marginBottom: 6 }}>
            <span className="mono uid">{r.id}</span>
            <span className={statusChip(r.status).cls}>{statusChip(r.status).label}</span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 4 }}>
            {r.message ?? r.category.replace(/_/g, " ")}
          </div>
          <div className="lab" style={{ fontSize: 12, marginBottom: 12 }}>
            {r.userEmail} · job {r.jobId ?? "—"} · {relativeTime(r.createdAt)}
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn sm dark" disabled={pending} onClick={() => run(() => moderateReport(r.id, "resolved"))}>
              <i className="ph ph-check" />
              Resolve
            </button>
            <button className="btn sm" disabled={pending} onClick={() => run(() => moderateReport(r.id, "dismissed"))}>
              Dismiss
            </button>
            {r.linearUrl ? (
              <a className="btn sm" href={r.linearUrl} target="_blank" rel="noreferrer">
                <i className="ph ph-arrow-square-out" />
              </a>
            ) : null}
            <button className="btn sm danger" disabled={pending} onClick={() => run(() => deleteReport(r.id))}>
              <i className="ph ph-trash" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
