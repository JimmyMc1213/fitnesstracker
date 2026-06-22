import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BottomSheet } from "@/components/motion";

import { BottomActionBar } from "@/components/BottomActionBar";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { STRETCH_BLOCKS, STRETCH_INTRO } from "@/lib/stretchRoutine";
import { mobilityColors } from "@/lib/workoutUiTokens";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  open: boolean;
  onClose: () => void;
  onStart?: () => void;
};

const SHEET_MAX_HEIGHT = Math.round(Dimensions.get("window").height * 0.78);

export function MobilityPreviewSheet({ open, onClose, onStart }: Props) {
  const { colors, theme } = useAppTheme();
  const mobility = mobilityColors(theme);
  const totalMoves = STRETCH_BLOCKS.length;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      placement="bottom"
      panelStyle={{
        paddingHorizontal: 0,
        height: SHEET_MAX_HEIGHT,
        maxHeight: SHEET_MAX_HEIGHT,
        overflow: "hidden",
      }}
    >
      <View testID="mobility-preview-sheet" style={styles.sheetBody}>
        <View style={styles.header} className="px-4 pb-2 pt-4">
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

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
        >
          <View
            className="mb-3 rounded-[10px] border px-3 py-2.5"
            style={{ borderColor: mobility.border, backgroundColor: mobility.bg }}
          >
            <Text
              className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: mobility.accent }}
            >
              Coach note
            </Text>
            <Text className="text-xs leading-[1.45]" style={{ color: colors.textSecondary }}>
              {STRETCH_INTRO}
            </Text>
          </View>

          {STRETCH_BLOCKS.map((block, i) => (
            <View
              key={block.id}
              className="mb-2 flex-row items-start gap-2.5 rounded-xl border px-3 py-3"
              style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
            >
              <Text className="min-w-[18px] text-[11px] font-semibold tabular-nums" style={{ color: colors.textTertiary }}>
                {i + 1}
              </Text>
              <View className="min-w-0 flex-1">
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
            </View>
          ))}

          <Text className="mt-2 text-center text-[11px] font-medium" style={{ color: colors.textTertiary }}>
            Full stretch session player ships in RN-6
          </Text>
        </ScrollView>

        <BottomActionBar
          className="border-t px-4 pt-3"
          style={styles.footer}
          bordered
          borderColor={colors.border}
        >
          <PrimaryButton block onPress={onStart ?? onClose}>
            Preview complete
          </PrimaryButton>
          <Pressable onPress={onClose} className="mt-2 items-center py-2">
            <Text className="text-sm font-semibold" style={{ color: colors.textTertiary }}>
              Close
            </Text>
          </Pressable>
        </BottomActionBar>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBody: {
    flex: 1,
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    flexShrink: 0,
  },
  scroll: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  footer: {
    flexShrink: 0,
  },
});
