import { useState } from "react";

import { IconTrash } from "../icons";
import { ScreenHeader } from "../shared";
import { WorkoutSessionPreviewSheet } from "../WorkoutSessionPreviewSheet";
import {
  formatWorkoutHistoryDate,
  getWorkoutHistorySorted,
  removeWorkoutFromHistory,
  workoutsCompletedByDayFromHistory,
} from "../workoutHistory";
import { formatWorkoutDuration } from "../workoutSummary";
import type { CompletedWorkoutSession, ScreenProps } from "../types";

const ACCENT_BLUE = "#0A84FF";

type Props = ScreenProps & {
  onBack: () => void;
};

export function ScreenWorkoutHistory({ state, setState, onBack }: Props) {
  const [previewSession, setPreviewSession] = useState<CompletedWorkoutSession | null>(null);
  const sessions = getWorkoutHistorySorted(state.workoutHistory);

  function deleteSession(session: CompletedWorkoutSession) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Delete "${session.title}" from ${formatWorkoutHistoryDate(session.dayKey, session.endedAtMs)}? This cannot be undone.`)
    ) {
      return;
    }
    setState((s) => {
      const workoutHistory = removeWorkoutFromHistory(s.workoutHistory, session.id);
      return {
        ...s,
        workoutHistory,
        workoutsCompletedByDay: workoutsCompletedByDayFromHistory(workoutHistory),
      };
    });
    if (previewSession?.id === session.id) setPreviewSession(null);
  }

  return (
    <div className="screen">
      <div className="between" style={{ alignItems: "center", marginBottom: 8, marginTop: 4 }}>
        <button
          type="button"
          className="tap"
          onClick={onBack}
          aria-label="Back to workout"
          style={{ color: ACCENT_BLUE, fontSize: 15, fontWeight: 600, padding: 8, marginLeft: -8 }}
        >
          ← Back
        </button>
      </div>

      <ScreenHeader
        eyebrow="TRAINING"
        title="Workout history"
      />

      <p style={{ margin: "4px 0 16px", fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
        {sessions.length > 0
          ? `${sessions.length} saved session${sessions.length === 1 ? "" : "s"}`
          : "Finish a workout with logged sets to see sessions here."}
      </p>

      {sessions.length === 0 ? (
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
            No workouts saved yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sessions.map((session) => (
            <div
              key={session.id}
              className="card"
              style={{
                padding: 0,
                overflow: "hidden",
                border: "0.5px solid var(--border)",
              }}
            >
              <div className="between" style={{ alignItems: "stretch", gap: 0 }}>
                <button
                  type="button"
                  className="tap"
                  onClick={() => setPreviewSession(session)}
                  style={{
                    flex: 1,
                    textAlign: "left",
                    padding: "12px 14px",
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    minWidth: 0,
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{session.title}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                    {formatWorkoutHistoryDate(session.dayKey, session.endedAtMs)}
                    {" · "}
                    {formatWorkoutDuration(session.durationSec)}
                  </div>
                </button>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderLeft: "0.5px solid var(--border)",
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    className="tap"
                    onClick={() => setPreviewSession(session)}
                    style={{
                      flex: 1,
                      padding: "0 16px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: ACCENT_BLUE,
                      background: "transparent",
                      border: "none",
                      borderBottom: "0.5px solid var(--border)",
                      minWidth: 56,
                    }}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="tap"
                    onClick={() => deleteSession(session)}
                    aria-label={`Delete ${session.title}`}
                    style={{
                      flex: 1,
                      padding: "0 14px",
                      background: "transparent",
                      border: "none",
                      color: "#FF6961",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 56,
                    }}
                  >
                    <IconTrash size={16} stroke={1.75} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 16 }} />

      {previewSession ? (
        <WorkoutSessionPreviewSheet
          session={previewSession}
          onClose={() => setPreviewSession(null)}
          onDelete={() => deleteSession(previewSession)}
        />
      ) : null}
    </div>
  );
}
