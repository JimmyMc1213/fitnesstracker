import type { WorkoutExercise, WorkoutRoutineTemplate } from "@newyouai/types";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { EditableNumber } from "@/components/onboarding/EditableNumber";
import { GradientCard } from "@/components/ui/GradientCard";
import { PressableScale } from "@/components/ui/PressableScale";
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
          <GradientCard
            key={routine.id}
            padding={14}
          >
            <PressableScale
              onPress={() => setExpandedId(open ? null : routine.id)}
              accessibilityRole="button"
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
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
            </PressableScale>

            {open ? (
              <View className="mt-3.5 gap-2">
                {routine.exercises.map((row) => (
                  <GradientCard
                    key={row.id}
                    radius={12}
                    padding={10}
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
                      <EditableNumber
                        value={row.sets.length}
                        label="Sets"
                        variant="row"
                        onChange={(n) => patchExercise(routine.id, row.id, { setCount: n })}
                        sanitize={(n) => Math.max(1, Math.min(10, n))}
                      />
                      <PressableScale
                        onPress={() => setSwapTarget({ routineId: routine.id, exerciseId: row.id })}
                        style={{ marginLeft: "auto" }}
                      >
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                          Swap
                        </Text>
                      </PressableScale>
                      <PressableScale
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
                      </PressableScale>
                    </View>
                  </GradientCard>
                ))}

                {swapTarget?.routineId === routine.id ? (
                  <View className="mt-2 max-h-40">
                    <Text className="mb-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
                      Pick replacement exercise
                    </Text>
                    {exerciseLibrary.slice(0, 24).map((ex) => (
                      <PressableScale
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
                        style={{
                          marginBottom: 4,
                          borderRadius: 8,
                          borderWidth: 1,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                        }}
                      >
                        <Text className="text-[13px]" style={{ color: colors.textPrimary }}>
                          {ex.name}
                        </Text>
                        <Text className="text-[11px]" style={{ color: colors.textSecondary }}>
                          {ex.label}
                        </Text>
                      </PressableScale>
                    ))}
                    <PressableScale onPress={() => setSwapTarget(null)} style={{ marginTop: 8 }}>
                      <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        Cancel swap
                      </Text>
                    </PressableScale>
                  </View>
                ) : null}
              </View>
            ) : null}
          </GradientCard>
        );
      })}
    </View>
  );
}
