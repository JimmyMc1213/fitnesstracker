import { Modal, Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import type { WorkoutRoutineTemplate } from "@newyouai/types";

type Props = {
  open: boolean;
  template: WorkoutRoutineTemplate;
  onClose: () => void;
  onEdit: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
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
    <Pressable
      onPress={onPress}
      className="w-full flex-row items-center rounded-xl px-3.5 py-3.5"
      style={{ backgroundColor: "transparent" }}
    >
      <Text
        className="text-[15px] font-semibold"
        style={{ color: destructive ? "#FF453A" : colors.textPrimary }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function WorkoutRoutineActionSheet({
  open,
  template,
  onClose,
  onEdit,
  onRename,
  onDuplicate,
  onDelete,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={open} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onPress={onClose}
      >
        <Pressable
          testID="workout-routine-action-sheet"
          className="w-full max-w-[320px] rounded-2xl px-2 py-2"
          style={{ backgroundColor: colors.card }}
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            className="mx-2 mb-1 mt-1 text-[13px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textTertiary }}
          >
            {template.name}
          </Text>
          <ActionRow
            label="Edit"
            onPress={() => {
              onEdit();
              onClose();
            }}
          />
          <ActionRow
            label="Rename"
            onPress={() => {
              onRename();
              onClose();
            }}
          />
          <ActionRow
            label="Duplicate"
            onPress={() => {
              onDuplicate();
              onClose();
            }}
          />
          <ActionRow
            label="Delete"
            destructive
            onPress={() => {
              onDelete();
              onClose();
            }}
          />
          <Pressable onPress={onClose} className="mx-2 mb-1 mt-1 items-center py-2">
            <Text className="text-sm font-semibold" style={{ color: colors.textTertiary }}>
              Cancel
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
