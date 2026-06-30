"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { AdminUserRow } from "../lib/types";
import { goalChip, initialsFromEmail, numberWithCommas, relativeTime, shortId, statusChip } from "../lib/format";

type SortKey = "email" | "createdAt" | "plan" | "status" | "lastSyncMs";

const PAGE_SIZE = 12;

export function UsersTable({ rows, initialQuery }: { rows: AdminUserRow[]; initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "createdAt", dir: -1 });
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? rows.filter((r) => r.email.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
      : rows;
    const sorted = [...base].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      if (av < bv) return -1 * sort.dir;
      if (av > bv) return 1 * sort.dir;
      return 0;
    });
    return sorted;
  }, [rows, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageRows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 }));

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th onClick={() => toggleSort(k)}>
      <span className="sorth">
        {label}
        {sort.key === k ? <i className={sort.dir === 1 ? "ph ph-caret-up" : "ph ph-caret-down"} /> : null}
      </span>
    </th>
  );

  return (
    <>
      <div className="filterbar">
        <div className="tsearch" style={{ marginLeft: 0, width: 320 }}>
          <i className="ph ph-magnifying-glass" />
          <input
            placeholder="Filter by email or id…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <span className="lab" style={{ alignSelf: "center", fontSize: 12 }}>
          {numberWithCommas(filtered.length)} matching
        </span>
      </div>

      <div className="card tblwrap">
        <table className="tbl">
          <thead>
            <tr>
              <Th k="email" label="User" />
              <Th k="createdAt" label="Created" />
              <th>Goal</th>
              <Th k="plan" label="Plan" />
              <Th k="status" label="Subscription" />
              <Th k="lastSyncMs" label="Last sync" />
            </tr>
          </thead>
          <tbody>
            {pageRows.map((u) => {
              const status = statusChip(u.status);
              const goal = goalChip(u.goal);
              return (
                <tr key={u.id} className="trow" onClick={() => router.push(`/users/${u.id}`)}>
                  <td>
                    <div className="uc">
                      <div className="avem">{initialsFromEmail(u.email)}</div>
                      <div>
                        <div className="umail">{u.email}</div>
                        <div className="uid">
                          {shortId(u.id)}
                          {u.country ? ` · ${u.country}` : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
                  <td>
                    <span className={goal.cls}>{goal.label}</span>
                  </td>
                  <td>{u.plan}</td>
                  <td>
                    <span className={status.cls}>{status.label}</span>
                  </td>
                  <td className="muted">{relativeTime(u.lastSyncMs)}</td>
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={6} className="muted" style={{ textAlign: "center", padding: 28 }}>
                  No users match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="tblfoot">
          <span>
            Showing {pageRows.length} of {numberWithCommas(filtered.length)} accounts
          </span>
          <div className="pg">
            <button className="pgb" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={current === 1}>
              <i className="ph ph-caret-left" />
            </button>
            <button className="pgb on">{current}</button>
            <span className="lab" style={{ alignSelf: "center", padding: "0 4px" }}>
              / {totalPages}
            </span>
            <button className="pgb" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={current === totalPages}>
              <i className="ph ph-caret-right" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
