import { useMemo, useState } from "react";

import {
  AVERAGE_CAL_WEEK_OPTIONS,
  buildAverageCalWeekStats,
  type MacroCalories,
} from "./averageCalTracker";
import type { AppState } from "./types";

const MACRO_COLORS = {
  protein: "var(--macro-protein)",
  carbs: "var(--macro-carbs)",
  fat: "var(--macro-fat)",
} as const;

const CHART_HEIGHT = 112;

type Props = {
  state: AppState;
  todayKey: string;
};

export function AverageCalTrackerCard({ state, todayKey }: Props) {
  const [weeksAgo, setWeeksAgo] = useState(0);
  const stats = useMemo(
    () => buildAverageCalWeekStats(state, todayKey, weeksAgo),
    [state, todayKey, weeksAgo],
  );

  const yTicks = useMemo(() => {
    const step = stats.chartMaxCal / 3;
    return [stats.chartMaxCal, Math.round(step * 2), Math.round(step), 0];
  }, [stats.chartMaxCal]);

  const trendUp = stats.trendPct != null && stats.trendPct > 0;
  const trendNeutral = stats.trendPct === 0;

  return (
    <div className="card" style={{ padding: "18px 16px 14px", marginTop: 18 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
        Daily Average Calories
      </div>

      <div className="between" style={{ alignItems: "center", gap: 12, marginTop: 10, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
          <span
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              fontVariantNumeric: "tabular-nums",
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            {(stats.averageCal ?? 0).toLocaleString()}
          </span>
          <span style={{ fontSize: 15, color: "var(--text-ghost)", fontWeight: 500 }}>cals</span>
        </div>

        {stats.trendPct != null ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 14,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: trendNeutral ? "var(--text-secondary)" : trendUp ? "#6ecf8a" : "#f87171",
              flexShrink: 0,
            }}
          >
            {!trendNeutral ? (
              <span aria-hidden style={{ fontSize: 13, lineHeight: 1 }}>
                {trendUp ? "↑" : "↓"}
              </span>
            ) : null}
            {Math.abs(stats.trendPct)}%
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 34,
            height: CHART_HEIGHT,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          {yTicks.map((tick) => (
            <span
              key={tick}
              style={{
                fontSize: 10,
                color: "var(--text-ghost)",
                fontWeight: 500,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
                textAlign: "right",
              }}
            >
              {tick.toLocaleString()}
            </span>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: CHART_HEIGHT,
              pointerEvents: "none",
            }}
          >
            {yTicks.slice(0, -1).map((tick) => {
              const pct = 1 - tick / stats.chartMaxCal;
              return (
                <div
                  key={`grid-${tick}`}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: `${pct * 100}%`,
                    borderTop: "1px dashed rgba(255,255,255,0.08)",
                  }}
                />
              );
            })}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 8,
              alignItems: "end",
              height: CHART_HEIGHT,
              paddingBottom: 0,
            }}
          >
            {stats.days.map((day) => (
              <StackedDayBar
                key={day.dateKey}
                macros={day.macros}
                chartMaxCal={stats.chartMaxCal}
                muted={day.isFuture}
              />
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 8,
              marginTop: 8,
            }}
          >
            {stats.days.map((day) => (
              <div
                key={`${day.dateKey}-label`}
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: day.isToday ? 700 : 500,
                  color: day.isToday ? "var(--text-primary)" : "var(--text-ghost)",
                }}
              >
                {day.dayLabel}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 18,
          marginTop: 14,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <LegendItem color={MACRO_COLORS.protein} label="Protein" />
        <LegendItem color={MACRO_COLORS.carbs} label="Carbs" />
        <LegendItem color={MACRO_COLORS.fat} label="Fats" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 6,
          padding: 4,
          borderRadius: 999,
          background: "var(--surface-2)",
        }}
      >
        {AVERAGE_CAL_WEEK_OPTIONS.map((opt) => {
          const active = weeksAgo === opt.weeksAgo;
          return (
            <button
              key={opt.weeksAgo}
              type="button"
              className="tap"
              aria-pressed={active}
              onClick={() => setWeeksAgo(opt.weeksAgo)}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "8px 6px",
                fontSize: 11,
                fontWeight: active ? 600 : 500,
                color: active ? "var(--text-primary)" : "var(--text-ghost)",
                background: active ? "var(--surface-4)" : "transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StackedDayBar({
  macros,
  chartMaxCal,
  muted,
}: {
  macros: MacroCalories;
  chartMaxCal: number;
  muted: boolean;
}) {
  const segments = [
    { key: "fat", cal: macros.fat, color: MACRO_COLORS.fat },
    { key: "carbs", cal: macros.carbs, color: MACRO_COLORS.carbs },
    { key: "protein", cal: macros.protein, color: MACRO_COLORS.protein },
  ].filter((s) => s.cal > 0);

  const totalPct = Math.min(1, macros.total / chartMaxCal);

  return (
    <div
      style={{
        height: CHART_HEIGHT,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        opacity: muted ? 0.28 : 1,
      }}
    >
      {segments.length > 0 ? (
        <div
          style={{
            width: "100%",
            maxWidth: 28,
            height: `${Math.max(totalPct * 100, 6)}%`,
            borderRadius: "6px 6px 4px 4px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column-reverse",
          }}
        >
          {segments.map((seg, idx) => {
            const segPct = macros.total > 0 ? (seg.cal / macros.total) * 100 : 0;
            const isTop = idx === segments.length - 1;
            return (
              <div
                key={seg.key}
                style={{
                  height: `${segPct}%`,
                  background: seg.color,
                  borderRadius: isTop ? "6px 6px 0 0" : 0,
                }}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ fontSize: 12, color, fontWeight: 600 }}>{label}</span>
  );
}
