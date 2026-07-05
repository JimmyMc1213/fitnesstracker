import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { BottomSheet } from "@/components/motion";

import { BottomActionBar } from "@/components/BottomActionBar";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import type { PreWorkoutCoachBrief } from "@/lib/preWorkoutCoachBrief";
import { COACH_BLUE_LABEL, coachCardColors } from "@/lib/workoutUiTokens";
import { useAppTheme } from "@/hooks/useAppTheme";
import { weekdayFullName } from "@newyouai/core";
import type { WorkoutRoutineTemplate } from "@newyouai/types";

type Props = {
  open: boolean;
  template: WorkoutRoutineTemplate;
  coachBrief?: PreWorkoutCoachBrief;
  onClose: () => void;
  onOpenMenu: () => void;
  onStart: () => void;
};

const SHEET_MAX_HEIGHT = Math.round(Dimensions.get("window").height * 0.78);

export function RoutinePreviewSheet({
  open,
  template,
  coachBrief,
  onClose,
  onOpenMenu,
  onStart,
}: Props) {
  const { colors, theme } = useAppTheme();
  const coachCard = coachCardColors(theme);
  const totalSets = template.exercises.reduce((a, e) => a + e.sets.length, 0);
  const dayLabel = template.dayLabel.trim();
  const dayDisplay = dayLabel ? weekdayFullName(dayLabel) : "Workout";

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
      <View testID="routine-preview-sheet" style={styles.sheetBody}>
          <View style={styles.header} className="px-4 pb-2 pt-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text
                  className="mb-1 text-[10px] font-semibold tracking-widest"
                  style={{ color: colors.textTertiary }}
                >
                  {dayDisplay}
                </Text>
                <Text className="text-xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                  {template.name}
                </Text>
              </View>
              <Pressable
                onPress={onOpenMenu}
                accessibilityLabel={`Options for ${template.name}`}
                className="h-9 w-9 items-center justify-center"
              >
                <Text style={{ color: colors.textSecondary, fontSize: 20 }}>⋮</Text>
              </Pressable>
            </View>

            {template.focus.trim() ? (
              <Text className="mt-2 text-xs leading-[1.45]" style={{ color: colors.textSecondary }}>
                {template.focus}
              </Text>
            ) : null}

            <Text className="mt-2 text-[11px] font-medium tabular-nums" style={{ color: colors.textTertiary }}>
              {template.exercises.length} exercise{template.exercises.length === 1 ? "" : "s"} · {totalSets} set
              {totalSets === 1 ? "" : "s"}
            </Text>

            {coachBrief ? (
              <View
                className="mt-3 rounded-[10px] border px-3 py-2.5"
                style={{ borderColor: coachCard.border, backgroundColor: coachCard.background }}
              >
                <Text
                  className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: COACH_BLUE_LABEL }}
                >
                  Coach
                </Text>
                <Text className="text-[13px] font-semibold leading-[1.45]" style={{ color: colors.textPrimary }}>
                  {coachBrief.headline}
                </Text>
                {coachBrief.rationale ? (
                  <Text className="mt-1.5 text-xs font-medium leading-[1.45]" style={{ color: colors.textSecondary }}>
                    {coachBrief.rationale}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
          >
            {template.exercises.map((ex, i) => (
              <View
                key={ex.id}
                className="mb-2 flex-row items-start gap-2.5 rounded-xl border px-3 py-2.5"
                style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
              >
                <Text className="min-w-[18px] text-[11px] font-semibold tabular-nums" style={{ color: colors.textTertiary }}>
                  {i + 1}
                </Text>
                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
                    {ex.name}
                  </Text>
                  <Text className="mt-0.5 text-xs font-medium" style={{ color: colors.textTertiary }}>
                    {ex.target.trim() || `${ex.sets.length} sets`}
                    {ex.target.trim() ? ` · ${ex.sets.length} set${ex.sets.length === 1 ? "" : "s"}` : ""}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <BottomActionBar
            className="border-t px-4 pt-3"
            style={styles.footer}
            bordered
            borderColor={colors.border}
          >
            <PrimaryButton
              block
              testID={`workout-start-${template.id}`}
              onPress={onStart}
              disabled={template.exercises.length === 0}
            >
              Start workout
            </PrimaryButton>
            {template.exercises.length === 0 ? (
              <Text className="mt-2 text-center text-[11px]" style={{ color: colors.textTertiary }}>
                Add exercises before starting.
              </Text>
            ) : (
              <Pressable onPress={onClose} className="mt-2 items-center py-2">
                <Text className="text-sm font-semibold" style={{ color: colors.textTertiary }}>
                  Cancel
                </Text>
              </Pressable>
            )}
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
    flex: 1,
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
