import { FUTURE_YOU_READY_BANNER_LABEL } from "@/lib/futureYouGenerationPillModel";
import { Text, View } from "react-native";

import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";

export function FutureYouReadyBanner() {
  const { ob } = useOnboardingTheme();

  return (
    <View
      testID="future-you-ready-banner"
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      className="mb-4 rounded-[14px] px-[14px] py-3"
      style={{
        backgroundColor: ob.goldOn,
        borderColor: ob.gold,
        borderWidth: 1,
        shadowColor: ob.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.32,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <Text
        className="text-center text-[13px] font-semibold"
        style={{ color: ob.goldMid, letterSpacing: -0.13 }}
      >
        {FUTURE_YOU_READY_BANNER_LABEL}
      </Text>
    </View>
  );
}
