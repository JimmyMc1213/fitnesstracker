import type { CoachAdjustment } from "@newyouai/core";
import { greetingFirstName } from "@newyouai/core";
import { Text, View } from "react-native";

import { COACH_BLUE_LABEL } from "@/lib/workoutUiTokens";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  adjustment: CoachAdjustment;
  displayName?: string;
};

export function WeighInCoachReaction({ adjustment, displayName = "" }: Props) {
  const { colors } = useAppTheme();
  const nudge = adjustment.macroNudge;
  const firstName = greetingFirstName(displayName);
  const greeting = firstName ? `Hey ${firstName}, Just Checking in.` : "Hey there, Just Checking in.";

  return (
    <View
      testID="weigh-in-coach-reaction"
      className="mt-2.5 rounded-xl border p-3.5"
      style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
      accessibilityLiveRegion="polite"
    >
      <Text className="text-xs font-medium leading-[1.5]">
        <Text style={{ color: COACH_BLUE_LABEL, fontWeight: "600" }}>Coach: </Text>
        <Text style={{ color: colors.textSecondary }}>{greeting}</Text>
      </Text>
      <Text className="mt-1.5 text-xs font-medium leading-[1.5]" style={{ color: colors.textSecondary }}>
        {adjustment.message}
      </Text>
      {nudge?.deltaCal != null ? (
        <Text className="mt-2 text-[11px] font-medium leading-[1.45]" style={{ color: colors.textTertiary }}>
          +{nudge.deltaCal} cal suggested, {nudge.reason}
        </Text>
      ) : null}
    </View>
  );
}
