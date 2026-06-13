import { useMemo, useRef, useState, type ElementRef } from "react";
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
import {
  ExerciseDragHandle,
  SortableExerciseList,
  type ExerciseDragHandleProps,
} from "@/components/workout/SortableExerciseList";
import { WorkoutCoachCard } from "@/components/workout/WorkoutCoachCard";
import { WorkoutExerciseCard } from "@/components/workout/WorkoutExerciseCard";
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

function SortableExerciseCard({
  exercise,
  exerciseIndex,
  workoutHistory,
  unitPreferences,
  sessionCoachNote,
  handle,
  onToggleSetDone,
  onOpenActions,
  onUpdateSetKind,
}: {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  workoutHistory: CompletedWorkoutSession[] | undefined;
  unitPreferences: UnitPreferences;
  sessionCoachNote?: string;
  handle: ExerciseDragHandleProps;
  onToggleSetDone: (exercise: WorkoutExercise, setIndex: number) => boolean;
  onOpenActions: () => void;
  onUpdateSetKind: (exerciseId: string, setIndex: number, kind: WorkoutSetKind) => void;
}) {
  return (
    <View>
      <View className="absolute left-0 top-3 z-10">
        <ExerciseDragHandle handle={handle} />
      </View>
      <View className="pl-8">
        <WorkoutExerciseCard
          exercise={exercise}
          exerciseIndex={exerciseIndex}
          workoutHistory={workoutHistory}
          unitPreferences={unitPreferences}
          sessionCoachNote={sessionCoachNote}
          onToggleSetDone={(ex, idx) => {
            void onToggleSetDone(ex, idx);
          }}
          onOpenActions={onOpenActions}
          onUpdateSetKind={onUpdateSetKind}
        />
      </View>
    </View>
  );
}

function newWorkoutExerciseId(): string {
  return `e${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function WorkoutLiftingSlot() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { state, setFitnessState } = useFitnessState();
  const listRef = useRef<ElementRef<typeof DraggableFlatList<WorkoutExercise>> | null>(null);
  const restTimerRef = useRef<ActiveRestTimer | null>(null);

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

  restTimerRef.current = restTimer;

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

  if (!state || !w) return null;

  const workout = w;

  const activeRoutine = state.workoutTemplates.find((t) => t.id === workout.splitId);
  const splitDay = activeRoutine?.dayLabel;
  const weightUnit = state.unitPreferences.weightUnit;
  const doneSets = workout.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
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

  function startRestTimer(exercise: WorkoutExercise, afterSetIndex: number) {
    const previous = restTimerRef.current;
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
    void previous;
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
    setRestTimer(null);
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
    return true;
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
      <View testID="workout-lifting" className="flex-1">
        <WorkoutSessionHeader
          elapsedSec={elapsedSec}
          sessionTitle={workout.sessionTitle}
          onSessionTitleChange={updateSessionTitle}
          startedAt={workout.startedAt}
          splitDay={splitDay}
          exerciseCount={workout.exercises.length}
          onFinishWorkout={requestFinishWorkout}
          onCancel={() => setShowCancelWorkoutConfirm(true)}
        />

        <WorkoutCoachCard
          overloadTip={overloadTip}
          sessionTip={activeRoutine?.sessionTip}
          warmupGroups={sessionWarmup.groups}
          warmupTip={sessionWarmup.tip}
          defaultExpanded={shouldDefaultExpandCoachCard(
            Boolean(preWorkoutCoach),
            workout.splitId,
            preWorkoutCoach?.todayTemplateId,
          )}
        />

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
          <View className="mt-4 min-h-0 flex-1">
            <SortableExerciseList
              listRef={listRef}
              items={workout.exercises}
              onReorder={reorderExercises}
              listFooter={listFooter}
              extraData={doneSets}
              contentContainerStyle={{ paddingBottom: WORKOUT_KEYPAD_HEIGHT + insets.bottom + 32 }}
              renderItem={(exercise, index, handle) => (
                <SortableExerciseCard
                  exercise={exercise}
                  exerciseIndex={index}
                  workoutHistory={state.workoutHistory}
                  unitPreferences={state.unitPreferences}
                  sessionCoachNote={workout.sessionCoachNotesByExerciseId?.[exercise.id]}
                  handle={handle}
                  onToggleSetDone={toggleSetDone}
                  onOpenActions={() => setExerciseActionId(exercise.id)}
                  onUpdateSetKind={updateSetKind}
                />
              )}
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
          onEditRest={() => setRestSheetExerciseId(actionExercise.id)}
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
