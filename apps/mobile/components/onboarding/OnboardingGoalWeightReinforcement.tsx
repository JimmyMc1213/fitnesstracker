import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export function OnboardingGoalWeightReinforcement({
  headline,
  subtext,
}: {
  headline: ReactNode;
  subtext: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View className="flex-1 items-center justify-center px-2">
      <Text className="text-center text-[26px] font-bold leading-snug" style={{ color: colors.textPrimary }}>
        {headline}
      </Text>
      <Text className="mt-4 text-center text-base leading-relaxed" style={{ color: colors.textSecondary }}>
        {subtext}
      </Text>
    </View>
  );
}
