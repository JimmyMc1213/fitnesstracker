import { planWeekIndex } from "@newyouai/core";
import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import { isMobilityHabit } from "@/lib/mobilityHabit";
import { isActionHabit, isWeighInActionHabit } from "@/lib/habits";
import { MOBILITY_ACCENT, MOBILITY_BG, MOBILITY_BORDER } from "@/lib/workoutUiTokens";
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
  const canEdit = !readOnly && Boolean(onSaveHabitTemplates);

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
          <MobilityRoutineCard
            habit={mobilityHabit}
            readOnly={readOnly}
            onPress={onMobilityPress}
          />
        </View>
      ) : null}

      {displayHabits.length > 0 ? (
        <View className={mobilityHabit ? "mt-[22px]" : "mt-7"}>
          <View className="mb-3 flex-row items-baseline justify-between gap-2">
            <Text
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: colors.textTertiary }}
            >
              Daily habits
            </Text>
            <View className="flex-row items-baseline gap-2.5">
              {canEdit ? (
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
      ) : null}
    </View>
  );
}

function MobilityRoutineCard({
  habit,
  readOnly,
  onPress,
}: {
  habit: Habit;
  readOnly: boolean;
  onPress?: () => void;
}) {
  const { colors } = useAppTheme();
  const subtitle = habit.done
    ? "Routine complete for today"
    : habit.subtitle?.trim() || "~15 min stretch · complete all moves";

  return (
    <Pressable
      onPress={onPress}
      disabled={readOnly}
      testID="habit-mobility"
      accessibilityLabel={habit.done ? "Open mobility routine" : "Start mobility routine"}
      className="rounded-xl border p-4"
      style={{
        borderColor: habit.done ? "rgba(196,181,253,0.42)" : MOBILITY_BORDER,
        backgroundColor: MOBILITY_BG,
        opacity: readOnly ? 0.72 : 1,
      }}
    >
      <View className="flex-row items-start gap-3.5">
        <View
          className="h-10 w-10 items-center justify-center rounded-xl border"
          style={{
            borderColor: "rgba(196,181,253,0.22)",
            backgroundColor: habit.done ? "rgba(196,181,253,0.18)" : "rgba(196,181,253,0.12)",
          }}
        >
          <SymbolView
            name={{ ios: "figure.cooldown", android: "self_improvement", web: "self_improvement" }}
            tintColor={MOBILITY_ACCENT}
            size={22}
          />
        </View>
        <View className="min-w-0 flex-1">
          <View className="mb-1.5 flex-row flex-wrap items-center gap-2">
            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MOBILITY_ACCENT }}>
              Guided routine
            </Text>
            {habit.done ? (
              <View
                className="rounded-full border px-1.5 py-0.5"
                style={{ borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.06)" }}
              >
                <Text className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary }}>
                  Done
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="text-[15px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
            {habit.name}
          </Text>
          <Text className="mt-1 text-xs leading-[1.45]" style={{ color: colors.textSecondary }}>
            {subtitle}
          </Text>
          {!readOnly ? (
            <View className="mt-3 flex-row items-center gap-1.5">
              <Text className="text-xs font-semibold" style={{ color: MOBILITY_ACCENT }}>
                {habit.done ? "Open routine" : "Start routine"}
              </Text>
              <Text style={{ color: MOBILITY_ACCENT }}>›</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
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
    drop: "💧",
    droplet: "💧",
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
