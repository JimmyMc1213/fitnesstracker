import { useMemo, useState } from "react";

import {
  buildPersonalRecordsBoard,
  formatPersonalRecordDate,
  formatPersonalRecordSet,
} from "./personalRecordsBoard";
import type { AppState, WeightUnit } from "./types";

type Props = {
  state: AppState;
};

export function PersonalRecordsSection({ state }: Props) {
  const wUnit = state.unitPreferences.weightUnit;
  const rows = useMemo(
    () => buildPersonalRecordsBoard(state.exerciseSessionHistoryByKey ?? {}, state.workoutHistory ?? []),
    [state.exerciseSessionHistoryByKey, state.workoutHistory],
  );
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <div className="card" style={{ padding: 18 }}>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.4)" }}>
          Finish workouts with logged sets to build your PR board.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((row) => {
        const expanded = expandedKey === row.key;
        const title = row.displayLabel ? `${row.displayName} · ${row.displayLabel}` : row.displayName;
        return (
          <div key={row.key} className="card" style={{ padding: 0, overflow: "hidden", border: "0.5px solid var(--border)" }}>
            <button
              type="button"
              className="tap"
              onClick={() => setExpandedKey(expanded ? null : row.key)}
              aria-expanded={expanded}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "none",
                background: "transparent",
                color: "#fff",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                  {formatPersonalRecordSet(row.bestWeight, row.bestReps, wUnit)}
                  <span style={{ margin: "0 6px", color: "rgba(255,255,255,0.2)" }}>·</span>
                  {formatPersonalRecordDate(row.bestDateKey, row.bestEndedAtMs)}
                </div>
              </div>
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 18,
                  color: "rgba(255,255,255,0.35)",
                  transform: expanded ? "rotate(90deg)" : "none",
                  transition: "transform 0.15s ease",
                }}
                aria-hidden
              >
                ›
              </span>
            </button>

            {expanded ? (
              <div
                style={{
                  borderTop: "0.5px solid var(--border)",
                  padding: "8px 16px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {row.history.map((entry) => (
                  <HistoryRow key={entry.endedAtMs} entry={entry} unit={wUnit} />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function HistoryRow({
  entry,
  unit,
}: {
  entry: { dayKey: string; endedAtMs: number; bestWeight: number; bestReps: number; isPr: boolean };
  unit: WeightUnit;
}) {
  return (
    <div
      className="between"
      style={{
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 8,
        background: entry.isPr ? "rgba(52,199,89,0.08)" : "rgba(255,255,255,0.03)",
        border: entry.isPr ? "0.5px solid rgba(52,199,89,0.25)" : "0.5px solid transparent",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {formatPersonalRecordSet(entry.bestWeight, entry.bestReps, unit)}
        </div>
        <div style={{ marginTop: 2, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          {formatPersonalRecordDate(entry.dayKey, entry.endedAtMs)}
        </div>
      </div>
      {entry.isPr ? (
        <span
          style={{
            flexShrink: 0,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#34C759",
            background: "rgba(52,199,89,0.15)",
            padding: "4px 8px",
            borderRadius: 6,
          }}
        >
          PR
        </span>
      ) : null}
    </div>
  );
}
