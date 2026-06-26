import { ScrollView, Text, View } from "react-native";
import { DevSettings } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { WelcomePhonePreview } from "@/components/WelcomePhonePreview";
import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { authLayout } from "@/lib/authLayoutStyles";
import { isOnboardingDevToolsEnabled, resetOnboardingProgress } from "@/lib/onboardingDevTools";

type OnboardingWelcomeScreenProps = {
  onGetStarted: () => void;
};

export function OnboardingWelcomeScreen({ onGetStarted }: OnboardingWelcomeScreenProps) {
  const { colors, ob } = useOnboardingTheme();
  const insets = useSafeAreaInsets();
  const showDevTools = isOnboardingDevToolsEnabled();

  const onStartFresh = () => {
    void (async () => {
      await resetOnboardingProgress();
      DevSettings.reload();
    })();
  };

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
          <WelcomePhonePreview size="hero" useBrandGold />
        </View>

        <View style={authLayout.welcomeBottom}>
          <View style={authLayout.copyBlock}>
            <Text style={[authLayout.welcomeHeadline, { color: colors.textPrimary }]}>
              Your program. Smarter every session.
            </Text>
            <Text style={[authLayout.subline, { color: colors.textSecondary }]}>
              Progressive training and nutrition, built around you.
            </Text>
          </View>

          <View style={authLayout.actions}>
            <PressableScale
              onPress={onGetStarted}
              testID="onboarding-continue"
              style={[authLayout.primaryButton, { backgroundColor: ob.gold }]}
            >
              <Text style={[authLayout.primaryButtonText, { color: ob.goldOn, fontWeight: "700" }]}>
                Get Started
              </Text>
            </PressableScale>
            {showDevTools ? (
              <PressableScale onPress={onStartFresh} testID="onboarding-start-fresh" style={{ marginTop: 12, paddingVertical: 8 }}>
                <Text className="text-center text-sm" style={{ color: colors.textTertiary }}>
                  Start fresh (dev)
                  {process.env.EXPO_PUBLIC_BUNDLE_MARKER ?
                    ` · ${process.env.EXPO_PUBLIC_BUNDLE_MARKER}`
                  : ""}
                </Text>
              </PressableScale>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
