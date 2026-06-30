import {
  FUTURE_YOU_FAILURE_PRIMARY_CTA,
  FUTURE_YOU_FAILURE_TIPS,
  futureYouFailureCopy,
} from "@newyouai/core";
import { Text, View } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";

type Props = {
  generationError?: string;
  onReupload: () => void;
  /** Onboarding screens use gold accents; tab uses app theme accent. */
  tone?: "onboarding" | "tab";
  testID?: string;
};

export function FutureYouFailureRecovery({
  generationError,
  onReupload,
  tone = "tab",
  testID = "future-you-failure-recovery",
}: Props) {
  const { colors } = useAppTheme();
  const { ob } = useOnboardingTheme();
  const { lead, showTips } = futureYouFailureCopy(generationError);
  const accent = tone === "onboarding" ? ob.gold : colors.buttonPrimary;
  const accentOn = tone === "onboarding" ? ob.goldOn : colors.buttonPrimaryText;

  const isOnboarding = tone === "onboarding";

  return (
    <View
      testID={testID}
      className="w-full gap-6 rounded-[24px] border px-6 py-7"
      style={{
        borderColor: isOnboarding ? "rgba(201, 168, 118, 0.35)" : colors.border,
        backgroundColor: isOnboarding ? "rgba(201, 168, 118, 0.06)" : colors.backgroundSecondary,
      }}
    >
      <Text
        className="text-center text-lg font-semibold leading-[1.45]"
        style={{ color: colors.textPrimary }}
      >
        {lead}
      </Text>

      {showTips ? (
        <View className="gap-3.5 px-1">
          {FUTURE_YOU_FAILURE_TIPS.map((tip) => (
            <View key={tip} className="flex-row gap-2.5">
              <Text
                className="text-[15px] leading-[1.5]"
                style={{ color: isOnboarding ? ob.gold : colors.buttonPrimary }}
              >
                •
              </Text>
              <Text
                className="flex-1 text-[15px] leading-[1.5]"
                style={{ color: colors.textSecondary }}
              >
                {tip}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <PressableScale
        onPress={onReupload}
        accessibilityRole="button"
        accessibilityLabel={FUTURE_YOU_FAILURE_PRIMARY_CTA}
        testID={`${testID}-reupload`}
        style={{
          alignItems: "center",
          borderRadius: 9999,
          paddingVertical: 16,
          backgroundColor: accent,
        }}
      >
        <Text className="text-[16px] font-bold tracking-tight" style={{ color: accentOn }}>
          {FUTURE_YOU_FAILURE_PRIMARY_CTA}
        </Text>
      </PressableScale>
    </View>
  );
}
