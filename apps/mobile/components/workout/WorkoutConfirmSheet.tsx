import { Pressable, Text, View } from "react-native";
import type { ReactNode } from "react";

import { CenterDialog } from "@/components/motion";
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
    <CenterDialog open={open} onClose={onCancel} panelStyle={{ padding: 0, maxWidth: 384 }}>
      <View testID={sheetTestID} className="w-full overflow-hidden rounded-2xl">
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
    </CenterDialog>
  );
}
