import { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import { SaveWorkoutConfirmSheet } from "@/components/workout/SaveWorkoutConfirmSheet";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { WorkoutRoutineTemplate } from "@newyouai/types";

type Props = {
  open?: boolean;
  template: WorkoutRoutineTemplate;
  onSave: (name: string) => void;
  onClose: () => void;
};

export function RenameRoutineSheet({ open = true, template, onSave, onClose }: Props) {
  const { colors } = useAppTheme();
  const [name, setName] = useState(template.name);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setName(template.name);
    setConfirmOpen(false);
  }, [template.id, template.name]);

  function handleSaveClick() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (trimmed === template.name.trim()) {
      onClose();
      return;
    }
    setConfirmOpen(true);
  }

  function confirmSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setConfirmOpen(false);
    onClose();
  }

  return (
    <>
      <Modal visible={open && !confirmOpen} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={onClose}>
          <Pressable
            testID="rename-routine-sheet"
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ backgroundColor: colors.card }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-lg font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              Rename workout
            </Text>
            <Text className="mt-2 text-sm leading-[1.5]" style={{ color: colors.textSecondary }}>
              Update the name shown on your workouts list.
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Workout name"
              placeholderTextColor={colors.textTertiary}
              className="mt-4 rounded-xl border px-3 py-3 text-base"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.backgroundSecondary,
                color: colors.textPrimary,
              }}
            />
            <View className="mt-4">
              <PrimaryButton block onPress={handleSaveClick} disabled={!name.trim()}>
                Save name
              </PrimaryButton>
            </View>
            <Pressable onPress={onClose} className="mt-2.5 items-center py-2">
              <Text className="text-sm font-medium" style={{ color: colors.textTertiary }}>
                Cancel
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      {confirmOpen ? (
        <SaveWorkoutConfirmSheet
          title="Rename workout?"
          workoutName={name.trim()}
          cancelLabel="Keep name"
          confirmLabel="Rename"
          message={`Rename this workout to ${name.trim()}?`}
          onCancel={() => setConfirmOpen(false)}
          onSave={confirmSave}
        />
      ) : null}
    </>
  );
}
