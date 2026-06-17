import { Pressable, Text, View } from "react-native";

import { CenterDialog } from "@/components/motion";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  open?: boolean;
  sessionTitle: string;
  onStart: () => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
};

function ActionRow({
  label,
  icon,
  destructive,
  testID,
  onPress,
}: {
  label: string;
  icon: string;
  destructive?: boolean;
  testID?: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable testID={testID} onPress={onPress} className="flex-row items-center gap-3 rounded-xl px-3.5 py-3.5">
      <Text style={{ color: destructive ? "#FF453A" : colors.accent, fontSize: 16 }}>{icon}</Text>
      <Text className="text-[15px] font-semibold" style={{ color: destructive ? "#FF453A" : colors.textPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function WorkoutHistorySessionActionSheet({
  open = true,
  sessionTitle,
  onStart,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <CenterDialog open={open} onClose={onClose} panelStyle={{ padding: 0, maxWidth: 320 }}>
      <View testID="workout-history-session-action-sheet" className="w-full rounded-2xl px-3 py-4">
          <Text
            className="mx-2 mb-2 mt-1 text-[13px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textTertiary }}
          >
            {sessionTitle}
          </Text>
          <ActionRow
            testID="workout-history-action-start"
            label="Start workout"
            icon="⚡"
            onPress={() => {
              onStart();
              onClose();
            }}
          />
          <ActionRow
            testID="workout-history-action-save"
            label="Save workout"
            icon="📖"
            onPress={() => {
              onSave();
              onClose();
            }}
          />
          <ActionRow
            testID="workout-history-action-delete"
            label="Delete workout"
            icon="🗑"
            destructive
            onPress={() => {
              onDelete();
              onClose();
            }}
          />
      </View>
    </CenterDialog>
  );
}
