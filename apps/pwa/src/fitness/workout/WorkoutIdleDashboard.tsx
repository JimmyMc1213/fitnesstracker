import { useState } from "react";

import { DeleteConfirmSheet } from "../DeleteConfirmSheet";
import { IconClock, IconMoreVertical, IconPlus } from "../icons";
import { RoutinePreviewSheet } from "../RoutinePreviewSheet";
import { buildRoutinePreviewCoachBrief, type PreWorkoutCoachBrief } from "../preWorkoutCoachBrief";
import { routineTemplateContentKey } from "../routineTemplateFocus";
import { ScreenHeader, PrimaryButton, SecondaryButton } from "../shared";
import type { AppState } from "../types";
import { NEW_ROUTINE_EDITOR_ID } from "../screens/WorkoutRoutineEditor";
import { RenameRoutineSheet } from "./RenameRoutineSheet";
import { WorkoutRoutineActionSheet } from "./WorkoutRoutineActionSheet";
import { COACH_BLUE_LABEL, COACH_CARD_BG, COACH_CARD_BORDER } from "../workoutUiTokens";

function WorkoutHeaderActions({
  onBrowseTemplates,
  onShowHistory,
}: {
  onBrowseTemplates: () => void;
  onShowHistory: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
      <button
        type="button"
        className="tap"
        onClick={onBrowseTemplates}
        style={{
          height: 40,
          padding: "0 14px",
          borderRadius: 10,
          border: "0.5px solid var(--border)",
          background: "var(--surface-3)",
          color: "#6EB7FF",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          flexShrink: 0,
        }}
      >
        Templates
      </button>
      <HistoryHeaderButton onClick={onShowHistory} />
    </div>
  );
}

function HistoryHeaderButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="tap"
      onClick={onClick}
      aria-label="Workout history"
      style={{
        width: 48,
        height: 48,
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
      <IconClock size={24} stroke={1.75} />
    </button>
  );
}

export function WorkoutIdleDashboard({
  state,
  preWorkoutCoach,
  previewRoutineId,
  setPreviewRoutineId,
  onEditRoutine,
  onDuplicateRoutine,
  onRenameRoutine,
  onDeleteRoutine,
  startEmptyWorkout,
  startTemplateWorkout,
  onShowHistory,
  onCreateWeeklyRoutine,
  onBrowseTemplates,
}: {
  state: AppState;
  preWorkoutCoach: { brief: PreWorkoutCoachBrief; todayTemplateId: string } | null;
  previewRoutineId: string | null;
  setPreviewRoutineId: (id: string | null) => void;
  onEditRoutine: (templateId: string) => void;
  onDuplicateRoutine: (templateId: string) => void;
  onRenameRoutine: (templateId: string, name: string) => void;
  onDeleteRoutine: (templateId: string) => void;
  startEmptyWorkout: () => void;
  startTemplateWorkout: (templateId: string) => void;
  onShowHistory: () => void;
  onCreateWeeklyRoutine: () => void;
  onBrowseTemplates: () => void;
}) {
  const [menuRoutineId, setMenuRoutineId] = useState<string | null>(null);
  const [renameRoutineId, setRenameRoutineId] = useState<string | null>(null);
  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null);

  const previewTpl = previewRoutineId ? state.workoutTemplates.find((t) => t.id === previewRoutineId) : null;
  const menuTpl = menuRoutineId ? state.workoutTemplates.find((t) => t.id === menuRoutineId) : null;
  const renameTpl = renameRoutineId ? state.workoutTemplates.find((t) => t.id === renameRoutineId) : null;
  const deleteTpl = deleteRoutineId ? state.workoutTemplates.find((t) => t.id === deleteRoutineId) : null;

  const idleCoachSubtitle = preWorkoutCoach?.brief.headline;
  const todayTemplateId = preWorkoutCoach?.todayTemplateId ?? null;
  const previewCoachBrief: PreWorkoutCoachBrief | undefined = previewTpl
    ? buildRoutinePreviewCoachBrief(previewTpl, {
        isTodayWorkout: previewTpl.id === todayTemplateId,
        todayHeadline: preWorkoutCoach?.brief.headline,
      })
    : undefined;

  function openRoutineMenu(templateId: string) {
    setMenuRoutineId(templateId);
  }

  function confirmDeleteRoutine() {
    if (!deleteRoutineId) return;
    onDeleteRoutine(deleteRoutineId);
    setDeleteRoutineId(null);
  }

  return (
    <>
      <div key="workout-idle" className="screen page-transition">
        <ScreenHeader
          eyebrow="TRAINING"
          title="Start Workout"
          subtitle={idleCoachSubtitle}
          right={<WorkoutHeaderActions onBrowseTemplates={onBrowseTemplates} onShowHistory={onShowHistory} />}
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
                onClick={() => onEditRoutine(NEW_ROUTINE_EDITOR_ID)}
                style={{
                  alignSelf: "flex-start",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-ghost)",
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <IconPlus size={13} stroke={2.5} />
                Add day
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
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <IconPlus size={13} stroke={2.5} />
              New weekly routine
            </button>
          ) : null}
        </div>

        {state.workoutTemplates.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--text-muted-soft)", fontWeight: 500, lineHeight: 1.5 }}>
              No workouts yet. Create a weekly routine to get started.
            </p>
            <PrimaryButton block onClick={onCreateWeeklyRoutine} style={{ fontSize: 14, padding: 14 }}>
              New weekly routine
            </PrimaryButton>
            <SecondaryButton
              block
              onClick={() => onEditRoutine(NEW_ROUTINE_EDITOR_ID)}
              style={{ marginTop: 12 }}
            >
              Add a single workout day
            </SecondaryButton>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {state.workoutTemplates.map((tpl) => {
              const preview = tpl.exercises.slice(0, 4).map((e) => e.name);
              const more = tpl.exercises.length - preview.length;
              const isTodayWorkout = tpl.id === todayTemplateId;
              return (
                <div
                  key={tpl.id}
                  style={{
                    display: "flex",
                    borderRadius: 14,
                    overflow: "hidden",
                    border: isTodayWorkout ? `1px solid ${COACH_CARD_BORDER}` : "0.5px solid var(--border)",
                    background: isTodayWorkout ? COACH_CARD_BG : "var(--surface-2)",
                    boxShadow: isTodayWorkout
                      ? "0 0 0 1px rgba(10,132,255,0.2), 0 0 18px rgba(10,132,255,0.35), 0 0 36px rgba(10,132,255,0.12)"
                      : undefined,
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
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-faint-soft)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {tpl.dayLabel.trim() || "Workout"}
                      </div>
                      {isTodayWorkout ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: COACH_BLUE_LABEL,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                          }}
                        >
                          Today
                        </span>
                      ) : null}
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
                    aria-label={`Options for ${tpl.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openRoutineMenu(tpl.id);
                    }}
                    style={{
                      padding: "16px 14px",
                      border: "none",
                      borderLeft: isTodayWorkout ? `0.5px solid ${COACH_CARD_BORDER}` : "0.5px solid var(--border)",
                      background: isTodayWorkout ? "rgba(10,132,255,0.06)" : "var(--surface-1)",
                      color: "var(--text-muted-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconMoreVertical size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ height: 12 }} />
      </div>
      {previewTpl ? (
        <RoutinePreviewSheet
          key={routineTemplateContentKey(previewTpl)}
          template={previewTpl}
          coachBrief={previewCoachBrief}
          onClose={() => setPreviewRoutineId(null)}
          onOpenMenu={() => openRoutineMenu(previewTpl.id)}
          onStart={() => {
            startTemplateWorkout(previewTpl.id);
            setPreviewRoutineId(null);
          }}
        />
      ) : null}
      {menuTpl ? (
        <WorkoutRoutineActionSheet
          template={menuTpl}
          onClose={() => setMenuRoutineId(null)}
          onEdit={() => {
            setPreviewRoutineId(null);
            onEditRoutine(menuTpl.id);
          }}
          onRename={() => setRenameRoutineId(menuTpl.id)}
          onDuplicate={() => onDuplicateRoutine(menuTpl.id)}
          onDelete={() => setDeleteRoutineId(menuTpl.id)}
        />
      ) : null}
      {renameTpl ? (
        <RenameRoutineSheet
          template={renameTpl}
          onClose={() => setRenameRoutineId(null)}
          onSave={(name) => {
            onRenameRoutine(renameTpl.id, name);
            setRenameRoutineId(null);
          }}
        />
      ) : null}
      {deleteTpl ? (
        <DeleteConfirmSheet
          title="Delete workout?"
          cancelLabel="Keep workout"
          confirmLabel="Delete workout"
          zIndex={1400}
          message={
            <>
              Delete <strong style={{ color: "var(--text-primary)" }}>{deleteTpl.name.trim() || "this workout"}</strong>?
              This can&apos;t be undone.
            </>
          }
          onCancel={() => setDeleteRoutineId(null)}
          onConfirm={confirmDeleteRoutine}
        />
      ) : null}
    </>
  );
}
