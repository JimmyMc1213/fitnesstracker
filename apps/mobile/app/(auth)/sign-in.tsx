import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function SignInScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const result = await signInWithPassword(email, password);
      if (result.error) {
        setError(result.error);
      }
      // Navigation to tabs is handled by useAuthGate when onAuthStateChange updates session.
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        className="flex-1 px-screen-x"
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        }}
        testID="auth-sign-in-screen"
      >
        <Pressable onPress={() => router.back()} testID="auth-sign-in-back">
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
          testID="auth-sign-in-title"
        >
          Welcome back
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
            placeholder="Email"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            accessibilityLabel="Email"
            testID="auth-sign-in-email"
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
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            accessibilityLabel="Password"
            testID="auth-sign-in-password"
          />
        </View>

        {error ? (
          <Text className="mt-4 text-center text-sm text-red-500" testID="auth-sign-in-error">
            {error}
          </Text>
        ) : null}

        <View className="mt-auto gap-4">
          <Pressable
            className="items-center rounded-full py-4"
            style={{ backgroundColor: colors.accent, opacity: loading ? 0.7 : 1 }}
            onPress={() => void handleSignIn()}
            disabled={loading}
            testID="auth-sign-in-submit"
          >
            {loading ? (
              <ActivityIndicator color={colors.accentText} />
            ) : (
              <Text className="text-base font-semibold" style={{ color: colors.accentText }}>
                Sign In
              </Text>
            )}
          </Pressable>

          <Pressable
            className="items-center py-2"
            onPress={() => router.replace("/(auth)/sign-up")}
            testID="auth-sign-in-to-sign-up"
          >
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Don&apos;t have an account? <Text style={{ color: colors.accent, fontWeight: "600" }}>Sign up</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
