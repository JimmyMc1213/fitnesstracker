import { useState, type CSSProperties } from "react";

import { ExerciseProgressChart } from "./ExerciseProgressChart";
import { getExerciseSessionHistory } from "./exerciseSessionHistory";
import type { AppState } from "./types";

export function ExerciseProgressSection({
  state,
  exerciseName,
  exerciseLabel,
  style,
}: {
  state: AppState;
  exerciseName: string;
  exerciseLabel?: string;
  style?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const sessionCount = getExerciseSessionHistory(
    state.exerciseSessionHistoryByKey ?? {},
    exerciseName,
    exerciseLabel,
  ).length;

  return (
    <div style={{ marginTop: 10, marginBottom: 4, ...style }}>
      <button
        type="button"
        className="tap"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 10,
          border: "0.5px solid rgba(255,255,255,0.12)",
          background: open ? "rgba(10,132,255,0.1)" : "rgba(255,255,255,0.05)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          textAlign: "left",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span aria-hidden style={{ fontSize: 14, opacity: 0.85 }}>
            📈
          </span>
          <span style={{ letterSpacing: "-0.01em" }}>Progress</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>
            · last 10 sessions
            {sessionCount > 0 ? ` (${sessionCount})` : ""}
          </span>
        </span>
        <span
          style={{
            flexShrink: 0,
            fontSize: 11,
            color: "rgba(10,132,255,0.9)",
            fontWeight: 600,
          }}
        >
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open ? (
        <div
          style={{
            marginTop: 8,
            padding: "10px 12px 4px",
            borderRadius: 10,
            border: "0.5px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <ExerciseProgressChart state={state} exerciseName={exerciseName} exerciseLabel={exerciseLabel} />
        </div>
      ) : null}
    </div>
  );
}
