import { useEffect, useMemo, useRef, useState, type ElementRef } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type DraggableFlatList from "react-native-draggable-flatlist";

import { CancelWorkoutConfirmSheet } from "@/components/workout/CancelWorkoutConfirmSheet";
import { DeleteExerciseConfirmSheet } from "@/components/workout/DeleteExerciseConfirmSheet";
import { EmptyFinishConfirmSheet } from "@/components/workout/EmptyFinishConfirmSheet";
import { ExerciseActionSheet } from "@/components/workout/ExerciseActionSheet";
import { ExerciseNotesEditSheet } from "@/components/workout/ExerciseNotesEditSheet";
import { ExerciseSwapSheet } from "@/components/workout/ExerciseSwapSheet";
import { RestTimerSheet, type RestTimerPhase } from "@/components/workout/RestTimerSheet";
import { RoutineExerciseSearchSheet } from "@/components/workout/RoutineExerciseSearchSheet";
import { SortableExerciseList } from "@/components/workout/SortableExerciseList";
import { WorkoutCoachCard } from "@/components/workout/WorkoutCoachCard";
import { WorkoutExerciseCard } from "@/components/workout/WorkoutExerciseCard";
import { WorkoutExerciseCardFlat } from "@/components/workout/WorkoutExerciseCardFlat";
import {
  WORKOUT_KEYPAD_HEIGHT,
  WorkoutKeypadProvider,
} from "@/components/workout/WorkoutKeypadContext";
import type { WorkoutKeypadTarget } from "@/lib/workout/workoutKeypadLogic";
import { WorkoutNumericKeypad } from "@/components/workout/WorkoutNumericKeypad";
import { WorkoutSessionHeader, useSessionElapsedSec } from "@/components/workout/WorkoutSessionHeader";
import { useFitnessState } from "@/context/FitnessContext";
import { getExerciseNote, withExerciseNote } from "@/lib/workout/exerciseNotes";
import { defaultExerciseTarget } from "@/lib/workout/exercisePrescriptionDefaults";
import { buildPreWorkoutCoachBrief, shouldDefaultExpandCoachCard } from "@/lib/preWorkoutCoachBrief";
import { parseWorkoutTarget } from "@/lib/workout/workoutTarget";
import { buildWorkoutWarmup } from "@/lib/workout/workoutWarmup";
import { isUpperStrengthMondayWorkout } from "@/lib/workout/workoutNewLook";
import {
  clampRestTimerSeconds,
  MAX_REST_TIMER_SECONDS,
  restDurationForExercise,
} from "@/lib/workout/restTimerPreferences";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  buildSessionCoachNoteForExercise,
  buildSetCompletionPatch,
  canCompleteSet,
  exerciseNoteKey,
  finishWorkout,
  getFirstSessionCoachNote,
  previousSetsForExercise,
  progressiveOverloadInsight,
  buildSetsForExercise,
} from "@newyouai/core";
import type { CompletedWorkoutSession, UnitPreferences, WorkoutExercise, WorkoutSetKind } from "@newyouai/types";

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

function newWorkoutExerciseId(): string {
  return `e${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function WorkoutLiftingSlot() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { state, setFitnessState } = useFitnessState();
  const listRef = useRef<ElementRef<typeof DraggableFlatList<WorkoutExercise>> | null>(null);
  const restTimerRef = useRef<ActiveRestTimer | null>(null);
  const isWorkoutSessionE2e =
    typeof __DEV__ !== "undefined" &&
    __DEV__ &&
    process.env.EXPO_PUBLIC_E2E_FITNESS_SEED?.trim() === "workout-session";

  const [searchOpen, setSearchOpen] = useState(false);
  const [swapExerciseId, setSwapExerciseId] = useState<string | null>(null);
  const [exerciseActionId, setExerciseActionId] = useState<string | null>(null);
  const [notesEdit, setNotesEdit] = useState<{ name: string; label?: string } | null>(null);
  const [pendingExerciseDelete, setPendingExerciseDelete] = useState<{
    id: string;
    name: string;
    label?: string;
  } | null>(null);
  const [showEmptyFinishConfirm, setShowEmptyFinishConfirm] = useState(false);
  const [showCancelWorkoutConfirm, setShowCancelWorkoutConfirm] = useState(false);
  const [restTimer, setRestTimer] = useState<ActiveRestTimer | null>(null);
  const [restSheetExerciseId, setRestSheetExerciseId] = useState<string | null>(null);
  const [restedRestSecByExerciseId, setRestedRestSecByExerciseId] = useState<
    Record<string, Record<number, number>>
  >({});

  restTimerRef.current = restTimer;

  useEffect(() => {
    if (!restTimer || restTimer.completed || restTimer.paused) return;
    const remainingMs = restTimer.endsAtMs - Date.now();
    if (remainingMs <= 0) {
      setRestTimer((current) => (current && !current.completed ? { ...current, completed: true } : current));
      return;
    }
    const id = setTimeout(() => {
      setRestTimer((current) => (current && !current.completed ? { ...current, completed: true } : current));
    }, remainingMs);
    return () => clearTimeout(id);
  }, [restTimer?.exerciseId, restTimer?.endsAtMs, restTimer?.completed, restTimer?.paused]);

  const w = state?.workout;
  const elapsedSec = useSessionElapsedSec(w?.sessionStartedAtMs ?? null, w?.sessionPhase === "lifting");
  const preWorkoutCoach = useMemo(
    () => (state ? buildPreWorkoutCoachBrief(state) : null),
    [state],
  );
  const sessionWarmup = useMemo(
    () => buildWorkoutWarmup(w?.exercises ?? []),
    [w?.exercises],
  );
  const useNewLook = useMemo(
    () =>
      state && w ? isUpperStrengthMondayWorkout(w.splitId, state.workoutTemplates) : false,
    [state, w],
  );

  const liftingDoneSets = useMemo(
    () => (w ? w.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0) : 0),
    [w],
  );

  const listExtraData = useMemo(
    () => (useNewLook ? [liftingDoneSets, restTimer, restedRestSecByExerciseId] : liftingDoneSets),
    [useNewLook, liftingDoneSets, restTimer, restedRestSecByExerciseId],
  );

  if (!state || !w) return null;

  const workout = w;

  const activeRoutine = state.workoutTemplates.find((t) => t.id === workout.splitId);
  const splitDay = activeRoutine?.dayLabel;
  const weightUnit = state.unitPreferences.weightUnit;
  const doneSets = liftingDoneSets;
  const overloadTip = getFirstSessionCoachNote(state, workout) ?? progressiveOverloadInsight(workout);

  const restSheetExercise = restSheetExerciseId
    ? workout.exercises.find((e) => e.id === restSheetExerciseId)
    : null;
  const restSheetIsActive = restTimer?.exerciseId === restSheetExerciseId;
  const restSheetPhase: RestTimerPhase = restSheetIsActive
    ? restTimer!.completed
      ? "complete"
      : "running"
    : "ready";
  const restSheetPresetSec = restSheetExercise
    ? restDurationForExercise(
        restSheetExercise.name,
        restSheetExercise.label,
        state.restTimerDefaultSeconds,
        state.restTimerSecondsByExerciseKey,
      )
    : state.restTimerDefaultSeconds;

  function updateSessionTitle(text: string) {
    setFitnessState((prev) => ({
      ...prev,
      workout: { ...prev.workout, sessionTitle: text },
    }));
  }

  function reorderExercises(next: WorkoutExercise[]) {
    setFitnessState((prev) => ({
      ...prev,
      workout: { ...prev.workout, exercises: next },
    }));
  }

  function updateSet(exerciseId: string, setIndex: number, patch: Partial<{ w: number; r: number; done: boolean }>) {
    setFitnessState((prev) => ({
      ...prev,
      workout: {
        ...prev.workout,
        exercises: prev.workout.exercises.map((ex) =>
          ex.id === exerciseId
            ? {
                ...ex,
                sets: ex.sets.map((st, i) => (i === setIndex ? { ...st, ...patch } : st)),
              }
            : ex,
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

  function startRestTimer(exercise: WorkoutExercise, afterSetIndex: number) {
    const previous = restTimerRef.current;

    function durationForCompletedGap(gapIndex: number): number {
      if (previous?.exerciseId === exercise.id && previous.afterSetIndex === gapIndex) {
        return previous.durationSec;
      }
      return restDurationForExercise(
        exercise.name,
        exercise.label,
        state!.restTimerDefaultSeconds,
        state!.restTimerSecondsByExerciseKey,
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
      state!.restTimerDefaultSeconds,
      state!.restTimerSecondsByExerciseKey,
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

  function dismissCompletedRest() {
    if (restTimer?.completed) {
      markRestedAfterSet(restTimer.exerciseId, restTimer.afterSetIndex, restTimer.durationSec);
    }
    setRestTimer(null);
  }

  function openRestSheet(exerciseId: string) {
    if (restTimer?.exerciseId === exerciseId && restTimer.completed) {
      dismissCompletedRest();
      return;
    }
    setRestSheetExerciseId(exerciseId);
  }

  function toggleSetDone(
    exercise: WorkoutExercise,
    setIndex: number,
    pendingPatch?: Partial<{ w: number; r: number }>,
  ): boolean {
    const set = exercise.sets[setIndex];
    if (!set) return false;

    const historySets = previousSetsForExercise(state!.workoutHistory, exercise.name, exercise.label);
    const effective = pendingPatch ? { ...set, ...pendingPatch } : set;
    const willDone = !set.done;

    if (willDone) {
      if (!canCompleteSet(effective, exercise.sets, setIndex, historySets)) {
        Alert.alert("Empty set", "Enter weight or reps before marking this set done.");
        return false;
      }
      setFitnessState((prev) => ({
        ...prev,
        workout: {
          ...prev.workout,
          exercises: prev.workout.exercises.map((ex) =>
            ex.id === exercise.id
              ? {
                  ...ex,
                  sets: ex.sets.map((st, i) =>
                    i === setIndex
                      ? { ...st, ...buildSetCompletionPatch(effective, ex.sets, setIndex, historySets) }
                      : st,
                  ),
                }
              : ex,
          ),
        },
      }));
      startRestTimer(exercise, setIndex);
      return true;
    }

    setFitnessState((prev) => ({
      ...prev,
      workout: {
        ...prev.workout,
        exercises: prev.workout.exercises.map((ex) =>
          ex.id === exercise.id
            ? {
                ...ex,
                sets: ex.sets.map((st, i) => (i === setIndex ? { ...st, done: false } : st)),
              }
            : ex,
        ),
      },
    }));
    if (restTimer?.exerciseId === exercise.id) clearRestTimer();
    unmarkRestedFromSet(exercise.id, setIndex);
    return true;
  }

  function addSet(exerciseId: string) {
    setFitnessState((prev) => ({
      ...prev,
      workout: {
        ...prev.workout,
        exercises: prev.workout.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, sets: [...exercise.sets, { w: 0, r: 0, done: false }] }
            : exercise,
        ),
      },
    }));
  }

  function removeSet(exerciseId: string, setIndex: number) {
    if (restTimer?.exerciseId === exerciseId) {
      if (restTimer.afterSetIndex === setIndex) {
        clearRestTimer();
      } else if (restTimer.afterSetIndex > setIndex) {
        setRestTimer((current) =>
          current ? { ...current, afterSetIndex: current.afterSetIndex - 1 } : null,
        );
      }
    }
    setFitnessState((prev) => ({
      ...prev,
      workout: {
        ...prev.workout,
        exercises: prev.workout.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, sets: exercise.sets.filter((_, i) => i !== setIndex) }
            : exercise,
        ),
      },
    }));
  }

  function updateSetKind(exerciseId: string, setIndex: number, kind: WorkoutSetKind) {
    setFitnessState((prev) => ({
      ...prev,
      workout: {
        ...prev.workout,
        exercises: prev.workout.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? {
                ...exercise,
                sets: exercise.sets.map((st, i) => {
                  if (i !== setIndex) return st;
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

  function setRestPreset(exercise: WorkoutExercise, seconds: number) {
    const clamped = clampRestTimerSeconds(seconds);
    const key = exerciseNoteKey(exercise.name, exercise.label);
    setFitnessState((prev) => ({
      ...prev,
      restTimerSecondsByExerciseKey: { ...prev.restTimerSecondsByExerciseKey, [key]: clamped },
    }));
    setRestTimer((current) => {
      if (!current || current.exerciseId !== exercise.id || current.completed) return current;
      if (current.paused) {
        return { ...current, durationSec: clamped, pausedRemainingMs: clamped * 1000 };
      }
      return { ...current, durationSec: clamped, endsAtMs: Date.now() + clamped * 1000 };
    });
  }

  function adjustRestTimer(deltaSec: number) {
    setRestTimer((current) => {
      if (!current || current.completed) return current;
      const deltaMs = deltaSec * 1000;
      if (current.paused) {
        const nextRemainingMs = Math.max(
          0,
          Math.min(MAX_REST_TIMER_SECONDS * 1000, (current.pausedRemainingMs ?? 0) + deltaMs),
        );
        if (nextRemainingMs <= 0) {
          return { ...current, completed: true, paused: false, pausedRemainingMs: undefined };
        }
        return {
          ...current,
          pausedRemainingMs: nextRemainingMs,
          durationSec: Math.max(current.durationSec, Math.ceil(nextRemainingMs / 1000)),
        };
      }
      const remaining = Math.max(0, Math.ceil((current.endsAtMs - Date.now()) / 1000));
      const nextRemaining = Math.max(0, Math.min(MAX_REST_TIMER_SECONDS, remaining + deltaSec));
      if (nextRemaining <= 0) {
        return { ...current, completed: true, endsAtMs: Date.now() };
      }
      return {
        ...current,
        endsAtMs: Date.now() + nextRemaining * 1000,
        durationSec: Math.max(current.durationSec, nextRemaining),
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

  function removeExerciseFromSession(exerciseId: string) {
    if (restTimer?.exerciseId === exerciseId) clearRestTimer();
    setRestedRestSecByExerciseId((prev) => {
      if (!(exerciseId in prev)) return prev;
      const { [exerciseId]: _, ...rest } = prev;
      return rest;
    });
    setFitnessState((prev) => {
      const { [exerciseId]: _removed, ...remainingNotes } = prev.workout.sessionCoachNotesByExerciseId ?? {};
      return {
        ...prev,
        workout: {
          ...prev.workout,
          exercises: prev.workout.exercises.filter((exercise) => exercise.id !== exerciseId),
          sessionCoachNotesByExerciseId: remainingNotes,
        },
      };
    });
  }

  function swapExerciseInSession(exerciseId: string, newName: string, newLabel?: string) {
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    const trimmedLabel = newLabel?.trim();
    setFitnessState((prev) => ({
      ...prev,
      workout: {
        ...prev.workout,
        exercises: prev.workout.exercises.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;
          const setCount = exercise.sets.length;
          const fallback = parseWorkoutTarget(exercise.target).repRange;
          const next: WorkoutExercise = {
            id: exercise.id,
            name: trimmedName,
            target: defaultExerciseTarget(trimmedName, trimmedLabel, setCount, fallback),
            sets: buildSetsForExercise(trimmedName, trimmedLabel, setCount, prev.workoutHistory),
          };
          if (trimmedLabel) next.label = trimmedLabel;
          return next;
        }),
        sessionCoachNotesByExerciseId: {
          ...prev.workout.sessionCoachNotesByExerciseId,
          [exerciseId]: buildSessionCoachNoteForExercise(
            prev.workoutHistory,
            {
              id: exerciseId,
              name: trimmedName,
              ...(trimmedLabel ? { label: trimmedLabel } : {}),
              target: "",
              sets: [],
            },
            prev.onboardingProfile?.trainingStyle,
          ),
        },
      },
    }));
    setSwapExerciseId(null);
  }

  function addExerciseToSession(name: string, label?: string) {
    const trimmedLabel = label?.trim();
    setFitnessState((prev) => {
      const newExercise: WorkoutExercise = {
        id: newWorkoutExerciseId(),
        name,
        ...(trimmedLabel ? { label: trimmedLabel } : {}),
        target: defaultExerciseTarget(name, trimmedLabel, 3),
        sets: buildSetsForExercise(name, trimmedLabel, 3, prev.workoutHistory),
      };
      return {
        ...prev,
        workout: {
          ...prev.workout,
          exercises: [...prev.workout.exercises, newExercise],
          sessionCoachNotesByExerciseId: {
            ...prev.workout.sessionCoachNotesByExerciseId,
            [newExercise.id]: buildSessionCoachNoteForExercise(
              prev.workoutHistory,
              newExercise,
              prev.onboardingProfile?.trainingStyle,
            ),
          },
        },
      };
    });
  }

  function saveExerciseNote(name: string, label: string | undefined, note: string) {
    setFitnessState((prev) => ({
      ...prev,
      exerciseNotesByKey: withExerciseNote(prev.exerciseNotesByKey, name, label, note),
    }));
  }

  function deleteExerciseNote(name: string, label?: string) {
    setFitnessState((prev) => ({
      ...prev,
      exerciseNotesByKey: withExerciseNote(prev.exerciseNotesByKey, name, label, ""),
    }));
  }

  function endSessionToIdle(completed: boolean) {
    if (completed) {
      setFitnessState((prev) => {
        const result = finishWorkout(prev);
        return result ? result.state : prev;
      });
    } else {
      setFitnessState((prev) => ({
        ...prev,
        workout: {
          ...prev.workout,
          sessionPhase: "idle",
          startedAt: "-",
          sessionDayKey: null,
          sessionStartedAtMs: null,
          sessionTitle: "Workout",
          exercises: [],
          sessionCoachNotesByExerciseId: undefined,
          sessionBaselineExerciseOrder: undefined,
        },
      }));
    }
    setSearchOpen(false);
    setSwapExerciseId(null);
    setExerciseActionId(null);
    setNotesEdit(null);
    setPendingExerciseDelete(null);
    setShowEmptyFinishConfirm(false);
    setShowCancelWorkoutConfirm(false);
    clearRestTimer();
    setRestSheetExerciseId(null);
    setRestedRestSecByExerciseId({});
  }

  function requestFinishWorkout() {
    if (doneSets === 0) {
      setShowEmptyFinishConfirm(true);
      return;
    }
    endSessionToIdle(true);
  }

  function scrollToField(target: WorkoutKeypadTarget) {
    const exerciseIndex = workout.exercises.findIndex((e) => e.id === target.exerciseId);
    if (exerciseIndex < 0) return;
    listRef.current?.scrollToIndex({ index: exerciseIndex, animated: true, viewOffset: WORKOUT_KEYPAD_HEIGHT + 24 });
  }

  const swapExercise = swapExerciseId ? workout.exercises.find((e) => e.id === swapExerciseId) : null;
  const actionExercise = exerciseActionId ? workout.exercises.find((e) => e.id === exerciseActionId) : null;

  const listFooter = (
    <View className="gap-3">
      <Pressable
        testID="workout-add-exercise"
        onPress={() => setSearchOpen(true)}
        className="items-center rounded-xl border px-4 py-3"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <Text className="text-sm font-semibold" style={{ color: colors.accent }}>
          Add exercise
        </Text>
      </Pressable>
      <Text className="text-center text-[11px] font-medium" style={{ color: colors.textTertiary }}>
        Long-press the grip handle to reorder exercises.
      </Text>
    </View>
  );

  return (
    <WorkoutKeypadProvider
      exercises={workout.exercises}
      weightUnit={weightUnit}
      onUpdateSet={updateSet}
      onScrollToField={scrollToField}
      onCompleteSet={(exerciseId, setIndex, pendingPatch) => {
        const exercise = workout.exercises.find((e) => e.id === exerciseId);
        if (!exercise) return false;
        const st = exercise.sets[setIndex];
        if (!st || st.done) return false;
        return toggleSetDone(exercise, setIndex, pendingPatch);
      }}
    >
      <View testID={useNewLook ? "workout-lifting-newlook" : "workout-lifting"} className="flex-1">
        <View className="shrink-0">
          <WorkoutSessionHeader
            elapsedSec={elapsedSec}
            sessionTitle={workout.sessionTitle}
            onSessionTitleChange={updateSessionTitle}
            startedAt={workout.startedAt}
            splitDay={splitDay}
            exerciseCount={workout.exercises.length}
            onFinishWorkout={requestFinishWorkout}
            onCancel={() => setShowCancelWorkoutConfirm(true)}
            metaLayout={useNewLook ? "stacked" : "inline"}
          />
        </View>

        {isWorkoutSessionE2e && workout.exercises[0] ? (
          <Pressable
            testID="workout-e2e-complete-first-set"
            accessibilityLabel="Complete first set"
            onPress={() => {
              toggleSetDone(workout.exercises[0]!, 0);
            }}
            className="mx-4 mt-2 items-center rounded-lg border px-3 py-2"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
              E2E: mark first set done
            </Text>
          </Pressable>
        ) : null}

        {!useNewLook ? (
          <View className="shrink-0">
            <WorkoutCoachCard
              overloadTip={overloadTip}
              sessionTip={activeRoutine?.sessionTip}
              warmupGroups={sessionWarmup.groups}
              warmupTip={sessionWarmup.tip}
              defaultExpanded={
                !isWorkoutSessionE2e &&
                shouldDefaultExpandCoachCard(
                  Boolean(preWorkoutCoach),
                  workout.splitId,
                  preWorkoutCoach?.todayTemplateId,
                )
              }
            />
          </View>
        ) : null}

        {workout.exercises.length === 0 ? (
          <View
            className="mt-4 rounded-xl border p-6"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text className="text-center text-sm font-medium leading-[1.5]" style={{ color: colors.textSecondary }}>
              No exercises yet. Add exercises from a template next time.
            </Text>
          </View>
        ) : (
          <View className="mt-3 min-h-0 flex-1">
            <SortableExerciseList
              listRef={listRef}
              items={workout.exercises}
              onReorder={reorderExercises}
              listFooter={listFooter}
              extraData={listExtraData}
              onScrollToIndexFailed={({ index, averageItemLength }) => {
                listRef.current?.scrollToOffset({
                  offset: Math.max(0, averageItemLength * index),
                  animated: false,
                });
              }}
              contentContainerStyle={{
                paddingBottom: WORKOUT_KEYPAD_HEIGHT + insets.bottom + 32,
                ...(useNewLook ? { gap: 28 } : {}),
              }}
              renderItem={(exercise, index, handle, ctx) =>
                useNewLook ? (
                  <WorkoutExerciseCardFlat
                    exercise={exercise}
                    workoutHistory={state.workoutHistory}
                    unitPreferences={state.unitPreferences}
                    handle={handle}
                    restTimer={restTimer}
                    restTimerDefaultSeconds={state.restTimerDefaultSeconds}
                    restTimerSecondsByExerciseKey={state.restTimerSecondsByExerciseKey}
                    restedRestSecByAfterSetIndex={restedRestSecByExerciseId[exercise.id] ?? {}}
                    onToggleSetDone={toggleSetDone}
                    onOpenActions={() => setExerciseActionId(exercise.id)}
                    onOpenRestSheet={openRestSheet}
                    onAddSet={addSet}
                    onRemoveSet={removeSet}
                    onUpdateSetKind={updateSetKind}
                    swipeDisabled={ctx.isListDragging || handle.isDragging}
                  />
                ) : (
                  <WorkoutExerciseCard
                    exercise={exercise}
                    exerciseIndex={index}
                    workoutHistory={state.workoutHistory}
                    unitPreferences={state.unitPreferences}
                    sessionCoachNote={workout.sessionCoachNotesByExerciseId?.[exercise.id]}
                    handle={handle}
                    onToggleSetDone={toggleSetDone}
                    onOpenActions={() => setExerciseActionId(exercise.id)}
                    onRemoveSet={removeSet}
                    onUpdateSetKind={updateSetKind}
                    swipeDisabled={ctx.isListDragging || handle.isDragging}
                  />
                )
              }
            />
          </View>
        )}

        <WorkoutNumericKeypad weightUnit={weightUnit} />
      </View>

      {searchOpen ? (
        <RoutineExerciseSearchSheet
          open
          title="Add exercise"
          equipmentSetup={state.equipmentSetup}
          customExercises={state.customExercises}
          onSelect={(name, label) => addExerciseToSession(name, label)}
          onClose={() => setSearchOpen(false)}
          closeOnSelect={false}
          closeLabel="Done"
        />
      ) : null}

      {swapExercise ? (
        <ExerciseSwapSheet
          open
          equipmentSetup={state.equipmentSetup}
          currentName={swapExercise.name}
          currentLabel={swapExercise.label}
          customExercises={state.customExercises}
          onSelect={(name, label) => swapExerciseInSession(swapExercise.id, name, label)}
          onClose={() => setSwapExerciseId(null)}
        />
      ) : null}

      {actionExercise ? (
        <ExerciseActionSheet
          open
          exerciseName={actionExercise.name}
          onEditNote={() =>
            setNotesEdit({ name: actionExercise.name, label: actionExercise.label })
          }
          onEditRest={() => openRestSheet(actionExercise.id)}
          onReplace={() => setSwapExerciseId(actionExercise.id)}
          onRemove={() =>
            setPendingExerciseDelete({
              id: actionExercise.id,
              name: actionExercise.name,
              label: actionExercise.label,
            })
          }
          onClose={() => setExerciseActionId(null)}
        />
      ) : null}

      {notesEdit ? (
        <ExerciseNotesEditSheet
          open
          exerciseName={notesEdit.name}
          note={getExerciseNote(state.exerciseNotesByKey, notesEdit.name, notesEdit.label)}
          onSave={(note) => saveExerciseNote(notesEdit.name, notesEdit.label, note)}
          onDelete={() => deleteExerciseNote(notesEdit.name, notesEdit.label)}
          onClose={() => setNotesEdit(null)}
        />
      ) : null}

      {restSheetExercise ? (
        <RestTimerSheet
          open
          exerciseName={restSheetExercise.name}
          exerciseLabel={restSheetExercise.label}
          phase={restSheetPhase}
          durationSec={restSheetIsActive ? restTimer!.durationSec : restSheetPresetSec}
          endsAtMs={restSheetIsActive ? restTimer!.endsAtMs : undefined}
          paused={restSheetIsActive ? restTimer!.paused : false}
          pausedRemainingMs={restSheetIsActive ? restTimer!.pausedRemainingMs : undefined}
          selectedPresetSec={restSheetIsActive ? restTimer!.durationSec : restSheetPresetSec}
          onClose={() => setRestSheetExerciseId(null)}
          onSelectPreset={(seconds) => setRestPreset(restSheetExercise, seconds)}
          onAdjustSeconds={adjustRestTimer}
          onTogglePause={toggleRestPause}
          onRestart={restartRestTimer}
          onSkip={completeRestTimer}
          onDismiss={dismissCompletedRest}
        />
      ) : null}

      {pendingExerciseDelete ? (
        <DeleteExerciseConfirmSheet
          open
          exerciseName={pendingExerciseDelete.name}
          exerciseLabel={pendingExerciseDelete.label}
          onCancel={() => setPendingExerciseDelete(null)}
          onConfirm={() => {
            removeExerciseFromSession(pendingExerciseDelete.id);
            setPendingExerciseDelete(null);
          }}
        />
      ) : null}

      {showEmptyFinishConfirm ? (
        <EmptyFinishConfirmSheet
          open
          onKeepTraining={() => setShowEmptyFinishConfirm(false)}
          onQuit={() => endSessionToIdle(false)}
        />
      ) : null}

      {showCancelWorkoutConfirm ? (
        <CancelWorkoutConfirmSheet
          open
          onResume={() => setShowCancelWorkoutConfirm(false)}
          onCancelWorkout={() => endSessionToIdle(false)}
        />
      ) : null}
    </WorkoutKeypadProvider>
  );
}
