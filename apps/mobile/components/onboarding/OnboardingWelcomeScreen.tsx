import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { useAppTheme } from "@/hooks/useAppTheme";

type OnboardingWelcomeScreenProps = {
  onGetStarted: () => void;
};

function PhonePreviewPlaceholder() {
  const { colors } = useAppTheme();

  return (
    <View
      className="h-48 w-full items-center justify-center rounded-3xl border"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
      accessibilityElementsHidden
    >
      <Text className="text-sm font-medium" style={{ color: colors.textTertiary }}>
        App Preview
      </Text>
    </View>
  );
}

export function OnboardingWelcomeScreen({ onGetStarted }: OnboardingWelcomeScreenProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      testID="onboarding-step-0"
      className="flex-1"
      style={{
        backgroundColor: colors.background,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 23,
      }}
    >
      <View className="items-center pt-4">
        <NewYouSplashMark />
      </View>

      <View className="mt-8">
        <PhonePreviewPlaceholder />
      </View>

      <View className="mt-8">
        <Text className="text-center text-[28px] font-bold leading-tight" style={{ color: colors.textPrimary }}>
          Your program. Smarter every session.
        </Text>
        <Text className="mt-3 text-center text-base" style={{ color: colors.textSecondary }}>
          Progressive training and nutrition, built around you.
        </Text>
      </View>

      <View className="mt-auto">
        <Pressable
          onPress={onGetStarted}
          testID="onboarding-continue"
          className="items-center rounded-full py-4"
          style={{ backgroundColor: colors.accent }}
        >
          <Text className="text-base font-semibold" style={{ color: colors.accentText }}>
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
