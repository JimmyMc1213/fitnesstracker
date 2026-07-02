import { Pressable, Text, View } from "react-native";
import { useState } from "react";

import { SetKindPickerSheet } from "@/components/workout/SetKindPickerSheet";
import { SwipeableWorkoutSetRow } from "@/components/workout/SwipeableWorkoutSetRow";
import { WorkoutSetField } from "@/components/workout/WorkoutSetField";
import { useWorkoutKeypad } from "@/components/workout/WorkoutKeypadContext";
import { ExerciseDragHandle, type ExerciseDragHandleProps } from "@/components/workout/SortableExerciseList";
import { setFieldSecondColumnLabel } from "@/lib/workout/exercisePrescriptionDefaults";
import { formatLastSessionHint } from "@/lib/workout/formatLastSessionHint";
import { setColumnLabel, setKindColors } from "@/lib/workout/workoutSetKind";
import { COACH_BLUE_LABEL } from "@/lib/workoutUiTokens";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  previousSetLinesForExercise,
  previousSetsForExercise,
  sanitizeCoachCopy,
  setFieldPlaceholder,
  weightUnitLabel,
} from "@newyouai/core";
import type { CompletedWorkoutSession, UnitPreferences, WorkoutExercise, WorkoutSetKind } from "@newyouai/types";

type Props = {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  workoutHistory: CompletedWorkoutSession[] | undefined;
  unitPreferences: UnitPreferences;
  sessionCoachNote?: string;
  handle?: ExerciseDragHandleProps;
  onToggleSetDone: (exercise: WorkoutExercise, setIndex: number) => void;
  onOpenActions?: () => void;
  onRemoveSet?: (exerciseId: string, setIndex: number) => void;
  onUpdateSetKind?: (exerciseId: string, setIndex: number, kind: WorkoutSetKind) => void;
  swipeDisabled?: boolean;
};

export function WorkoutExerciseCard({
  exercise,
  exerciseIndex,
  workoutHistory,
  unitPreferences,
  sessionCoachNote,
  handle,
  onToggleSetDone,
  onOpenActions,
  onRemoveSet,
  onUpdateSetKind,
  swipeDisabled,
}: Props) {
  const { colors } = useAppTheme();
  const keypad = useWorkoutKeypad();
  const weightUnit = unitPreferences.weightUnit;
  const [setKindPickerIndex, setSetKindPickerIndex] = useState<number | null>(null);

  const done = exercise.sets.filter((st) => st.done).length;
  const previousSets = previousSetsForExercise(workoutHistory, exercise.name, exercise.label);
  const previousLines = previousSetLinesForExercise(
    workoutHistory,
    exercise.name,
    exercise.label,
    exercise.sets.length,
    weightUnit,
  );
  const secondFieldLabel = setFieldSecondColumnLabel(exercise);
  const lastSessionHint = formatLastSessionHint(workoutHistory, exercise.name, exercise.label, weightUnit);
  const coachCopy = sessionCoachNote ? sanitizeCoachCopy(sessionCoachNote) : null;

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
            <Text className="text-[15px] font-semibold tracking-tight" style={{ color: colors.accent }}>
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
          const weightActive = keypad.isActive({ exerciseId: exercise.id, setIndex: si, field: "weight" });
          const repsActive = keypad.isActive({ exerciseId: exercise.id, setIndex: si, field: "reps" });

          return (
            <SwipeableWorkoutSetRow
              key={`${exercise.id}-set-${si}`}
              deleteLabel={`Delete set ${si + 1}`}
              disabled={swipeDisabled || !onRemoveSet}
              testID={`workout-set-${exercise.id}-${si}-delete`}
              onRemove={() => onRemoveSet?.(exercise.id, si)}
            >
              <View
                className="flex-row items-center gap-1.5 rounded-lg px-1 py-1"
                style={{
                  backgroundColor: st.done ? `${colors.accent}14` : colors.card,
                }}
              >
              <Pressable
                onPress={() => onUpdateSetKind && setSetKindPickerIndex(si)}
                accessibilityLabel={`Set ${si + 1} type`}
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
                  {setColumnLabel(exercise.sets, si)}
                </Text>
              </Pressable>

              <Text
                className="w-[68px] text-center text-[11px] font-medium tabular-nums leading-[1.25]"
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
                className="h-9 w-11 items-center justify-center rounded-full border"
                style={{
                  borderColor: st.done ? colors.accent : colors.border,
                  backgroundColor: st.done ? colors.accent : weightActive || repsActive ? colors.backgroundSecondary : "transparent",
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
