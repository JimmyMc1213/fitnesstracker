import { useMemo } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleIndicator,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { buildCoachContext, getWeeklyCoachReview } from "./coachEngine";
import { buildWeeklySummary, formatWeeklySummaryRange } from "./weeklySummary";
import { LBS_PER_KG } from "./unitPreferences";
import type { AppState } from "./types";

type Props = {
  state: AppState;
  todayKey: string;
  defaultCollapsed?: boolean;
};

export function WeeklySummaryCard({ state, todayKey, defaultCollapsed = false }: Props) {
  const wUnit = state.unitPreferences.weightUnit;
  const summary = useMemo(() => buildWeeklySummary(state, todayKey), [state, todayKey]);
  const coachReview = useMemo(() => {
    const ctx = buildCoachContext(state, todayKey);
    return getWeeklyCoachReview(ctx);
  }, [state, todayKey]);

  const displayVolume =
    summary.totalVolumeLbs > 0 && wUnit === "kg"
      ? Math.round(summary.totalVolumeLbs / LBS_PER_KG)
      : summary.totalVolumeLbs;
  const volLabel = summary.totalVolumeLbs > 0 ? (wUnit === "kg" ? "kg·reps" : "lb·reps") : undefined;

  const rangeLabel = formatWeeklySummaryRange(summary.weekStartKey, summary.weekEndKey);

  const coachCopy = (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.45,
          color: "var(--text-soft)",
          fontWeight: 500,
        }}
      >
        {coachReview.narrative}
      </p>
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          background: "rgba(96,165,250,0.08)",
          border: "0.5px solid rgba(96,165,250,0.18)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "rgba(96,165,250,0.85)",
          }}
        >
          Next week
        </div>
        <div style={{ marginTop: 5, fontSize: 12, lineHeight: 1.4, color: "var(--text-soft)", fontWeight: 600 }}>
          {coachReview.nextWeekFocus}
        </div>
      </div>
    </div>
  );

  const statGrid = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
      <StatBlock
        label="Workouts"
        value={`${summary.workoutsCompleted}/${summary.workoutsPlanned}`}
        sub="days done"
      />
      <StatBlock
        label="Volume"
        value={summary.totalVolumeLbs > 0 ? displayVolume.toLocaleString() : ", "}
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
      <div style={{ marginTop: 4, fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
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
        {coachCopy}
      </div>
    );
  }

  return (
    <Collapsible
      defaultOpen={!defaultCollapsed}
      className="card"
      style={{
        padding: 0,
        marginTop: 18,
        overflow: "hidden",
        borderColor: "rgba(96,165,250,0.22)",
        background: "linear-gradient(180deg, rgba(96,165,250,0.06) 0%, transparent 48%)",
      }}
    >
      <CollapsibleTrigger
        className="tap"
        aria-label="This week summary"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
          padding: 16,
          border: "none",
          background: "transparent",
          color: "var(--text-primary)",
          textAlign: "left",
        }}
      >
        {headerContent}
        <span style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <WeekGlyph size={22} />
          <CollapsibleIndicator
            aria-hidden
            className="collapsible-indicator--rotate-180"
            style={{
              fontSize: 12,
              color: "rgba(96,165,250,0.75)",
            }}
          >
            ▼
          </CollapsibleIndicator>
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div style={{ padding: "0 16px 16px" }}>
          {statGrid}
          {coachCopy}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      style={{
        padding: "10px 8px",
        borderRadius: 10,
        background: "var(--surface-1)",
        border: "0.5px solid var(--divider-subtle)",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-ghost)" }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          color: "var(--text-primary)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
      {sub ? (
        <div style={{ marginTop: 3, fontSize: 9, color: "var(--text-ghost)", fontWeight: 500 }}>{sub}</div>
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
