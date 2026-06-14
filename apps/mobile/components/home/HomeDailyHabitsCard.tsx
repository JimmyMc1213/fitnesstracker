import { planWeekIndex } from "@newyouai/core";
import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AddHabitSheet } from "@/components/home/AddHabitSheet";
import {
  IconCheck,
  IconChevR,
  IconMinus,
  IconMobilityRunner,
  IconPlus,
} from "@/components/icons/FitnessIcons";
import { ExerciseDragHandle, SortableExerciseList } from "@/components/workout/SortableExerciseList";
import { isMobilityHabit } from "@/lib/mobilityHabit";
import { isActionHabit, isWeighInActionHabit } from "@/lib/habits";
import { habitIconComponent } from "@/lib/habitIcons";
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
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<HabitTemplate[]>([]);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const mobilityHabit = habits.find((h) => isMobilityHabit(h.id));
  const displayHabits = habits.filter((h) => !isMobilityHabit(h.id));
  const progWeek = planWeekIndex(new Date(`${dateKey}T12:00:00`), planStartIso);
  const doneCount = displayHabits.filter((h) => h.done).length;
  const canEdit = !readOnly && Boolean(onSaveHabitTemplates);

  const editHabits = useMemo(() => {
    if (!editMode) return displayHabits;
    const doneMap = Object.fromEntries(displayHabits.map((h) => [h.id, h.done]));
    return editDraft.map((t) => ({ ...t, done: Boolean(doneMap[t.id]) }));
  }, [displayHabits, editDraft, editMode]);

  const enterEditMode = useCallback(() => {
    setEditDraft(dailyHabitTemplates);
    setRemovingIds(new Set());
    setEditMode(true);
  }, [dailyHabitTemplates]);

  const exitEditMode = useCallback(
    (save: boolean) => {
      if (save && onSaveHabitTemplates) {
        onSaveHabitTemplates(editDraft);
      }
      setEditMode(false);
      setEditDraft([]);
      setRemovingIds(new Set());
      setAddSheetOpen(false);
    },
    [editDraft, onSaveHabitTemplates],
  );

  const removeHabit = useCallback((id: string) => {
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setEditDraft((draft) => draft.filter((h) => h.id !== id));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 250);
  }, []);

  if (habits.length === 0 && dailyHabitTemplates.length === 0) return null;

  const listHabits = editMode ? editHabits : displayHabits;

  return (
    <>
      <View testID="home-daily-habits">
        {mobilityHabit ? (
          <View className="mt-7">
            <Text
              className="mb-3 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: colors.textTertiary }}
            >
              Mobility
            </Text>
            <MobilityRoutineCard habit={mobilityHabit} readOnly={readOnly} onPress={onMobilityPress} />
          </View>
        ) : null}

        {listHabits.length > 0 || editMode ? (
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
                  <Pressable
                    onPress={() => (editMode ? exitEditMode(true) : enterEditMode())}
                    accessibilityRole="button"
                  >
                    <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                      {editMode ? "Done" : "Edit"}
                    </Text>
                  </Pressable>
                ) : null}
                <Text className="text-xs font-medium tabular-nums" style={{ color: colors.textSecondary }}>
                  {doneCount}/{displayHabits.length}
                </Text>
              </View>
            </View>

            {editMode ? (
              <>
                <SortableExerciseList
                  items={editDraft}
                  onReorder={setEditDraft}
                  renderItem={(item, _index, handle) => {
                    const habit = editHabits.find((h) => h.id === item.id) ?? { ...item, done: false };
                    const removing = removingIds.has(item.id);
                    return (
                      <View className="flex-row items-center gap-2" style={{ width: "100%" }}>
                        <View style={{ flex: 1, minWidth: 0, opacity: removing ? 0 : 1 }}>
                          <HabitRowContent
                            habit={habit}
                            stepsTarget={stepsTarget}
                            progWeek={progWeek}
                            readOnly={readOnly}
                            onToggle={onToggle}
                            editMode
                            onRemove={removeHabit}
                            removing={removing}
                          />
                        </View>
                        {!removing ? <ExerciseDragHandle handle={handle} tapSize={36} /> : null}
                      </View>
                    );
                  }}
                />
                <Pressable
                  onPress={() => setAddSheetOpen(true)}
                  className="mt-2 flex-row items-center gap-1.5 rounded-xl border border-dashed px-3.5 py-3.5"
                  style={{ borderColor: colors.border }}
                >
                  <IconPlus size={13} stroke={2.5} color={colors.textSecondary} />
                  <Text className="text-[13px] font-semibold" style={{ color: colors.textSecondary }}>
                    Add habit
                  </Text>
                </Pressable>
              </>
            ) : (
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
            )}
          </View>
        ) : null}
      </View>

      {editMode ? (
        <AddHabitSheet
          open={addSheetOpen}
          currentTemplates={editDraft}
          onAdd={(template) => setEditDraft((draft) => [...draft, template])}
          onClose={() => setAddSheetOpen(false)}
        />
      ) : null}
    </>
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
          <IconMobilityRunner size={22} color={MOBILITY_ACCENT} />
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
              <IconChevR size={14} stroke={2.2} color={MOBILITY_ACCENT} />
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
  const actionHabit = isActionHabit(habit);

  const content = (
    <HabitRowContent
      habit={habit}
      stepsTarget={stepsTarget}
      progWeek={progWeek}
      readOnly={readOnly}
      onToggle={onToggle}
    />
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

function HabitRowContent({
  habit,
  stepsTarget,
  progWeek,
  readOnly,
  onToggle,
  editMode,
  onRemove,
  removing,
}: {
  habit: Habit;
  stepsTarget: number;
  progWeek: number;
  readOnly: boolean;
  onToggle: (id: string) => void;
  editMode?: boolean;
  onRemove?: (id: string) => void;
  removing?: boolean;
}) {
  const { colors } = useAppTheme();
  const IconComp = habitIconComponent(habit.icon);
  const actionHabit = isActionHabit(habit);
  const subtitle = habitSubtitle(habit, stepsTarget, progWeek);

  return (
    <View
      className="min-h-[64px] flex-row items-center gap-3 rounded-xl border p-3.5"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.card,
        opacity: removing ? 0 : 1,
        transform: [{ translateX: removing ? -12 : 0 }],
      }}
    >
      {editMode ? (
        <Pressable
          onPress={() => onRemove?.(habit.id)}
          accessibilityLabel={`Remove ${habit.name}`}
          className="h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(248,113,113,0.15)" }}
        >
          <IconMinus size={14} stroke={2.2} color="rgba(248,113,113,0.95)" />
        </Pressable>
      ) : null}

      <View
        className="h-10 w-10 items-center justify-center rounded-[10px]"
        style={{ backgroundColor: habit.done ? "rgba(255,255,255,0.08)" : colors.backgroundSecondary }}
      >
        <IconComp
          size={18}
          stroke={1.6}
          color={habit.done ? colors.textPrimary : colors.textTertiary}
        />
      </View>

      <View className="min-w-0 flex-1">
        <Text className="mb-0.5 text-sm font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
          {habit.name}
        </Text>
        <Text className="text-xs leading-[1.35]" style={{ color: colors.textTertiary }}>
          {subtitle}
        </Text>
      </View>

      {!editMode ? (
        actionHabit ? (
          habit.done ? (
            <IconCheck size={18} stroke={2.4} color={colors.accent} />
          ) : (
            <IconChevR size={14} color={colors.textTertiary} />
          )
        ) : (
          <HabitToggle habit={habit} readOnly={readOnly} onToggle={onToggle} />
        )
      ) : null}
    </View>
  );
}

function HabitToggle({
  habit,
  readOnly,
  onToggle,
}: {
  habit: Habit;
  readOnly: boolean;
  onToggle: (id: string) => void;
}) {
  const { colors } = useAppTheme();

  if (readOnly) {
    return (
      <View
        className="h-[22px] w-10 rounded-full"
        style={{ backgroundColor: habit.done ? colors.accent : colors.border }}
      />
    );
  }

  return (
    <Pressable
      onPress={() => onToggle(habit.id)}
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
  );
}

function habitSubtitle(habit: Habit, stepsTarget: number, progWeek: number): string {
  if (habit.done) return "Done";
  if (habit.subtitle?.trim()) return habit.subtitle.trim();
  if (habit.icon === "run") return `${stepsTarget.toLocaleString()} steps · Week ${progWeek}`;
  return "Not yet today";
}
