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

import { AuthOAuthButtons } from "@/components/AuthOAuthButtons";
import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function SignUpScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { signUpWithEmail } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    setInfo(null);
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithEmail(email, password, name);
      if (result.error) {
        setError(result.error);
      } else if (result.needsConfirmation) {
        setInfo("Check your inbox and click the confirmation link, then come back and sign in.");
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
            value={name}
            onChangeText={setName}
            autoComplete="name"
            textContentType="name"
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
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
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
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            accessibilityLabel="Password"
            testID="auth-sign-up-password"
          />
        </View>

        <View className="mt-4">
          <AuthOAuthButtons onError={setError} />
        </View>

        {error ? (
          <Text className="mt-4 text-center text-sm text-red-500" testID="auth-sign-up-error">
            {error}
          </Text>
        ) : null}

        {info ? (
          <Text className="mt-4 text-center text-sm" style={{ color: colors.accent }} testID="auth-sign-up-info">
            {info}
          </Text>
        ) : null}

        <View className="mt-auto gap-4">
          <Pressable
            className="items-center rounded-full py-4"
            style={{ backgroundColor: colors.accent, opacity: loading ? 0.7 : 1 }}
            onPress={() => void handleSignUp()}
            disabled={loading}
            testID="auth-sign-up-submit"
          >
            {loading ? (
              <ActivityIndicator color={colors.accentText} />
            ) : (
              <Text className="text-base font-semibold" style={{ color: colors.accentText }}>
                Create Account
              </Text>
            )}
          </Pressable>

          <Pressable
            className="items-center py-2"
            onPress={() => router.replace("/(auth)/sign-in")}
            testID="auth-sign-up-to-sign-in"
          >
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Already have an account? <Text style={{ color: colors.accent, fontWeight: "600" }}>Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
