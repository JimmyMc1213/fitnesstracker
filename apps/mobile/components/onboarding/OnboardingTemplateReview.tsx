import type { WorkoutExercise, WorkoutRoutineTemplate } from "@newyouai/types";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import exerciseLibrary from "@/lib/workout/exerciseLibrary";
import { estimatedSessionLabel } from "@/lib/workout/estimateSessionDuration";
import { newTemplateExerciseLine, resizeWorkoutSets } from "@/lib/workout/templateExerciseUtils";

type Props = {
  templates: WorkoutRoutineTemplate[];
  onChange: (next: WorkoutRoutineTemplate[]) => void;
};

export function OnboardingTemplateReview({ templates, onChange }: Props) {
  const { colors } = useAppTheme();
  const [expandedId, setExpandedId] = useState<string | null>(templates[0]?.id ?? null);
  const [swapTarget, setSwapTarget] = useState<{ routineId: string; exerciseId: string } | null>(null);

  function updateRoutine(routineId: string, patch: Partial<WorkoutRoutineTemplate>) {
    onChange(templates.map((t) => (t.id === routineId ? { ...t, ...patch } : t)));
  }

  function updateExercises(routineId: string, exercises: WorkoutExercise[]) {
    updateRoutine(routineId, { exercises });
  }

  function patchExercise(
    routineId: string,
    exerciseId: string,
    patch: Partial<WorkoutExercise> & { setCount?: number },
  ) {
    const routine = templates.find((t) => t.id === routineId);
    if (!routine) return;
    const exercises = routine.exercises.map((row) => {
      if (row.id !== exerciseId) return row;
      let sets = row.sets;
      if (typeof patch.setCount === "number") sets = resizeWorkoutSets(row.sets, patch.setCount);
      return { ...row, ...patch, sets };
    });
    updateExercises(routineId, exercises);
  }

  return (
    <View className="gap-3">
      {templates.map((routine) => {
        const open = expandedId === routine.id;
        const sessionEstimate = routine.exercises.length > 0 ? estimatedSessionLabel(routine) : null;

        return (
          <View
            key={routine.id}
            className="rounded-2xl border p-3.5"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Pressable
              onPress={() => setExpandedId(open ? null : routine.id)}
              accessibilityRole="button"
              className="flex-row items-center justify-between"
            >
              <View className="flex-1 pr-3">
                <Text className="text-[15px] font-bold" style={{ color: colors.textPrimary }}>
                  {routine.dayLabel} · {routine.name}
                </Text>
                <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                  {routine.focus}
                </Text>
                {sessionEstimate ? (
                  <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                    {sessionEstimate}
                  </Text>
                ) : null}
              </View>
              <Text className="text-xl" style={{ color: colors.textSecondary }}>
                {open ? "−" : "+"}
              </Text>
            </Pressable>

            {open ? (
              <View className="mt-3.5 gap-2">
                {routine.exercises.map((row) => (
                  <View
                    key={row.id}
                    className="rounded-xl border p-2.5"
                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                  >
                    <Text className="mb-1.5 text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      {row.name}
                    </Text>
                    <TextInput
                      value={row.target}
                      onChangeText={(target) => patchExercise(routine.id, row.id, { target })}
                      placeholder="Target"
                      placeholderTextColor={colors.textSecondary}
                      className="rounded-lg border px-2.5 py-2 text-[13px]"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                        color: colors.textPrimary,
                      }}
                    />
                    <View className="mt-2 flex-row items-center gap-2">
                      <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        Sets
                      </Text>
                      <TextInput
                        value={String(row.sets.length)}
                        onChangeText={(raw) => {
                          const n = parseInt(raw, 10);
                          if (Number.isFinite(n)) patchExercise(routine.id, row.id, { setCount: n });
                        }}
                        keyboardType="number-pad"
                        className="w-14 rounded-lg border px-2 py-1.5 text-center text-[13px]"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                          color: colors.textPrimary,
                        }}
                      />
                      <Pressable
                        onPress={() => setSwapTarget({ routineId: routine.id, exerciseId: row.id })}
                        className="ml-auto"
                      >
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                          Swap
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          updateExercises(
                            routine.id,
                            routine.exercises.filter((e) => e.id !== row.id),
                          )
                        }
                      >
                        <Text className="text-xs" style={{ color: "#ff6b6b" }}>
                          Remove
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}

                {swapTarget?.routineId === routine.id ? (
                  <View className="mt-2 max-h-40">
                    <Text className="mb-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
                      Pick replacement exercise
                    </Text>
                    {exerciseLibrary.slice(0, 24).map((ex) => (
                      <Pressable
                        key={ex.id}
                        onPress={() => {
                          const replacement = newTemplateExerciseLine(ex.name, { label: ex.label });
                          updateExercises(
                            routine.id,
                            routine.exercises.map((e) =>
                              e.id === swapTarget.exerciseId ? { ...replacement, id: e.id } : e,
                            ),
                          );
                          setSwapTarget(null);
                        }}
                        className="mb-1 rounded-lg border px-2.5 py-2"
                        style={{ borderColor: colors.border, backgroundColor: colors.background }}
                      >
                        <Text className="text-[13px]" style={{ color: colors.textPrimary }}>
                          {ex.name}
                        </Text>
                        <Text className="text-[11px]" style={{ color: colors.textSecondary }}>
                          {ex.label}
                        </Text>
                      </Pressable>
                    ))}
                    <Pressable onPress={() => setSwapTarget(null)} className="mt-2">
                      <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        Cancel swap
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
