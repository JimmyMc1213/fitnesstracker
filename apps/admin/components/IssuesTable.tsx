"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { IssueReport } from "../lib/types";
import { relativeTime, statusChip } from "../lib/format";
import { useToast } from "./Toast";
import { resolveIssue } from "../app/(protected)/actions";

type Filter = "all" | "bug" | "feature" | "open";

export function IssuesTable({ issues }: { issues: IssueReport[] }) {
  const router = useRouter();
  const { flash } = useToast();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<Filter>("all");

  const view = useMemo(() => {
    if (filter === "bug") return issues.filter((i) => i.category === "bug");
    if (filter === "feature") return issues.filter((i) => i.category === "feature");
    if (filter === "open") return issues.filter((i) => i.status === "open");
    return issues;
  }, [issues, filter]);

  const openCount = issues.filter((i) => i.status === "open").length;

  function run(id: string, status: "resolved" | "open") {
    startTransition(async () => {
      const res = await resolveIssue(id, status);
      flash(res.message);
      if (res.ok) router.refresh();
    });
  }

  const typeChip = (cat: string) =>
    cat === "bug"
      ? { cls: "chip cred", icon: "ph ph-bug", label: "Bug" }
      : cat === "feature"
        ? { cls: "chip cblue", icon: "ph ph-lightbulb", label: "Feature" }
        : { cls: "chip cgray", icon: "ph ph-chat-circle", label: "Other" };

  return (
    <>
      <div className="filterbar">
        {(["all", "bug", "feature", "open"] as const).map((f) => (
          <button key={f} className={filter === f ? "fbtn on" : "fbtn"} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "open" ? `Open · ${openCount}` : f === "bug" ? "Bugs" : "Features"}
          </button>
        ))}
      </div>

      <div className="card tblwrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Type</th>
              <th>Report</th>
              <th>From</th>
              <th>Linear</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {view.map((i) => {
              const t = typeChip(i.category);
              const s = statusChip(i.status);
              return (
                <tr key={i.id}>
                  <td>
                    <span className={t.cls}>
                      <i className={t.icon} />
                      {t.label}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, letterSpacing: "-0.01em" }}>{i.message ?? "—"}</div>
                    <div className="uid">
                      {i.id} · {i.platform ?? "—"} {i.appVersion ? `· v${i.appVersion}` : ""}
                    </div>
                  </td>
                  <td className="uid">{i.userId}</td>
                  <td>
                    {i.linearUrl ? (
                      <a className="chip cblue mono" href={i.linearUrl} target="_blank" rel="noreferrer">
                        <i className="ph ph-arrow-square-out" />
                        {i.linearId}
                      </a>
                    ) : (
                      <span className="lab">—</span>
                    )}
                  </td>
                  <td>
                    <span className={s.cls}>{s.label}</span>
                  </td>
                  <td>
                    {i.status === "resolved" ? (
                      <button className="btn sm" disabled={pending} onClick={() => run(i.id, "open")}>
                        Reopen
                      </button>
                    ) : (
                      <button className="btn sm" disabled={pending} onClick={() => run(i.id, "resolved")}>
                        <i className="ph ph-check" />
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {view.length === 0 && (
              <tr>
                <td colSpan={6} className="muted" style={{ textAlign: "center", padding: 24 }}>
                  No issues match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="tblfoot">
          <span>issue_reports · synced to Linear</span>
        </div>
      </div>
    </>
  );
}
