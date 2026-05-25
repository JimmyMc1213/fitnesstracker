import { Fragment } from "react";

import { ExerciseNoteRow } from "../ExerciseNoteRow";
import { exerciseNoteKey } from "../exerciseNotes";
import { sanitizeCoachCopy } from "../exerciseSessionNotes";
import { IconCheck, IconMinus, IconPlus } from "../icons";
import { ExerciseDragHandle, type ExerciseDragHandleProps } from "../SortableExerciseList";
import { formatSetWeight, parseSetWeightInput, weightUnitLabel } from "../unitPreferences";
import type { ExercisePersonalBest, WeightUnit, WorkoutExercise } from "../types";
import { RestTimerStrip, type RestTimerPhase } from "../RestTimerStrip";
import { formatRestDuration, restDurationForExercise } from "../restTimerPreferences";
import { normalizeExerciseKey } from "../workoutSummary";
import { METADATA_SIZE, SECONDARY_ACTION_COLOR, USER_NOTE_GRAY_MUTED, COACH_BLUE_MUTED, labelStyle, workoutSetInputStyle } from "../workoutUiTokens";

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
  onUpdateSet,
  onToggleSetDone,
  onRemoveSet,
  onAddSet,
  onPressNote,
  onToggleProgress,
}: {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  handle: ExerciseDragHandleProps;
  isOverlay?: boolean;
  isListDragging: boolean;
  weightUnit: WeightUnit;
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
  onUpdateSet: (eid: string, idx: number, patch: Partial<{ w: number; r: number; done: boolean }>) => void;
  onToggleSetDone: (exercise: WorkoutExercise, idx: number) => void;
  onRemoveSet: (eid: string, idx: number) => void;
  onAddSet: (eid: string) => void;
  onPressNote: (name: string, label?: string) => void;
  onToggleProgress: (exerciseId: string) => void;
}) {
  const done = exercise.sets.filter((st) => st.done).length;
  const prLabel = formatExercisePr(exercise.name, exercisePersonalBests, weightUnit);
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
            {exercise.name}
            {exercise.label ? (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "rgba(10,132,255,0.95)",
                  background: "rgba(10,132,255,0.15)",
                  border: "0.5px solid rgba(10,132,255,0.35)",
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
        <button
          type="button"
          className="tap"
          data-no-swipe
          aria-label={`Swap ${exercise.name}`}
          disabled={isListDragging}
          onClick={() => onSwapExercise(exercise.id)}
          style={{
            flexShrink: 0,
            fontSize: 12,
            fontWeight: 600,
            color: SECONDARY_ACTION_COLOR,
            background: "none",
            border: "none",
            padding: "4px 0",
          }}
        >
          Swap
        </button>
      </div>

      <div data-no-swipe>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "32px 1fr 1fr 44px 32px",
          gap: 6,
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <div style={{ ...labelStyle, color: "var(--text-ghost)", textAlign: "center" }}>Set</div>
        <div style={{ ...labelStyle, color: "var(--text-ghost)", textAlign: "center" }}>{weightUnitLabel(weightUnit)}</div>
        <div style={{ ...labelStyle, color: "var(--text-ghost)", textAlign: "center" }}>Reps</div>
        <div />
        <div />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {exercise.sets.map((st, si) => (
          <Fragment key={si}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr 1fr 44px 32px",
                gap: 6,
                alignItems: "center",
                background: st.done ? "var(--surface-1)" : "transparent",
                borderRadius: 8,
                padding: "4px 4px",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted-soft)", textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
                {si + 1}
              </div>
              <input
                type="number"
                value={st.w ? formatSetWeight(st.w, weightUnit) : ""}
                onChange={(ev) => onUpdateSet(exercise.id, si, { w: parseSetWeightInput(ev.target.value, weightUnit) })}
                placeholder="-"
                style={workoutSetInputStyle}
              />
              <input
                type="number"
                value={st.r || ""}
                onChange={(ev) => onUpdateSet(exercise.id, si, { r: +ev.target.value || 0 })}
                placeholder="-"
                style={workoutSetInputStyle}
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
              <button type="button" className="tap" onClick={() => onRemoveSet(exercise.id, si)} aria-label="Remove" style={{ width: 32, height: 36, color: "var(--text-whisper)", display: "grid", placeItems: "center" }}>
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
        ))}
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
        {prLabel ? (
          <button
            type="button"
            className="tap"
            aria-expanded={progressExpanded}
            onClick={() => onToggleProgress(exercise.id)}
            style={{
              padding: "4px 0",
              border: "none",
              background: "transparent",
              fontSize: 12,
              fontWeight: 500,
              color: SECONDARY_ACTION_COLOR,
              flexShrink: 0,
            }}
          >
            Progress
          </button>
        ) : null}
      </div>
      {progressExpanded && prLabel ? (
        <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 600, color: USER_NOTE_GRAY_MUTED, fontVariantNumeric: "tabular-nums" }}>
          {prLabel} · {weightUnitLabel(weightUnit)}
        </p>
      ) : null}
      </div>
    </div>
  );
}
