import { Modal, Pressable, Text, View } from "react-native";

import {
  SET_KIND_LABELS,
  SET_KIND_SHORT,
  WORKOUT_SET_KINDS,
  setKindColors,
} from "@/lib/workout/workoutSetKind";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { WorkoutSetKind } from "@newyouai/types";

type Props = {
  open?: boolean;
  selected: WorkoutSetKind;
  onSelect: (kind: WorkoutSetKind) => void;
  onClose: () => void;
};

export function SetKindPickerSheet({ open = true, selected, onSelect, onClose }: Props) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} onPress={onClose}>
        <Pressable
          testID="set-kind-picker-sheet"
          className="rounded-t-2xl px-3 pb-8 pt-3"
          style={{ backgroundColor: colors.card }}
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            className="mx-2 mb-2 mt-1 text-[13px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textTertiary }}
          >
            Set type
          </Text>
          {WORKOUT_SET_KINDS.map((kind) => {
            const active = kind === selected;
            const badge = kind === "working" ? "#" : SET_KIND_SHORT[kind];
            const badgeColors = setKindColors(kind === "working" ? undefined : kind);
            return (
              <Pressable
                key={kind}
                onPress={() => {
                  onSelect(kind);
                  onClose();
                }}
                className="mb-1 flex-row items-center gap-3 rounded-xl px-3.5 py-3"
                style={{
                  backgroundColor: active ? colors.backgroundSecondary : "transparent",
                  borderWidth: active ? 0.5 : 0,
                  borderColor: colors.border,
                }}
              >
                <View
                  className="h-7 w-7 items-center justify-center rounded-lg border"
                  style={
                    kind === "working"
                      ? { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }
                      : {
                          borderColor: badgeColors.border,
                          backgroundColor: badgeColors.background,
                        }
                  }
                >
                  <Text
                    className="text-[13px] font-bold"
                    style={{ color: kind === "working" ? colors.textSecondary : badgeColors.color }}
                  >
                    {badge}
                  </Text>
                </View>
                <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
                  {SET_KIND_LABELS[kind]}
                </Text>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
