import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthOAuthButtons } from "@/components/AuthOAuthButtons";
import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { FutureYouPhonePreview } from "@/components/FutureYouPhonePreview";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { authLayout } from "@/lib/authLayoutStyles";
import { isWelcomeCompactLayout } from "@/lib/welcomeHeroLayout";

type AuthWelcomePhase = "landing" | "auth";

function WelcomeShell({
  children,
  insets,
  testID,
  compact,
  phase,
}: {
  children: ReactNode;
  insets: { top: number; bottom: number };
  testID: string;
  compact: boolean;
  phase: AuthWelcomePhase;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        authLayout.screen,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + (compact ? 8 : 12),
          paddingBottom: insets.bottom + (compact ? 12 : 16),
          paddingHorizontal: 23,
          overflow: "hidden",
        },
      ]}
      testID={testID}
    >
      <View style={authLayout.welcomeLanding}>
        <View style={authLayout.brandRow}>
          <NewYouSplashMark iconOnly size={compact ? 44 : 48} />
        </View>

        <View style={authLayout.heroRow}>
          <FutureYouPhonePreview size="hero" welcomePhase={phase} />
        </View>

        {children}
      </View>
    </View>
  );
}

export default function AuthWelcomeScreen() {
  const { colors } = useAppTheme();
  const { ob } = useOnboardingTheme();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const [phase, setPhase] = useState<AuthWelcomePhase>("landing");
  const [oauthError, setOauthError] = useState<string | null>(null);
  const compact = isWelcomeCompactLayout(screenHeight, insets, phase);

  if (phase === "landing") {
    return (
      <WelcomeShell compact={compact} insets={insets} phase="landing" testID="auth-welcome-screen">
        <View style={authLayout.welcomeBottom}>
          <View style={authLayout.copyBlock}>
            <Text
              style={[
                authLayout.welcomeHeadline,
                compact ? authLayout.welcomeHeadlineCompact : null,
                { color: colors.textPrimary },
              ]}
              testID="auth-welcome-headline"
            >
              Smarter training for a{" "}
              <Text style={{ color: ob.gold }}>stronger you.</Text>
            </Text>
            <Text
              style={[
                authLayout.subline,
                compact ? authLayout.sublineCompact : null,
                { color: colors.textSecondary },
              ]}
            >
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
    <WelcomeShell compact={compact} insets={insets} phase="auth" testID="auth-welcome-screen">
      <View style={authLayout.welcomeBottom}>
        <View style={authLayout.copyBlock}>
          <Text
            style={[
              authLayout.welcomeHeadline,
              compact ? authLayout.welcomeHeadlineCompact : null,
              { color: colors.textPrimary },
            ]}
            testID="auth-entry-headline"
          >
            Create your account
          </Text>
          <Text
            style={[
              authLayout.subline,
              compact ? authLayout.sublineCompact : null,
              { color: colors.textSecondary },
            ]}
          >
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
