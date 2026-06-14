import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { IconSearch } from "@/components/icons/FitnessIcons";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  availableHabitsToAdd,
  createCustomHabitTemplate,
  normalizeHabitIcon,
  type HabitDefinition,
} from "@/lib/habits";
import { habitIconComponent } from "@/lib/habitIcons";
import { sanitizeUserText } from "@/lib/userText";
import type { HabitTemplate } from "@newyouai/types";

type Props = {
  open: boolean;
  currentTemplates: HabitTemplate[];
  onAdd: (template: HabitTemplate) => void;
  onClose: () => void;
};

export function AddHabitSheet({ open, currentTemplates, onAdd, onClose }: Props) {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const available = useMemo(
    () => availableHabitsToAdd(currentTemplates, query),
    [currentTemplates, query],
  );

  const showCustomRow =
    !showCustomForm &&
    (!query.trim() ||
      "custom habit".includes(query.trim().toLowerCase()) ||
      "custom".includes(query.trim().toLowerCase()));

  function reset() {
    setQuery("");
    setShowCustomForm(false);
    setCustomName("");
    setCustomDescription("");
  }

  function pick(def: HabitDefinition) {
    onAdd({
      id: def.id,
      name: def.name,
      icon: normalizeHabitIcon(def.icon === "droplet" ? "drop" : def.icon),
      subtitle: def.subtitle,
      type: def.type,
      ...(def.action ? { action: def.action } : {}),
    });
    reset();
    onClose();
  }

  function saveCustom() {
    const name = sanitizeUserText(customName).trim();
    if (!name) return;
    const subtitle = sanitizeUserText(customDescription).trim();
    onAdd(createCustomHabitTemplate(name, subtitle || undefined));
    reset();
    onClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  if (!open) return null;

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} onPress={handleClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="rounded-t-[20px] border px-5 pb-8 pt-5"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.card,
              maxHeight: "85%",
            }}
          >
            <Text className="mb-3 text-[17px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              Add habit
            </Text>

            {!showCustomForm ? (
              <>
                <View className="relative mb-2.5">
                  <View className="absolute left-3 top-3.5 z-10">
                    <IconSearch size={16} stroke={1.6} color={colors.textTertiary} />
                  </View>
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search habits"
                    placeholderTextColor={colors.textTertiary}
                    accessibilityLabel="Search habits"
                    className="rounded-xl border px-3 py-3 pl-9 text-[15px]"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.textPrimary,
                    }}
                  />
                </View>

                <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
                  <View style={{ gap: 8 }}>
                    {available.map((habit) => {
                      const IconComp = habitIconComponent(habit.icon);
                      return (
                        <Pressable
                          key={habit.id}
                          onPress={() => pick(habit)}
                          className="flex-row items-center gap-3.5 rounded-xl border p-3.5"
                          style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
                        >
                          <View
                            className="h-9 w-9 items-center justify-center rounded-[10px]"
                            style={{ backgroundColor: colors.backgroundTertiary }}
                          >
                            <IconComp size={16} stroke={1.6} color={colors.textTertiary} />
                          </View>
                          <View className="min-w-0 flex-1">
                            <Text className="text-sm font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
                              {habit.name}
                            </Text>
                            {habit.subtitle ? (
                              <Text className="mt-0.5 text-[11px]" style={{ color: colors.textTertiary }}>
                                {habit.subtitle}
                              </Text>
                            ) : null}
                          </View>
                        </Pressable>
                      );
                    })}

                    {showCustomRow ? (
                      <Pressable
                        onPress={() => setShowCustomForm(true)}
                        className="flex-row items-center gap-3.5 rounded-xl border p-3.5"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
                      >
                        <View
                          className="h-9 w-9 items-center justify-center rounded-[10px]"
                          style={{ backgroundColor: colors.backgroundTertiary }}
                        >
                          {(() => {
                            const IconComp = habitIconComponent("bolt");
                            return <IconComp size={16} stroke={1.6} color={colors.textTertiary} />;
                          })()}
                        </View>
                        <View className="min-w-0 flex-1">
                          <Text className="text-sm font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
                            Custom habit
                          </Text>
                          <Text className="mt-0.5 text-[11px]" style={{ color: colors.textTertiary }}>
                            Name your own habit
                          </Text>
                        </View>
                      </Pressable>
                    ) : null}

                    {available.length === 0 && !showCustomRow ? (
                      <Text className="my-2 text-xs" style={{ color: colors.textSecondary }}>
                        No matching habits to add.
                      </Text>
                    ) : null}
                  </View>
                </ScrollView>
              </>
            ) : (
              <View style={{ gap: 12 }}>
                <View>
                  <Text
                    className="mb-2 text-[11px] font-medium uppercase tracking-widest"
                    style={{ color: colors.textTertiary }}
                  >
                    Habit name
                  </Text>
                  <TextInput
                    value={customName}
                    maxLength={40}
                    onChangeText={(value) => setCustomName(sanitizeUserText(value))}
                    placeholder="e.g. Meditate"
                    placeholderTextColor={colors.textTertiary}
                    accessibilityLabel="Habit name"
                    className="rounded-xl border px-3 py-3 text-[15px]"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.textPrimary,
                    }}
                  />
                </View>
                <View>
                  <Text
                    className="mb-2 text-[11px] font-medium uppercase tracking-widest"
                    style={{ color: colors.textTertiary }}
                  >
                    Description (optional)
                  </Text>
                  <TextInput
                    value={customDescription}
                    maxLength={80}
                    onChangeText={(value) => setCustomDescription(sanitizeUserText(value))}
                    placeholder="Why this matters"
                    placeholderTextColor={colors.textTertiary}
                    accessibilityLabel="Habit description"
                    className="rounded-xl border px-3 py-3 text-[15px]"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.textPrimary,
                    }}
                  />
                </View>
                <PrimaryButton block onPress={saveCustom} disabled={!customName.trim()}>
                  Add custom habit
                </PrimaryButton>
                <Pressable onPress={() => setShowCustomForm(false)} className="items-center py-2.5">
                  <Text className="text-[13px] font-semibold" style={{ color: colors.textTertiary }}>
                    Back
                  </Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
