import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthOAuthButtons } from "@/components/AuthOAuthButtons";
import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { useAppTheme } from "@/hooks/useAppTheme";
import { authLayout } from "@/lib/authLayoutStyles";

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
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        },
      ]}
      testID="auth-welcome-screen"
    >
      <View style={authLayout.welcomeLanding}>
        <View style={authLayout.brandRow}>
          <NewYouSplashMark />
        </View>

        <View
          style={[
            authLayout.heroPreview,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
          accessibilityElementsHidden
        >
          <Text style={[authLayout.heroPreviewLabel, { color: colors.textTertiary }]}>
            App Preview
          </Text>
        </View>

        <View style={authLayout.copyBlock}>
          <Text
            style={[authLayout.headline, { color: colors.textPrimary }]}
            testID="auth-welcome-headline"
          >
            Your program. Smarter every session.
          </Text>
          <Text style={[authLayout.subline, { color: colors.textSecondary }]}>
            Progressive training and nutrition, built around you.
          </Text>
        </View>

        <View style={authLayout.actions}>
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

          <View style={authLayout.signInRow}>
            <Text style={[authLayout.signInPrompt, { color: colors.textSecondary }]}>
              Already have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/(auth)/sign-in")} testID="auth-sign-in-link">
              <Text style={[authLayout.signInLink, { color: colors.accent }]}>Sign in</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
