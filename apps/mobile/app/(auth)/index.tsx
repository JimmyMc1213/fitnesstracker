import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthOAuthButtons } from "@/components/AuthOAuthButtons";
import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function AuthWelcomeScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [oauthError, setOauthError] = useState<string | null>(null);

  return (
    <View
      className="flex-1 px-screen-x"
      style={{
        backgroundColor: colors.background,
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24,
      }}
      testID="auth-welcome-screen"
    >
      <View className="items-center pt-6">
        <NewYouSplashMark />
      </View>

      <View
        className="mt-10 flex-1 items-center justify-center rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
        accessibilityElementsHidden
      >
        <Text className="text-sm" style={{ color: colors.textTertiary }}>
          App Preview
        </Text>
      </View>

      <View className="mt-8">
        <Text
          className="text-center text-[28px] font-bold leading-tight"
          style={{ color: colors.textPrimary }}
          testID="auth-welcome-headline"
        >
          Your program. Smarter every session.
        </Text>
        <Text className="mt-3 text-center text-base" style={{ color: colors.textSecondary }}>
          Progressive training and nutrition, built around you.
        </Text>
      </View>

      <View className="mt-6">
        <AuthOAuthButtons onError={setOauthError} />
        {oauthError ? (
          <Text className="mt-3 text-center text-sm text-red-500" testID="auth-welcome-oauth-error">
            {oauthError}
          </Text>
        ) : null}
      </View>

      <View className="mt-6 gap-4">
        <Pressable
          className="items-center rounded-full py-4"
          style={{ backgroundColor: colors.accent }}
          onPress={() => router.push("/(auth)/sign-up")}
          testID="auth-get-started-button"
        >
          <Text className="text-base font-semibold" style={{ color: colors.accentText }}>
            Get Started
          </Text>
        </Pressable>

        <View className="flex-row flex-wrap items-center justify-center">
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            Already have an account?{" "}
          </Text>
          <Pressable onPress={() => router.push("/(auth)/sign-in")} testID="auth-sign-in-link">
            <Text className="text-sm font-semibold" style={{ color: colors.accent }}>
              Sign in
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
