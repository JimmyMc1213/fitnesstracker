import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthOAuthButtons } from "@/components/AuthOAuthButtons";
import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { AuthTextField } from "@/components/ui/AuthTextField";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { authLayout } from "@/lib/authLayoutStyles";
import {
  PASSWORD_RESET_COOLDOWN_MS,
  PASSWORD_RESET_COOLDOWN_MESSAGE,
  PASSWORD_RESET_RESENT_MESSAGE,
  PASSWORD_RESET_SENT_MESSAGE,
} from "@/lib/passwordResetEmail";

export default function SignInScreen() {
  const { colors } = useAppTheme();
  const { ob } = useOnboardingTheme();
  const insets = useSafeAreaInsets();
  const { signInWithPassword, requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetSentAt, setResetSentAt] = useState<number | null>(null);
  const [resetCooldownRemainingMs, setResetCooldownRemainingMs] = useState(0);
  const resetSentAtRef = useRef<number | null>(null);

  useEffect(() => {
    resetSentAtRef.current = resetSentAt;
  }, [resetSentAt]);

  useEffect(() => {
    if (!resetSentAt) {
      setResetCooldownRemainingMs(0);
      return;
    }

    const updateCooldown = () => {
      const sentAt = resetSentAtRef.current;
      if (!sentAt) {
        setResetCooldownRemainingMs(0);
        return;
      }
      const remaining = PASSWORD_RESET_COOLDOWN_MS - (Date.now() - sentAt);
      setResetCooldownRemainingMs(Math.max(0, remaining));
    };

    updateCooldown();
    const intervalId = setInterval(updateCooldown, 1000);
    return () => clearInterval(intervalId);
  }, [resetSentAt]);

  const handleSignIn = async () => {
    setError(null);
    setInfo(null);
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

  const handleForgotPassword = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    if (resetCooldownRemainingMs > 0) {
      setInfo(PASSWORD_RESET_COOLDOWN_MESSAGE);
      return;
    }

    const isResend = resetSentAt != null;
    setResetBusy(true);
    try {
      const result = await requestPasswordReset(email);
      if (result.error) {
        setError(result.error);
        if (result.error === PASSWORD_RESET_COOLDOWN_MESSAGE) {
          setInfo(result.error);
          setError(null);
        }
        return;
      }
      const sentAt = Date.now();
      setResetSentAt(sentAt);
      setInfo(isResend ? PASSWORD_RESET_RESENT_MESSAGE : PASSWORD_RESET_SENT_MESSAGE);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[authLayout.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      testID="auth-sign-in-screen"
    >
      <View
        style={[
          authLayout.screenPadding,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} testID="auth-sign-in-back">
          <Text style={{ color: colors.textPrimary, fontSize: 16 }}>Back</Text>
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
          <AuthTextField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            onEndEditing={(event) => setEmail(event.nativeEvent.text.trim())}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            accessibilityLabel="Email"
            testID="auth-sign-in-email"
          />
          <AuthTextField
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            onEndEditing={(event) => setPassword(event.nativeEvent.text)}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            accessibilityLabel="Password"
            testID="auth-sign-in-password"
            onSubmitEditing={() => void handleSignIn()}
          />
          <Pressable
            style={{ alignSelf: "flex-end", paddingVertical: 4 }}
            onPress={() => void handleForgotPassword()}
            disabled={resetBusy}
            testID="auth-sign-in-forgot-password"
          >
            <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: "600" }}>
              {resetBusy ? "Sending…" : "Forgot password?"}
            </Text>
          </Pressable>
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

        {info ? (
          <Text
            style={{ marginTop: 16, textAlign: "center", fontSize: 14, color: colors.textSecondary }}
            testID="auth-sign-in-info"
          >
            {info}
          </Text>
        ) : null}

        <View style={authLayout.footerActions}>
          <Pressable
            style={[
              authLayout.primaryButton,
              { backgroundColor: ob.gold, opacity: loading ? 0.7 : 1 },
            ]}
            onPress={() => void handleSignIn()}
            disabled={loading}
            testID="auth-sign-in-submit"
          >
            {loading ? (
              <ActivityIndicator color={ob.goldOn} />
            ) : (
              <Text style={[authLayout.primaryButtonText, { color: ob.goldOn, fontWeight: "700" }]}>
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
              <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>Sign up</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
