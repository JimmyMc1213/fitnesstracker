import { buildCoachContext, getWeighInReaction, localDateKey } from "@newyouai/core";
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { buildHabitsForDateKey, markWeighInHabitDone } from "@/lib/habits";
import { formatWeightFromLbs, isValidWeighInLbs, parseWeightToLbs } from "@/lib/unitConversions";
import { weightUnitLabel } from "@/lib/unitLabels";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { AppState, UnitPreferences, WeightEntry } from "@newyouai/types";

type Props = {
  open: boolean;
  onClose: () => void;
  dateKey: string;
  existing: WeightEntry | undefined;
  unitPreferences: UnitPreferences;
  setFitnessState: (updater: (prev: AppState) => AppState) => void;
};

export function WeighInSheet({
  open,
  onClose,
  dateKey,
  existing,
  unitPreferences,
  setFitnessState,
}: Props) {
  const { colors } = useAppTheme();
  const wUnit = unitPreferences.weightUnit;
  const [weightDraft, setWeightDraft] = useState("");

  useEffect(() => {
    if (!open) return;
    setWeightDraft(
      existing ? formatWeightFromLbs(existing.weightLbs, wUnit, wUnit === "kg" ? 1 : 1) : "",
    );
  }, [open, dateKey, existing?.weightLbs, wUnit]);

  function save() {
    const display = parseFloat(weightDraft);
    const lbs = parseWeightToLbs(display, wUnit);
    if (!isValidWeighInLbs(lbs)) return;

    const loggedAtIso = new Date().toISOString();
    setFitnessState((s) => {
      const withoutDay = s.weightLog.filter((e) => e.dateKey !== dateKey);
      const draft: WeightEntry = {
        dateKey,
        weightLbs: lbs,
        loggedAtIso,
      };
      const ctx = buildCoachContext({ ...s, weightLog: withoutDay }, dateKey, new Date());
      const reaction = getWeighInReaction(ctx, draft);
      const entry: WeightEntry = {
        ...draft,
        ...(reaction?.message ? { coachMessage: reaction.message } : {}),
        ...(reaction?.macroNudge?.deltaCal != null
          ? {
              macroNudge: {
                deltaCal: reaction.macroNudge.deltaCal,
                reason: reaction.macroNudge.reason,
              },
            }
          : {}),
      };
      const nextLog = [...withoutDay, entry].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
      const habitsDoneByDay = markWeighInHabitDone(s.habitsDoneByDay, dateKey);
      const todayKey = localDateKey(new Date());
      const habits =
        dateKey === todayKey
          ? buildHabitsForDateKey(s.habitTemplates, habitsDoneByDay, dateKey, { weightLogged: true })
          : s.habits;
      return { ...s, weightLog: nextLog, habitsDoneByDay, habits };
    });
    onClose();
  }

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View
          testID="weigh-in-sheet"
          className="rounded-t-2xl px-5 pb-8 pt-5"
          style={{ backgroundColor: colors.card, maxHeight: "82%" }}
        >
          <Text
            className="mb-2 text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textTertiary }}
          >
            Weigh-in
          </Text>
          <Text className="mb-3.5 text-xs leading-[1.5]" style={{ color: colors.textSecondary }}>
            Morning scale, post-bathroom, before food. Optional progress photo ships in RN-8.
          </Text>

          <Text className="text-[10px] font-medium tracking-wider" style={{ color: colors.textTertiary }}>
            Weight ({weightUnitLabel(wUnit)})
          </Text>
          <TextInput
            testID="weigh-in-weight-input"
            value={weightDraft}
            onChangeText={setWeightDraft}
            keyboardType="decimal-pad"
            placeholder={wUnit === "kg" ? "78.2" : "172.4"}
            placeholderTextColor={colors.textTertiary}
            className="mt-1.5 rounded-xl border px-3 py-3 text-lg font-semibold"
            style={{
              borderColor: colors.border,
              color: colors.textPrimary,
              backgroundColor: colors.background,
            }}
          />

          <Pressable
            onPress={() => {}}
            className="mt-3 self-start rounded-[10px] border px-3.5 py-2.5"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.textPrimary }}>
              Add progress photo (coming soon)
            </Text>
          </Pressable>

          <Pressable
            onPress={save}
            testID="weigh-in-save"
            className="mt-4 items-center rounded-xl py-3.5"
            style={{ backgroundColor: colors.accent }}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.accentText }}>
              {existing ? "Update weigh-in" : "Save weigh-in"}
            </Text>
          </Pressable>

          <Pressable onPress={onClose} className="mt-2.5 items-center py-2.5">
            <Text className="text-[13px] font-semibold" style={{ color: colors.textTertiary }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
