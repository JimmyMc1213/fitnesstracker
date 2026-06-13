import { Modal, Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  open?: boolean;
  exerciseName: string;
  onEditNote: () => void;
  onEditRest: () => void;
  onReplace: () => void;
  onRemove: () => void;
  onClose: () => void;
};

function ActionRow({
  label,
  destructive,
  onPress,
}: {
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable onPress={onPress} className="w-full rounded-xl px-3.5 py-3.5">
      <Text className="text-[15px] font-semibold" style={{ color: destructive ? "#FF453A" : colors.textPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ExerciseActionSheet({
  open = true,
  exerciseName,
  onEditNote,
  onEditRest,
  onReplace,
  onRemove,
  onClose,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} onPress={onClose}>
        <Pressable
          testID="exercise-action-sheet"
          className="rounded-t-2xl px-2 pb-8 pt-3"
          style={{ backgroundColor: colors.card }}
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            className="mx-2 mb-2 mt-1 text-[13px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textTertiary }}
          >
            {exerciseName}
          </Text>
          <ActionRow
            label="Add note"
            onPress={() => {
              onEditNote();
              onClose();
            }}
          />
          <ActionRow
            label="Rest timer"
            onPress={() => {
              onEditRest();
              onClose();
            }}
          />
          <ActionRow
            label="Replace exercise"
            onPress={() => {
              onReplace();
              onClose();
            }}
          />
          <ActionRow
            label="Remove exercise"
            destructive
            onPress={() => {
              onClose();
              setTimeout(onRemove, 0);
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
