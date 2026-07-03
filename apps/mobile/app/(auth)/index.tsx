import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthOAuthButtons } from "@/components/AuthOAuthButtons";
import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { FutureYouPhonePreview } from "@/components/FutureYouPhonePreview";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { authLayout } from "@/lib/authLayoutStyles";

type AuthWelcomePhase = "landing" | "auth";

function WelcomeShell({
  children,
  insets,
  testID,
}: {
  children: ReactNode;
  insets: { top: number; bottom: number };
  testID: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        authLayout.screen,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 23,
        },
      ]}
      testID={testID}
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
          <FutureYouPhonePreview size="hero" />
        </View>

        {children}
      </ScrollView>
    </View>
  );
}

export default function AuthWelcomeScreen() {
  const { colors } = useAppTheme();
  const { ob } = useOnboardingTheme();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<AuthWelcomePhase>("landing");
  const [oauthError, setOauthError] = useState<string | null>(null);

  if (phase === "landing") {
    return (
      <WelcomeShell insets={insets} testID="auth-welcome-screen">
        <View style={authLayout.welcomeBottom}>
          <View style={authLayout.copyBlock}>
            <View style={{ alignItems: "center" }} testID="auth-welcome-headline">
              <Text style={[authLayout.welcomeHeadline, { color: colors.textPrimary }]}>
                Discover a new version of
              </Text>
              <Text style={[authLayout.welcomeHeadlineEmphasis, { color: ob.gold }]}>You</Text>
            </View>
            <Text style={[authLayout.subline, { color: colors.textSecondary }]}>
              Progressive training and nutrition, built around you.
            </Text>
          </View>

          <View style={authLayout.actions}>
            <Pressable
              style={[authLayout.primaryButton, { backgroundColor: ob.gold }]}
              onPress={() => setPhase("auth")}
              testID="auth-get-started-button"
            >
              <Text style={[authLayout.primaryButtonText, { color: ob.goldOn, fontWeight: "700" }]}>
                Get Started
              </Text>
            </Pressable>
          </View>
        </View>
      </WelcomeShell>
    );
  }

  return (
    <WelcomeShell insets={insets} testID="auth-welcome-screen">
      <View style={authLayout.welcomeBottom}>
        <View style={authLayout.copyBlock}>
          <Text
            style={[authLayout.welcomeHeadline, { color: colors.textPrimary }]}
            testID="auth-entry-headline"
          >
            Create your account
          </Text>
          <Text style={[authLayout.subline, { color: colors.textSecondary }]}>
            Sign up with email or Apple to get started.
          </Text>
        </View>

        <View style={authLayout.actions}>
        <Pressable
          style={[authLayout.primaryButton, { backgroundColor: ob.gold }]}
          onPress={() => router.push("/(auth)/sign-up")}
          testID="auth-continue-sign-up"
        >
          <Text style={[authLayout.primaryButtonText, { color: ob.goldOn, fontWeight: "700" }]}>
            Sign up with email
          </Text>
        </Pressable>

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
          testID="auth-sign-in-link"
          style={authLayout.signInRow}
          onPress={() => router.push("/(auth)/sign-in")}
          accessibilityRole="link"
        >
          <Text style={[authLayout.signInPrompt, { color: colors.textSecondary }]}>
            Already have an account?{" "}
          </Text>
          <Text style={[authLayout.signInLink, { color: colors.textPrimary }]}>Sign in</Text>
        </Pressable>

        </View>
      </View>
    </WelcomeShell>
  );
}
