import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from "react";

import { localDateKey } from "../dailyPlan";
import { EXERCISE_DB, SPLIT, cloneExercisesForNewSession, defaultWorkoutRoutineTemplates } from "../data";
import { ExerciseNoteRow } from "../ExerciseNoteRow";
import { ExerciseNotesEditSheet } from "../ExerciseNotesEditSheet";
import { ExerciseProgressSection } from "../ExerciseProgressSection";
import { getExerciseNote, withExerciseNote } from "../exerciseNotes";
import { jimmyIntensityCoachingLine, progressiveOverloadInsight } from "../coach";
import { finishWorkout } from "../finishWorkout";
import { refreshStateAfterJimmySeed } from "../jimmy-seed-data";
import { isJimmySummerPlanTemplates, jimmySuggestedRoutineIdForDate } from "../jimmyWeekly";
import {
  IconBook,
  IconCheck,
  IconClock,
  IconMinus,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
} from "../icons";
import { ScreenWorkoutHistory } from "./ScreenWorkoutHistory";
import { ExerciseDragHandle, SortableExerciseList } from "../SortableExerciseList";
import { ScreenHeader } from "../shared";
import type { ScreenProps } from "../types";
import { RoutinePreviewSheet } from "../RoutinePreviewSheet";
import { WorkoutCoachBanner, type CoachSection } from "../WorkoutCoachBanner";
import { NEW_ROUTINE_EDITOR_ID, WorkoutRoutineEditor } from "./WorkoutRoutineEditor";

function formatSessionClock(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatElapsed(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const ACCENT_BLUE = "#0A84FF";
const ACCENT_GREEN = "#34C759";
const COACH_BLUE_LIGHT = "#6EB7FF";

const TYPE = {
  title: { fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" },
  label: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.4)",
  },
  exerciseName: { fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" },
  body: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
  bodyStrong: { fontSize: 14, fontWeight: 600, lineHeight: 1.5 },
  secondary: { fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)" },
} as const satisfies Record<string, CSSProperties>;

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

function EmptyFinishConfirmSheet({
  onKeepTraining,
  onQuit,
}: {
  onKeepTraining: () => void;
  onQuit: () => void;
}) {
  function onBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onKeepTraining();
  }

  return (
    <div
      role="presentation"
      onMouseDown={onBackdropMouseDown}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(0,0,0,0.52)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "12px 12px calc(16px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="empty-finish-title"
        className="card page-transition"
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#121212",
          borderColor: "var(--border)",
          padding: 20,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div id="empty-finish-title" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>
          Nothing logged yet
        </div>
        <p style={{ margin: "10px 0 18px", fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "rgba(255,255,255,0.55)" }}>
          You haven&apos;t checked off any sets. Quit without saving this workout?
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            className="tap"
            onClick={onKeepTraining}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "none",
              background: ACCENT_GREEN,
              color: "#0a0a0a",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            Keep training
          </button>
          <button
            type="button"
            className="tap"
            onClick={onQuit}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "0.5px solid rgba(255,69,58,0.35)",
              background: "rgba(255,69,58,0.12)",
              color: "#FF6961",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Quit workout
          </button>
        </div>
      </div>
    </div>
  );
}

export function ScreenWorkout({ state, setState }: ScreenProps) {
  const [showExSearch, setShowExSearch] = useState(false);
  const [exQuery, setExQuery] = useState("");
  const [draftExName, setDraftExName] = useState("");
  const [draftExLabel, setDraftExLabel] = useState("");
  const [, setTick] = useState(0);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [previewRoutineId, setPreviewRoutineId] = useState<string | null>(null);
  const [notesEdit, setNotesEdit] = useState<{ name: string; label?: string } | null>(null);
  const [showEmptyFinishConfirm, setShowEmptyFinishConfirm] = useState(false);
  const [showHistoryPage, setShowHistoryPage] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const w = state.workout;
  const activeRoutine = state.workoutTemplates.find((t) => t.id === w.splitId);
  const split = activeRoutine ? { day: activeRoutine.dayLabel, name: activeRoutine.name } : SPLIT.find((s) => s.id === w.splitId);
  const phase = w.sessionPhase;

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
    if (phase !== "lifting") setEditMode(false);
  }, [phase]);

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
    setState((s) => ({
      ...s,
      workout: {
        ...s.workout,
        exercises: s.workout.exercises.filter((exercise) => exercise.id !== eid),
      },
    }));
  }

  function newWorkoutExerciseId(): string {
    return `e${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function blankSets() {
    return [
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
    ];
  }

  function addExerciseToSession(name: string, label?: string, closeSheet = true) {
    const trimmedLabel = label?.trim();
    setState((s) => ({
      ...s,
      workout: {
        ...s.workout,
        exercises: [
          ...s.workout.exercises,
          {
            id: newWorkoutExerciseId(),
            name,
            ...(trimmedLabel ? { label: trimmedLabel } : {}),
            target: "3 × 10",
            sets: blankSets(),
          },
        ],
      },
    }));
    if (closeSheet) {
      setShowExSearch(false);
      setExQuery("");
    }
  }

  function saveDraftCustomAndAddToSession() {
    const n = draftExName.trim();
    if (!n) return;
    const lb = draftExLabel.trim();
    setState((s) => ({
      ...s,
      customExercises: [...s.customExercises, { id: `c${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: n, label: lb }],
      workout: {
        ...s.workout,
        exercises: [
          ...s.workout.exercises,
          {
            id: newWorkoutExerciseId(),
            name: n,
            ...(lb ? { label: lb } : {}),
            target: "3 × 10",
            sets: blankSets(),
          },
        ],
      },
    }));
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
      },
    }));
  }

  function startTemplateWorkout(templateId: string) {
    setState((s) => {
      const tpl = s.workoutTemplates.find((t) => t.id === templateId);
      if (!tpl) return s;
      return {
        ...s,
        workout: {
          ...s.workout,
          splitId: templateId,
          exercises: cloneExercisesForNewSession(tpl.exercises),
          startedAt: formatSessionClock(new Date()),
          sessionDayKey: localDateKey(new Date()),
          sessionPhase: "lifting",
          sessionStartedAtMs: Date.now(),
          sessionTitle: tpl.name,
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
          startedAt: "—",
          sessionDayKey: null,
          sessionStartedAtMs: null,
          sessionTitle: "Workout",
          exercises: [],
        },
      }));
    }
    setShowExSearch(false);
    setExQuery("");
    setDraftExName("");
    setDraftExLabel("");
    setPreviewRoutineId(null);
  }

  function updateSessionTitle(text: string) {
    setState((s) => ({
      ...s,
      workout: { ...s.workout, sessionTitle: text },
    }));
  }

  const sortedRoutineTemplates = useMemo(() => {
    if (!isJimmySummerPlanTemplates(state.workoutTemplates)) return state.workoutTemplates;
    const rid = jimmySuggestedRoutineIdForDate(new Date());
    if (!rid) return state.workoutTemplates;
    const ix = state.workoutTemplates.findIndex((t) => t.id === rid);
    if (ix <= 0) return state.workoutTemplates;
    const next = [...state.workoutTemplates];
    const [head] = next.splice(ix, 1);
    return head ? [head, ...next] : state.workoutTemplates;
  }, [state.workoutTemplates]);

  const todayRoutineId = useMemo(() => jimmySuggestedRoutineIdForDate(new Date()), []);
  const qLow = exQuery.trim().toLowerCase();
  const filteredBuiltin = EXERCISE_DB.filter((n) => !qLow || n.toLowerCase().includes(qLow));
  const filteredCustom = state.customExercises.filter(
    (c) => !qLow || c.name.toLowerCase().includes(qLow) || c.label.toLowerCase().includes(qLow),
  );
  const overloadTip =
    isJimmySummerPlanTemplates(state.workoutTemplates) && phase === "lifting"
      ? `${progressiveOverloadInsight(w)}\n\n${jimmyIntensityCoachingLine(localDateKey(new Date()))}`
      : progressiveOverloadInsight(w);

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

  const coachSections: CoachSection[] = [];
  if (activeRoutine?.warmupItems?.length) {
    coachSections.push({
      id: "warmup",
      label: "Warm-up",
      content: (
        <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
          {activeRoutine.warmupItems.map((item) => (
            <li key={item.description} style={{ ...TYPE.body, color: "rgba(255,255,255,0.82)" }}>
              {item.description}
            </li>
          ))}
        </ul>
      ),
    });
  }
  if (activeRoutine?.warmupTip) {
    coachSections.push({
      id: "callout",
      label: "Callout",
      content: <p style={{ margin: 0, ...TYPE.body, color: "rgba(255,255,255,0.88)" }}>{activeRoutine.warmupTip}</p>,
    });
  }
  if (overloadTip) {
    coachSections.push({
      id: "note",
      label: "Note",
      content: (
        <p style={{ margin: 0, ...TYPE.body, color: "rgba(255,255,255,0.82)", whiteSpace: "pre-line" }}>
          {overloadTip}
        </p>
      ),
    });
  }
  if (phase === "lifting" && activeRoutine?.sessionTip) {
    coachSections.push({
      id: "after",
      label: "After this session",
      content: <p style={{ margin: 0, ...TYPE.body, color: "rgba(255,255,255,0.82)" }}>{activeRoutine.sessionTip}</p>,
    });
  }

  if (showHistoryPage) {
    return (
      <ScreenWorkoutHistory
        state={state}
        setState={setState}
        navigate={() => {}}
        onBack={() => setShowHistoryPage(false)}
      />
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
          state={state}
          template={editTemplate}
          customExercises={state.customExercises}
          exerciseNotesByKey={state.exerciseNotesByKey}
          onNotePress={(name, label) => setNotesEdit({ name, label })}
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
        {notesEdit ? (
          <ExerciseNotesEditSheet
            exerciseName={notesEdit.name}
            note={getExerciseNote(state.exerciseNotesByKey, notesEdit.name, notesEdit.label)}
            onSave={(next) => saveExerciseNote(notesEdit.name, notesEdit.label, next)}
            onDelete={() => deleteExerciseNote(notesEdit.name, notesEdit.label)}
            onClose={() => setNotesEdit(null)}
          />
        ) : null}
      </>
    );
  }

  if (phase === "idle") {
    const jimmyLoaded = isJimmySummerPlanTemplates(state.workoutTemplates);
    const previewTpl = previewRoutineId ? state.workoutTemplates.find((t) => t.id === previewRoutineId) : null;
    return (
      <>
      <div key="workout-idle" className="screen page-transition">
        <ScreenHeader
          eyebrow="TRAINING"
          title="Start Workout"
          right={<HistoryHeaderButton onClick={() => setShowHistoryPage(true)} />}
        />

        {!jimmyLoaded ? (
          <div
            className="card"
            style={{
              marginTop: 18,
              padding: 16,
              borderColor: "rgba(10,132,255,0.38)",
              background: "rgba(10,132,255,0.07)",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Summer plan not loaded</div>
            <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>
              Your device already had saved data, so the app kept the default program. Load Jimmy&apos;s routines (Chest + Triceps Mon, etc.), macro targets, and meal presets in one step.
            </p>
            <button
              type="button"
              className="tap"
              onClick={() => {
                if (
                  typeof window !== "undefined" &&
                  !window.confirm(
                    "Load Jimmy’s summer plan? Replaces workouts, Saved nutrition presets, habits, macros, and goal range. Logs stay.",
                  )
                )
                  return;
                setState(refreshStateAfterJimmySeed());
              }}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                background: ACCENT_BLUE,
                color: "#fff",
              }}
            >
              Load Jimmy&apos;s summer plan
            </button>
          </div>
        ) : null}

        <button
          type="button"
          className="tap"
          onClick={startEmptyWorkout}
          style={{
            marginTop: 20,
            width: "100%",
            background: ACCENT_BLUE,
            color: "#fff",
            borderRadius: 12,
            padding: 16,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            border: "none",
          }}
        >
          Start an empty workout
        </button>

        <div className="between" style={{ marginTop: 28, marginBottom: 12, alignItems: "center" }}>
          <span className="label">Routines</span>
          <button
            type="button"
            className="tap"
            onClick={() => setEditingRoutineId(NEW_ROUTINE_EDITOR_ID)}
            style={{ fontSize: 13, fontWeight: 600, color: ACCENT_BLUE, padding: "6px 10px" }}
          >
            + New routine
          </button>
        </div>

        {state.workoutTemplates.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "rgba(255,255,255,0.55)", fontWeight: 500, lineHeight: 1.5 }}>
              No routines yet. Create one or restore the built-in 5-day split.
            </p>
            <button
              type="button"
              className="tap"
              onClick={() => setEditingRoutineId(NEW_ROUTINE_EDITOR_ID)}
              style={{
                width: "100%",
                background: ACCENT_BLUE,
                color: "#fff",
                borderRadius: 12,
                padding: 14,
                fontSize: 14,
                fontWeight: 600,
                border: "none",
              }}
            >
              New routine
            </button>
            <button
              type="button"
              className="tap"
              onClick={() => setState((s) => ({ ...s, workoutTemplates: defaultWorkoutRoutineTemplates() }))}
              style={{
                marginTop: 12,
                width: "100%",
                background: "rgba(255,255,255,0.08)",
                border: "0.5px solid var(--border)",
                borderRadius: 12,
                padding: 14,
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Restore default program
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sortedRoutineTemplates.map((tpl) => {
              const preview = tpl.exercises.slice(0, 4).map((e) => e.name);
              const more = tpl.exercises.length - preview.length;
              const isToday = todayRoutineId != null && tpl.id === todayRoutineId;
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
                      {isToday ? (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 10,
                            color: "rgba(10,132,255,0.95)",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Today
                        </span>
                      ) : null}
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
          state={state}
          template={previewTpl}
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
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          marginLeft: -20,
          marginRight: -20,
          padding: "10px 20px 12px",
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <div className="between" style={{ alignItems: "center", gap: 10, marginBottom: 8 }}>
          <input
            value={w.sessionTitle}
            onChange={(e) => updateSessionTitle(e.target.value)}
            placeholder="Workout"
            aria-label="Workout name"
            style={{
              flex: 1,
              minWidth: 0,
              ...TYPE.title,
              background: "transparent",
              border: "none",
              padding: 0,
              color: "#fff",
              outline: "none",
              fontFamily: "var(--ui)",
            }}
          />
          <button
            type="button"
            className="tap"
            onClick={() => setEditMode((v) => !v)}
            aria-label={editMode ? "Exit edit mode" : "Edit exercises"}
            aria-pressed={editMode}
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: 10,
              border: editMode ? "0.5px solid rgba(10,132,255,0.45)" : "0.5px solid var(--border)",
              background: editMode ? "rgba(10,132,255,0.15)" : "rgba(255,255,255,0.06)",
              color: editMode ? COACH_BLUE_LIGHT : "#fff",
              display: "grid",
              placeItems: "center",
            }}
          >
            {editMode ? <IconCheck size={18} stroke={2} /> : <IconPencil size={16} stroke={1.8} />}
          </button>
          <button
            type="button"
            className="tap"
            onClick={requestFinishWorkout}
            style={{
              flexShrink: 0,
              background: ACCENT_GREEN,
              color: "#0a0a0a",
              borderRadius: 10,
              padding: "9px 14px",
              ...TYPE.bodyStrong,
              border: "none",
            }}
          >
            Finish
          </button>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ ...TYPE.bodyStrong, color: "#fff" }}>
              {doneSets}/{totalSets}
            </span>
            <span style={TYPE.label}>Sets</span>
          </span>
          <span style={{ ...TYPE.secondary, opacity: 0.5 }}>·</span>
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ ...TYPE.bodyStrong, color: "#fff" }}>
              {totalVolume.toLocaleString()}
            </span>
            <span style={TYPE.label}>Lbs</span>
          </span>
          <span style={{ ...TYPE.secondary, opacity: 0.5 }}>·</span>
          <span style={{ ...TYPE.secondary, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <IconClock size={12} stroke={1.8} />
            {formatElapsed(elapsedSec)}
          </span>
        </div>
      </div>

      <div style={{ ...TYPE.secondary, marginTop: 14, marginBottom: 10 }}>
        Started {w.startedAt}
        {split ? ` · ${split.day}` : ""} · {w.exercises.length} exercise{w.exercises.length === 1 ? "" : "s"}
      </div>

      <WorkoutCoachBanner sections={coachSections} />

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
          renderItem={(exercise, ei, handle, ctx) => {
          const done = exercise.sets.filter((st) => st.done).length;
          const exerciseNote = getExerciseNote(state.exerciseNotesByKey, exercise.name, exercise.label);
          const hasNote = exerciseNote.trim().length > 0;
          return (
            <div
              className="card"
              style={{
                padding: 16,
                pointerEvents: ctx.isOverlay ? "none" : undefined,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                {editMode ? (
                  <ExerciseDragHandle handle={handle} disabled={ctx.isListDragging && !handle.isDragging} />
                ) : null}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...TYPE.exerciseName, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ ...TYPE.secondary, fontVariantNumeric: "tabular-nums" }}>
                      {String(ei + 1).padStart(2, "0")}
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
                  <div style={{ ...TYPE.secondary, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                    Target {exercise.target} · {done}/{exercise.sets.length} sets
                  </div>
                </div>
                {editMode ? (
                  <button
                    type="button"
                    className="tap"
                    aria-label={`Remove ${exercise.name}`}
                    disabled={ctx.isListDragging}
                    onClick={() => removeExerciseFromSession(exercise.id)}
                    style={{
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      width: 36,
                      height: 36,
                      padding: 0,
                      border: "none",
                      background: "transparent",
                      color: "#FF6961",
                    }}
                  >
                    <IconTrash size={18} stroke={1.75} />
                  </button>
                ) : null}
              </div>

              {hasNote ? (
                <ExerciseNoteRow
                  note={exerciseNote}
                  onPress={() => setNotesEdit({ name: exercise.name, label: exercise.label })}
                  style={{ marginTop: 0, marginBottom: 12 }}
                />
              ) : null}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr 1fr 44px 32px",
                  gap: 6,
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div style={{ ...TYPE.label, textAlign: "center" }}>Set</div>
                <div style={{ ...TYPE.label, textAlign: "center" }}>Lbs</div>
                <div style={{ ...TYPE.label, textAlign: "center" }}>Reps</div>
                <div />
                <div />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {exercise.sets.map((st, si) => (
                  <div
                    key={si}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "32px 1fr 1fr 44px 32px",
                      gap: 6,
                      alignItems: "center",
                      background: st.done ? "rgba(255,255,255,0.04)" : "transparent",
                      borderRadius: 8,
                      padding: "4px 4px",
                    }}
                  >
                    <div
                      style={{
                        ...TYPE.body,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.5)",
                        textAlign: "center",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {si + 1}
                    </div>
                    <input
                      type="number"
                      value={st.w || ""}
                      onChange={(ev) => updateSet(exercise.id, si, { w: +ev.target.value || 0 })}
                      placeholder="—"
                      style={{
                        background: "#1A1A1A",
                        border: "0.5px solid var(--border)",
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: "#fff",
                        fontFamily: "var(--ui)",
                        fontSize: 14,
                        fontWeight: 500,
                        width: "100%",
                        outline: "none",
                        textAlign: "center",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    />
                    <input
                      type="number"
                      value={st.r || ""}
                      onChange={(ev) => updateSet(exercise.id, si, { r: +ev.target.value || 0 })}
                      placeholder="—"
                      style={{
                        background: "#1A1A1A",
                        border: "0.5px solid var(--border)",
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: "#fff",
                        fontFamily: "var(--ui)",
                        fontSize: 14,
                        fontWeight: 500,
                        width: "100%",
                        outline: "none",
                        textAlign: "center",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    />
                    <button
                      type="button"
                      className="tap"
                      onClick={() => updateSet(exercise.id, si, { done: !st.done })}
                      aria-label="Done"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 999,
                        background: st.done ? "#ffffff" : "transparent",
                        border: st.done ? "0.5px solid #fff" : "0.5px solid var(--border)",
                        color: st.done ? "#000" : "rgba(255,255,255,0.4)",
                        display: "grid",
                        placeItems: "center",
                        margin: "0 auto",
                      }}
                    >
                      <IconCheck size={16} stroke={2.4} />
                    </button>
                    <button type="button" className="tap" onClick={() => removeSet(exercise.id, si)} aria-label="Remove" style={{ width: 32, height: 36, color: "rgba(255,255,255,0.2)", display: "grid", placeItems: "center" }}>
                      <IconMinus size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="tap"
                onClick={() => addSet(exercise.id)}
                style={{
                  marginTop: 10,
                  width: "100%",
                  border: "0.5px dashed rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "10px",
                  color: "rgba(255,255,255,0.5)",
                  ...TYPE.body,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <IconPlus size={14} stroke={2} /> Add set
              </button>

              <div
                style={{
                  marginTop: 14,
                  paddingTop: 4,
                  borderTop: "0.5px solid var(--border)",
                }}
              >
                {!hasNote ? (
                  <button
                    type="button"
                    className="tap"
                    onClick={() => setNotesEdit({ name: exercise.name, label: exercise.label })}
                    aria-label="Add exercise note"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 0",
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    <IconBook size={14} stroke={1.8} style={{ color: "rgba(255,255,255,0.4)" }} />
                    <span style={{ ...TYPE.secondary, color: "rgba(255,255,255,0.6)" }}>Add note</span>
                  </button>
                ) : null}
                <ExerciseProgressSection
                  state={state}
                  exerciseName={exercise.name}
                  exerciseLabel={exercise.label}
                  variant="footer"
                />
              </div>
            </div>
          );
          }}
        />
      </div>

      {showExSearch ? (
        <div className="card" style={{ padding: 12, marginTop: 16 }}>
          <div style={{ ...TYPE.label, marginBottom: 10 }}>Create new</div>
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
            <button
              type="button"
              className="tap"
              onClick={saveDraftCustomAndAddToSession}
              disabled={!draftExName.trim()}
              style={{
                width: "100%",
                background: draftExName.trim() ? ACCENT_BLUE : "rgba(255,255,255,0.06)",
                border: "none",
                borderRadius: 10,
                padding: 12,
                color: draftExName.trim() ? "#fff" : "rgba(255,255,255,0.35)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Save to my list & add to workout
            </button>
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
                <div style={{ ...TYPE.label, padding: "8px 8px 6px" }}>Your exercises</div>
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
                      ...TYPE.body,
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
                        <span style={{ display: "block", ...TYPE.secondary, marginTop: 3 }}>{c.label}</span>
                      ) : null}
                    </span>
                    <IconPlus size={14} stroke={2} style={{ color: "#fff", flexShrink: 0 }} />
                  </button>
                ))}
              </>
            ) : null}
            {filteredBuiltin.length > 0 ? (
              <>
                <div style={{ ...TYPE.label, padding: "8px 8px 6px" }}>Catalog</div>
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
                      ...TYPE.body,
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
              <div
                style={{
                  padding: 16,
                  textAlign: "center",
                  ...TYPE.body,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                No matches
              </div>
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
              ...TYPE.secondary,
              padding: 6,
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

    </div>
  );
}
