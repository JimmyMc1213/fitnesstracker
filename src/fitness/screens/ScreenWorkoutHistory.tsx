import { useState } from "react";

import { DeleteConfirmSheet } from "../DeleteConfirmSheet";
import { ScreenHeader } from "../shared";
import { WorkoutSessionPreviewSheet } from "../WorkoutSessionPreviewSheet";
import { WorkoutHistorySessionCard } from "../workout/WorkoutHistorySessionCard";
import {
  formatWorkoutHistoryDate,
  getWorkoutHistorySorted,
  removeWorkoutFromHistory,
  workoutsCompletedByDayFromHistory,
} from "../workoutHistory";
import { groupSessionsByMonth, monthGroupLabel } from "../workoutHistorySessionStats";
import type { CompletedWorkoutSession, ScreenProps } from "../types";

const ACCENT_BLUE = "var(--accent)";

type Props = ScreenProps & {
  onBack: () => void;
};

export function ScreenWorkoutHistory({ state, setState, onBack }: Props) {
  const [previewSession, setPreviewSession] = useState<CompletedWorkoutSession | null>(null);
  const [pendingDeleteSession, setPendingDeleteSession] = useState<CompletedWorkoutSession | null>(null);
  const sessions = getWorkoutHistorySorted(state.workoutHistory);
  const grouped = groupSessionsByMonth(sessions);
  const wUnit = state.unitPreferences.weightUnit;

  function requestDeleteSession(session: CompletedWorkoutSession) {
    setPendingDeleteSession(session);
  }

  function confirmDeleteSession() {
    if (!pendingDeleteSession) return;
    const session = pendingDeleteSession;
    setState((s) => {
      const workoutHistory = removeWorkoutFromHistory(s.workoutHistory, session.id);
      return {
        ...s,
        workoutHistory,
        workoutsCompletedByDay: workoutsCompletedByDayFromHistory(workoutHistory),
      };
    });
    if (previewSession?.id === session.id) setPreviewSession(null);
    setPendingDeleteSession(null);
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

      <ScreenHeader eyebrow="TRAINING" title="Workout history" />

      <p style={{ margin: "4px 0 16px", fontSize: 13, color: "var(--text-faint-soft)", fontWeight: 500 }}>
        {sessions.length > 0
          ? `${sessions.length} saved session${sessions.length === 1 ? "" : "s"}`
          : "Finish a workout with logged sets to see sessions here."}
      </p>

      {sessions.length === 0 ? (
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-ghost)", lineHeight: 1.5 }}>
            No workouts saved yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {grouped.map(({ monthKey, sessions: monthSessions }) => (
            <section key={monthKey}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "var(--text-ghost)",
                  marginBottom: 10,
                }}
              >
                {monthGroupLabel(monthKey)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {monthSessions.map((session) => (
                  <WorkoutHistorySessionCard
                    key={session.id}
                    session={session}
                    workoutHistory={state.workoutHistory}
                    weightUnit={wUnit}
                    onOpen={() => setPreviewSession(session)}
                    onDelete={() => requestDeleteSession(session)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div style={{ height: 16 }} />

      {previewSession ? (
        <WorkoutSessionPreviewSheet
          session={previewSession}
          onClose={() => setPreviewSession(null)}
          onDelete={() => requestDeleteSession(previewSession)}
        />
      ) : null}

      {pendingDeleteSession ? (
        <DeleteConfirmSheet
          title="Delete workout?"
          cancelLabel="Keep workout"
          confirmLabel="Delete workout"
          message={
            <>
              Delete <strong style={{ color: "var(--text-primary)" }}>{pendingDeleteSession.title}</strong> from{" "}
              {formatWorkoutHistoryDate(pendingDeleteSession.dayKey, pendingDeleteSession.endedAtMs)}? This can&apos;t be
              undone.
            </>
          }
          onCancel={() => setPendingDeleteSession(null)}
          onConfirm={confirmDeleteSession}
        />
      ) : null}
    </div>
  );
}
