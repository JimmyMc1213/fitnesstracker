import { useState } from "react";

import { IconClock } from "../icons";
import { DeleteConfirmSheet } from "../DeleteConfirmSheet";
import { RoutinePreviewSheet } from "../RoutinePreviewSheet";
import type { PreWorkoutCoachBrief } from "../preWorkoutCoachBrief";
import { ScreenHeader, PrimaryButton, SecondaryButton } from "../shared";
import type { AppState } from "../types";
import { defaultWorkoutRoutineTemplates } from "../data";
import { NEW_ROUTINE_EDITOR_ID } from "../screens/WorkoutRoutineEditor";

function HistoryHeaderButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="tap"
      onClick={onClick}
      aria-label="Workout history"
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        border: "0.5px solid var(--border)",
        background: "var(--surface-3)",
        color: "var(--text-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <IconClock size={20} stroke={1.75} />
    </button>
  );
}

export function WorkoutIdleDashboard({
  state,
  preWorkoutCoach,
  previewRoutineId,
  setPreviewRoutineId,
  setEditingRoutineId,
  startEmptyWorkout,
  startTemplateWorkout,
  setState,
  onShowHistory,
  onCreateWeeklyRoutine,
}: {
  state: AppState;
  preWorkoutCoach: { brief: PreWorkoutCoachBrief; todayTemplateId: string } | null;
  previewRoutineId: string | null;
  setPreviewRoutineId: (id: string | null) => void;
  setEditingRoutineId: (id: string | null) => void;
  startEmptyWorkout: () => void;
  startTemplateWorkout: (templateId: string) => void;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onShowHistory: () => void;
  onCreateWeeklyRoutine: () => void;
}) {
  const [pendingRestoreDefaults, setPendingRestoreDefaults] = useState(false);
  const previewTpl = previewRoutineId ? state.workoutTemplates.find((t) => t.id === previewRoutineId) : null;
  const idleCoachSubtitle = preWorkoutCoach?.brief.headline;
  const previewCoachBrief =
    previewTpl && preWorkoutCoach && previewTpl.id === preWorkoutCoach.todayTemplateId
      ? preWorkoutCoach.brief
      : undefined;

  return (
    <>
      <div key="workout-idle" className="screen page-transition">
        <ScreenHeader
          eyebrow="TRAINING"
          title="Start Workout"
          subtitle={idleCoachSubtitle}
          right={<HistoryHeaderButton onClick={onShowHistory} />}
        />

        <PrimaryButton block onClick={startEmptyWorkout} style={{ marginTop: 20 }}>
          Start an empty workout
        </PrimaryButton>

        <div className="between" style={{ marginTop: 28, marginBottom: 12, alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
              }}
            >
              Workouts
            </span>
            {state.workoutTemplates.length > 0 ? (
              <button
                type="button"
                className="tap"
                onClick={() => setEditingRoutineId(NEW_ROUTINE_EDITOR_ID)}
                style={{
                  alignSelf: "flex-start",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-ghost)",
                  padding: 0,
                }}
              >
                + Add day
              </button>
            ) : null}
          </div>
          {state.workoutTemplates.length > 0 ? (
            <button
              type="button"
              className="tap"
              onClick={onCreateWeeklyRoutine}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#6EB7FF",
                padding: "6px 0 6px 10px",
                flexShrink: 0,
              }}
            >
              + New weekly routine
            </button>
          ) : null}
        </div>

        {state.workoutTemplates.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--text-muted-soft)", fontWeight: 500, lineHeight: 1.5 }}>
              No workouts yet. Create a weekly routine or restore the built-in 5-day split.
            </p>
            <PrimaryButton block onClick={onCreateWeeklyRoutine} style={{ fontSize: 14, padding: 14 }}>
              New weekly routine
            </PrimaryButton>
            <SecondaryButton
              block
              onClick={() => setEditingRoutineId(NEW_ROUTINE_EDITOR_ID)}
              style={{ marginTop: 12 }}
            >
              Add a single workout day
            </SecondaryButton>
            <SecondaryButton
              block
              onClick={() => setPendingRestoreDefaults(true)}
              style={{ marginTop: 12 }}
            >
              Restore default program
            </SecondaryButton>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {state.workoutTemplates.map((tpl) => {
              const preview = tpl.exercises.slice(0, 4).map((e) => e.name);
              const more = tpl.exercises.length - preview.length;
              return (
                <div
                  key={tpl.id}
                  style={{
                    display: "flex",
                    borderRadius: 14,
                    overflow: "hidden",
                    border: "0.5px solid var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <button
                    type="button"
                    className="tap"
                    onClick={() => setPreviewRoutineId(tpl.id)}
                    style={{
                      flex: 1,
                      textAlign: "left",
                      padding: 16,
                      color: "var(--text-primary)",
                      border: "none",
                      background: "transparent",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-faint-soft)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      {tpl.dayLabel.trim() || "Workout"}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>{tpl.name}</div>
                    {tpl.focus.trim() ? (
                      <div style={{ fontSize: 12, color: "var(--text-muted-soft)", marginBottom: 10, lineHeight: 1.4 }}>{tpl.focus}</div>
                    ) : null}
                    <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                      {preview.map((name, i) => (
                        <li key={`${tpl.id}-p${i}`} style={{ fontSize: 13, color: "var(--text-soft)", fontWeight: 500 }}>
                          {name}
                        </li>
                      ))}
                    </ul>
                    {more > 0 ? (
                      <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-ghost)", fontWeight: 500 }}>+{more} more</div>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    className="tap"
                    onClick={() => setEditingRoutineId(tpl.id)}
                    style={{
                      padding: "16px 14px",
                      border: "none",
                      borderLeft: "0.5px solid var(--border)",
                      background: "var(--surface-1)",
                      color: "#6EB7FF",
                      fontSize: 13,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    Edit
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          className="tap"
          onClick={() => setPendingRestoreDefaults(true)}
          style={{
            marginTop: 16,
            width: "100%",
            color: "var(--text-ghost)",
            fontSize: 12,
            fontWeight: 500,
            padding: 10,
          }}
        >
          Restore default 5-day program
        </button>

        <div style={{ height: 12 }} />
      </div>
      {previewTpl ? (
        <RoutinePreviewSheet
          template={previewTpl}
          coachBrief={previewCoachBrief}
          onClose={() => setPreviewRoutineId(null)}
          onEdit={() => {
            setPreviewRoutineId(null);
            setEditingRoutineId(previewTpl.id);
          }}
          onStart={() => {
            startTemplateWorkout(previewTpl.id);
            setPreviewRoutineId(null);
          }}
        />
      ) : null}

      {pendingRestoreDefaults ? (
        <DeleteConfirmSheet
          title="Restore default program?"
          cancelLabel="Keep my workouts"
          confirmLabel="Restore defaults"
          placement="center"
          message="Replace all workouts with the built-in 5-day program? Your custom workouts and edits will be lost."
          onCancel={() => setPendingRestoreDefaults(false)}
          onConfirm={() => {
            setState((s) => ({ ...s, workoutTemplates: defaultWorkoutRoutineTemplates() }));
            setPendingRestoreDefaults(false);
          }}
        />
      ) : null}
    </>
  );
}
