import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { localDateKey } from "../dailyPlan";
import { IconArrowDown, IconArrowUp, IconPlus } from "../icons";
import { WorkoutCalendarCard } from "../WorkoutCalendarCard";
import { PersonalRecordsSection } from "../PersonalRecordsSection";
import { WeeklySummaryCard } from "../WeeklySummaryCard";
import { SundayCheckInHistorySection } from "../SundayCheckInHistorySection";
import { LineChart, ScreenHeader, SectionLabel } from "../shared";
import { BottomSheet, FullScreenOverlay } from "../motion";
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

const WEEK_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function dateKeyFromParts(y: number, monthIndex: number, day: number): string {
  return `${y}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function daysInMonthCount(y: number, monthIndex: number): number {
  return new Date(y, monthIndex + 1, 0).getDate();
}

function YearPickerSheet({
  open,
  selectedYear,
  onPick,
  onClose,
}: {
  open: boolean;
  selectedYear: number;
  onPick: (y: number) => void;
  onClose: () => void;
}) {
  const anchorYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 9 }, (_, i) => anchorYear - 4 + i), [anchorYear]);
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      zIndex={190}
      ariaLabel="Choose year"
      backdropStyle={{
        background: "var(--sheet-backdrop)",
        alignItems: "stretch",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: 10,
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      }}
      panelStyle={{
        padding: 18,
        borderRadius: 16,
        marginBottom: 8,
        maxHeight: "72%",
        overflowY: "auto",
        border: "0.5px solid var(--sheet-panel-border)",
        background: "var(--card)",
        width: "100%",
        maxWidth: "100%",
      }}
    >
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 14 }}>
          Choose year
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {years.map((y) => {
            const active = y === selectedYear;
            return (
              <button
                key={y}
                type="button"
                className="tap"
                onClick={() => {
                  onPick(y);
                  onClose();
                }}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: active ? "1px solid var(--border-strong)" : "0.5px solid var(--border)",
                  background: active ? "var(--surface-4)" : "var(--surface-2)",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: 16,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {y}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="tap"
          onClick={onClose}
          style={{
            marginTop: 16,
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "0.5px solid var(--border)",
            background: "transparent",
            color: "var(--text-soft)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Close
        </button>
    </BottomSheet>
  );
}

type LiftingCalendarProps = {
  viewYear: number;
  viewMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenYear: () => void;
  completedByDay: Record<string, boolean>;
};

function LiftingCalendarCard({ viewYear, viewMonth, onPrevMonth, onNextMonth, onOpenYear, completedByDay }: LiftingCalendarProps) {
  const todayKey = localDateKey(new Date());
  const dim = daysInMonthCount(viewYear, viewMonth);
  const startDow = new Date(viewYear, viewMonth, 1).getDay();
  const title = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const cells: ({ day: number; key: string } | "blank")[] = [];
  for (let i = 0; i < startDow; i++) cells.push("blank");
  for (let d = 1; d <= dim; d++) cells.push({ day: d, key: dateKeyFromParts(viewYear, viewMonth, d) });
  while (cells.length % 7 !== 0) cells.push("blank");

  return (
    <div className="card" style={{ padding: 16 }} onClick={onOpenYear} role="presentation">
      <div className="between" style={{ alignItems: "center", marginBottom: 12 }}>
        <button
          type="button"
          className="tap"
          aria-label="Previous month"
          onClick={(e) => {
            e.stopPropagation();
            onPrevMonth();
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: "0.5px solid var(--border)",
            background: "var(--surface-3)",
            color: "var(--text-primary)",
            fontSize: 22,
            fontWeight: 400,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ‹
        </button>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", textAlign: "center", padding: "0 8px" }}>{title}</div>
        <button
          type="button"
          className="tap"
          aria-label="Next month"
          onClick={(e) => {
            e.stopPropagation();
            onNextMonth();
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: "0.5px solid var(--border)",
            background: "var(--surface-3)",
            color: "var(--text-primary)",
            fontSize: 22,
            fontWeight: 400,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ›
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
        {WEEK_LABELS.map((l, i) => (
          <div
            key={`${l}-${i}`}
            style={{
              textAlign: "center",
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-ghost)",
              letterSpacing: "0.06em",
            }}
          >
            {l}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {cells.map((cell, idx) => {
          if (cell === "blank") {
            return <div key={`b-${idx}`} style={{ aspectRatio: "1", minHeight: 36 }} />;
          }
          const { key, day } = cell;
          const done = completedByDay[key] === true;
          const isToday = key === todayKey;
          const isFuture = key > todayKey;
          const highlight = done && !isFuture;
          const faded = isFuture;
          return (
            <div
              key={key}
              style={{
                aspectRatio: "1",
                minHeight: 36,
                borderRadius: 10,
                display: "grid",
                placeItems: "center",
                fontSize: 13,
                fontWeight: highlight ? 700 : 500,
                fontVariantNumeric: "tabular-nums",
                background: highlight ? "var(--primary)" : "var(--surface-2)",
                color: highlight ? "var(--primary-fg)" : faded ? "var(--text-whisper)" : "var(--text-muted-soft)",
                border: isToday ? "1px solid var(--border-strong)" : "0.5px solid transparent",
                boxSizing: "border-box",
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      <p
        style={{
          margin: "14px 0 0",
          fontSize: 11,
          lineHeight: 1.45,
          color: "var(--text-ghost)",
          fontWeight: 400,
          textAlign: "center",
        }}
      >
        Tap the card to pick a year · White = finished a workout from the Workout tab that day
      </p>
    </div>
  );
}

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

  const [calView, setCalView] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });
  const [yearSheetOpen, setYearSheetOpen] = useState(false);

  const shiftCalMonth = (delta: number) => {
    setCalView((prev) => {
      const d = new Date(prev.y, prev.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const T = state.nutritionTargets;

  if (showCheckInHistoryPage) {
    return (
      <FullScreenOverlay open zIndex={120}>
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
    <div className="screen">
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

      <WeeklySummaryCard state={state} todayKey={dateKeyToday} />

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

      <SectionLabel
        right={
          <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500 }}>Finish in Workout tab</span>
        }
      >
        Lifting days
      </SectionLabel>
      <LiftingCalendarCard
        viewYear={calView.y}
        viewMonth={calView.m}
        onPrevMonth={() => shiftCalMonth(-1)}
        onNextMonth={() => shiftCalMonth(1)}
        onOpenYear={() => setYearSheetOpen(true)}
        completedByDay={state.workoutsCompletedByDay}
      />

      <YearPickerSheet
        open={yearSheetOpen}
        selectedYear={calView.y}
        onPick={(y) => setCalView((v) => ({ ...v, y }))}
        onClose={() => setYearSheetOpen(false)}
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
