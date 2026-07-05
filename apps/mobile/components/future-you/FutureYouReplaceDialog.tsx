import {
  FUTURE_YOU_REPLACE_CANCEL_LABEL,
  FUTURE_YOU_REPLACE_DELETE_LABEL,
  FUTURE_YOU_REPLACE_DIALOG_BODY,
  FUTURE_YOU_REPLACE_DIALOG_TITLE,
  FUTURE_YOU_REPLACE_KEEP_LABEL,
} from "@newyouai/core";
import { ActivityIndicator, Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { CenterDialog } from "@/components/motion";
import { useAppTheme } from "@/hooks/useAppTheme";
import { FUTURE_YOU_CALLOUT_BG, FUTURE_YOU_GOLD } from "@/lib/futureYouTokens";

type Props = {
  open: boolean;
  busy?: boolean;
  onCancel: () => void;
  onDeleteOld: () => void;
  onKeepOld: () => void;
};

export function FutureYouReplaceDialog({
  open,
  busy = false,
  onCancel,
  onDeleteOld,
  onKeepOld,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <CenterDialog
      open={open}
      onClose={busy ? undefined : onCancel}
      panelStyle={{ padding: 0, maxWidth: 384 }}
    >
      <View
        testID="future-you-replace-dialog"
        className="w-full overflow-hidden rounded-2xl px-7 py-7"
      >
          <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>
            {FUTURE_YOU_REPLACE_DIALOG_TITLE}
          </Text>
          <Text className="mt-3 text-sm leading-5" style={{ color: colors.textSecondary }}>
            {FUTURE_YOU_REPLACE_DIALOG_BODY}
          </Text>

          <View className="mt-6 gap-2">
            <Pressable
              testID="future-you-replace-keep"
              disabled={busy}
              onPress={onKeepOld}
              className="items-center rounded-full px-6 py-3.5"
              style={{ backgroundColor: FUTURE_YOU_GOLD, opacity: busy ? 0.5 : 1 }}
            >
              <Text className="text-base font-semibold" style={{ color: FUTURE_YOU_CALLOUT_BG }}>
                {FUTURE_YOU_REPLACE_KEEP_LABEL}
              </Text>
            </Pressable>
            <Pressable
              testID="future-you-replace-delete"
              disabled={busy}
              onPress={onDeleteOld}
              className="items-center px-6 py-3"
              style={{ opacity: busy ? 0.5 : 1 }}
            >
              {busy ? (
                <ActivityIndicator color="#FF453A" />
              ) : (
                <Text className="text-base font-semibold" style={{ color: "#FF453A" }}>
                  {FUTURE_YOU_REPLACE_DELETE_LABEL}
                </Text>
              )}
            </Pressable>
            <Pressable
              testID="future-you-replace-cancel"
              disabled={busy}
              onPress={onCancel}
              className="items-center px-6 py-3"
              style={{ opacity: busy ? 0.5 : 1 }}
            >
              <Text className="text-[15px] font-semibold" style={{ color: colors.textSecondary }}>
                {FUTURE_YOU_REPLACE_CANCEL_LABEL}
              </Text>
            </Pressable>
          </View>
      </View>
    </CenterDialog>
  );
}
