import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { planDayIndex, planWeekIndex } from "../data";
import { IconArrowDown, IconArrowUp } from "../icons";
import { WorkoutCalendarCard } from "../WorkoutCalendarCard";
import { LineChart, ScreenHeader, SectionLabel } from "../shared";
import {
  MIN_WEIGH_INS_PER_WEEK,
  calendarWeekRangeFromSunday,
  meanWeightInRangeOrNull,
  sundayOfWeekContaining,
} from "../weeklyAdjustment";
import type { ScreenProps } from "../types";

function weekRowTitle(index: number): string {
  if (index === 0) return "This week";
  if (index === 1) return "Last week";
  if (index === 2) return "2 wks ago";
  return `${index} wks ago`;
}

function shortWeekEnding(dateKey: string): string {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function distinctDaysLogged(log: { dateKey: string }[], startKey: string, endKey: string): number {
  const keys = new Set<string>();
  for (const e of log) {
    if (e.dateKey >= startKey && e.dateKey <= endKey) keys.add(e.dateKey);
  }
  return keys.size;
}

const DEFAULT_GOAL_LO = 158;
const DEFAULT_GOAL_HI = 165;
const DEFAULT_CUT_START = 172;

export function ScreenProgress({ state }: ScreenProps) {
  const chartWrapRef = useRef<HTMLDivElement>(null);
  const [chartW, setChartW] = useState(0);

  const goalLo = state.progressGoal?.goalWeightLowLbs ?? DEFAULT_GOAL_LO;
  const goalHi = state.progressGoal?.goalWeightHighLbs ?? DEFAULT_GOAL_HI;
  const cutBarStart = state.progressGoal?.progressStartWeightLbs ?? DEFAULT_CUT_START;

  useLayoutEffect(() => {
    const el = chartWrapRef.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      setChartW(Math.max(1, Math.round(w)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const sorted = useMemo(
    () => [...state.weightLog].sort((a, b) => a.dateKey.localeCompare(b.dateKey)),
    [state.weightLog],
  );
  const chartSeries = sorted.map((e) => e.weightLbs);
  const todayWeight = chartSeries.length ? chartSeries[chartSeries.length - 1]! : cutBarStart;
  const startWeight = chartSeries.length ? chartSeries[0]! : todayWeight;
  const delta = todayWeight - startWeight;

  const goalMid = (goalLo + goalHi) / 2;
  const denom = cutBarStart - goalMid;
  const goalPct = denom !== 0 ? Math.max(0, Math.min(1, (cutBarStart - todayWeight) / denom)) : 0;

  const daysIn = planDayIndex(new Date(), state.planStartIso);
  const daysTotal = 84;
  const weekIn = planWeekIndex(new Date(), state.planStartIso);

  const calendarWeekRows = useMemo(() => {
    const rows: { mon: string; sun: string; avg: number | null; days: number }[] = [];
    let sun = sundayOfWeekContaining(new Date());
    for (let i = 0; i < 8; i++) {
      const { mon, sun: sk } = calendarWeekRangeFromSunday(sun);
      const days = distinctDaysLogged(state.weightLog, mon, sk);
      const avg = meanWeightInRangeOrNull(state.weightLog, mon, sk);
      rows.push({ mon, sun: sk, avg, days });
      const prev = new Date(sun);
      prev.setDate(prev.getDate() - 7);
      sun = prev;
    }
    return rows;
  }, [state.weightLog]);

  const T = state.nutritionTargets;

  return (
    <div className="screen page-transition">
      <ScreenHeader eyebrow={`Week ${weekIn}/12 · Day ${daysIn}/${daysTotal}`} title="Progress" />

      <div className="card" style={{ padding: 18, marginTop: 18 }}>
        <div className="between">
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Body weight
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                {chartSeries.length ? todayWeight.toFixed(1) : "—"}
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>lbs</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 12,
                color: delta <= 0 ? "var(--pos)" : "var(--neg)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
                justifyContent: "flex-end",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {chartSeries.length >= 2 ? (
                <>
                  {delta <= 0 ? <IconArrowDown size={11} stroke={2.4} /> : <IconArrowUp size={11} stroke={2.4} />}
                  {delta >= 0 ? "+" : ""}
                  {delta.toFixed(1)} lbs
                </>
              ) : (
                <span style={{ color: "rgba(255,255,255,0.35)" }}>Log on Home</span>
              )}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              vs first log
            </div>
          </div>
        </div>
        <div ref={chartWrapRef} style={{ marginTop: 14, width: "100%" }}>
          {chartSeries.length >= 2 && chartW > 0 ? (
            <LineChart data={chartSeries} width={chartW} height={140} />
          ) : chartSeries.length >= 2 ? null : (
            <div style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Two weigh-ins unlock the chart.</div>
          )}
        </div>
      </div>

      <SectionLabel
        right={
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
            Sundays compare two weeks (need {MIN_WEIGH_INS_PER_WEEK} weigh-in days each)
          </span>
        }
      >
        Week avg
      </SectionLabel>
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {calendarWeekRows.map((row, i) => (
            <div key={row.sun} className="between" style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>
              <span>{weekRowTitle(i)}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {row.avg !== null ? (
                  <>
                    {row.avg.toFixed(1)} lb <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{row.days}/{MIN_WEIGH_INS_PER_WEEK}d</span>
                  </>
                ) : (
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>
                    — <span style={{ fontSize: 10 }}>{row.days}/{MIN_WEIGH_INS_PER_WEEK}d</span>
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <SectionLabel>Workouts</SectionLabel>
      <WorkoutCalendarCard state={state} />

      <SectionLabel>Goal range</SectionLabel>
      <div className="card" style={{ padding: 18 }}>
        <div className="between" style={{ alignItems: "baseline" }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
            {todayWeight.toFixed(1)}{" "}
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 16 }}>→</span> {goalLo}–{goalHi}
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginLeft: 6, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>lbs</span>
          </div>
          <div style={{ fontSize: 12, color: "#fff", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{Math.round(goalPct * 100)}%</div>
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 11, lineHeight: 1.5, color: "rgba(255,255,255,0.38)", fontWeight: 400 }}>
          ~1 lb/wk · read trend over a few weeks
        </p>
        <div style={{ marginTop: 14 }}>
          <div className="barTrack" style={{ height: 4 }}>
            <div className="barFill" style={{ width: `${goalPct * 100}%` }} />
          </div>
        </div>
        <div className="between" style={{ marginTop: 10 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Day {daysIn}
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {daysTotal - daysIn} days left
          </span>
        </div>
      </div>

      <SectionLabel>Fuel updates</SectionLabel>
      <div className="card" style={{ padding: 18 }}>
        {state.adjustmentHistory.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {state.adjustmentHistory.slice(0, 6).map((ev, idx) => (
              <div
                key={`${ev.atIso}-${ev.weekEndingSunday}`}
                className="between"
                style={{
                  alignItems: "flex-start",
                  gap: 12,
                  fontSize: 12,
                  paddingTop: idx > 0 ? 12 : 0,
                  borderTop: idx > 0 ? "0.5px solid var(--border)" : "none",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.45)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                  {shortWeekEnding(ev.weekEndingSunday)}
                </span>
                <div style={{ textAlign: "right", minWidth: 0 }}>
                  <div style={{ color: "rgba(255,255,255,0.82)", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                    {ev.before.cal}→{ev.after.cal} kcal · {ev.weeklyLossLbs.toFixed(1)} lb/wk
                  </div>
                  {ev.recommendedDeltaCal != null && ev.appliedDeltaCal != null && ev.recommendedDeltaCal !== ev.appliedDeltaCal ? (
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                      rec {ev.recommendedDeltaCal >= 0 ? "+" : ""}
                      {ev.recommendedDeltaCal} · applied {ev.appliedDeltaCal >= 0 ? "+" : ""}
                      {ev.appliedDeltaCal}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>No updates yet.</p>
        )}
      </div>

      <SectionLabel>Targets</SectionLabel>
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Calories", value: String(T.cal), unit: "kcal" },
            { label: "Protein", value: String(T.p), unit: "g" },
            { label: "Carbs", value: String(T.c), unit: "g" },
            { label: "Fat", value: String(T.f), unit: "g" },
          ].map((x) => (
            <div key={x.label}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>{x.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{x.value}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>{x.unit}</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ margin: "14px 0 0", fontSize: 11, lineHeight: 1.5, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>
          Steps: Settings
        </p>
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}
