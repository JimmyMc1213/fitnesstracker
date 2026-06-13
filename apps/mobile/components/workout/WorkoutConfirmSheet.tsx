import { Modal, Pressable, Text, View } from "react-native";
import type { ReactNode } from "react";

import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  open?: boolean;
  title: string;
  message: ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  confirmDestructive?: boolean;
  confirmPrimary?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  cancelTestID?: string;
  confirmTestID?: string;
  sheetTestID?: string;
};

export function WorkoutConfirmSheet({
  open = true,
  title,
  message,
  cancelLabel,
  confirmLabel,
  confirmDestructive = false,
  confirmPrimary = false,
  onCancel,
  onConfirm,
  cancelTestID,
  confirmTestID,
  sheetTestID,
}: Props) {
  const { colors } = useAppTheme();

  const confirmColor = confirmDestructive ? "#FF453A" : confirmPrimary ? colors.accent : colors.textPrimary;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View
          testID={sheetTestID}
          className="w-full max-w-sm overflow-hidden rounded-2xl"
          style={{ backgroundColor: colors.card }}
        >
          <View className="px-7 py-7">
            <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>
              {title}
            </Text>
            {typeof message === "string" ? (
              <Text className="mt-3 text-sm leading-5" style={{ color: colors.textSecondary }}>
                {message}
              </Text>
            ) : (
              <View className="mt-3">{message}</View>
            )}
          </View>
          <View className="flex-row border-t" style={{ borderColor: colors.border }}>
            <Pressable testID={cancelTestID} onPress={onCancel} className="flex-1 items-center py-3.5">
              <Text className="text-[15px] font-semibold" style={{ color: colors.textSecondary }}>
                {cancelLabel}
              </Text>
            </Pressable>
            <Pressable testID={confirmTestID} onPress={onConfirm} className="flex-1 items-center py-3.5">
              <Text className="text-[15px] font-semibold" style={{ color: confirmColor }}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
