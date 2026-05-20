import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { getExerciseSessionHistory } from "./exerciseSessionHistory";
import type { AppState } from "./types";

const WEIGHT_STROKE = "#ffffff";
const REPS_STROKE = "#0A84FF";

function formatSessionLabel(dayKey: string): string {
  const [, m, d] = dayKey.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function DualMetricLineChart({
  weightData,
  repsData,
  labels,
  width,
  height = 120,
}: {
  weightData: number[];
  repsData: number[];
  labels: string[];
  width: number;
  height?: number;
}) {
  const padLeft = 28;
  const padRight = 28;
  const padTop = 12;
  const padBottom = 22;
  const plotW = Math.max(1, width - padLeft - padRight);
  const plotH = Math.max(1, height - padTop - padBottom);

  const wMin = Math.min(...weightData) - 2;
  const wMax = Math.max(...weightData) + 2;
  const wRange = wMax - wMin || 1;
  const rMin = Math.min(...repsData) - 1;
  const rMax = Math.max(...repsData) + 1;
  const rRange = rMax - rMin || 1;

  const n = weightData.length;
  const stepX = n > 1 ? plotW / (n - 1) : 0;

  const wPts = weightData.map((v, i) => {
    const x = padLeft + i * stepX;
    const y = padTop + plotH - ((v - wMin) / wRange) * plotH;
    return [x, y] as const;
  });
  const rPts = repsData.map((v, i) => {
    const x = padLeft + i * stepX;
    const y = padTop + plotH - ((v - rMin) / rRange) * plotH;
    return [x, y] as const;
  });

  const pathD = (pts: readonly (readonly [number, number])[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

  const wTicks = [wMax, (wMax + wMin) / 2, wMin];
  const rTicks = [rMax, (rMax + rMin) / 2, rMin];

  return (
    <svg width={width} height={height} style={{ display: "block", maxWidth: "100%" }}>
      {[0, 1, 2].map((i) => {
        const y = padTop + (i / 2) * plotH;
        return (
          <line
            key={i}
            x1={padLeft}
            x2={width - padRight}
            y1={y}
            y2={y}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        );
      })}
      {wTicks.map((t, i) => (
        <text
          key={`w${i}`}
          x={4}
          y={padTop + (i / 2) * plotH + 3}
          fill="rgba(255,255,255,0.35)"
          fontSize="8"
          fontFamily="var(--ui)"
        >
          {t >= 10 ? Math.round(t) : t.toFixed(1)}
        </text>
      ))}
      {rTicks.map((t, i) => (
        <text
          key={`r${i}`}
          x={width - 4}
          y={padTop + (i / 2) * plotH + 3}
          textAnchor="end"
          fill="rgba(10,132,255,0.7)"
          fontSize="8"
          fontFamily="var(--ui)"
        >
          {Math.round(t)}
        </text>
      ))}
      <path d={pathD(wPts)} fill="none" stroke={WEIGHT_STROKE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={pathD(rPts)} fill="none" stroke={REPS_STROKE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {wPts.length > 0 && (
        <circle cx={wPts[wPts.length - 1][0]} cy={wPts[wPts.length - 1][1]} r="2.5" fill={WEIGHT_STROKE} />
      )}
      {rPts.length > 0 && (
        <circle cx={rPts[rPts.length - 1][0]} cy={rPts[rPts.length - 1][1]} r="2.5" fill={REPS_STROKE} />
      )}
      {labels.map((lbl, i) => (
        <text
          key={i}
          x={padLeft + i * stepX}
          y={height - 4}
          textAnchor="middle"
          fill="rgba(255,255,255,0.28)"
          fontSize="8"
          fontFamily="var(--ui)"
        >
          {lbl}
        </text>
      ))}
    </svg>
  );
}

export function ExerciseProgressChart({
  state,
  exerciseName,
  exerciseLabel,
}: {
  state: AppState;
  exerciseName: string;
  exerciseLabel?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [chartW, setChartW] = useState(280);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setChartW(Math.floor(w));
    });
    ro.observe(el);
    setChartW(Math.floor(el.getBoundingClientRect().width) || 280);
    return () => ro.disconnect();
  }, []);

  const sessions = useMemo(
    () => getExerciseSessionHistory(state.exerciseSessionHistoryByKey, exerciseName, exerciseLabel),
    [state.exerciseSessionHistoryByKey, exerciseName, exerciseLabel],
  );

  const { weightData, repsData, labels } = useMemo(() => {
    return {
      weightData: sessions.map((s) => s.bestWeight),
      repsData: sessions.map((s) => s.bestReps),
      labels: sessions.map((s) => formatSessionLabel(s.dayKey)),
    };
  }, [sessions]);

  if (sessions.length < 2) {
    return (
      <div
        style={{
          padding: "12px 0 4px",
          fontSize: 12,
          color: "rgba(255,255,255,0.4)",
          lineHeight: 1.45,
        }}
      >
        {sessions.length === 0
          ? "Finish a workout with logged sets to see your last 10 sessions here."
          : "One session logged — finish another workout to see the trend."}
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ marginTop: 4 }}>
      <div
        style={{
          display: "flex",
          gap: 14,
          marginBottom: 8,
          fontSize: 10,
          fontWeight: 500,
          color: "rgba(255,255,255,0.45)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 2, background: WEIGHT_STROKE, borderRadius: 1 }} />
          Weight (lb)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 2, background: REPS_STROKE, borderRadius: 1 }} />
          Reps
        </span>
      </div>
      <DualMetricLineChart weightData={weightData} repsData={repsData} labels={labels} width={chartW} />
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
        Last {sessions.length} session{sessions.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}
