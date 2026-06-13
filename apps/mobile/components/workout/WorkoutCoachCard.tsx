import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { WorkoutWarmupGroups } from "@/components/workout/WorkoutWarmupGroups";
import type { WorkoutWarmupGroup } from "@/lib/workout/workoutWarmup";
import { COACH_BLUE_LABEL, coachCardColors } from "@/lib/workoutUiTokens";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  overloadTip: string;
  sessionTip?: string;
  warmupGroups: readonly WorkoutWarmupGroup[];
  warmupTip?: string;
  defaultExpanded?: boolean;
};

export function WorkoutCoachCard({
  overloadTip,
  sessionTip,
  warmupGroups,
  warmupTip,
  defaultExpanded = false,
}: Props) {
  const { colors, theme } = useAppTheme();
  const coachCard = coachCardColors(theme);
  const [open, setOpen] = useState(defaultExpanded);

  return (
    <View
      className="mt-3 overflow-hidden rounded-xl border"
      style={{ borderColor: coachCard.border, backgroundColor: coachCard.background }}
    >
      <Pressable
        testID="workout-coach-card-toggle"
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={open ? "Coach tips, tap to collapse" : "Coach tips, tap to expand"}
        className="flex-row items-center justify-between gap-3 px-4 py-3.5"
      >
        <View className="min-w-0 flex-1">
          <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
            Coach
          </Text>
          {!open ? (
            <Text className="mt-1 text-xs font-medium leading-[1.35]" style={{ color: colors.textTertiary }}>
              Tap for coach note and warm-up
            </Text>
          ) : null}
        </View>
        <Text style={{ color: COACH_BLUE_LABEL, fontSize: 12 }}>{open ? "▲" : "▼"}</Text>
      </Pressable>

      {open ? (
        <View className="gap-3 px-4 pb-4">
          <View>
            <Text
              className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: colors.textTertiary }}
            >
              Coach note
            </Text>
            <Text className="text-[13px] font-medium leading-[1.5]" style={{ color: colors.textSecondary }}>
              {overloadTip}
            </Text>
          </View>

          {sessionTip ? (
            <View
              className="rounded-[10px] border px-3 py-2.5"
              style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
            >
              <Text
                className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: colors.textTertiary }}
              >
                After this session
              </Text>
              <Text className="text-[13px] font-medium leading-[1.5]" style={{ color: colors.textSecondary }}>
                {sessionTip}
              </Text>
            </View>
          ) : null}

          {warmupGroups.length ? (
            <View className="border-t pt-3" style={{ borderColor: colors.border }}>
              <Text className="mb-2.5 text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
                Warm-up
              </Text>
              <WorkoutWarmupGroups groups={warmupGroups} footerTip={warmupTip} />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
