import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";

import { CenterDialog } from "@/components/motion";
import { AppTextField } from "@/components/ui/AppTextField";
import {
  HABIT_DESCRIPTION_MAX_LENGTH,
  HABIT_NAME_MAX_LENGTH,
  normalizeHabitName,
  normalizeHabitSubtitle,
} from "@/lib/habits";
import { sanitizeUserText } from "@/lib/userText";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  open: boolean;
  habitId: string | null;
  initialName: string;
  initialDescription: string;
  onSave: (id: string, name: string, description: string) => void;
  onClose: () => void;
};

export function EditHabitDialog({
  open,
  habitId,
  initialName,
  initialDescription,
  onSave,
  onClose,
}: Props) {
  const { colors } = useAppTheme();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setDescription(initialDescription);
  }, [open, initialName, initialDescription]);

  function handleSave() {
    if (!habitId) return;
    onSave(
      habitId,
      normalizeHabitName(name) || "New habit",
      normalizeHabitSubtitle(description) ?? "",
    );
    onClose();
  }

  return (
    <CenterDialog open={open} onClose={onClose} panelStyle={{ padding: 0, maxWidth: 340, width: "100%" }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View testID="edit-habit-dialog" className="w-full overflow-hidden rounded-2xl">
          <View className="px-6 pb-2 pt-6">
            <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>
              Edit habit
            </Text>

            <View className="mt-5" style={{ gap: 16 }}>
              <View>
                <View className="mb-2 flex-row items-center justify-between">
                  <Text
                    className="text-[11px] font-medium uppercase tracking-widest"
                    style={{ color: colors.textTertiary }}
                  >
                    Name
                  </Text>
                  <Text className="text-[11px] tabular-nums" style={{ color: colors.textTertiary }}>
                    {name.length}/{HABIT_NAME_MAX_LENGTH}
                  </Text>
                </View>
                <AppTextField
                  value={name}
                  maxLength={HABIT_NAME_MAX_LENGTH}
                  onChangeText={(value) => setName(sanitizeUserText(value))}
                  placeholder="Habit name"
                  accessibilityLabel="Habit name"
                  returnKeyType="next"
                />
              </View>

              <View>
                <View className="mb-2 flex-row items-center justify-between">
                  <Text
                    className="text-[11px] font-medium uppercase tracking-widest"
                    style={{ color: colors.textTertiary }}
                  >
                    Description
                  </Text>
                  <Text className="text-[11px] tabular-nums" style={{ color: colors.textTertiary }}>
                    {description.length}/{HABIT_DESCRIPTION_MAX_LENGTH}
                  </Text>
                </View>
                <AppTextField
                  value={description}
                  maxLength={HABIT_DESCRIPTION_MAX_LENGTH}
                  onChangeText={(value) => setDescription(sanitizeUserText(value))}
                  placeholder="Why this matters"
                  accessibilityLabel="Habit description"
                  multiline
                  multilineMinHeight={88}
                />
              </View>
            </View>
          </View>

          <View className="mt-4 flex-row border-t" style={{ borderColor: colors.border }}>
            <Pressable
              testID="edit-habit-cancel"
              onPress={onClose}
              className="flex-1 items-center py-3.5"
            >
              <Text className="text-[15px] font-semibold" style={{ color: colors.textSecondary }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              testID="edit-habit-save"
              onPress={handleSave}
              disabled={!name.trim()}
              className="flex-1 items-center py-3.5"
              style={{ opacity: name.trim() ? 1 : 0.45 }}
            >
              <Text className="text-[15px] font-semibold" style={{ color: colors.accent }}>
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </CenterDialog>
  );
}
