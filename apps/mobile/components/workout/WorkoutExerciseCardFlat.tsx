import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { RestTimerStrip, type RestTimerStripPhase } from "@/components/workout/RestTimerStrip";
import { SetKindPickerSheet } from "@/components/workout/SetKindPickerSheet";
import { SwipeableWorkoutSetRow } from "@/components/workout/SwipeableWorkoutSetRow";
import { WorkoutSetField } from "@/components/workout/WorkoutSetField";
import { useWorkoutKeypad } from "@/components/workout/WorkoutKeypadContext";
import { ExerciseDragHandle, type ExerciseDragHandleProps } from "@/components/workout/SortableExerciseList";
import { setFieldSecondColumnLabel } from "@/lib/workout/exercisePrescriptionDefaults";
import { formatFlatExerciseTitle } from "@/lib/workout/workoutNewLook";
import { restDurationForExercise } from "@/lib/workout/restTimerPreferences";
import { setColumnLabel, setKindColors } from "@/lib/workout/workoutSetKind";
import { WORKOUT_ACCENT, WORKOUT_ACCENT_BG, WORKOUT_ACCENT_BORDER } from "@/lib/workoutUiTokens";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  previousSetLinesForExercise,
  previousSetsForExercise,
  setFieldPlaceholder,
  weightUnitLabel,
} from "@newyouai/core";
import type { CompletedWorkoutSession, UnitPreferences, WorkoutExercise, WorkoutSetKind } from "@newyouai/types";

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
  workoutHistory: CompletedWorkoutSession[] | undefined;
  unitPreferences: UnitPreferences;
  handle?: ExerciseDragHandleProps;
  restTimer: ActiveRestTimer | null;
  restTimerDefaultSeconds: number;
  restTimerSecondsByExerciseKey: Record<string, number>;
  restedRestSecByAfterSetIndex: Record<number, number>;
  onToggleSetDone: (exercise: WorkoutExercise, setIndex: number) => void;
  onOpenActions?: () => void;
  onOpenRestSheet: (exerciseId: string) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet?: (exerciseId: string, setIndex: number) => void;
  onUpdateSetKind?: (exerciseId: string, setIndex: number, kind: WorkoutSetKind) => void;
  swipeDisabled?: boolean;
};

export function WorkoutExerciseCardFlat({
  exercise,
  workoutHistory,
  unitPreferences,
  handle,
  restTimer,
  restTimerDefaultSeconds,
  restTimerSecondsByExerciseKey,
  restedRestSecByAfterSetIndex,
  onToggleSetDone,
  onOpenActions,
  onOpenRestSheet,
  onAddSet,
  onRemoveSet,
  onUpdateSetKind,
  swipeDisabled,
}: Props) {
  const { colors } = useAppTheme();
  const keypad = useWorkoutKeypad();
  const weightUnit = unitPreferences.weightUnit;
  const [setKindPickerIndex, setSetKindPickerIndex] = useState<number | null>(null);

  const previousSets = previousSetsForExercise(workoutHistory, exercise.name, exercise.label);
  const previousLines = previousSetLinesForExercise(
    workoutHistory,
    exercise.name,
    exercise.label,
    exercise.sets.length,
    weightUnit,
  );
  const secondFieldLabel = setFieldSecondColumnLabel(exercise);
  const restPresetSec = restDurationForExercise(
    exercise.name,
    exercise.label,
    restTimerDefaultSeconds,
    restTimerSecondsByExerciseKey,
  );
  const title = formatFlatExerciseTitle(exercise.name, exercise.label);
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
    <View testID={`workout-exercise-flat-${exercise.id}`}>
      <View className="mb-3 flex-row items-start gap-2">
        {handle ? <ExerciseDragHandle handle={handle} tapSize={32} /> : null}
        <Text className="min-w-0 flex-1 text-[17px] font-semibold leading-[1.25] tracking-tight" style={{ color: WORKOUT_ACCENT }}>
          {title}
        </Text>
        {onOpenActions ? (
          <Pressable
            testID={`workout-exercise-${exercise.id}-menu`}
            onPress={onOpenActions}
            accessibilityLabel={`Options for ${exercise.name}`}
            className="h-8 w-8 items-center justify-center rounded-lg border"
            style={{
              borderColor: WORKOUT_ACCENT_BORDER,
              backgroundColor: WORKOUT_ACCENT_BG,
            }}
          >
            <Text style={{ color: WORKOUT_ACCENT, fontSize: 16, fontWeight: 700, lineHeight: 16 }}>···</Text>
          </Pressable>
        ) : null}
      </View>

      <View className="mb-2 flex-row items-center gap-1.5 px-0.5">
        <Text className="w-8 text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
          Set
        </Text>
        <Text className="w-[72px] text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
          Previous
        </Text>
        <Text className="flex-1 text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
          {weightUnitLabel(weightUnit)}
        </Text>
        <Text className="flex-1 text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
          {secondFieldLabel}
        </Text>
        <View className="w-10 items-center">
          <Text className="text-[11px] font-semibold" style={{ color: colors.textTertiary }}>
            ✓
          </Text>
        </View>
      </View>

      <View>
        {exercise.sets.map((st, si) => {
          const kind = st.kind ?? "working";
          const kindVisual = setKindColors(kind === "working" ? undefined : kind);
          const { w: placeholderWeight, r: placeholderReps } = setFieldPlaceholder(
            exercise.sets,
            si,
            previousSets,
          );

          return (
            <View key={`${exercise.id}-set-${si}`}>
              <SwipeableWorkoutSetRow
                deleteLabel={`Delete set ${si + 1}`}
                disabled={swipeDisabled || !onRemoveSet}
                testID={`workout-set-${exercise.id}-${si}-delete`}
                onRemove={() => onRemoveSet?.(exercise.id, si)}
              >
                <View className="flex-row items-center gap-1.5 py-1">
                <Pressable
                  onPress={() => onUpdateSetKind && setSetKindPickerIndex(si)}
                  accessibilityLabel={`Set ${si + 1} type`}
                  className="h-8 w-8 items-center justify-center rounded-lg border"
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
                    style={{ color: kind === "working" ? colors.textPrimary : kindVisual.color }}
                  >
                    {setColumnLabel(exercise.sets, si)}
                  </Text>
                </Pressable>

                <Text
                  className="w-[72px] text-center text-[11px] font-medium tabular-nums leading-[1.25]"
                  style={{ color: colors.textTertiary }}
                >
                  {previousLines[si]}
                </Text>

                <View className="flex-1">
                  <WorkoutSetField
                    exerciseId={exercise.id}
                    setIndex={si}
                    field="weight"
                    weight={st.w}
                    reps={st.r}
                    placeholderWeight={placeholderWeight}
                    placeholderReps={placeholderReps}
                    weightUnit={weightUnit}
                    onPress={() => keypad.openField({ exerciseId: exercise.id, setIndex: si, field: "weight" })}
                  />
                </View>

                <View className="flex-1">
                  <WorkoutSetField
                    exerciseId={exercise.id}
                    setIndex={si}
                    field="reps"
                    weight={st.w}
                    reps={st.r}
                    placeholderWeight={placeholderWeight}
                    placeholderReps={placeholderReps}
                    weightUnit={weightUnit}
                    secondFieldLabel={secondFieldLabel}
                    onPress={() => keypad.openField({ exerciseId: exercise.id, setIndex: si, field: "reps" })}
                  />
                </View>

                <Pressable
                  testID={`workout-set-${exercise.id}-${si}-done`}
                  accessibilityLabel="Done"
                  onPress={() => onToggleSetDone(exercise, si)}
                  className="h-9 w-10 items-center justify-center rounded-lg border"
                  style={{
                    borderColor: st.done ? colors.accent : colors.border,
                    backgroundColor: st.done ? colors.accent : colors.backgroundSecondary,
                  }}
                >
                  <Text
                    className="text-sm font-bold"
                    style={{ color: st.done ? colors.background : colors.textTertiary }}
                  >
                    ✓
                  </Text>
                </Pressable>
                </View>
              </SwipeableWorkoutSetRow>

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
            </View>
          );
        })}
      </View>

      <Pressable
        testID={`workout-exercise-${exercise.id}-add-set`}
        onPress={() => onAddSet(exercise.id)}
        accessibilityRole="button"
        accessibilityLabel="Add set"
        className="mt-4 self-center rounded-full px-5 py-2"
        style={{
          width: "50%",
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.backgroundSecondary,
        }}
      >
        <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
          Add set
        </Text>
      </Pressable>

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
