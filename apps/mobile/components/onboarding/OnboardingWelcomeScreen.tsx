import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { WelcomePhonePreview } from "@/components/WelcomePhonePreview";
import { useAppTheme } from "@/hooks/useAppTheme";
import { authLayout } from "@/lib/authLayoutStyles";

type OnboardingWelcomeScreenProps = {
  onGetStarted: () => void;
};

export function OnboardingWelcomeScreen({ onGetStarted }: OnboardingWelcomeScreenProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      testID="onboarding-step-0"
      style={[
        authLayout.screen,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 23,
        },
      ]}
    >
      <ScrollView
        style={authLayout.screen}
        contentContainerStyle={authLayout.welcomeLanding}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={authLayout.brandRow}>
          <NewYouSplashMark />
        </View>

        <View style={authLayout.heroRow}>
          <WelcomePhonePreview />
        </View>

        <View style={authLayout.copyBlock}>
          <Text style={[authLayout.welcomeHeadline, { color: colors.textPrimary }]}>
            Your program. Smarter every session.
          </Text>
          <Text style={[authLayout.subline, { color: colors.textSecondary }]}>
            Progressive training and nutrition, built around you.
          </Text>
        </View>

        <View style={[authLayout.actions, { marginTop: "auto" as const, paddingTop: 16 }]}>
          <Pressable
            onPress={onGetStarted}
            testID="onboarding-continue"
            style={[authLayout.primaryButton, { backgroundColor: colors.accent }]}
          >
            <Text style={[authLayout.primaryButtonText, { color: colors.accentText }]}>
              Get Started
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
