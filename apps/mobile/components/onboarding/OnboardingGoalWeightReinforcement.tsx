import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";

export function OnboardingGoalWeightReinforcement({
  headline,
  subtext,
}: {
  headline: ReactNode;
  subtext: string;
}) {
  const { ob } = useOnboardingTheme();

  return (
    <View className="flex-1 items-center justify-center px-2 py-6">
      <Text
        className="max-w-[320px] text-center text-[30px] font-bold leading-tight tracking-tight"
        style={{ color: ob.headline }}
      >
        {headline}
      </Text>
      <Text
        className="mt-5 max-w-[296px] text-center text-[15px] leading-[1.55]"
        style={{ color: ob.helper }}
      >
        {subtext}
      </Text>
    </View>
  );
}
