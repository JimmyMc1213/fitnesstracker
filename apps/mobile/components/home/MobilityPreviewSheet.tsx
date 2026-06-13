import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import { STRETCH_BLOCKS, STRETCH_INTRO } from "@/lib/stretchRoutine";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  open: boolean;
  onClose: () => void;
  onStart?: () => void;
};

export function MobilityPreviewSheet({ open, onClose, onStart }: Props) {
  const { colors } = useAppTheme();
  const totalMoves = STRETCH_BLOCKS.length;

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View
          testID="mobility-preview-sheet"
          className="max-h-[78%] rounded-t-2xl"
          style={{ backgroundColor: colors.card }}
        >
          <View className="px-4 pb-2 pt-4">
            <Text
              className="mb-1 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: colors.textTertiary }}
            >
              Recovery
            </Text>
            <Text className="text-xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              Mobility routine
            </Text>
            <Text className="mt-2 text-xs leading-[1.45]" style={{ color: colors.textSecondary }}>
              ~15–20 min · low-back care & gentle mobility
            </Text>
            <Text className="mt-2 text-[11px] font-medium tabular-nums" style={{ color: colors.textTertiary }}>
              {totalMoves} moves
            </Text>
          </View>

          <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 16 }}>
            <View
              className="mb-3 rounded-[10px] border px-3 py-2.5"
              style={{ borderColor: "rgba(196,181,253,0.22)", backgroundColor: "rgba(196,181,253,0.08)" }}
            >
              <Text className="text-xs leading-[1.45]" style={{ color: colors.textSecondary }}>
                {STRETCH_INTRO}
              </Text>
            </View>

            {STRETCH_BLOCKS.map((block) => (
              <View
                key={block.id}
                className="mb-2 rounded-xl border px-3 py-3"
                style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
              >
                <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  {block.title}
                </Text>
                {block.minutes ? (
                  <Text className="mt-0.5 text-[11px]" style={{ color: colors.textTertiary }}>
                    {block.minutes}
                  </Text>
                ) : null}
                <Text className="mt-1 text-xs leading-[1.4]" style={{ color: colors.textSecondary }}>
                  {block.cues.join(" ")}
                </Text>
              </View>
            ))}

            <Text className="mt-2 text-center text-[11px] font-medium" style={{ color: colors.textTertiary }}>
              Full stretch session player ships in RN-6
            </Text>
          </ScrollView>

          <View className="border-t px-4 pb-8 pt-3" style={{ borderColor: colors.border }}>
            <PrimaryButton block onPress={onStart ?? onClose}>
              Preview complete
            </PrimaryButton>
            <Pressable onPress={onClose} className="mt-2 items-center py-2">
              <Text className="text-sm font-semibold" style={{ color: colors.textTertiary }}>
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
