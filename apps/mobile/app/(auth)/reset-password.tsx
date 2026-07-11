import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { AuthTextField } from "@/components/ui/AuthTextField";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { authLayout } from "@/lib/authLayoutStyles";

export default function ResetPasswordScreen() {
  const { colors } = useAppTheme();
  const { ob } = useOnboardingTheme();
  const insets = useSafeAreaInsets();
  const { session, setPasswordFromRecovery } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!session) {
      setError("This reset link has expired. Request a new one from the sign-in screen.");
      return;
    }
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await setPasswordFromRecovery(newPassword);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[authLayout.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      testID="auth-reset-password-screen"
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
        <Pressable onPress={() => router.back()} testID="auth-reset-password-back">
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
          testID="auth-reset-password-title"
        >
          Choose a new password
        </Text>

        <Text style={[authLayout.subline, { marginTop: 12, color: colors.textSecondary }]}>
          Choose a new password for your account.
        </Text>

        {success ? (
          <View style={{ marginTop: 32, gap: 16 }}>
            <Text
              style={{ textAlign: "center", fontSize: 15, color: colors.textSecondary, lineHeight: 22 }}
              testID="auth-reset-password-success"
            >
              Password updated. You&apos;re all set.
            </Text>
            <Pressable
              style={[authLayout.primaryButton, { backgroundColor: ob.gold }]}
              onPress={() => router.replace("/(tabs)/home")}
              testID="auth-reset-password-continue"
            >
              <Text style={[authLayout.primaryButtonText, { color: ob.goldOn, fontWeight: "700" }]}>
                Continue
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={[authLayout.inputStack, { marginTop: 24 }]}>
              <AuthTextField
                placeholder="New password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                accessibilityLabel="New password"
                testID="auth-reset-password-new"
              />
              <AuthTextField
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                accessibilityLabel="Confirm new password"
                testID="auth-reset-password-confirm"
                onSubmitEditing={() => void handleSubmit()}
              />
            </View>

            {error ? (
              <Text
                style={{ marginTop: 16, textAlign: "center", fontSize: 14, color: "#ef4444" }}
                testID="auth-reset-password-error"
              >
                {error}
              </Text>
            ) : null}

            <View style={[authLayout.footerActions, { marginTop: 24 }]}>
              <Pressable
                style={[
                  authLayout.primaryButton,
                  { backgroundColor: ob.gold, opacity: loading ? 0.7 : 1 },
                ]}
                onPress={() => void handleSubmit()}
                disabled={loading}
                testID="auth-reset-password-submit"
              >
                {loading ? (
                  <ActivityIndicator color={ob.goldOn} />
                ) : (
                  <Text style={[authLayout.primaryButtonText, { color: ob.goldOn, fontWeight: "700" }]}>
                    Update password
                  </Text>
                )}
              </Pressable>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
