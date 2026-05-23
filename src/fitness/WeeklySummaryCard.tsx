import { useMemo, useState } from "react";

import { buildWeeklySummary, formatWeeklySummaryRange } from "./weeklySummary";
import { LBS_PER_KG } from "./unitPreferences";
import type { AppState } from "./types";

type Props = {
  state: AppState;
  todayKey: string;
  defaultCollapsed?: boolean;
};

export function WeeklySummaryCard({ state, todayKey, defaultCollapsed = false }: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const wUnit = state.unitPreferences.weightUnit;
  const summary = useMemo(() => buildWeeklySummary(state, todayKey), [state, todayKey]);

  const displayVolume =
    summary.totalVolumeLbs > 0 && wUnit === "kg"
      ? Math.round(summary.totalVolumeLbs / LBS_PER_KG)
      : summary.totalVolumeLbs;
  const volLabel = summary.totalVolumeLbs > 0 ? (wUnit === "kg" ? "kg·reps" : "lb·reps") : undefined;

  const rangeLabel = formatWeeklySummaryRange(summary.weekStartKey, summary.weekEndKey);

  const statGrid = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
      <StatBlock
        label="Workouts"
        value={`${summary.workoutsCompleted}/${summary.workoutsPlanned}`}
        sub="days done"
      />
      <StatBlock
        label="Volume"
        value={summary.totalVolumeLbs > 0 ? displayVolume.toLocaleString() : "—"}
        sub={volLabel}
      />
      <StatBlock
        label="Fuel"
        value={`${summary.nutritionDaysHit}/${summary.daysInWeek}`}
        sub="days on target"
      />
    </div>
  );

  const headerContent = (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(96,165,250,0.85)",
        }}
      >
        This week
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
        {rangeLabel} · resets Monday
      </div>
    </div>
  );

  if (!defaultCollapsed) {
    return (
      <div
        className="card"
        style={{
          padding: 16,
          marginTop: 18,
          borderColor: "rgba(96,165,250,0.22)",
          background: "linear-gradient(180deg, rgba(96,165,250,0.06) 0%, transparent 48%)",
        }}
      >
        <div className="between" style={{ alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
          {headerContent}
          <WeekGlyph size={22} />
        </div>
        {statGrid}
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        padding: 0,
        marginTop: 18,
        overflow: "hidden",
        borderColor: "rgba(96,165,250,0.22)",
        background: "linear-gradient(180deg, rgba(96,165,250,0.06) 0%, transparent 48%)",
      }}
    >
      <button
        type="button"
        className="tap"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "This week summary — tap to expand" : "This week summary — tap to collapse"}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
          padding: 16,
          border: "none",
          background: "transparent",
          color: "#fff",
          textAlign: "left",
        }}
      >
        {headerContent}
        <span style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <WeekGlyph size={22} />
          <span
            aria-hidden
            style={{
              fontSize: 12,
              color: "rgba(96,165,250,0.75)",
              transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.15s ease",
            }}
          >
            ▼
          </span>
        </span>
      </button>

      {!collapsed ? <div style={{ padding: "0 16px 16px" }}>{statGrid}</div> : null}
    </div>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      style={{
        padding: "10px 8px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.04)",
        border: "0.5px solid rgba(255,255,255,0.06)",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          color: "#fff",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
      {sub ? (
        <div style={{ marginTop: 3, fontSize: 9, color: "rgba(255,255,255,0.32)", fontWeight: 500 }}>{sub}</div>
      ) : null}
    </div>
  );
}

function WeekGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "block", flexShrink: 0 }}>
      <rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="rgba(96,165,250,0.75)" strokeWidth="1.5" />
      <path d="M3 9h18" stroke="rgba(96,165,250,0.5)" strokeWidth="1.5" />
      <circle cx="8" cy="14" r="1.2" fill="rgba(96,165,250,0.9)" />
      <circle cx="12" cy="14" r="1.2" fill="rgba(96,165,250,0.55)" />
      <circle cx="16" cy="14" r="1.2" fill="rgba(96,165,250,0.35)" />
    </svg>
  );
}
