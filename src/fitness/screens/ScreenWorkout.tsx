import { useEffect, useMemo, useRef, useState } from "react";

import { buildPreWorkoutCoachBrief, shouldDefaultExpandCoachCard } from "../preWorkoutCoachBrief";
import { localDateKey } from "../dailyPlan";
import { SPLIT, cloneExercisesForNewSession } from "../data";
import { ExerciseNotesEditSheet } from "../ExerciseNotesEditSheet";
import { exerciseNoteKey, getExerciseNote, withExerciseNote } from "../exerciseNotes";
import { progressiveOverloadInsight } from "../coach";
import { getFirstSessionCoachNote } from "../coachEngine";
import { finishWorkout } from "../finishWorkout";
import { SwipeToDelete } from "../SwipeToDelete";
import { IconPlus } from "../icons";
import { ScreenWorkoutHistory } from "./ScreenWorkoutHistory";
import { FullScreenOverlay } from "../motion";
import { SortableExerciseList } from "../SortableExerciseList";
import type { ScreenProps, WorkoutExercise, WorkoutSetKind } from "../types";
import { autofillExerciseSets, buildSetsForExercise } from "../workoutAutofill";
import {
  buildSessionCoachNoteForExercise,
  buildSessionCoachNotesByExerciseId,
} from "../exerciseSessionNotes";
import { WorkoutCoachCard } from "../WorkoutCoachCard";
import { WorkoutSessionStickyHeader } from "../WorkoutSessionStickyHeader";
import { RestTimerSheet } from "../RestTimerSheet";
import type { RestTimerPhase } from "../RestTimerStrip";
import { restDurationForExercise } from "../restTimerPreferences";
import { ExerciseSwapSheet } from "../ExerciseSwapSheet";
import { isTrainingDay } from "../trainingCalendar";
import { NEW_ROUTINE_EDITOR_ID, WorkoutRoutineEditor } from "./WorkoutRoutineEditor";
import { AddExerciseSearchSheet } from "../workout/AddExerciseSearchSheet";
import { CancelWorkoutConfirmSheet } from "../workout/CancelWorkoutConfirmSheet";
import { EmptyFinishConfirmSheet } from "../workout/EmptyFinishConfirmSheet";
import { DeleteExerciseConfirmSheet } from "../workout/DeleteExerciseConfirmSheet";
import { WorkoutExerciseCard } from "../workout/WorkoutExerciseCard";
import { WorkoutIdleDashboard } from "../workout/WorkoutIdleDashboard";
import { WorkoutSessionHeader } from "../workout/WorkoutSessionHeader";
import { CreateWeeklyRoutineSheet } from "../CreateWeeklyRoutineSheet";
import { WeeklyRoutineBuilderFlow, type WeeklyRoutineBuilderMode } from "../WeeklyRoutineBuilderFlow";

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
  afterSetIndex: number;
  paused?: boolean;
  pausedRemainingMs?: number;
};

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

export function ScreenWorkout({ state, setState, onRoutineEditorOpenChange }: ScreenProps) {
  const [showExSearch, setShowExSearch] = useState(false);
  const [openSwipeExerciseId, setOpenSwipeExerciseId] = useState<string | null>(null);
  const [expandedProgressId, setExpandedProgressId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);

  const [showCreateWeeklyRoutineSheet, setShowCreateWeeklyRoutineSheet] = useState(false);
  const [weeklyRoutineBuilderMode, setWeeklyRoutineBuilderMode] = useState<WeeklyRoutineBuilderMode | null>(null);

  const workoutOverlayOpen =
    editingRoutineId !== null || weeklyRoutineBuilderMode !== null || showCreateWeeklyRoutineSheet;

  useEffect(() => {
    onRoutineEditorOpenChange?.(workoutOverlayOpen);
    return () => onRoutineEditorOpenChange?.(false);
  }, [workoutOverlayOpen, onRoutineEditorOpenChange]);
  const [previewRoutineId, setPreviewRoutineId] = useState<string | null>(null);
  const [notesEdit, setNotesEdit] = useState<{ name: string; label?: string } | null>(null);
  const [showEmptyFinishConfirm, setShowEmptyFinishConfirm] = useState(false);
  const [showCancelWorkoutConfirm, setShowCancelWorkoutConfirm] = useState(false);
  const [showHistoryPage, setShowHistoryPage] = useState(false);
  const [restTimer, setRestTimer] = useState<ActiveRestTimer | null>(null);
  const [restSheetExerciseId, setRestSheetExerciseId] = useState<string | null>(null);
  const [restedRestSecByExerciseId, setRestedRestSecByExerciseId] = useState<Record<string, Record<number, number>>>({});
  const [swapExerciseId, setSwapExerciseId] = useState<string | null>(null);
  const [pendingExerciseDelete, setPendingExerciseDelete] = useState<{
    id: string;
    name: string;
    label?: string;
  } | null>(null);
  const exerciseListEndRef = useRef<HTMLDivElement>(null);
  const pendingScrollToNewExerciseRef = useRef(false);
  const restTimerRef = useRef<ActiveRestTimer | null>(null);
  restTimerRef.current = restTimer;
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
    if (!pendingScrollToNewExerciseRef.current) return;
    pendingScrollToNewExerciseRef.current = false;
    requestAnimationFrame(() => {
      exerciseListEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, [w.exercises.length]);

  useEffect(() => {
    if (!restTimer || restTimer.completed || restTimer.paused) return;
    const remainingMs = restTimer.endsAtMs - Date.now();
    if (remainingMs <= 0) {
      setRestTimer((current) => (current && !current.completed ? { ...current, completed: true } : current));
      return;
    }
    const id = window.setTimeout(() => {
      setRestTimer((current) => (current && !current.completed ? { ...current, completed: true } : current));
    }, remainingMs);
    return () => window.clearTimeout(id);
  }, [restTimer?.exerciseId, restTimer?.endsAtMs, restTimer?.completed, restTimer?.paused]);

  const elapsedSec =
    phase === "lifting" && w.sessionStartedAtMs != null
      ? Math.max(0, Math.floor((Date.now() - w.sessionStartedAtMs) / 1000))
      : 0;
  void tick;

  const totalSets = w.exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = w.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const totalVolume = w.exercises.reduce(
    (a, e) => a + e.sets.filter((s) => s.done).reduce((b, st) => b + st.w * st.r, 0),
    0,
  );

  const daysPerWeek = state.onboardingProfile?.workoutDaysPerWeek ?? 5;
  const isTrainingDayToday = isTrainingDay(new Date(), state.workoutTemplates, daysPerWeek);

  const restSheetExercise = restSheetExerciseId
    ? w.exercises.find((e) => e.id === restSheetExerciseId) ?? null
    : null;
  const restSheetIsActive = restSheetExercise != null && restTimer?.exerciseId === restSheetExercise.id;
  const restSheetPhase: RestTimerPhase = restSheetIsActive
    ? restTimer!.completed
      ? "complete"
      : "running"
    : "ready";
  const restSheetPresetSec =
    restSheetExercise == null
      ? state.restTimerDefaultSeconds
      : restDurationForExercise(
          restSheetExercise.name,
          restSheetExercise.label,
          state.restTimerDefaultSeconds,
          state.restTimerSecondsByExerciseKey,
          exerciseNoteKey,
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

  function updateSetKind(eid: string, idx: number, kind: WorkoutSetKind) {
    setState((s) => ({
      ...s,
      workout: {
        ...s.workout,
        exercises: s.workout.exercises.map((exercise) =>
          exercise.id === eid
            ? {
                ...exercise,
                sets: exercise.sets.map((st, i) => {
                  if (i !== idx) return st;
                  if (kind === "working") {
                    const { kind: _k, ...rest } = st;
                    return rest;
                  }
                  return { ...st, kind };
                }),
              }
            : exercise,
        ),
      },
    }));
  }

  function clearRestTimer() {
    setRestTimer(null);
  }

  function markRestedAfterSet(exerciseId: string, afterSetIndex: number, durationSec: number) {
    setRestedRestSecByExerciseId((prev) => {
      const existing = prev[exerciseId] ?? {};
      if (existing[afterSetIndex] != null) return prev;
      return {
        ...prev,
        [exerciseId]: { ...existing, [afterSetIndex]: durationSec },
      };
    });
  }

  function unmarkRestedFromSet(exerciseId: string, fromSetIndex: number) {
    setRestedRestSecByExerciseId((prev) => {
      const existing = prev[exerciseId];
      if (!existing) return prev;
      const next: Record<number, number> = {};
      let changed = false;
      for (const [key, sec] of Object.entries(existing)) {
        const idx = Number(key);
        if (idx < fromSetIndex) next[idx] = sec;
        else changed = true;
      }
      if (!changed) return prev;
      if (Object.keys(next).length === 0) {
        const { [exerciseId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [exerciseId]: next };
    });
  }

  function dismissCompletedRest() {
    if (restTimer?.completed) {
      markRestedAfterSet(restTimer.exerciseId, restTimer.afterSetIndex, restTimer.durationSec);
    }
    setRestTimer(null);
  }

  function completeRestTimer() {
    setRestTimer((current) => {
      if (!current) return current;
      return {
        ...current,
        completed: true,
        paused: false,
        pausedRemainingMs: undefined,
        endsAtMs: Date.now(),
      };
    });
  }

  function openRestSheet(exerciseId: string) {
    if (restTimer?.exerciseId === exerciseId && restTimer.completed) {
      dismissCompletedRest();
      return;
    }
    setRestSheetExerciseId(exerciseId);
  }

  function startRestTimer(exercise: WorkoutExercise, afterSetIndex: number) {
    const previous = restTimerRef.current;

    function durationForCompletedGap(gapIndex: number): number {
      if (previous?.exerciseId === exercise.id && previous.afterSetIndex === gapIndex) {
        return previous.durationSec;
      }
      return restDurationForExercise(
        exercise.name,
        exercise.label,
        state.restTimerDefaultSeconds,
        state.restTimerSecondsByExerciseKey,
        exerciseNoteKey,
      );
    }

    if (afterSetIndex > 0) {
      markRestedAfterSet(exercise.id, afterSetIndex - 1, durationForCompletedGap(afterSetIndex - 1));
    }
    if (previous?.exerciseId === exercise.id && previous.afterSetIndex !== afterSetIndex) {
      markRestedAfterSet(exercise.id, previous.afterSetIndex, previous.durationSec);
    }
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
      afterSetIndex,
      paused: false,
    });
  }

  function toggleSetDone(exercise: WorkoutExercise, idx: number) {
    const st = exercise.sets[idx];
    if (!st) return;
    const willDone = !st.done;
    updateSet(exercise.id, idx, { done: willDone });
    if (willDone) {
      startRestTimer(exercise, idx);
    } else {
      if (restTimer?.exerciseId === exercise.id) {
        clearRestTimer();
      }
      unmarkRestedFromSet(exercise.id, idx);
    }
  }

  function setRestPreset(exercise: WorkoutExercise, seconds: number) {
    const key = exerciseNoteKey(exercise.name, exercise.label);
    setState((s) => ({
      ...s,
      restTimerSecondsByExerciseKey: { ...s.restTimerSecondsByExerciseKey, [key]: seconds },
    }));
    setRestTimer((current) => {
      if (!current || current.exerciseId !== exercise.id || current.completed) return current;
      if (current.paused) {
        return {
          ...current,
          durationSec: seconds,
          pausedRemainingMs: seconds * 1000,
        };
      }
      return {
        ...current,
        durationSec: seconds,
        endsAtMs: Date.now() + seconds * 1000,
      };
    });
  }

  function adjustRestTimer(deltaSec: number) {
    setRestTimer((current) => {
      if (!current || current.completed) return current;
      const deltaMs = deltaSec * 1000;
      if (current.paused) {
        const nextRemainingMs = Math.max(0, (current.pausedRemainingMs ?? 0) + deltaMs);
        if (nextRemainingMs <= 0) {
          return { ...current, completed: true, paused: false, pausedRemainingMs: undefined };
        }
        return {
          ...current,
          pausedRemainingMs: nextRemainingMs,
          durationSec: current.durationSec + Math.max(0, deltaSec),
        };
      }
      const remaining = Math.max(0, Math.ceil((current.endsAtMs - Date.now()) / 1000));
      const nextRemaining = remaining + deltaSec;
      if (nextRemaining <= 0) {
        return { ...current, completed: true, endsAtMs: Date.now() };
      }
      return {
        ...current,
        endsAtMs: Date.now() + nextRemaining * 1000,
        durationSec: current.durationSec + Math.max(0, deltaSec),
      };
    });
  }

  function toggleRestPause() {
    setRestTimer((current) => {
      if (!current || current.completed) return current;
      if (current.paused) {
        return {
          ...current,
          paused: false,
          endsAtMs: Date.now() + (current.pausedRemainingMs ?? 0),
          pausedRemainingMs: undefined,
        };
      }
      const remainingMs = Math.max(0, current.endsAtMs - Date.now());
      return { ...current, paused: true, pausedRemainingMs: remainingMs };
    });
  }

  function restartRestTimer() {
    setRestTimer((current) => {
      if (!current || current.completed) return current;
      return {
        ...current,
        paused: false,
        pausedRemainingMs: undefined,
        endsAtMs: Date.now() + current.durationSec * 1000,
        completed: false,
      };
    });
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
    setOpenSwipeExerciseId((id) => (id === eid ? null : id));
    if (restTimer?.exerciseId === eid) clearRestTimer();
    setRestedRestSecByExerciseId((prev) => {
      if (!(eid in prev)) return prev;
      const { [eid]: _, ...rest } = prev;
      return rest;
    });
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

  function requestDeleteExercise(exercise: { id: string; name: string; label?: string }) {
    setOpenSwipeExerciseId(null);
    setPendingExerciseDelete(exercise);
  }

  function confirmDeleteExercise() {
    if (!pendingExerciseDelete) return;
    removeExerciseFromSession(pendingExerciseDelete.id);
    setPendingExerciseDelete(null);
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
            s.onboardingProfile?.trainingStyle,
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
            [newExercise.id]: buildSessionCoachNoteForExercise(
              s.workoutHistory,
              newExercise,
              s.onboardingProfile?.trainingStyle,
            ),
          },
        },
      };
    });
    pendingScrollToNewExerciseRef.current = true;
    if (closeSheet) {
      setShowExSearch(false);
    }
  }

  function saveCustomExercise(name: string, label: string) {
    const n = name.trim();
    if (!n) return;
    const lb = label.trim();
    setState((s) => ({
      ...s,
      customExercises: [
        ...s.customExercises,
        { id: `c${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: n, label: lb },
      ],
    }));
  }

  function saveCustomAndAddToSession(name: string, label: string) {
    const n = name.trim();
    if (!n) return;
    const lb = label.trim();
    saveCustomExercise(n, lb);
    addExerciseToSession(n, lb || undefined, false);
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
          sessionCoachNotesByExerciseId: buildSessionCoachNotesByExerciseId(
            s.workoutHistory,
            exercises,
            s.onboardingProfile?.trainingStyle,
          ),
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
    setShowCancelWorkoutConfirm(false);
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
    setOpenSwipeExerciseId(null);
    setExpandedProgressId(null);
    setPreviewRoutineId(null);
    setRestTimer(null);
    setRestSheetExerciseId(null);
    setRestedRestSecByExerciseId({});
    setSwapExerciseId(null);
  }

  function updateSessionTitle(text: string) {
    setState((s) => ({
      ...s,
      workout: { ...s.workout, sessionTitle: text },
    }));
  }

  const overloadTip = getFirstSessionCoachNote(state, w) ?? progressiveOverloadInsight(w);

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
          equipmentSetup={state.equipmentSetup}
          onSaveCustomExercise={saveCustomExercise}
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
    return (
      <>
        <WorkoutIdleDashboard
          state={state}
          preWorkoutCoach={preWorkoutCoach}
          previewRoutineId={previewRoutineId}
          setPreviewRoutineId={setPreviewRoutineId}
          setEditingRoutineId={setEditingRoutineId}
          startEmptyWorkout={startEmptyWorkout}
          startTemplateWorkout={startTemplateWorkout}
          setState={setState}
          onShowHistory={() => setShowHistoryPage(true)}
          onCreateWeeklyRoutine={() => setShowCreateWeeklyRoutineSheet(true)}
        />
        {showCreateWeeklyRoutineSheet ? (
          <CreateWeeklyRoutineSheet
            onClose={() => setShowCreateWeeklyRoutineSheet(false)}
            onGenerate={() => {
              setShowCreateWeeklyRoutineSheet(false);
              setWeeklyRoutineBuilderMode("generate");
            }}
            onManual={() => {
              setShowCreateWeeklyRoutineSheet(false);
              setWeeklyRoutineBuilderMode("manual");
            }}
          />
        ) : null}
        {weeklyRoutineBuilderMode ? (
          <WeeklyRoutineBuilderFlow
            mode={weeklyRoutineBuilderMode}
            state={state}
            onApply={(next) => setState(next)}
            onSaveCustomExercise={saveCustomExercise}
            onClose={() => setWeeklyRoutineBuilderMode(null)}
          />
        ) : null}
      </>
    );
  }

  return (
    <div key="workout-lifting" className="screen page-transition">
      <WorkoutSessionHeader
        elapsedSec={elapsedSec}
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
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", fontWeight: 500, lineHeight: 1.5 }}>
              No exercises yet. Tap <strong style={{ color: "var(--text-primary)" }}>Add exercises</strong> or start from a template next time.
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
            <SwipeToDelete
              deleteLabel={`Delete ${exercise.name}`}
              onDelete={() => requestDeleteExercise(exercise)}
              disabled={ctx.isListDragging}
              isOpen={openSwipeExerciseId === exercise.id}
              onOpen={() => setOpenSwipeExerciseId(exercise.id)}
              onClose={() => setOpenSwipeExerciseId(null)}
            >
              <WorkoutExerciseCard
                exercise={exercise}
                exerciseIndex={ei}
                handle={handle}
                isOverlay={ctx.isOverlay}
                isListDragging={ctx.isListDragging}
                weightUnit={wUnit}
                workoutHistory={state.workoutHistory}
                exerciseNote={getExerciseNote(state.exerciseNotesByKey, exercise.name, exercise.label)}
                sessionCoachNote={w.sessionCoachNotesByExerciseId?.[exercise.id]}
                exercisePersonalBests={state.exercisePersonalBests}
                progressExpanded={expandedProgressId === exercise.id}
                restedRestSecByAfterSetIndex={restedRestSecByExerciseId[exercise.id] ?? {}}
                restTimer={restTimer}
                restTimerDefaultSeconds={state.restTimerDefaultSeconds}
                restTimerSecondsByExerciseKey={state.restTimerSecondsByExerciseKey}
                onSwapExercise={setSwapExerciseId}
                onOpenRestSheet={openRestSheet}
                onUpdateSet={updateSet}
                onUpdateSetKind={updateSetKind}
                onToggleSetDone={toggleSetDone}
                onRemoveSet={removeSet}
                onAddSet={addSet}
                onPressNote={(name, label) => setNotesEdit({ name, label })}
                onToggleProgress={(exerciseId) =>
                  setExpandedProgressId((id) => (id === exerciseId ? null : exerciseId))
                }
                onRemoveExercise={requestDeleteExercise}
              />
            </SwipeToDelete>
          )}
        />
        <div ref={exerciseListEndRef} aria-hidden="true" style={{ height: 0 }} />
      </div>

      {showExSearch ? (
        <AddExerciseSearchSheet
          equipmentSetup={state.equipmentSetup}
          customExercises={state.customExercises}
          onAddExercise={(name, label) => addExerciseToSession(name, label)}
          onSaveCustomAndAdd={saveCustomAndAddToSession}
          onClose={() => setShowExSearch(false)}
        />
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {!showExSearch ? (
          <button
            type="button"
            className="tap"
            onClick={() => setShowExSearch(true)}
            style={{
              width: "100%",
              background: "var(--workout-action-bg)",
              border: "0.5px solid var(--workout-action-border)",
              borderRadius: 12,
              padding: 14,
              color: "var(--workout-action-fg)",
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
          onClick={() => setShowCancelWorkoutConfirm(true)}
          style={{
            width: "100%",
            background: "var(--workout-danger-bg)",
            border: "0.5px solid var(--workout-danger-border)",
            borderRadius: 12,
            padding: 14,
            color: "var(--workout-danger-fg)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Cancel workout
        </button>
      </div>

      <div style={{ height: 8 }} />

      {showCancelWorkoutConfirm ? (
        <CancelWorkoutConfirmSheet
          onResume={() => setShowCancelWorkoutConfirm(false)}
          onCancelWorkout={() => {
            setShowCancelWorkoutConfirm(false);
            endSessionToIdle(false);
          }}
        />
      ) : null}

      {showEmptyFinishConfirm ? (
        <EmptyFinishConfirmSheet
          onKeepTraining={() => setShowEmptyFinishConfirm(false)}
          onQuit={() => endSessionToIdle(false)}
        />
      ) : null}

      {pendingExerciseDelete ? (
        <DeleteExerciseConfirmSheet
          exerciseName={pendingExerciseDelete.name}
          exerciseLabel={pendingExerciseDelete.label}
          onCancel={() => setPendingExerciseDelete(null)}
          onConfirm={confirmDeleteExercise}
        />
      ) : null}

      {restSheetExercise ? (
        <RestTimerSheet
          exerciseName={restSheetExercise.name}
          exerciseLabel={restSheetExercise.label}
          phase={restSheetPhase}
          durationSec={restSheetIsActive ? restTimer!.durationSec : restSheetPresetSec}
          endsAtMs={restSheetIsActive && !restTimer!.completed ? restTimer!.endsAtMs : undefined}
          paused={restSheetIsActive ? restTimer!.paused : false}
          pausedRemainingMs={restSheetIsActive ? restTimer!.pausedRemainingMs : undefined}
          selectedPresetSec={restSheetPresetSec}
          onClose={() => setRestSheetExerciseId(null)}
          onSelectPreset={(seconds) => setRestPreset(restSheetExercise, seconds)}
          onAdjustSeconds={adjustRestTimer}
          onTogglePause={toggleRestPause}
          onRestart={restartRestTimer}
          onSkip={completeRestTimer}
          onDismiss={dismissCompletedRest}
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
                equipmentSetup={state.equipmentSetup}
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
