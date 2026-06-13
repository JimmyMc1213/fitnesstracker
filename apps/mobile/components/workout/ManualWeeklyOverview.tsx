import { weekdayFullName } from "@newyouai/core";
import type { WorkoutRoutineTemplate } from "@newyouai/types";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type ManualWeeklyOverviewProps = {
  templates: WorkoutRoutineTemplate[];
  onEditDay: (index: number) => void;
};

function exerciseSummary(count: number): string {
  if (count === 0) return "No exercises yet";
  return `${count} exercise${count === 1 ? "" : "s"}`;
}

export function ManualWeeklyOverview({ templates, onEditDay }: ManualWeeklyOverviewProps) {
  const { colors } = useAppTheme();

  return (
    <View className="gap-2.5">
      {templates.map((template, index) => (
        <Pressable
          key={template.id}
          onPress={() => onEditDay(index)}
          className="rounded-2xl border p-4"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text className="text-base font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                {weekdayFullName(template.dayLabel)} · {template.name}
              </Text>
              <Text className="mt-1.5 text-[13px] font-medium" style={{ color: colors.textSecondary }}>
                {exerciseSummary(template.exercises.length)}
              </Text>
            </View>
            <Text style={{ color: colors.textTertiary, fontSize: 18 }}>›</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
