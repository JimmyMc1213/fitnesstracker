"use client";

import { useMemo, useState } from "react";

import type { AuditEntry } from "../lib/types";
import { auditIcon } from "../lib/audit";
import { formatDate, relativeTime } from "../lib/format";

type Filter = "all" | "edit" | "delete" | "override" | "impersonate";

export function AuditTable({ entries }: { entries: AuditEntry[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const view = useMemo(() => {
    if (filter === "all") return entries;
    return entries.filter((e) => e.action === filter);
  }, [entries, filter]);

  return (
    <>
      <div className="filterbar">
        {(["all", "edit", "delete", "override", "impersonate"] as const).map((f) => (
          <button key={f} className={filter === f ? "fbtn on" : "fbtn"} onClick={() => setFilter(f)}>
            {f === "all" ? "All actions" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="card tblwrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Action</th>
              <th>Target</th>
              <th>Admin</th>
              <th>Detail</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {view.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="row" style={{ gap: 9 }}>
                    <div className="iconchip neu" style={{ width: 30, height: 30, borderRadius: 8 }}>
                      <i className={auditIcon(a.action)} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 12.5 }}>{a.action}</span>
                  </div>
                </td>
                <td className="mono uid">{a.targetId ?? "—"}</td>
                <td className="muted" style={{ fontSize: 12 }}>
                  {a.adminEmail}
                </td>
                <td className="muted" style={{ fontSize: 12 }}>
                  {a.detail ?? "—"}
                </td>
                <td className="muted" style={{ fontSize: 12, whiteSpace: "nowrap" }} title={formatDate(a.createdAt)}>
                  {relativeTime(a.createdAt)}
                </td>
              </tr>
            ))}
            {view.length === 0 && (
              <tr>
                <td colSpan={5} className="muted" style={{ textAlign: "center", padding: 24 }}>
                  No audit entries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="tblfoot">
          <span>admin_audit_log · before / after captured on every write</span>
          <span className="lab">retention: forever</span>
        </div>
      </div>
    </>
  );
}
