import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { CenterDialog } from "@/components/motion";
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
    <CenterDialog open={open} onClose={onClose} panelStyle={{ padding: 0, maxWidth: 320 }}>
      <View testID="exercise-action-sheet" className="w-full rounded-2xl px-2 py-2">
          <Text
            className="mx-2 mb-1 mt-1 text-[13px] font-semibold uppercase tracking-widest"
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
      </View>
    </CenterDialog>
  );
}
