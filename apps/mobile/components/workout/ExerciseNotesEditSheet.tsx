import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { BottomSheet } from "@/components/motion";

import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  open?: boolean;
  exerciseName: string;
  note: string;
  onSave: (note: string) => void;
  onDelete: () => void;
  onClose: () => void;
};

export function ExerciseNotesEditSheet({
  open = true,
  exerciseName,
  note,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const { colors } = useAppTheme();
  const [draft, setDraft] = useState(note);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    setDraft(note);
    setConfirmDeleteOpen(false);
  }, [note, open]);

  function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSave(trimmed);
    onClose();
  }

  function handleDelete() {
    onDelete();
    setConfirmDeleteOpen(false);
    onClose();
  }

  const canSave = Boolean(draft.trim());
  const hasExisting = Boolean(note.trim());

  return (
    <>
      <BottomSheet
        open={open && !confirmDeleteOpen}
        onClose={onClose}
        panelStyle={{ paddingHorizontal: 0, paddingBottom: 32 }}
      >
        <View testID="exercise-notes-edit-sheet" className="rounded-t-2xl px-5 pb-8 pt-5">
            <Text className="text-lg font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              Exercise note
            </Text>
            <Text className="mt-1 text-sm font-medium" style={{ color: colors.textSecondary }}>
              {exerciseName}
            </Text>
            <Text className="mt-2 text-xs leading-[1.45]" style={{ color: colors.textTertiary }}>
              Saved to this exercise everywhere it appears: seat height, form cues, machine settings, etc.
            </Text>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder='e.g. "seat height 3", "keep elbows in"'
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              className="mt-3 min-h-[96px] rounded-xl border px-3.5 py-3 text-[15px] leading-[1.45]"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.backgroundSecondary,
                color: colors.textPrimary,
                textAlignVertical: "top",
              }}
            />
            <View className="mt-4 flex-row gap-2.5">
              <Pressable
                onPress={onClose}
                className="flex-1 items-center rounded-xl border py-3.5"
                style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
              >
                <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                testID="exercise-notes-save"
                onPress={handleSave}
                disabled={!canSave}
                className="flex-1 items-center rounded-xl py-3.5"
                style={{
                  backgroundColor: canSave ? colors.accent : colors.backgroundSecondary,
                  opacity: canSave ? 1 : 0.5,
                }}
              >
                <Text className="text-sm font-semibold" style={{ color: canSave ? colors.background : colors.textTertiary }}>
                  Save
                </Text>
              </Pressable>
            </View>
            {hasExisting ? (
              <Pressable
                onPress={() => setConfirmDeleteOpen(true)}
                className="mt-2.5 items-center rounded-xl border py-3"
                style={{ borderColor: "rgba(255,105,97,0.35)", backgroundColor: "rgba(255,105,97,0.08)" }}
              >
                <Text className="text-sm font-semibold" style={{ color: "#FF6961" }}>
                  Delete note
                </Text>
              </Pressable>
            ) : null}
        </View>
      </BottomSheet>
      {confirmDeleteOpen ? (
        <WorkoutConfirmSheet
          title="Delete note?"
          message={`Remove the saved note for ${exerciseName}? This can't be undone.`}
          cancelLabel="Keep note"
          confirmLabel="Delete note"
          confirmDestructive
          onCancel={() => setConfirmDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  );
}
