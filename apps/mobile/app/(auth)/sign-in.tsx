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
import { authLayout } from "@/lib/authLayoutStyles";

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
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [
    authLayout.input,
    {
      backgroundColor: colors.card,
      color: colors.textPrimary,
      borderColor: colors.border,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[authLayout.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[
          authLayout.screenPadding,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        testID="auth-sign-in-screen"
      >
        <Pressable onPress={() => router.back()} testID="auth-sign-in-back">
          <Text style={{ color: colors.accent, fontSize: 16 }}>Back</Text>
        </Pressable>

        <View style={{ marginTop: 24, alignItems: "center" }}>
          <NewYouSplashMark />
        </View>

        <Text
          style={[
            authLayout.headline,
            { marginTop: 32, color: colors.textPrimary, fontSize: 26 },
          ]}
          testID="auth-sign-in-title"
        >
          Welcome back
        </Text>

        <View style={authLayout.inputStack}>
          <TextInput
            style={inputStyle}
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
            style={inputStyle}
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

        <View style={{ marginTop: 16 }}>
          <AuthOAuthButtons onError={setError} />
        </View>

        {error ? (
          <Text
            style={{ marginTop: 16, textAlign: "center", fontSize: 14, color: "#ef4444" }}
            testID="auth-sign-in-error"
          >
            {error}
          </Text>
        ) : null}

        <View style={authLayout.footerActions}>
          <Pressable
            style={[
              authLayout.primaryButton,
              { backgroundColor: colors.accent, opacity: loading ? 0.7 : 1 },
            ]}
            onPress={() => void handleSignIn()}
            disabled={loading}
            testID="auth-sign-in-submit"
          >
            {loading ? (
              <ActivityIndicator color={colors.accentText} />
            ) : (
              <Text style={[authLayout.primaryButtonText, { color: colors.accentText }]}>
                Sign In
              </Text>
            )}
          </Pressable>

          <Pressable
            style={{ alignItems: "center", paddingVertical: 8 }}
            onPress={() => router.replace("/(auth)/sign-up")}
            testID="auth-sign-in-to-sign-up"
          >
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              Don&apos;t have an account?{" "}
              <Text style={{ color: colors.accent, fontWeight: "600" }}>Sign up</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
