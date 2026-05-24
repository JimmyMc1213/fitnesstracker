import { IconClock } from "../icons";
import { RoutinePreviewSheet } from "../RoutinePreviewSheet";
import type { PreWorkoutCoachBrief } from "../preWorkoutCoachBrief";
import { ScreenHeader, PrimaryButton, SecondaryButton } from "../shared";
import type { AppState } from "../types";
import { defaultWorkoutRoutineTemplates } from "../data";
import { NEW_ROUTINE_EDITOR_ID } from "../screens/WorkoutRoutineEditor";
import { SECONDARY_ACTION_COLOR } from "../workoutUiTokens";

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
}) {
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

        <div className="between" style={{ marginTop: 28, marginBottom: 12, alignItems: "center" }}>
          <span className="label">Routines</span>
          <button
            type="button"
            className="tap"
            onClick={() => setEditingRoutineId(NEW_ROUTINE_EDITOR_ID)}
            style={{ fontSize: 13, fontWeight: 600, color: SECONDARY_ACTION_COLOR, padding: "6px 10px" }}
          >
            + New routine
          </button>
        </div>

        {state.workoutTemplates.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--text-muted-soft)", fontWeight: 500, lineHeight: 1.5 }}>
              No routines yet. Create one or restore the built-in 5-day split.
            </p>
            <PrimaryButton block onClick={() => setEditingRoutineId(NEW_ROUTINE_EDITOR_ID)} style={{ fontSize: 14, padding: 14 }}>
              New routine
            </PrimaryButton>
            <SecondaryButton
              block
              onClick={() => setState((s) => ({ ...s, workoutTemplates: defaultWorkoutRoutineTemplates() }))}
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
                      {tpl.dayLabel.trim() || "Routine"}
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
          onClick={() => {
            if (typeof window !== "undefined" && !window.confirm("Replace all routines with the default 5-day program? Your edits will be lost.")) return;
            setState((s) => ({ ...s, workoutTemplates: defaultWorkoutRoutineTemplates() }));
          }}
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
    </>
  );
}
