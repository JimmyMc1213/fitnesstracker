import { router } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { useAppTheme } from "@/hooks/useAppTheme";

/** Sign-up UI shell — full flow ships in RN-2-02. */
export default function SignUpScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 px-screen-x"
      style={{
        backgroundColor: colors.background,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 24,
      }}
      testID="auth-sign-up-screen"
    >
      <Pressable onPress={() => router.back()} testID="auth-sign-up-back">
        <Text className="text-base" style={{ color: colors.accent }}>
          Back
        </Text>
      </Pressable>

      <View className="mt-6 items-center">
        <NewYouSplashMark />
      </View>

      <Text
        className="mt-8 text-center text-[26px] font-bold"
        style={{ color: colors.textPrimary }}
        testID="auth-sign-up-title"
      >
        Create your account
      </Text>

      <View className="mt-8 gap-3">
        <TextInput
          className="rounded-full px-5 py-4 text-base"
          style={{
            backgroundColor: colors.card,
            color: colors.textPrimary,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          placeholder="Name"
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel="Name"
          testID="auth-sign-up-name"
        />
        <TextInput
          className="rounded-full px-5 py-4 text-base"
          style={{
            backgroundColor: colors.card,
            color: colors.textPrimary,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          placeholder="Email"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="none"
          keyboardType="email-address"
          accessibilityLabel="Email"
          testID="auth-sign-up-email"
        />
        <TextInput
          className="rounded-full px-5 py-4 text-base"
          style={{
            backgroundColor: colors.card,
            color: colors.textPrimary,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          placeholder="Password"
          placeholderTextColor={colors.textTertiary}
          secureTextEntry
          accessibilityLabel="Password"
          testID="auth-sign-up-password"
        />
      </View>

      <Text className="mt-6 text-center text-sm" style={{ color: colors.textTertiary }}>
        Account creation ships in RN-2-02. Use Sign in if you already have an account.
      </Text>

      <Pressable
        className="mt-auto items-center rounded-full py-4"
        style={{ backgroundColor: colors.accent, opacity: 0.5 }}
        disabled
        testID="auth-sign-up-submit"
      >
        <Text className="text-base font-semibold" style={{ color: colors.accentText }}>
          Create Account
        </Text>
      </Pressable>
    </View>
  );
}
