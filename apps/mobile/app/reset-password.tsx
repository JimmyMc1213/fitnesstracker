import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthTextField } from "@/components/ui/AuthTextField";
import { OnboardingContinueButton } from "@/components/onboarding/OnboardingContinueButton";
import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { authLayout } from "@/lib/authLayoutStyles";
import { hasAuthenticatedUser } from "@/lib/authSession";
import {
  PASSWORD_RESET_CONFIRM_LABEL,
  PASSWORD_RESET_HELPER,
  PASSWORD_RESET_NEW_LABEL,
  PASSWORD_RESET_SUBMIT_LABEL,
  PASSWORD_RESET_SUCCESS_MESSAGE,
} from "@newyouai/core";

export default function ResetPasswordScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { session, sessionResolved, passwordRecoveryPending, completePasswordReset } = useAuth();
  const [newPasswordIn, setNewPasswordIn] = useState("");
  const [confirmPasswordIn, setConfirmPasswordIn] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (sessionResolved && !hasAuthenticatedUser(session) && !passwordRecoveryPending) {
      router.replace("/(auth)/sign-in");
    }
  }, [session, sessionResolved, passwordRecoveryPending]);

  const canSubmit = !busy && newPasswordIn.length > 0 && confirmPasswordIn.length > 0;
  const awaitingSession = !sessionResolved || (passwordRecoveryPending && !hasAuthenticatedUser(session));

  if (awaitingSession) {
    return (
      <View style={[authLayout.screen, { backgroundColor: colors.background, justifyContent: "center" }]}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[authLayout.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      testID="auth-reset-password-screen"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
          justifyContent: "center",
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <NewYouSplashMark size={56} />
        </View>

        <Text
          className="text-2xl font-bold tracking-tight text-center"
          style={{ color: colors.textPrimary, marginBottom: 8 }}
        >
          Choose a new password
        </Text>
        <Text
          className="text-sm leading-[1.5] text-center"
          style={{ color: colors.textSecondary, marginBottom: 24 }}
        >
          {PASSWORD_RESET_HELPER}
        </Text>

        {success ? (
          <View style={{ gap: 16 }}>
            <Text className="text-sm leading-[1.5] text-center" style={{ color: colors.textSecondary }}>
              {PASSWORD_RESET_SUCCESS_MESSAGE}
            </Text>
            <OnboardingContinueButton
              label="Continue"
              onPress={() => router.replace("/(tabs)/home")}
            />
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            <AuthTextField
              testID="auth-reset-password-new"
              placeholder={PASSWORD_RESET_NEW_LABEL}
              value={newPasswordIn}
              onChangeText={(value) => {
                setNewPasswordIn(value);
                setError(null);
              }}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              accessibilityLabel={PASSWORD_RESET_NEW_LABEL}
            />
            <AuthTextField
              testID="auth-reset-password-confirm"
              placeholder={PASSWORD_RESET_CONFIRM_LABEL}
              value={confirmPasswordIn}
              onChangeText={(value) => {
                setConfirmPasswordIn(value);
                setError(null);
              }}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              accessibilityLabel={PASSWORD_RESET_CONFIRM_LABEL}
            />

            {error ? (
              <Text className="text-[13px] leading-[1.5]" style={{ color: "#dc2626" }} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <OnboardingContinueButton
              label={busy ? "Updating…" : PASSWORD_RESET_SUBMIT_LABEL}
              disabled={!canSubmit}
              tone="gold"
              onPress={async () => {
                if (newPasswordIn !== confirmPasswordIn) {
                  setError("New passwords don't match.");
                  return;
                }
                setBusy(true);
                setError(null);
                const result = await completePasswordReset(newPasswordIn);
                setBusy(false);
                if (result.error) {
                  setError(result.error);
                  return;
                }
                setNewPasswordIn("");
                setConfirmPasswordIn("");
                setSuccess(true);
              }}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
