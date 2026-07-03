import { memo, useMemo, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { RestTimerStrip, type RestTimerStripPhase } from "@/components/workout/RestTimerStrip";
import { SetKindPickerSheet } from "@/components/workout/SetKindPickerSheet";
import { SwipeableWorkoutSetRow } from "@/components/workout/SwipeableWorkoutSetRow";
import { WorkoutSetField } from "@/components/workout/WorkoutSetField";
import { useWorkoutKeypad } from "@/components/workout/WorkoutKeypadContext";
import { ExerciseDragHandle, type ExerciseDragHandleProps } from "@/components/workout/SortableExerciseList";
import { setFieldSecondColumnLabel } from "@/lib/workout/exercisePrescriptionDefaults";
import { formatLastSessionHint } from "@/lib/workout/formatLastSessionHint";
import { restDurationForExercise } from "@/lib/workout/restTimerPreferences";
import { setColumnLabel, setKindColors } from "@/lib/workout/workoutSetKind";
import { COACH_BLUE_LABEL } from "@/lib/workoutUiTokens";
import { useWorkoutSetRejectShake, WORKOUT_SET_REJECT_COLOR } from "@/components/workout/useWorkoutSetRejectShake";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  previousSetLinesForExercise,
  previousSetsForExercise,
  sanitizeCoachCopy,
  setFieldPlaceholder,
  weightUnitLabel,
} from "@newyouai/core";
import type { CompletedWorkoutSession, UnitPreferences, WeightUnit, WorkoutExercise, WorkoutSetKind } from "@newyouai/types";

type ActiveRestTimer = {
  exerciseId: string;
  afterSetIndex: number;
  endsAtMs: number;
  durationSec: number;
  completed: boolean;
  paused?: boolean;
  pausedRemainingMs?: number;
};

type Props = {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  workoutHistory: CompletedWorkoutSession[] | undefined;
  unitPreferences: UnitPreferences;
  sessionCoachNote?: string;
  handle?: ExerciseDragHandleProps;
  restTimer: ActiveRestTimer | null;
  restTimerDefaultSeconds: number;
  restTimerSecondsByExerciseKey: Record<string, number>;
  restedRestSecByAfterSetIndex: Record<number, number>;
  rejectShakeSet: { exerciseId: string; setIndex: number } | null;
  onToggleSetDone: (exercise: WorkoutExercise, setIndex: number) => void;
  onOpenActions?: () => void;
  onOpenRestSheet: (exerciseId: string) => void;
  onRemoveSet?: (exerciseId: string, setIndex: number) => void;
  onUpdateSetKind?: (exerciseId: string, setIndex: number, kind: WorkoutSetKind) => void;
  swipeDisabled?: boolean;
};

function WorkoutExerciseCardComponent({
  exercise,
  exerciseIndex,
  workoutHistory,
  unitPreferences,
  sessionCoachNote,
  handle,
  restTimer,
  restTimerDefaultSeconds,
  restTimerSecondsByExerciseKey,
  restedRestSecByAfterSetIndex,
  rejectShakeSet,
  onToggleSetDone,
  onOpenActions,
  onOpenRestSheet,
  onRemoveSet,
  onUpdateSetKind,
  swipeDisabled,
}: Props) {
  const { colors } = useAppTheme();
  const weightUnit = unitPreferences.weightUnit;
  const [setKindPickerIndex, setSetKindPickerIndex] = useState<number | null>(null);

  const done = exercise.sets.filter((st) => st.done).length;
  const setCount = exercise.sets.length;
  const previousSets = useMemo(
    () => previousSetsForExercise(workoutHistory, exercise.name, exercise.label),
    [workoutHistory, exercise.name, exercise.label],
  );
  const previousLines = useMemo(
    () => previousSetLinesForExercise(workoutHistory, exercise.name, exercise.label, setCount, weightUnit),
    [workoutHistory, exercise.name, exercise.label, setCount, weightUnit],
  );
  const secondFieldLabel = setFieldSecondColumnLabel(exercise);
  const lastSessionHint = useMemo(
    () => formatLastSessionHint(workoutHistory, exercise.name, exercise.label, weightUnit),
    [workoutHistory, exercise.name, exercise.label, weightUnit],
  );
  const coachCopy = useMemo(
    () => (sessionCoachNote ? sanitizeCoachCopy(sessionCoachNote) : null),
    [sessionCoachNote],
  );
  const restPresetSec = restDurationForExercise(
    exercise.name,
    exercise.label,
    restTimerDefaultSeconds,
    restTimerSecondsByExerciseKey,
  );
  const isActiveRest = restTimer?.exerciseId === exercise.id;
  const activeRestAfterSetIndex = isActiveRest ? restTimer!.afterSetIndex : null;

  function stripPhase(afterSetIndex: number): RestTimerStripPhase {
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
    <View
      className="rounded-xl border p-3.5"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <View className="mb-3 flex-row items-start gap-2">
        {handle ? <ExerciseDragHandle handle={handle} tapSize={36} /> : null}
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-[11px] font-medium tabular-nums" style={{ color: colors.textTertiary }}>
              {String(exerciseIndex + 1).padStart(2, "0")}
            </Text>
            <Text className="text-[15px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
              {exercise.name}
            </Text>
            {exercise.label ? (
              <View
                className="rounded-md border px-2 py-0.5"
                style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
              >
                <Text
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: colors.textSecondary }}
                >
                  {exercise.label}
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="mt-1 text-[11px] font-normal tabular-nums" style={{ color: colors.textTertiary }}>
            Target {exercise.target} · {done}/{exercise.sets.length} sets
          </Text>
          {lastSessionHint ? (
            <Text
              testID={`workout-last-session-${exercise.id}`}
              className="mt-1.5 text-xs font-medium leading-[1.4]"
              style={{ color: colors.textSecondary }}
            >
              {lastSessionHint}
            </Text>
          ) : null}
          {coachCopy ? (
            <Text className="mt-1.5 text-xs font-medium leading-[1.45]" style={{ color: COACH_BLUE_LABEL }}>
              {coachCopy}
            </Text>
          ) : null}
        </View>
        {onOpenActions ? (
          <Pressable
            testID={`workout-exercise-${exercise.id}-menu`}
            onPress={onOpenActions}
            accessibilityLabel={`Options for ${exercise.name}`}
            className="h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 18 }}>⋮</Text>
          </Pressable>
        ) : null}
      </View>

      <View className="mb-1.5 flex-row items-center gap-1.5 px-1">
        <Text className="w-7 text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
          Set
        </Text>
        <Text className="w-[68px] text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
          Prev
        </Text>
        <Text className="flex-1 text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
          {weightUnitLabel(weightUnit)}
        </Text>
        <Text className="flex-1 text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
          {secondFieldLabel}
        </Text>
        <View className="w-11" />
      </View>

      <View className="gap-1.5">
        {exercise.sets.map((st, si) => {
          const kind = st.kind ?? "working";
          const kindVisual = setKindColors(kind === "working" ? undefined : kind);
          const { w: placeholderWeight, r: placeholderReps } = setFieldPlaceholder(
            exercise.sets,
            si,
            previousSets,
          );
          const isRejectShake =
            rejectShakeSet?.exerciseId === exercise.id && rejectShakeSet.setIndex === si;

          return (
            <WorkoutSetRow
              key={`${exercise.id}-set-${si}`}
              exercise={exercise}
              setIndex={si}
              set={st}
              kindVisual={kindVisual}
              kind={kind}
              previousLine={previousLines[si]}
              placeholderWeight={placeholderWeight}
              placeholderReps={placeholderReps}
              weightUnit={weightUnit}
              secondFieldLabel={secondFieldLabel}
              isRejectShake={isRejectShake}
              swipeDisabled={swipeDisabled}
              onRemoveSet={onRemoveSet}
              onUpdateSetKind={onUpdateSetKind ? () => setSetKindPickerIndex(si) : undefined}
              onToggleSetDone={() => onToggleSetDone(exercise, si)}
              restTimerStrip={
                <RestTimerStrip
                  phase={stripPhase(si)}
                  durationSec={
                    isActiveRest && activeRestAfterSetIndex === si ? restTimer!.durationSec : restPresetSec
                  }
                  endsAtMs={
                    isActiveRest && activeRestAfterSetIndex === si && !restTimer!.completed
                      ? restTimer!.endsAtMs
                      : undefined
                  }
                  paused={isActiveRest && activeRestAfterSetIndex === si ? restTimer!.paused : false}
                  pausedRemainingMs={
                    isActiveRest && activeRestAfterSetIndex === si ? restTimer!.pausedRemainingMs : undefined
                  }
                  displayPresetSec={stripDisplaySec(si)}
                  onPress={() => onOpenRestSheet(exercise.id)}
                />
              }
            />
          );
        })}
      </View>

      {setKindPickerIndex != null && onUpdateSetKind ? (
        <SetKindPickerSheet
          open
          selected={exercise.sets[setKindPickerIndex]?.kind ?? "working"}
          onSelect={(kind) => onUpdateSetKind(exercise.id, setKindPickerIndex, kind)}
          onClose={() => setSetKindPickerIndex(null)}
        />
      ) : null}
    </View>
  );
}

export const WorkoutExerciseCard = memo(WorkoutExerciseCardComponent);

function WorkoutSetRow({
  exercise,
  setIndex,
  set: st,
  kind,
  kindVisual,
  previousLine,
  placeholderWeight,
  placeholderReps,
  weightUnit,
  secondFieldLabel,
  isRejectShake,
  swipeDisabled,
  onRemoveSet,
  onUpdateSetKind,
  onToggleSetDone,
  restTimerStrip,
}: {
  exercise: WorkoutExercise;
  setIndex: number;
  set: WorkoutExercise["sets"][number];
  kind: WorkoutSetKind;
  kindVisual: ReturnType<typeof setKindColors>;
  previousLine: string;
  placeholderWeight: number;
  placeholderReps: number;
  weightUnit: WeightUnit;
  secondFieldLabel: "Reps" | "Sec";
  isRejectShake: boolean;
  swipeDisabled?: boolean;
  onRemoveSet?: (exerciseId: string, setIndex: number) => void;
  onUpdateSetKind?: () => void;
  onToggleSetDone: () => void;
  restTimerStrip: ReactNode;
}) {
  const { colors } = useAppTheme();
  const { animatedStyle } = useWorkoutSetRejectShake(isRejectShake);

  return (
    <View>
      <SwipeableWorkoutSetRow
        deleteLabel={`Delete set ${setIndex + 1}`}
        disabled={swipeDisabled || !onRemoveSet}
        testID={`workout-set-${exercise.id}-${setIndex}-delete`}
        onRemove={() => onRemoveSet?.(exercise.id, setIndex)}
      >
        <Animated.View
          className="flex-row items-center gap-1.5 rounded-lg px-1 py-1"
          style={[
            animatedStyle,
            { backgroundColor: st.done ? `${colors.textPrimary}0a` : colors.card },
          ]}
        >
          <Pressable
            onPress={onUpdateSetKind}
            accessibilityLabel={`Set ${setIndex + 1} type`}
            className="h-7 w-7 items-center justify-center rounded-lg border"
            style={
              kind === "working"
                ? { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }
                : {
                    borderColor: kindVisual.border,
                    backgroundColor: kindVisual.background,
                  }
            }
          >
            <Text
              className="text-[13px] font-bold tabular-nums"
              style={{ color: kind === "working" ? colors.textSecondary : kindVisual.color }}
            >
              {setColumnLabel(exercise.sets, setIndex)}
            </Text>
          </Pressable>

          <Text
            className="w-[68px] text-center text-[11px] font-medium tabular-nums leading-[1.25]"
            style={{ color: colors.textTertiary }}
          >
            {previousLine}
          </Text>

          <View className="flex-1">
            <WorkoutSetField
              exerciseId={exercise.id}
              setIndex={setIndex}
              field="weight"
              weight={st.w}
              reps={st.r}
              placeholderWeight={placeholderWeight}
              placeholderReps={placeholderReps}
              weightUnit={weightUnit}
              rejecting={isRejectShake}
            />
          </View>

          <View className="flex-1">
            <WorkoutSetField
              exerciseId={exercise.id}
              setIndex={setIndex}
              field="reps"
              weight={st.w}
              reps={st.r}
              placeholderWeight={placeholderWeight}
              placeholderReps={placeholderReps}
              weightUnit={weightUnit}
              secondFieldLabel={secondFieldLabel}
              rejecting={isRejectShake}
            />
          </View>

          <SetDoneButton
            exerciseId={exercise.id}
            setIndex={setIndex}
            done={st.done}
            rejecting={isRejectShake}
            onPress={onToggleSetDone}
          />
        </Animated.View>
      </SwipeableWorkoutSetRow>

      {restTimerStrip}
    </View>
  );
}

/**
 * Isolated so only this button re-renders when the active keypad field changes,
 * instead of re-rendering the whole exercise card on every field open/keystroke.
 */
function SetDoneButton({
  exerciseId,
  setIndex,
  done,
  rejecting,
  onPress,
}: {
  exerciseId: string;
  setIndex: number;
  done: boolean;
  rejecting?: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const { isActive, close } = useWorkoutKeypad();
  const rowActive =
    isActive({ exerciseId, setIndex, field: "weight" }) ||
    isActive({ exerciseId, setIndex, field: "reps" });
  const rejectBorder = rejecting ? WORKOUT_SET_REJECT_COLOR : undefined;

  return (
    <Pressable
      testID={`workout-set-${exerciseId}-${setIndex}-done`}
      accessibilityLabel="Done"
      onPress={() => {
        close();
        onPress();
      }}
      className="h-9 w-11 items-center justify-center rounded-full border"
      style={{
        borderColor: rejectBorder ?? (done ? colors.textPrimary : colors.border),
        backgroundColor: done ? colors.backgroundSecondary : rowActive ? colors.backgroundSecondary : "transparent",
      }}
    >
      <Text
        className="text-sm font-bold"
        style={{ color: done ? colors.textPrimary : rejecting ? WORKOUT_SET_REJECT_COLOR : colors.textTertiary }}
      >
        ✓
      </Text>
    </Pressable>
  );
}
