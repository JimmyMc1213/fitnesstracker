import { weekdayFullName } from "@newyouai/core";
import type { WorkoutRoutineTemplate } from "@newyouai/types";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

const PREVIEW_EXERCISE_COUNT = 4;

export function OnboardingSplitReveal({ templates }: { templates: WorkoutRoutineTemplate[] }) {
  const { colors } = useAppTheme();

  return (
    <View className="gap-3">
      {templates.map((routine) => {
        const preview = routine.exercises.slice(0, PREVIEW_EXERCISE_COUNT);
        const remaining = routine.exercises.length - preview.length;

        return (
          <View
            key={routine.id}
            className="rounded-2xl border p-4"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
            testID={`onboarding-split-card-${routine.dayLabel}`}
          >
            <Text className="text-base font-bold" style={{ color: colors.textPrimary }}>
              {weekdayFullName(routine.dayLabel)} · {routine.name}
            </Text>
            {routine.estimatedMinutes != null && routine.estimatedMinutes > 0 ? (
              <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                ~{routine.estimatedMinutes} min
              </Text>
            ) : null}
            {preview.length > 0 ? (
              <View className="mt-3 gap-1">
                {preview.map((ex) => (
                  <Text key={ex.id} className="text-sm" style={{ color: colors.textSecondary }}>
                    • {ex.name}
                  </Text>
                ))}
              </View>
            ) : null}
            {remaining > 0 ? (
              <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                +{remaining} more
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
