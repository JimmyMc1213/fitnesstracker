import { useState, type CSSProperties } from "react";

import { ExerciseProgressChart } from "./ExerciseProgressChart";
import { getExerciseSessionHistory } from "./exerciseSessionHistory";
import { IconChart } from "./icons";
import type { AppState } from "./types";

type ExerciseProgressVariant = "card" | "footer";

export function ExerciseProgressSection({
  state,
  exerciseName,
  exerciseLabel,
  style,
  variant = "card",
}: {
  state: AppState;
  exerciseName: string;
  exerciseLabel?: string;
  style?: CSSProperties;
  variant?: ExerciseProgressVariant;
}) {
  const [open, setOpen] = useState(false);
  const sessionCount = getExerciseSessionHistory(
    state.exerciseSessionHistoryByKey ?? {},
    exerciseName,
    exerciseLabel,
  ).length;

  if (variant === "footer") {
    return (
      <div style={style}>
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
            padding: "10px 0",
            border: "none",
            background: "transparent",
            color: "#fff",
            textAlign: "left",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <IconChart size={14} stroke={1.8} style={{ color: "rgba(255,255,255,0.4)" }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
              Progress
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>
              · last 10 sessions
              {sessionCount > 0 ? ` (${sessionCount})` : ""}
            </span>
          </span>
          <span
            style={{
              flexShrink: 0,
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              fontWeight: 500,
            }}
          >
            {open ? "Hide" : "Show"}
          </span>
        </button>
        {open ? (
          <div
            style={{
              marginTop: 4,
              marginBottom: 6,
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
          <IconChart size={14} stroke={1.8} style={{ color: "rgba(255,255,255,0.7)" }} />
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
