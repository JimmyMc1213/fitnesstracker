import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { TAB_BAR_FLOAT_OFFSET } from "@/lib/futureYouTokens";
import { TAB_BAR_PILL_HEIGHT } from "@/lib/tabScreenInsets";

type Props = {
  sessionTitle: string;
  onResume: () => void;
  tabBarHidden?: boolean;
};

export function WorkoutResumeBar({ sessionTitle, onResume, tabBarHidden = false }: Props) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottom = tabBarHidden
    ? insets.bottom + 16
    : TAB_BAR_FLOAT_OFFSET + TAB_BAR_PILL_HEIGHT + insets.bottom + 10;

  return (
    <View
      testID="workout-resume-bar"
      className="absolute left-0 right-0 px-screen-x"
      style={{ bottom }}
      pointerEvents="box-none"
    >
      <View
        className="overflow-hidden rounded-2xl border px-4 py-3"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <Text className="mb-2.5 text-center text-xs font-medium" style={{ color: colors.textTertiary }} numberOfLines={1}>
          {sessionTitle.trim() || "Workout"} in progress
        </Text>
        <PrimaryButton testID="workout-resume" onPress={onResume}>
          Resume workout
        </PrimaryButton>
      </View>
    </View>
  );
}

/** Extra scroll padding so idle content clears the fixed resume bar. */
export const WORKOUT_RESUME_BAR_SCROLL_EXTRA = 96;
