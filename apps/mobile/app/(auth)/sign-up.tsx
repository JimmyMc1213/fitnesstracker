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
        testID="auth-sign-up-screen"
      >
        <Pressable onPress={() => router.back()} testID="auth-sign-up-back">
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
          testID="auth-sign-up-title"
        >
          Create your account
        </Text>

        <View style={authLayout.inputStack}>
          <TextInput
            style={inputStyle}
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
            testID="auth-sign-up-email"
          />
          <TextInput
            style={inputStyle}
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

        <View style={{ marginTop: 16 }}>
          <AuthOAuthButtons onError={setError} />
        </View>

        {error ? (
          <Text
            style={{ marginTop: 16, textAlign: "center", fontSize: 14, color: "#ef4444" }}
            testID="auth-sign-up-error"
          >
            {error}
          </Text>
        ) : null}

        {info ? (
          <Text
            style={{ marginTop: 16, textAlign: "center", fontSize: 14, color: colors.accent }}
            testID="auth-sign-up-info"
          >
            {info}
          </Text>
        ) : null}

        <View style={authLayout.footerActions}>
          <Pressable
            style={[
              authLayout.primaryButton,
              { backgroundColor: colors.accent, opacity: loading ? 0.7 : 1 },
            ]}
            onPress={() => void handleSignUp()}
            disabled={loading}
            testID="auth-sign-up-submit"
          >
            {loading ? (
              <ActivityIndicator color={colors.accentText} />
            ) : (
              <Text style={[authLayout.primaryButtonText, { color: colors.accentText }]}>
                Create Account
              </Text>
            )}
          </Pressable>

          <Pressable
            style={{ alignItems: "center", paddingVertical: 8 }}
            onPress={() => router.replace("/(auth)/sign-in")}
            testID="auth-sign-up-to-sign-in"
          >
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              Already have an account?{" "}
              <Text style={{ color: colors.accent, fontWeight: "600" }}>Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
