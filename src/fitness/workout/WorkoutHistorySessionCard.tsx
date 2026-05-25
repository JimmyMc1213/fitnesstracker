import { formatWorkoutHistoryDate } from "../workoutHistory";
import {
  countSessionPersonalRecords,
  formatSessionVolume,
  historyExerciseRows,
  sessionLoggedVolume,
} from "../workoutHistorySessionStats";
import { formatWorkoutDuration } from "../workoutSummary";
import type { CompletedWorkoutSession, WeightUnit } from "../types";

const ACCENT_BLUE = "var(--accent)";

export function WorkoutHistorySessionCard({
  session,
  workoutHistory,
  weightUnit,
  onOpen,
  onDelete,
}: {
  session: CompletedWorkoutSession;
  workoutHistory: CompletedWorkoutSession[] | undefined;
  weightUnit: WeightUnit;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const volume = sessionLoggedVolume(session);
  const prCount = countSessionPersonalRecords(session, workoutHistory);
  const rows = historyExerciseRows(session, weightUnit);

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: "hidden",
        border: "0.5px solid var(--border)",
      }}
    >
      <div className="between" style={{ alignItems: "flex-start", padding: "12px 14px 10px", gap: 8 }}>
        <button
          type="button"
          className="tap"
          onClick={onOpen}
          style={{
            flex: 1,
            textAlign: "left",
            background: "transparent",
            border: "none",
            color: "var(--text-primary)",
            minWidth: 0,
            padding: 0,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>{session.title}</div>
          <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint-soft)", fontWeight: 500 }}>
            {formatWorkoutHistoryDate(session.dayKey, session.endedAtMs)}
          </div>
        </button>
        <button
          type="button"
          className="tap"
          onClick={onOpen}
          aria-label={`Options for ${session.title}`}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            flexShrink: 0,
            background: "var(--workout-action-bg)",
            border: "0.5px solid var(--workout-action-border)",
            color: ACCENT_BLUE,
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          ···
        </button>
      </div>

      <button
        type="button"
        className="tap"
        onClick={onOpen}
        style={{
          width: "100%",
          textAlign: "left",
          background: "transparent",
          border: "none",
          padding: "0 14px 10px",
          color: "inherit",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-faint-soft)",
          }}
        >
          <span>⏱ {formatWorkoutDuration(session.durationSec)}</span>
          <span>🏋 {formatSessionVolume(volume, weightUnit)}</span>
          {prCount > 0 ? <span>🏆 {prCount} PR{prCount === 1 ? "" : "s"}</span> : null}
        </div>
      </button>

      {rows.length > 0 ? (
        <div style={{ borderTop: "0.5px solid var(--border)", padding: "8px 14px 12px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 8,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-ghost)",
              marginBottom: 6,
            }}
          >
            <span>Exercise</span>
            <span>Best set</span>
          </div>
          {rows.map((row) => (
            <div
              key={`${row.name}-${row.label ?? ""}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-muted-soft)",
                padding: "4px 0",
              }}
            >
              <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {row.setCount} × {row.name}
              </span>
              <span style={{ color: "var(--text-faint-soft)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                {row.bestDetail}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div style={{ borderTop: "0.5px solid var(--border)", display: "flex" }}>
        <button
          type="button"
          className="tap"
          onClick={onOpen}
          style={{
            flex: 1,
            padding: "10px 14px",
            fontSize: 12,
            fontWeight: 600,
            color: ACCENT_BLUE,
            background: "transparent",
            border: "none",
          }}
        >
          View details
        </button>
        <button
          type="button"
          className="tap"
          onClick={onDelete}
          aria-label={`Delete ${session.title}`}
          style={{
            padding: "10px 16px",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--workout-danger-fg)",
            background: "transparent",
            border: "none",
            borderLeft: "0.5px solid var(--border)",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
