import { localDateKey } from "@newyouai/core";
import type { HabitTemplate } from "@newyouai/types";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { SettingsHelper } from "@/components/settings/SettingsLayout";
import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { buildHabitsForDateKey } from "@/lib/habits";
import { sanitizeUserText } from "@/lib/userText";

const HABIT_ICONS = ["drop", "run", "bolt", "moon"] as const;

function newHabitId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `h_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function habitIconEmoji(icon: string): string {
  const map: Record<string, string> = {
    drop: "💧",
    run: "👟",
    bolt: "⚡",
    moon: "🌙",
  };
  return map[icon] ?? "✓";
}

function HabitIconButton({
  icon,
  selected,
  onPick,
}: {
  icon: HabitTemplate["icon"];
  selected: boolean;
  onPick: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPick}
      accessibilityLabel={`Icon ${icon}`}
      className="h-8 w-8 items-center justify-center rounded-lg border"
      style={{
        borderColor: selected ? colors.textPrimary : colors.border,
        backgroundColor: selected ? colors.backgroundTertiary : colors.backgroundSecondary,
      }}
    >
      <Text className="text-sm">{habitIconEmoji(icon)}</Text>
    </Pressable>
  );
}

export function HabitsPanel() {
  const { colors } = useAppTheme();
  const { state, setFitnessState } = useFitnessState();
  const [pendingHabitRemove, setPendingHabitRemove] = useState<{ id: string; name: string } | null>(null);
  const todayKey = localDateKey(new Date());

  if (!state) return null;

  return (
    <View>
      <SettingsHelper>
        Rename, pick an icon, or add rows. The runner icon shows your steps goal on the Home daily habits card.
      </SettingsHelper>

      <View className="gap-2.5">
        {state.habitTemplates.map((h) => (
          <View
            key={h.id}
            className="rounded-xl border p-3.5"
            style={{ borderColor: colors.border, backgroundColor: colors.card, gap: 10 }}
          >
            <TextInput
              value={h.name}
              onChangeText={(value) => {
                const name = sanitizeUserText(value);
                setFitnessState((prev) => {
                  const templates = prev.habitTemplates.map((x) => (x.id === h.id ? { ...x, name } : x));
                  return {
                    ...prev,
                    habitTemplates: templates,
                    habits: buildHabitsForDateKey(templates, prev.habitsDoneByDay, todayKey),
                  };
                });
              }}
              placeholder="Habit name"
              placeholderTextColor={colors.textTertiary}
              accessibilityLabel="Habit name"
              className="rounded-xl border px-3 py-2.5 text-[15px]"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.backgroundSecondary,
                color: colors.textPrimary,
              }}
            />
            <View className="flex-row flex-wrap items-center gap-2">
              <Text
                className="mr-1 text-[10px] font-medium uppercase tracking-widest"
                style={{ color: colors.textTertiary }}
              >
                ICON
              </Text>
              {HABIT_ICONS.map((ic) => (
                <HabitIconButton
                  key={ic}
                  icon={ic}
                  selected={h.icon === ic}
                  onPick={() => {
                    setFitnessState((prev) => {
                      const templates = prev.habitTemplates.map((x) =>
                        x.id === h.id ? { ...x, icon: ic } : x,
                      );
                      return {
                        ...prev,
                        habitTemplates: templates,
                        habits: buildHabitsForDateKey(templates, prev.habitsDoneByDay, todayKey),
                      };
                    });
                  }}
                />
              ))}
              <Pressable
                onPress={() => setPendingHabitRemove({ id: h.id, name: h.name.trim() || "this habit" })}
                className="ml-auto px-2.5 py-1.5"
              >
                <Text className="text-[12px] font-semibold" style={{ color: "#f87171" }}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <Pressable
          testID="settings-habits-add"
          onPress={() => {
            setFitnessState((prev) => {
              const templates = [...prev.habitTemplates, { id: newHabitId(), name: "New habit", icon: "bolt" }];
              return {
                ...prev,
                habitTemplates: templates,
                habits: buildHabitsForDateKey(templates, prev.habitsDoneByDay, todayKey),
              };
            });
          }}
          className="items-center rounded-xl border border-dashed px-4 py-3.5"
          style={{ borderColor: colors.border }}
        >
          <Text className="text-[13px] font-semibold" style={{ color: colors.textSecondary }}>
            + Add habit
          </Text>
        </Pressable>
      </View>

      {pendingHabitRemove ? (
        <WorkoutConfirmSheet
          title="Remove habit?"
          cancelLabel="Keep habit"
          confirmLabel="Remove habit"
          confirmDestructive
          message={`Remove ${pendingHabitRemove.name} from your daily checklist? This can't be undone.`}
          onCancel={() => setPendingHabitRemove(null)}
          onConfirm={() => {
            const habitId = pendingHabitRemove.id;
            setFitnessState((prev) => {
              const templates = prev.habitTemplates.filter((x) => x.id !== habitId);
              const nextDoneByDay = { ...prev.habitsDoneByDay };
              for (const dk of Object.keys(nextDoneByDay)) {
                const m = nextDoneByDay[dk];
                if (!m || typeof m !== "object") continue;
                if (habitId in m) {
                  const { [habitId]: _, ...rest } = m;
                  nextDoneByDay[dk] = rest;
                }
              }
              return {
                ...prev,
                habitTemplates: templates,
                habitsDoneByDay: nextDoneByDay,
                habits: buildHabitsForDateKey(templates, nextDoneByDay, todayKey),
              };
            });
            setPendingHabitRemove(null);
          }}
        />
      ) : null}
    </View>
  );
}
