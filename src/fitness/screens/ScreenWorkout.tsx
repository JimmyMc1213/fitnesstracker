import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { buildPreWorkoutCoachBrief, shouldDefaultExpandCoachCard } from "../preWorkoutCoachBrief";
import { localDateKey } from "../dailyPlan";
import { EXERCISE_DB, SPLIT, cloneExercisesForNewSession, defaultWorkoutRoutineTemplates } from "../data";
import { ExerciseNotesEditSheet } from "../ExerciseNotesEditSheet";
import { exerciseNoteKey, getExerciseNote, withExerciseNote } from "../exerciseNotes";
import { progressiveOverloadInsight } from "../coach";
import { finishWorkout } from "../finishWorkout";
import { IconClock, IconPlus, IconSearch } from "../icons";
import { ScreenWorkoutHistory } from "./ScreenWorkoutHistory";
import { FullScreenOverlay } from "../motion";
import { SortableExerciseList } from "../SortableExerciseList";
import { ScreenHeader, PrimaryButton, SecondaryButton } from "../shared";
import type { ScreenProps, WorkoutExercise } from "../types";
import { autofillExerciseSets, buildSetsForExercise } from "../workoutAutofill";
import {
  buildSessionCoachNoteForExercise,
  buildSessionCoachNotesByExerciseId,
} from "../exerciseSessionNotes";
import { WorkoutCoachCard } from "../WorkoutCoachCard";
import { WorkoutSessionStickyHeader } from "../WorkoutSessionStickyHeader";
import { SECONDARY_ACTION_COLOR } from "../workoutUiTokens";
import { RoutinePreviewSheet } from "../RoutinePreviewSheet";
import {
  nextRestTimerPreset,
  restDurationForExercise,
} from "../restTimerPreferences";
import { ExerciseSwapSheet } from "../ExerciseSwapSheet";
import { isTrainingDay } from "../trainingCalendar";
import { NEW_ROUTINE_EDITOR_ID, WorkoutRoutineEditor } from "./WorkoutRoutineEditor";
import { EmptyFinishConfirmSheet } from "../workout/EmptyFinishConfirmSheet";
import { WorkoutExerciseCard } from "../workout/WorkoutExerciseCard";
import { WorkoutSessionHeader } from "../workout/WorkoutSessionHeader";

function formatSessionClock(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

type ActiveRestTimer = {
  exerciseId: string;
  exerciseName: string;
  exerciseLabel?: string;
  endsAtMs: number;
  durationSec: number;
  completed: boolean;
};

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
        background: "rgba(255,255,255,0.06)",
        color: "#fff",
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

const MOBILITY_ITEMS = [
  "90/90 hips or World's greatest stretch, 45-60s each side",
  "Thoracic extension over bench or foam roller, 8-10 slow reps",
  "Shoulder circles + band dislocates (light), easy range, no forcing",
  "Ankles/calves: knee-to-wall or calf rocks if squatting today",
];

const WARMUP_ITEMS = [
  "5-8 min easy cardio (bike, walk incline, or row) until you break a light sweat",
  "Band pull-aparts or face pulls, 2-3 sets × 15-20, shoulders back & down",
  "2-4 ramp sets on your first main lift, empty bar → light → working weight",
];

export function ScreenWorkout({ state, setState }: ScreenProps) {
  const [showExSearch, setShowExSearch] = useState(false);
  const [exQuery, setExQuery] = useState("");
  const [draftExName, setDraftExName] = useState("");
  const [draftExLabel, setDraftExLabel] = useState("");
  const [sessionEditMode, setSessionEditMode] = useState(false);
  const [expandedProgressId, setExpandedProgressId] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [previewRoutineId, setPreviewRoutineId] = useState<string | null>(null);
  const [notesEdit, setNotesEdit] = useState<{ name: string; label?: string } | null>(null);
  const [showEmptyFinishConfirm, setShowEmptyFinishConfirm] = useState(false);
  const [showHistoryPage, setShowHistoryPage] = useState(false);
  const [restTimer, setRestTimer] = useState<ActiveRestTimer | null>(null);
  const [swapExerciseId, setSwapExerciseId] = useState<string | null>(null);
  const w = state.workout;
  const wUnit = state.unitPreferences.weightUnit;
  const activeRoutine = state.workoutTemplates.find((t) => t.id === w.splitId);
  const split = activeRoutine ? { day: activeRoutine.dayLabel, name: activeRoutine.name } : SPLIT.find((s) => s.id === w.splitId);
  const phase = w.sessionPhase;
  const todayTemplateId = useMemo(
    () => buildPreWorkoutCoachBrief(state)?.todayTemplateId ?? null,
    [state.workoutTemplates, state.onboardingProfile?.workoutDaysPerWeek],
  );
  const preWorkoutCoach = useMemo(
    () => buildPreWorkoutCoachBrief(state),
    [
      state.workoutTemplates,
      state.onboardingProfile,
      state.nutritionManualByDay,
      state.nutritionItemsByDay,
      state.nutritionTargets,
      state.workoutsCompletedByDay,
      state.weightLog,
      state.planStartIso,
    ],
  );

  useEffect(() => {
    if (phase !== "idle" || editingRoutineId === null) return;
    if (editingRoutineId === NEW_ROUTINE_EDITOR_ID) return;
    if (!state.workoutTemplates.some((t) => t.id === editingRoutineId)) {
      setEditingRoutineId(null);
    }
  }, [phase, editingRoutineId, state.workoutTemplates]);

  useEffect(() => {
    if (phase !== "idle" || previewRoutineId === null) return;
    if (!state.workoutTemplates.some((t) => t.id === previewRoutineId)) {
      setPreviewRoutineId(null);
    }
  }, [phase, previewRoutineId, state.workoutTemplates]);

  useEffect(() => {
    if (phase !== "lifting" || w.sessionStartedAtMs == null) return;
    const id = window.setInterval(() => setTick((x) => x + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase, w.sessionStartedAtMs]);

  useEffect(() => {
    if (!restTimer || restTimer.completed) return;
    if (Date.now() >= restTimer.endsAtMs) {
      setRestTimer((current) => (current && !current.completed ? { ...current, completed: true } : current));
    }
  }, [restTimer, restTimer?.endsAtMs, restTimer?.completed]);

  const restTimerRemainingSec =
    restTimer == null
      ? 0
      : restTimer.completed
        ? 0
        : Math.max(0, Math.ceil((restTimer.endsAtMs - Date.now()) / 1000));

  const elapsedSec =
    phase === "lifting" && w.sessionStartedAtMs != null
      ? Math.max(0, Math.floor((Date.now() - w.sessionStartedAtMs) / 1000))
      : 0;

  const totalSets = w.exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = w.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const totalVolume = w.exercises.reduce(
    (a, e) => a + e.sets.filter((s) => s.done).reduce((b, st) => b + st.w * st.r, 0),
    0,
  );

  const daysPerWeek = state.onboardingProfile?.workoutDaysPerWeek ?? 5;
  const isTrainingDayToday = isTrainingDay(new Date(), state.workoutTemplates, daysPerWeek);

  function updateSet(eid: string, idx: number, patch: Partial<{ w: number; r: number; done: boolean }>) {
    setState((s) => ({
      ...s,
      workout: {
        ...s.workout,
        exercises: s.workout.exercises.map((exercise) =>
          exercise.id === eid
            ? {
                ...exercise,
                sets: exercise.sets.map((st, i) => (i === idx ? { ...st, ...patch } : st)),
              }
            : exercise,
        ),
      },
    }));
  }

  function clearRestTimer() {
    setRestTimer(null);
  }

  function startRestTimer(exercise: WorkoutExercise) {
    const durationSec = restDurationForExercise(
      exercise.name,
      exercise.label,
      state.restTimerDefaultSeconds,
      state.restTimerSecondsByExerciseKey,
      exerciseNoteKey,
    );
    setRestTimer({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      exerciseLabel: exercise.label,
      endsAtMs: Date.now() + durationSec * 1000,
      durationSec,
      completed: false,
    });
  }

  function toggleSetDone(exercise: WorkoutExercise, idx: number) {
    const st = exercise.sets[idx];
    if (!st) return;
    const willDone = !st.done;
    updateSet(exercise.id, idx, { done: willDone });
    if (willDone) {
      startRestTimer(exercise);
    } else if (restTimer?.exerciseId === exercise.id) {
      clearRestTimer();
    }
  }

  function cycleRestPreset(exercise: WorkoutExercise) {
    const key = exerciseNoteKey(exercise.name, exercise.label);
    const current = restDurationForExercise(
      exercise.name,
      exercise.label,
      state.restTimerDefaultSeconds,
      state.restTimerSecondsByExerciseKey,
      exerciseNoteKey,
    );
    const next = nextRestTimerPreset(current);
    setState((s) => ({
      ...s,
      restTimerSecondsByExerciseKey: { ...s.restTimerSecondsByExerciseKey, [key]: next },
    }));
    if (restTimer?.exerciseId === exercise.id) {
      setRestTimer({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        exerciseLabel: exercise.label,
        endsAtMs: Date.now() + next * 1000,
        durationSec: next,
        completed: false,
      });
    }
  }

  function saveExerciseNote(name: string, label: string | undefined, note: string) {
    setState((s) => ({
      ...s,
      exerciseNotesByKey: withExerciseNote(s.exerciseNotesByKey, name, label, note),
    }));
  }

  function deleteExerciseNote(name: string, label?: string) {
    setState((s) => ({
      ...s,
      exerciseNotesByKey: withExerciseNote(s.exerciseNotesByKey, name, label, ""),
    }));
  }

  function addSet(eid: string) {
    setState((s) => ({
      ...s,
      workout: {
        ...s.workout,
        exercises: s.workout.exercises.map((exercise) => {
          if (exercise.id !== eid) return exercise;
          const last = exercise.sets[exercise.sets.length - 1] ?? { w: 0, r: 0 };
          return { ...exercise, sets: [...exercise.sets, { w: last.w, r: 0, done: false }] };
        }),
      },
    }));
  }

  function removeSet(eid: string, idx: number) {
    setState((s) => ({
      ...s,
      workout: {
        ...s.workout,
        exercises: s.workout.exercises.map((exercise) =>
          exercise.id === eid ? { ...exercise, sets: exercise.sets.filter((_, i) => i !== idx) } : exercise,
        ),
      },
    }));
  }

  function removeExerciseFromSession(eid: string) {
    setState((s) => {
      const { [eid]: _removed, ...remainingNotes } = s.workout.sessionCoachNotesByExerciseId ?? {};
      return {
        ...s,
        workout: {
          ...s.workout,
          exercises: s.workout.exercises.filter((exercise) => exercise.id !== eid),
          sessionCoachNotesByExerciseId: remainingNotes,
        },
      };
    });
  }

  function swapExerciseInSession(eid: string, newName: string, newLabel?: string) {
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    const trimmedLabel = newLabel?.trim();
    setState((s) => ({
      ...s,
      workout: {
        ...s.workout,
        exercises: s.workout.exercises.map((exercise) => {
          if (exercise.id !== eid) return exercise;
          const next: WorkoutExercise = {
            id: exercise.id,
            name: trimmedName,
            target: exercise.target,
            sets: buildSetsForExercise(
              trimmedName,
              trimmedLabel,
              exercise.sets.length,
              s.workoutHistory,
            ),
          };
          if (trimmedLabel) next.label = trimmedLabel;
          return next;
        }),
        sessionCoachNotesByExerciseId: {
          ...s.workout.sessionCoachNotesByExerciseId,
          [eid]: buildSessionCoachNoteForExercise(
            s.workoutHistory,
            {
              id: eid,
              name: trimmedName,
              ...(trimmedLabel ? { label: trimmedLabel } : {}),
              target: "",
              sets: [],
            },
          ),
        },
      },
    }));
    setRestTimer((current) =>
      current?.exerciseId === eid
        ? {
            ...current,
            exerciseName: trimmedName,
            exerciseLabel: trimmedLabel || undefined,
          }
        : current,
    );
    setSwapExerciseId(null);
  }

  function newWorkoutExerciseId(): string {
    return `e${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function addExerciseToSession(name: string, label?: string, closeSheet = true) {
    const trimmedLabel = label?.trim();
    setState((s) => {
      const newExercise: WorkoutExercise = {
        id: newWorkoutExerciseId(),
        name,
        ...(trimmedLabel ? { label: trimmedLabel } : {}),
        target: "3 × 10",
        sets: buildSetsForExercise(name, trimmedLabel, 3, s.workoutHistory),
      };
      return {
        ...s,
        workout: {
          ...s.workout,
          exercises: [...s.workout.exercises, newExercise],
          sessionCoachNotesByExerciseId: {
            ...s.workout.sessionCoachNotesByExerciseId,
            [newExercise.id]: buildSessionCoachNoteForExercise(s.workoutHistory, newExercise),
          },
        },
      };
    });
    if (closeSheet) {
      setShowExSearch(false);
      setExQuery("");
    }
  }

  function saveDraftCustomAndAddToSession() {
    const n = draftExName.trim();
    if (!n) return;
    const lb = draftExLabel.trim();
    setState((s) => {
      const newExercise: WorkoutExercise = {
        id: newWorkoutExerciseId(),
        name: n,
        ...(lb ? { label: lb } : {}),
        target: "3 × 10",
        sets: buildSetsForExercise(n, lb || undefined, 3, s.workoutHistory),
      };
      return {
        ...s,
        customExercises: [...s.customExercises, { id: `c${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: n, label: lb }],
        workout: {
          ...s.workout,
          exercises: [...s.workout.exercises, newExercise],
          sessionCoachNotesByExerciseId: {
            ...s.workout.sessionCoachNotesByExerciseId,
            [newExercise.id]: buildSessionCoachNoteForExercise(s.workoutHistory, newExercise),
          },
        },
      };
    });
    setDraftExName("");
    setDraftExLabel("");
    setExQuery("");
  }

  function startEmptyWorkout() {
    setState((s) => ({
      ...s,
      workout: {
        ...s.workout,
        splitId: "",
        startedAt: formatSessionClock(new Date()),
        sessionDayKey: localDateKey(new Date()),
        sessionPhase: "lifting",
        sessionStartedAtMs: Date.now(),
        sessionTitle: "Workout",
        exercises: [],
        sessionCoachNotesByExerciseId: {},
      },
    }));
  }

  function startTemplateWorkout(templateId: string) {
    setState((s) => {
      const tpl = s.workoutTemplates.find((t) => t.id === templateId);
      if (!tpl) return s;
      const exercises = cloneExercisesForNewSession(tpl.exercises).map((ex) =>
        autofillExerciseSets(ex, s.workoutHistory),
      );
      return {
        ...s,
        workout: {
          ...s.workout,
          splitId: templateId,
          exercises,
          startedAt: formatSessionClock(new Date()),
          sessionDayKey: localDateKey(new Date()),
          sessionPhase: "lifting",
          sessionStartedAtMs: Date.now(),
          sessionTitle: tpl.name,
          sessionCoachNotesByExerciseId: buildSessionCoachNotesByExerciseId(s.workoutHistory, exercises),
        },
      };
    });
  }

  function requestFinishWorkout() {
    if (doneSets === 0) {
      setShowEmptyFinishConfirm(true);
      return;
    }
    endSessionToIdle(true);
  }

  function endSessionToIdle(completed: boolean) {
    setShowEmptyFinishConfirm(false);
    if (completed) {
      setState((s) => {
        const result = finishWorkout(s);
        return result ? result.state : s;
      });
    } else {
      setState((s) => ({
        ...s,
        workout: {
          ...s.workout,
          sessionPhase: "idle",
          startedAt: "-",
          sessionDayKey: null,
          sessionStartedAtMs: null,
          sessionTitle: "Workout",
          exercises: [],
          sessionCoachNotesByExerciseId: undefined,
        },
      }));
    }
    setShowExSearch(false);
    setExQuery("");
    setDraftExName("");
    setDraftExLabel("");
    setSessionEditMode(false);
    setExpandedProgressId(null);
    setPreviewRoutineId(null);
    setRestTimer(null);
    setSwapExerciseId(null);
  }

  function updateSessionTitle(text: string) {
    setState((s) => ({
      ...s,
      workout: { ...s.workout, sessionTitle: text },
    }));
  }

  const qLow = exQuery.trim().toLowerCase();
  const filteredBuiltin = EXERCISE_DB.filter((n) => !qLow || n.toLowerCase().includes(qLow));
  const filteredCustom = state.customExercises.filter(
    (c) => !qLow || c.name.toLowerCase().includes(qLow) || c.label.toLowerCase().includes(qLow),
  );
  const overloadTip = progressiveOverloadInsight(w);

  const createInputStyle: CSSProperties = {
    background: "#1A1A1A",
    border: "0.5px solid var(--border)",
    borderRadius: 10,
    padding: "10px 12px",
    color: "#fff",
    fontFamily: "var(--ui)",
    fontSize: 14,
    fontWeight: 500,
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
  };

  if (showHistoryPage) {
    return (
      <FullScreenOverlay open={showHistoryPage} zIndex={120}>
        <ScreenWorkoutHistory
          state={state}
          setState={setState}
          navigate={() => {}}
          onBack={() => setShowHistoryPage(false)}
        />
      </FullScreenOverlay>
    );
  }

  if (phase === "idle" && editingRoutineId !== null) {
    if (editingRoutineId !== NEW_ROUTINE_EDITOR_ID && !state.workoutTemplates.some((t) => t.id === editingRoutineId)) {
      return null;
    }
    const editTemplate =
      editingRoutineId === NEW_ROUTINE_EDITOR_ID
        ? null
        : state.workoutTemplates.find((t) => t.id === editingRoutineId) ?? null;
    return (
      <>
        <WorkoutRoutineEditor
          key={editingRoutineId}
          template={editTemplate}
          customExercises={state.customExercises}
          onSave={(saved) => {
            setState((s) => {
              const i = s.workoutTemplates.findIndex((t) => t.id === saved.id);
              const next = [...s.workoutTemplates];
              if (i >= 0) next[i] = saved;
              else next.push(saved);
              return { ...s, workoutTemplates: next };
            });
            setEditingRoutineId(null);
          }}
          onDelete={
            editingRoutineId !== NEW_ROUTINE_EDITOR_ID
              ? (id) => {
                  setState((s) => ({
                    ...s,
                    workoutTemplates: s.workoutTemplates.filter((t) => t.id !== id),
                  }));
                }
              : null
          }
          onClose={() => setEditingRoutineId(null)}
        />
      </>
    );
  }

  if (phase === "idle") {
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
          right={<HistoryHeaderButton onClick={() => setShowHistoryPage(true)} />}
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
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "rgba(255,255,255,0.55)", fontWeight: 500, lineHeight: 1.5 }}>
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
                    background: "rgba(255,255,255,0.05)",
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
                      color: "#fff",
                      border: "none",
                      background: "transparent",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.45)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      {tpl.dayLabel.trim() || "Routine"}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>{tpl.name}</div>
                    {tpl.focus.trim() ? (
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 10, lineHeight: 1.4 }}>{tpl.focus}</div>
                    ) : null}
                    <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                      {preview.map((name, i) => (
                        <li key={`${tpl.id}-p${i}`} style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
                          {name}
                        </li>
                      ))}
                    </ul>
                    {more > 0 ? (
                      <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>+{more} more</div>
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
                      background: "rgba(255,255,255,0.03)",
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
            color: "rgba(255,255,255,0.35)",
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

  return (
    <div key="workout-lifting" className="screen page-transition">
      <WorkoutSessionHeader
        elapsedSec={elapsedSec}
        sessionEditMode={sessionEditMode}
        onToggleSessionEditMode={() => setSessionEditMode((v) => !v)}
        onFinishWorkout={requestFinishWorkout}
        sessionTitle={w.sessionTitle}
        onSessionTitleChange={updateSessionTitle}
        startedAt={w.startedAt}
        splitDay={split?.day}
        exerciseCount={w.exercises.length}
      />

      <WorkoutCoachCard
        overloadTip={overloadTip}
        sessionTip={activeRoutine?.sessionTip}
        activeRoutine={activeRoutine}
        mobilityItems={MOBILITY_ITEMS}
        warmupItems={WARMUP_ITEMS}
        defaultExpanded={shouldDefaultExpandCoachCard(isTrainingDayToday, w.splitId, todayTemplateId)}
      />

      <WorkoutSessionStickyHeader
        doneSets={doneSets}
        totalSets={totalSets}
        totalVolume={totalVolume}
        weightUnit={wUnit}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {w.exercises.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.55)", fontWeight: 500, lineHeight: 1.5 }}>
              No exercises yet. Tap <strong style={{ color: "#fff" }}>Add exercises</strong> or start from a template next time.
            </p>
          </div>
        ) : null}
        <SortableExerciseList
          items={w.exercises}
          gap={12}
          onReorder={(next) =>
            setState((s) => ({
              ...s,
              workout: { ...s.workout, exercises: next },
            }))
          }
          renderItem={(exercise, ei, handle, ctx) => (
            <WorkoutExerciseCard
              exercise={exercise}
              exerciseIndex={ei}
              handle={handle}
              isOverlay={ctx.isOverlay}
              isListDragging={ctx.isListDragging}
              sessionEditMode={sessionEditMode}
              weightUnit={wUnit}
              exerciseNote={getExerciseNote(state.exerciseNotesByKey, exercise.name, exercise.label)}
              sessionCoachNote={w.sessionCoachNotesByExerciseId?.[exercise.id]}
              exercisePersonalBests={state.exercisePersonalBests}
              progressExpanded={expandedProgressId === exercise.id}
              restTimer={restTimer}
              restTimerRemainingSec={restTimerRemainingSec}
              restTimerDefaultSeconds={state.restTimerDefaultSeconds}
              restTimerSecondsByExerciseKey={state.restTimerSecondsByExerciseKey}
              onRemoveExercise={removeExerciseFromSession}
              onSwapExercise={setSwapExerciseId}
              onClearRestTimer={clearRestTimer}
              onCycleRestPreset={cycleRestPreset}
              onUpdateSet={updateSet}
              onToggleSetDone={toggleSetDone}
              onRemoveSet={removeSet}
              onAddSet={addSet}
              onPressNote={(name, label) => setNotesEdit({ name, label })}
              onToggleProgress={(exerciseId) =>
                setExpandedProgressId((id) => (id === exerciseId ? null : exerciseId))
              }
            />
          )}
        />
      </div>

      {showExSearch ? (
        <div className="card" style={{ padding: 12, marginTop: 16 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              marginBottom: 10,
            }}
          >
            Create new
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              value={draftExName}
              onChange={(e) => setDraftExName(e.target.value)}
              placeholder="Exercise name"
              style={createInputStyle}
            />
            <input
              value={draftExLabel}
              onChange={(e) => setDraftExLabel(e.target.value)}
              placeholder="Label (optional)"
              style={createInputStyle}
            />
            <PrimaryButton
              block
              onClick={saveDraftCustomAndAddToSession}
              disabled={!draftExName.trim()}
              style={{ borderRadius: 10, padding: 12, fontSize: 14 }}
            >
              Save to my list & add to workout
            </PrimaryButton>
          </div>

          <div style={{ position: "relative", marginTop: 16 }}>
            <IconSearch size={16} style={{ position: "absolute", left: 12, top: 13, color: "rgba(255,255,255,0.4)" }} />
            <input
              autoFocus
              className="input"
              style={{ paddingLeft: 36, background: "#1A1A1A" }}
              placeholder="Search exercises..."
              value={exQuery}
              onChange={(e) => setExQuery(e.target.value)}
            />
          </div>
          <div style={{ marginTop: 10, maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {filteredCustom.length > 0 ? (
              <>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                    padding: "8px 8px 6px",
                  }}
                >
                  Your exercises
                </div>
                {filteredCustom.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="tap"
                    onClick={() => addExerciseToSession(c.name, c.label)}
                    style={{
                      padding: "12px 8px",
                      textAlign: "left",
                      borderBottom: "0.5px solid var(--border)",
                      fontSize: 13,
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", color: "#fff" }}>{c.name}</span>
                      {c.label ? (
                        <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 3, fontWeight: 500 }}>{c.label}</span>
                      ) : null}
                    </span>
                    <IconPlus size={14} stroke={2} style={{ color: "#fff", flexShrink: 0 }} />
                  </button>
                ))}
              </>
            ) : null}
            {filteredBuiltin.length > 0 ? (
              <>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                    padding: "8px 8px 6px",
                  }}
                >
                  Catalog
                </div>
                {filteredBuiltin.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="tap"
                    onClick={() => addExerciseToSession(n)}
                    style={{
                      padding: "12px 8px",
                      textAlign: "left",
                      borderBottom: "0.5px solid var(--border)",
                      fontSize: 13,
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{n}</span>
                    <IconPlus size={14} stroke={2} style={{ color: "#fff" }} />
                  </button>
                ))}
              </>
            ) : null}
            {filteredCustom.length === 0 && filteredBuiltin.length === 0 ? (
              <div style={{ padding: 16, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>No matches</div>
            ) : null}
          </div>
          <button
            type="button"
            className="tap"
            onClick={() => {
              setShowExSearch(false);
              setExQuery("");
              setDraftExName("");
              setDraftExLabel("");
            }}
            style={{
              marginTop: 8,
              width: "100%",
              color: "rgba(255,255,255,0.4)",
              fontSize: 12,
              padding: 6,
              fontWeight: 500,
            }}
          >
            Done
          </button>
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {!showExSearch ? (
          <button
            type="button"
            className="tap"
            onClick={() => setShowExSearch(true)}
            style={{
              width: "100%",
              background: "rgba(10,132,255,0.2)",
              border: "0.5px solid rgba(10,132,255,0.45)",
              borderRadius: 12,
              padding: 14,
              color: "#6EB7FF",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <IconPlus size={16} stroke={2} /> Add exercises
          </button>
        ) : null}

        <button
          type="button"
          className="tap"
          onClick={() => endSessionToIdle(false)}
          style={{
            width: "100%",
            background: "rgba(255,69,58,0.12)",
            border: "0.5px solid rgba(255,69,58,0.35)",
            borderRadius: 12,
            padding: 14,
            color: "#FF6961",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Cancel workout
        </button>
      </div>

      <div style={{ height: 8 }} />

      {showEmptyFinishConfirm ? (
        <EmptyFinishConfirmSheet
          onKeepTraining={() => setShowEmptyFinishConfirm(false)}
          onQuit={() => endSessionToIdle(false)}
        />
      ) : null}

      {notesEdit ? (
        <ExerciseNotesEditSheet
          exerciseName={notesEdit.name}
          note={getExerciseNote(state.exerciseNotesByKey, notesEdit.name, notesEdit.label)}
          onSave={(next) => saveExerciseNote(notesEdit.name, notesEdit.label, next)}
          onDelete={() => deleteExerciseNote(notesEdit.name, notesEdit.label)}
          onClose={() => setNotesEdit(null)}
        />
      ) : null}

      {swapExerciseId
        ? (() => {
            const swapRow = w.exercises.find((e) => e.id === swapExerciseId);
            if (!swapRow) return null;
            return (
              <ExerciseSwapSheet
                currentName={swapRow.name}
                currentLabel={swapRow.label}
                customExercises={state.customExercises}
                onSelect={(name, label) => swapExerciseInSession(swapRow.id, name, label)}
                onClose={() => setSwapExerciseId(null)}
              />
            );
          })()
        : null}

    </div>
  );
}
