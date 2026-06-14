import { planWeekIndex } from "@newyouai/core";
import { Pressable, Text, View } from "react-native";

import { isMobilityHabit } from "@/lib/mobilityHabit";
import { isActionHabit, isWeighInActionHabit } from "@/lib/habits";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { Habit, HabitTemplate } from "@newyouai/types";

type Props = {
  habits: Habit[];
  dailyHabitTemplates: HabitTemplate[];
  stepsTarget: number;
  planStartIso: string;
  dateKey: string;
  readOnly?: boolean;
  onToggle: (id: string) => void;
  onMobilityPress?: () => void;
  onOpenWeighIn?: () => void;
  onSaveHabitTemplates?: (templates: HabitTemplate[]) => void;
};

export function HomeDailyHabitsCard({
  habits,
  dailyHabitTemplates,
  stepsTarget,
  planStartIso,
  dateKey,
  readOnly = false,
  onToggle,
  onMobilityPress,
  onOpenWeighIn,
  onSaveHabitTemplates,
}: Props) {
  const { colors } = useAppTheme();
  const mobilityHabit = habits.find((h) => isMobilityHabit(h.id));
  const displayHabits = habits.filter((h) => !isMobilityHabit(h.id));
  const progWeek = planWeekIndex(new Date(`${dateKey}T12:00:00`), planStartIso);
  const doneCount = displayHabits.filter((h) => h.done).length;

  if (habits.length === 0 && dailyHabitTemplates.length === 0) return null;

  return (
    <View testID="home-daily-habits">
      {mobilityHabit ? (
        <View className="mt-7">
          <Text
            className="mb-3 text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textTertiary }}
          >
            Mobility
          </Text>
          <Pressable
            onPress={onMobilityPress}
            disabled={readOnly}
            testID="habit-mobility"
            className="rounded-xl border p-4"
            style={{ borderColor: "rgba(196,181,253,0.42)", backgroundColor: "rgba(196,181,253,0.08)" }}
          >
            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#a78bfa" }}>
              Guided routine
            </Text>
            <Text className="mt-1.5 text-[15px] font-bold" style={{ color: colors.textPrimary }}>
              {mobilityHabit.name}
            </Text>
            <Text className="mt-1 text-xs leading-[1.45]" style={{ color: colors.textSecondary }}>
              {mobilityHabit.done ? "Routine complete for today" : (mobilityHabit.subtitle ?? "Stretch routine ~15 min")}
            </Text>
            {!readOnly ? (
              <View className="mt-3 flex-row items-center gap-1.5">
                <Text className="text-xs font-semibold" style={{ color: "#a78bfa" }}>
                  {mobilityHabit.done ? "Open routine" : "Start routine"}
                </Text>
                <Text className="text-xs font-semibold" style={{ color: "#a78bfa" }}>
                  ›
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      ) : null}

      <View className="mt-7">
        <View className="mb-3 flex-row items-baseline justify-between">
          <Text
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textTertiary }}
          >
            Daily habits
          </Text>
          <View className="flex-row items-baseline gap-2.5">
            {onSaveHabitTemplates ? (
              <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                Edit
              </Text>
            ) : null}
            <Text className="text-xs font-medium tabular-nums" style={{ color: colors.textSecondary }}>
              {doneCount}/{displayHabits.length}
            </Text>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          {displayHabits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              stepsTarget={stepsTarget}
              progWeek={progWeek}
              readOnly={readOnly}
              onToggle={onToggle}
              onOpenWeighIn={onOpenWeighIn}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function HabitRow({
  habit,
  stepsTarget,
  progWeek,
  readOnly,
  onToggle,
  onOpenWeighIn,
}: {
  habit: Habit;
  stepsTarget: number;
  progWeek: number;
  readOnly: boolean;
  onToggle: (id: string) => void;
  onOpenWeighIn?: () => void;
}) {
  const { colors } = useAppTheme();
  const actionHabit = isActionHabit(habit);
  const subtitle = habitSubtitle(habit, stepsTarget, progWeek);

  const content = (
    <View className="min-h-[64px] flex-row items-center gap-3 rounded-xl border p-3.5" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
      <View
        className="h-10 w-10 items-center justify-center rounded-[10px]"
        style={{ backgroundColor: habit.done ? "rgba(255,255,255,0.08)" : colors.backgroundSecondary }}
      >
        <Text className="text-base">{habitIconEmoji(habit.icon)}</Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text className="mb-0.5 text-sm font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
          {habit.name}
        </Text>
        <Text className="text-xs leading-[1.35]" style={{ color: colors.textTertiary }}>
          {subtitle}
        </Text>
      </View>
      {actionHabit ? (
        habit.done ? (
          <Text style={{ color: colors.accent }}>✓</Text>
        ) : (
          <Text style={{ color: colors.textTertiary }}>›</Text>
        )
      ) : (
        <Pressable
          onPress={() => onToggle(habit.id)}
          disabled={readOnly}
          testID={`habit-toggle-${habit.id}`}
          accessibilityLabel={habit.done ? "Mark incomplete" : "Mark complete"}
          className="h-[22px] w-10 justify-center rounded-full px-0.5"
          style={{ backgroundColor: habit.done ? colors.accent : colors.border }}
        >
          <View
            className="h-[18px] w-[18px] rounded-full"
            style={{
              backgroundColor: colors.background,
              alignSelf: habit.done ? "flex-end" : "flex-start",
            }}
          />
        </Pressable>
      )}
    </View>
  );

  if (actionHabit && !readOnly) {
    return (
      <Pressable
        onPress={() => {
          if (isWeighInActionHabit(habit)) onOpenWeighIn?.();
        }}
        testID={`habit-action-${habit.id}`}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

function habitSubtitle(habit: Habit, stepsTarget: number, progWeek: number): string {
  if (habit.done) return "Done";
  if (habit.subtitle?.trim()) return habit.subtitle.trim();
  if (habit.icon === "run") return `${stepsTarget.toLocaleString()} steps · Week ${progWeek}`;
  return "Not yet today";
}

function habitIconEmoji(icon: string): string {
  const map: Record<string, string> = {
    droplet: "💧",
    drop: "💧",
    run: "👟",
    pill: "💊",
    moon: "🌙",
    scale: "⚖️",
    sun: "☀️",
    ban: "🚫",
    bolt: "⚡",
    food: "🍽️",
    protein: "🥩",
  };
  return map[icon] ?? "✓";
}
