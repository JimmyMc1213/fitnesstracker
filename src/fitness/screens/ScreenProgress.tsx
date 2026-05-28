import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { IconArrowDown, IconArrowUp, IconPlus } from "../icons";
import { WorkoutCalendarCard } from "../WorkoutCalendarCard";
import { PersonalRecordsSection } from "../PersonalRecordsSection";
import { AverageCalTrackerCard } from "../AverageCalTrackerCard";
import { SundayCheckInHistorySection } from "../SundayCheckInHistorySection";
import { LineChart, ScreenHeader, SectionLabel } from "../shared";
import { FullScreenOverlay } from "../motion";
import { ScreenSundayCheckInHistory } from "./ScreenSundayCheckInHistory";
import { WeighInSheet, weighInDateKeyToday } from "../WeighInSheet";
import {
  formatWeightFromLbs,
  formatWeeklyRateLbsPerWeek,
  LBS_PER_KG,
  weightUnitLabel,
} from "../unitPreferences";
import { deltaColorForSentiment, weightDeltaSentiment } from "../weightProgress";
import type { ScreenProps } from "../types";

function shortWeekEnding(dateKey: string): string {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function shortChartDate(dateKey: string): string {
  return shortWeekEnding(dateKey);
}

const BODY_WEIGHT_CHART_STROKE = "var(--accent)";
const CHART_PAD_LEFT = 12;
const CHART_PAD_RIGHT = 36;

export function ScreenProgress({ state, setState }: ScreenProps) {
  const chartWrapRef = useRef<HTMLDivElement>(null);
  const [chartW, setChartW] = useState(0);
  const [weighInOpen, setWeighInOpen] = useState(false);
  const [showCheckInHistoryPage, setShowCheckInHistoryPage] = useState(false);
  const wUnit = state.unitPreferences.weightUnit;
  const dateKeyToday = weighInDateKeyToday();
  const todayEntry = state.weightLog.find((e) => e.dateKey === dateKeyToday);

  const progressGoal = state.progressGoal;
  const goalLo = progressGoal?.goalWeightLowLbs;
  const goalHi = progressGoal?.goalWeightHighLbs;
  const cutBarStart = progressGoal?.progressStartWeightLbs;

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
  const chartSeriesLbs = sorted.map((e) => e.weightLbs);
  const chartSeries = wUnit === "kg" ? chartSeriesLbs.map((lbs) => lbs / LBS_PER_KG) : chartSeriesLbs;
  const todayWeightLbs = chartSeriesLbs.length ? chartSeriesLbs[chartSeriesLbs.length - 1]! : (todayEntry?.weightLbs ?? cutBarStart ?? 0);
  const startWeightLbs = chartSeriesLbs.length ? chartSeriesLbs[0]! : todayWeightLbs;
  const deltaLbs = todayWeightLbs - startWeightLbs;
  const goal = state.onboardingProfile?.goal ?? "maintain";
  const deltaSentiment = weightDeltaSentiment(goal, deltaLbs);
  const deltaColor = deltaColorForSentiment(deltaSentiment);
  const deltaAbsDisplay = wUnit === "kg" ? Math.abs(deltaLbs) / LBS_PER_KG : Math.abs(deltaLbs);
  const todayDisplay = wUnit === "kg" ? todayWeightLbs / LBS_PER_KG : todayWeightLbs;
  const chartDateLabels = useMemo(() => {
    if (sorted.length < 2) return null;
    const first = sorted[0]!.dateKey;
    const mid = sorted[Math.floor((sorted.length - 1) / 2)]!.dateKey;
    const last = sorted[sorted.length - 1]!.dateKey;
    return [first, mid, last].map(shortChartDate);
  }, [sorted]);
  const goalLoDisplay = goalLo != null ? (wUnit === "kg" ? goalLo / LBS_PER_KG : goalLo) : null;
  const goalHiDisplay = goalHi != null ? (wUnit === "kg" ? goalHi / LBS_PER_KG : goalHi) : null;

  const goalMid = goalLo != null && goalHi != null ? (goalLo + goalHi) / 2 : null;
  const denom = goalMid != null && cutBarStart != null ? cutBarStart - goalMid : 0;
  const goalPct = denom !== 0 && cutBarStart != null ? Math.max(0, Math.min(1, (cutBarStart - todayWeightLbs) / denom)) : 0;

  const T = state.nutritionTargets;

  if (showCheckInHistoryPage) {
    return (
      <FullScreenOverlay open zIndex={120} motionVariant="fade">
        <ScreenSundayCheckInHistory
          state={state}
          setState={setState}
          navigate={() => {}}
          onBack={() => setShowCheckInHistoryPage(false)}
        />
      </FullScreenOverlay>
    );
  }

  return (
    <div className="screen page-transition">
      <ScreenHeader title="Progress" />

      <div className="card" style={{ padding: 18, marginTop: 18 }}>
        <div className="between" style={{ alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text-whisper)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Body weight
          </div>
          <button
            type="button"
            className="tap"
            onClick={() => setWeighInOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
              border: "none",
              padding: 0,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--accent)",
              background: "transparent",
            }}
          >
            <IconPlus size={13} stroke={2.5} />
            {todayEntry ? "Update weight" : "Log weight"}
          </button>
        </div>
        <div className="between" style={{ alignItems: "flex-end", gap: 12, marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
              {chartSeries.length ? todayDisplay.toFixed(1) : "—"}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>{weightUnitLabel(wUnit)}</span>
          </div>
          <div style={{ textAlign: "right", minWidth: 0 }}>
            {chartSeries.length >= 2 ? (
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span style={{ color: deltaColor, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>
                  {deltaLbs < 0 ? <IconArrowDown size={11} stroke={2.4} /> : deltaLbs > 0 ? <IconArrowUp size={11} stroke={2.4} /> : null}
                  {deltaAbsDisplay.toFixed(1)} {weightUnitLabel(wUnit)}
                </span>
                <span style={{ color: "var(--text-ghost)" }}>
                  {" "}
                  · started at {formatWeightFromLbs(startWeightLbs, wUnit)}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>Log weigh-in</span>
            )}
          </div>
        </div>
        <div ref={chartWrapRef} style={{ marginTop: 14, width: "100%" }}>
          {chartSeries.length >= 2 && chartW > 0 ? (
            <>
              <LineChart
                data={chartSeries}
                width={chartW}
                height={140}
                stroke={BODY_WEIGHT_CHART_STROKE}
                padLeft={CHART_PAD_LEFT}
                padRight={CHART_PAD_RIGHT}
              />
              {chartDateLabels ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 6,
                    paddingLeft: CHART_PAD_LEFT,
                    paddingRight: CHART_PAD_RIGHT,
                    fontSize: 11,
                    color: "var(--text-ghost)",
                    fontWeight: 500,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {chartDateLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              ) : null}
            </>
          ) : chartSeries.length >= 2 ? null : (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
              Log two weigh-ins to unlock the trend line.
            </div>
          )}
        </div>
      </div>

      <AverageCalTrackerCard state={state} todayKey={dateKeyToday} />

      <SundayCheckInHistorySection
        history={state.sundayCheckInHistory ?? []}
        unitPreferences={state.unitPreferences}
        onShowPrevious={() => setShowCheckInHistoryPage(true)}
      />

      <WeighInSheet
        open={weighInOpen}
        onClose={() => setWeighInOpen(false)}
        dateKey={dateKeyToday}
        existing={todayEntry}
        unitPreferences={state.unitPreferences}
        setState={setState}
      />

      <SectionLabel>Workouts</SectionLabel>
      <WorkoutCalendarCard state={state} />

      <SectionLabel>Personal records</SectionLabel>
      <PersonalRecordsSection state={state} />

      <SectionLabel>Goal range</SectionLabel>
      {progressGoal && goalLoDisplay != null && goalHiDisplay != null ? (
      <div className="card" style={{ padding: 18 }}>
        <div className="between" style={{ alignItems: "baseline" }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
            {todayDisplay.toFixed(1)}{" "}
            <span style={{ color: "var(--text-ghost)", fontSize: 16 }}>→</span> {goalLoDisplay.toFixed(1)}–{goalHiDisplay.toFixed(1)}
            <span style={{ fontSize: 10, color: "var(--text-tertiary)", marginLeft: 6, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>{weightUnitLabel(wUnit)}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{Math.round(goalPct * 100)}%</div>
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 11, lineHeight: 1.5, color: "var(--text-ghost)", fontWeight: 400 }}>
          ~{wUnit === "kg" ? "0.5" : "1"} {weightUnitLabel(wUnit)}/wk · read trend over a few weeks
        </p>
        <div style={{ marginTop: 14 }}>
          <div className="barTrack" style={{ height: 4 }}>
            <div className="barFill" style={{ width: `${goalPct * 100}%` }} />
          </div>
        </div>
      </div>
      ) : (
        <div className="card" style={{ padding: 18, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Complete onboarding to set your goal weight range.
        </div>
      )}

      {state.adjustmentHistory.length > 0 ? (
        <>
          <SectionLabel>Fuel updates</SectionLabel>
          <div className="card" style={{ padding: 18 }}>
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
                  <span style={{ color: "var(--text-secondary)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                    {shortWeekEnding(ev.weekEndingSunday)}
                  </span>
                  <div style={{ textAlign: "right", minWidth: 0 }}>
                    <div style={{ color: "var(--text-soft)", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                      {ev.before.cal}→{ev.after.cal} kcal · {formatWeeklyRateLbsPerWeek(ev.weeklyLossLbs, wUnit)}
                    </div>
                    {ev.recommendedDeltaCal != null && ev.appliedDeltaCal != null && ev.recommendedDeltaCal !== ev.appliedDeltaCal ? (
                      <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                        rec {ev.recommendedDeltaCal >= 0 ? "+" : ""}
                        {ev.recommendedDeltaCal} · applied {ev.appliedDeltaCal >= 0 ? "+" : ""}
                        {ev.appliedDeltaCal}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

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
              <div style={{ fontSize: 10, color: "var(--text-ghost)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>{x.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{x.value}</span>
                <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>{x.unit}</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ margin: "14px 0 0", fontSize: 11, lineHeight: 1.5, color: "var(--text-tertiary)", fontWeight: 400 }}>
          Steps: Settings
        </p>
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}
