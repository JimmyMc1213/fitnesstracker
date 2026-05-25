import { Fragment, useState } from "react";

import { ExerciseNoteRow } from "../ExerciseNoteRow";
import { exerciseNoteKey } from "../exerciseNotes";
import { sanitizeCoachCopy } from "../exerciseSessionNotes";
import { IconCheck, IconChart, IconMinus, IconPlus } from "../icons";
import { ExerciseDragHandle, type ExerciseDragHandleProps } from "../SortableExerciseList";
import { formatSetWeight, weightUnitLabel } from "../unitPreferences";
import type { CompletedWorkoutSession, ExercisePersonalBest, WeightUnit, WorkoutExercise, WorkoutSetKind } from "../types";
import { RestTimerStrip, type RestTimerPhase } from "../RestTimerStrip";
import { formatRestDuration, restDurationForExercise } from "../restTimerPreferences";
import { previousSetLinesForExercise } from "../workoutPreviousSets";
import { normalizeExerciseKey } from "../workoutSummary";
import { setColumnLabel, setKindStyle } from "../workoutSetKind";
import { METADATA_SIZE, USER_NOTE_GRAY_MUTED, COACH_BLUE_MUTED, labelStyle } from "../workoutUiTokens";
import { ExerciseActionSheet } from "./ExerciseActionSheet";
import { SetKindPickerSheet } from "./SetKindPickerSheet";
import { WorkoutSetField } from "./WorkoutSetField";

const SET_GRID = "32px 68px 1fr 1fr 44px 32px";

type ActiveRestTimer = {
  exerciseId: string;
  exerciseName: string;
  exerciseLabel?: string;
  endsAtMs: number;
  durationSec: number;
  completed: boolean;
  afterSetIndex: number;
  paused?: boolean;
  pausedRemainingMs?: number;
};

function formatExercisePr(
  name: string,
  bests: Record<string, ExercisePersonalBest>,
  unit: WeightUnit,
): string | null {
  const best = bests[normalizeExerciseKey(name)];
  if (!best || (best.maxWeight <= 0 && best.maxReps <= 0)) return null;
  const w = formatSetWeight(best.maxWeight, unit);
  return `PR ${w}×${best.maxReps}`;
}

export function WorkoutExerciseCard({
  exercise,
  exerciseIndex,
  handle,
  isOverlay,
  isListDragging,
  weightUnit,
  workoutHistory,
  exerciseNote,
  sessionCoachNote,
  exercisePersonalBests,
  progressExpanded,
  restedRestSecByAfterSetIndex,
  restTimer,
  restTimerDefaultSeconds,
  restTimerSecondsByExerciseKey,
  onSwapExercise,
  onOpenRestSheet,
  onUpdateSetKind,
  onToggleSetDone,
  onRemoveSet,
  onAddSet,
  onPressNote,
  onToggleProgress,
  onRemoveExercise,
}: {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  handle: ExerciseDragHandleProps;
  isOverlay?: boolean;
  isListDragging: boolean;
  weightUnit: WeightUnit;
  workoutHistory: CompletedWorkoutSession[] | undefined;
  exerciseNote: string;
  sessionCoachNote?: string;
  exercisePersonalBests: Record<string, ExercisePersonalBest>;
  progressExpanded: boolean;
  restedRestSecByAfterSetIndex: Record<number, number>;
  restTimer: ActiveRestTimer | null;
  restTimerDefaultSeconds: number;
  restTimerSecondsByExerciseKey: Record<string, number>;
  onSwapExercise: (id: string) => void;
  onOpenRestSheet: (exerciseId: string) => void;
  onUpdateSetKind: (eid: string, idx: number, kind: WorkoutSetKind) => void;
  onToggleSetDone: (exercise: WorkoutExercise, idx: number) => void;
  onRemoveSet: (eid: string, idx: number) => void;
  onAddSet: (eid: string) => void;
  onPressNote: (name: string, label?: string) => void;
  onToggleProgress: (exerciseId: string) => void;
  onRemoveExercise: (exercise: WorkoutExercise) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [setKindPickerIndex, setSetKindPickerIndex] = useState<number | null>(null);

  const done = exercise.sets.filter((st) => st.done).length;
  const prLabel = formatExercisePr(exercise.name, exercisePersonalBests, weightUnit);
  const previousLines = previousSetLinesForExercise(
    workoutHistory,
    exercise.name,
    exercise.label,
    exercise.sets.length,
    weightUnit,
  );
  const restPresetSec = restDurationForExercise(
    exercise.name,
    exercise.label,
    restTimerDefaultSeconds,
    restTimerSecondsByExerciseKey,
    exerciseNoteKey,
  );
  const isActiveRest = restTimer?.exerciseId === exercise.id;
  const activeRestAfterSetIndex = isActiveRest ? restTimer!.afterSetIndex : null;

  function stripPhase(afterSetIndex: number): RestTimerPhase {
    if (isActiveRest && activeRestAfterSetIndex === afterSetIndex) {
      return restTimer!.completed ? "complete" : "running";
    }
    if (restedRestSecByAfterSetIndex[afterSetIndex] != null) return "rested";
    return "ready";
  }

  function stripDisplaySec(afterSetIndex: number): number {
    const restedSec = restedRestSecByAfterSetIndex[afterSetIndex];
    if (restedSec != null) return restedSec;
    return restPresetSec;
  }

  return (
    <div
      className="card"
      style={{
        padding: 16,
        pointerEvents: isOverlay ? "none" : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
        <ExerciseDragHandle handle={handle} disabled={isListDragging && !handle.isDragging} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: METADATA_SIZE, color: "var(--text-ghost)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
              {String(exerciseIndex + 1).padStart(2, "0")}
            </span>
            <span style={{ color: "var(--accent)" }}>{exercise.name}</span>
            {exercise.label ? (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "var(--coach-blue-label)",
                  background: "var(--coach-card-bg)",
                  border: "0.5px solid var(--coach-card-border)",
                  borderRadius: 6,
                  padding: "3px 8px",
                }}
              >
                {exercise.label}
              </span>
            ) : null}
          </div>
          <div style={{ fontSize: METADATA_SIZE, color: "var(--text-ghost)", marginTop: 4, fontWeight: 400, fontVariantNumeric: "tabular-nums" }}>
            Target {exercise.target} · {done}/{exercise.sets.length} sets
          </div>
          {sessionCoachNote ? (
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 12,
                fontWeight: 500,
                lineHeight: 1.45,
                color: COACH_BLUE_MUTED,
              }}
            >
              <span style={{ ...labelStyle, color: COACH_BLUE_MUTED, marginRight: 6 }}>Coach</span>
              {sanitizeCoachCopy(sessionCoachNote)}
            </p>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }} data-no-swipe>
          {prLabel ? (
            <button
              type="button"
              className="tap"
              aria-label={`Progress for ${exercise.name}`}
              disabled={isListDragging}
              onClick={() => onToggleProgress(exercise.id)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--workout-action-bg)",
                border: "0.5px solid var(--workout-action-border)",
                color: "var(--accent)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <IconChart size={16} stroke={1.75} />
            </button>
          ) : null}
          <button
            type="button"
            className="tap"
            aria-label={`Options for ${exercise.name}`}
            disabled={isListDragging}
            onClick={() => setShowActions(true)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--workout-action-bg)",
              border: "0.5px solid var(--workout-action-border)",
              color: "var(--accent)",
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            ···
          </button>
        </div>
      </div>

      <div data-no-swipe>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: SET_GRID,
            gap: 6,
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <div style={{ ...labelStyle, color: "var(--text-ghost)", textAlign: "center" }}>Set</div>
          <div style={{ ...labelStyle, color: "var(--text-ghost)", textAlign: "center" }}>Prev</div>
          <div style={{ ...labelStyle, color: "var(--text-ghost)", textAlign: "center" }}>{weightUnitLabel(weightUnit)}</div>
          <div style={{ ...labelStyle, color: "var(--text-ghost)", textAlign: "center" }}>Reps</div>
          <div />
          <div />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {exercise.sets.map((st, si) => {
            const kind = st.kind ?? "working";
            const kindVisual = setKindStyle(kind === "working" ? undefined : kind);
            return (
              <Fragment key={si}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: SET_GRID,
                    gap: 6,
                    alignItems: "center",
                    background: st.done ? "var(--workout-done-row-bg)" : "transparent",
                    borderRadius: 8,
                    padding: "4px 4px",
                  }}
                >
                  <button
                    type="button"
                    className="tap"
                    onClick={() => setSetKindPickerIndex(si)}
                    aria-label={`Set ${si + 1} type`}
                    style={{
                      width: 28,
                      height: 28,
                      margin: "0 auto",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                      display: "grid",
                      placeItems: "center",
                      ...(kind === "working"
                        ? {
                            background: "var(--surface-2)",
                            color: "var(--text-muted-soft)",
                            border: "0.5px solid var(--border)",
                          }
                        : kindVisual),
                    }}
                  >
                    {setColumnLabel(exercise.sets, si)}
                  </button>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--text-ghost)",
                      textAlign: "center",
                      lineHeight: 1.25,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {previousLines[si]}
                  </div>
                  <WorkoutSetField
                    exerciseId={exercise.id}
                    setIndex={si}
                    field="weight"
                    weight={st.w}
                    reps={st.r}
                    weightUnit={weightUnit}
                  />
                  <WorkoutSetField
                    exerciseId={exercise.id}
                    setIndex={si}
                    field="reps"
                    weight={st.w}
                    reps={st.r}
                    weightUnit={weightUnit}
                  />
                  <button
                    type="button"
                    className="tap"
                    onClick={() => onToggleSetDone(exercise, si)}
                    aria-label="Done"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 999,
                      background: st.done ? "var(--primary)" : "transparent",
                      border: st.done ? "0.5px solid var(--primary)" : "0.5px solid var(--border)",
                      color: st.done ? "var(--primary-fg)" : "var(--text-ghost)",
                      display: "grid",
                      placeItems: "center",
                      margin: "0 auto",
                    }}
                  >
                    <IconCheck size={16} stroke={2.4} />
                  </button>
                  <button
                    type="button"
                    className="tap"
                    onClick={() => onRemoveSet(exercise.id, si)}
                    aria-label="Remove set"
                    style={{ width: 32, height: 36, color: "var(--text-whisper)", display: "grid", placeItems: "center" }}
                  >
                    <IconMinus size={14} />
                  </button>
                </div>
                <RestTimerStrip
                  phase={stripPhase(si)}
                  durationSec={isActiveRest && activeRestAfterSetIndex === si ? restTimer!.durationSec : restPresetSec}
                  endsAtMs={isActiveRest && activeRestAfterSetIndex === si && !restTimer!.completed ? restTimer!.endsAtMs : undefined}
                  paused={isActiveRest && activeRestAfterSetIndex === si ? restTimer!.paused : false}
                  pausedRemainingMs={isActiveRest && activeRestAfterSetIndex === si ? restTimer!.pausedRemainingMs : undefined}
                  displayPresetSec={stripDisplaySec(si)}
                  onPress={() => onOpenRestSheet(exercise.id)}
                />
              </Fragment>
            );
          })}
        </div>

        <button
          type="button"
          className="tap"
          onClick={() => onAddSet(exercise.id)}
          style={{
            marginTop: 10,
            width: "100%",
            border: "0.5px dashed var(--divider-subtle)",
            borderRadius: 8,
            padding: "10px",
            color: "var(--text-muted-soft)",
            fontSize: 12,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <IconPlus size={14} stroke={2} /> Add set · {formatRestDuration(restPresetSec)}
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 10,
            paddingTop: 8,
            borderTop: "0.5px solid var(--divider-subtle)",
          }}
        >
          <ExerciseNoteRow
            note={exerciseNote}
            onPress={() => onPressNote(exercise.name, exercise.label)}
            style={{ flex: 1, minWidth: 0 }}
          />
          {progressExpanded && prLabel ? (
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: USER_NOTE_GRAY_MUTED, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
              {prLabel}
            </p>
          ) : null}
        </div>
      </div>

      {showActions ? (
        <ExerciseActionSheet
          exerciseName={exercise.name}
          onEditNote={() => onPressNote(exercise.name, exercise.label)}
          onEditRest={() => onOpenRestSheet(exercise.id)}
          onReplace={() => onSwapExercise(exercise.id)}
          onRemove={() => onRemoveExercise(exercise)}
          onClose={() => setShowActions(false)}
        />
      ) : null}

      {setKindPickerIndex != null ? (
        <SetKindPickerSheet
          selected={exercise.sets[setKindPickerIndex]?.kind ?? "working"}
          onSelect={(kind) => onUpdateSetKind(exercise.id, setKindPickerIndex, kind)}
          onClose={() => setSetKindPickerIndex(null)}
        />
      ) : null}
    </div>
  );
}
