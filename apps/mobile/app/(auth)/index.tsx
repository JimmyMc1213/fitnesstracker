import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthOAuthButtons } from "@/components/AuthOAuthButtons";
import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { WelcomePhonePreview } from "@/components/WelcomePhonePreview";
import { useAppTheme } from "@/hooks/useAppTheme";
import { authLayout } from "@/lib/authLayoutStyles";
import { startOnboardingPreview } from "@/lib/devPreviewOnboarding";

export default function AuthWelcomeScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [oauthError, setOauthError] = useState<string | null>(null);

  return (
    <View
      style={[
        authLayout.screen,
        authLayout.screenPadding,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 16,
        },
      ]}
      testID="auth-welcome-screen"
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
          <Text
            style={[authLayout.welcomeHeadline, { color: colors.textPrimary }]}
            testID="auth-welcome-headline"
          >
            Your program. Smarter every session.
          </Text>
          <Text style={[authLayout.subline, { color: colors.textSecondary }]}>
            Progressive training and nutrition, built around you.
          </Text>
        </View>

        <View style={[authLayout.actions, { marginTop: "auto" as const, paddingTop: 12 }]}>
          <AuthOAuthButtons onError={setOauthError} />
          {oauthError ? (
            <Text
              style={{ color: "#ef4444", textAlign: "center", fontSize: 14 }}
              testID="auth-welcome-oauth-error"
            >
              {oauthError}
            </Text>
          ) : null}

          <Pressable
            style={[authLayout.primaryButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push("/(auth)/sign-up")}
            testID="auth-get-started-button"
          >
            <Text style={[authLayout.primaryButtonText, { color: colors.accentText }]}>
              Get Started
            </Text>
          </Pressable>

          <Pressable
            testID="auth-sign-in-link"
            style={authLayout.signInRow}
            onPress={() => router.push("/(auth)/sign-in")}
            accessibilityRole="link"
          >
            <Text style={[authLayout.signInPrompt, { color: colors.textSecondary }]}>
              Already have an account?{" "}
            </Text>
            <Text style={[authLayout.signInLink, { color: colors.accent }]}>Sign in</Text>
          </Pressable>

          {__DEV__ ? (
            <Pressable
              onPress={() => {
                startOnboardingPreview();
                router.replace("/(onboarding)");
              }}
              testID="auth-preview-onboarding"
              style={{ marginTop: 20, alignItems: "center", paddingVertical: 8 }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textSecondary }}>
                Preview onboarding (dev)
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
