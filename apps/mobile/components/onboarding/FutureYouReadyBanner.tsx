import { FUTURE_YOU_READY_BANNER_LABEL } from "@/lib/futureYouGenerationPillModel";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export function FutureYouReadyBanner() {
  const { colors } = useAppTheme();

  return (
    <View
      testID="future-you-ready-banner"
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      className="mb-4 rounded-xl px-4 py-3"
      style={{ backgroundColor: colors.accent + "22", borderColor: colors.accent, borderWidth: 1 }}
    >
      <Text className="text-center text-sm font-medium" style={{ color: colors.accent }}>
        {FUTURE_YOU_READY_BANNER_LABEL}
      </Text>
    </View>
  );
}
