import { ActivityIndicator, Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import type { ReactNode } from "react";

import { CenterDialog } from "@/components/motion";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  open?: boolean;
  title: string;
  message: ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  confirmBusy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  sheetTestID?: string;
  cancelTestID?: string;
  confirmTestID?: string;
};

export function FutureYouDeleteConfirmSheet({
  open = true,
  title,
  message,
  cancelLabel,
  confirmLabel,
  confirmBusy = false,
  onCancel,
  onConfirm,
  sheetTestID = "future-you-delete-confirm-sheet",
  cancelTestID = "future-you-delete-cancel",
  confirmTestID = "future-you-delete-confirm",
}: Props) {
  const { colors } = useAppTheme();

  return (
    <CenterDialog
      open={open}
      onClose={confirmBusy ? undefined : onCancel}
      panelStyle={{ padding: 0, maxWidth: 384 }}
    >
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
            <Pressable
              testID={cancelTestID}
              disabled={confirmBusy}
              onPress={onCancel}
              className="flex-1 items-center py-3.5"
              style={{ opacity: confirmBusy ? 0.5 : 1 }}
            >
              <Text className="text-[15px] font-semibold" style={{ color: colors.textSecondary }}>
                {cancelLabel}
              </Text>
            </Pressable>
            <Pressable
              testID={confirmTestID}
              disabled={confirmBusy}
              onPress={onConfirm}
              className="flex-1 items-center py-3.5"
              style={{ opacity: confirmBusy ? 0.5 : 1 }}
            >
              {confirmBusy ? (
                <ActivityIndicator color="#FF453A" />
              ) : (
                <Text className="text-[15px] font-semibold" style={{ color: "#FF453A" }}>
                  {confirmLabel}
                </Text>
              )}
            </Pressable>
          </View>
      </View>
    </CenterDialog>
  );
}
