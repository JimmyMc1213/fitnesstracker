import { router } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import {
  SettingsDetailCard,
  SettingsFieldLabel,
  SettingsHelper,
  SettingsHubSection,
  SettingsPrimaryButton,
  SettingsRow,
} from "@/components/settings/SettingsLayout";
import { useAuth } from "@/context/AuthContext";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { connectedAuthProviders } from "@/lib/accountAuth";
import { sanitizeUserText } from "@/lib/userText";

function providerLabel(provider: string): string {
  if (provider === "apple") return "Apple Sign-In";
  if (provider === "google") return "Google";
  if (provider === "email") return "Email & password";
  return provider;
}

export function YouPanel() {
  const { colors } = useAppTheme();
  const { sessionEmail, session, updateEmail } = useAuth();
  const { state, setFitnessState } = useFitnessState();
  const [emailEditing, setEmailEditing] = useState(false);
  const [emailIn, setEmailIn] = useState(sessionEmail ?? "");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  if (!state) return null;

  const providers = connectedAuthProviders(session);

  const resetEmailEdit = () => {
    setEmailEditing(false);
    setEmailIn(sessionEmail ?? "");
    setEmailError(null);
    setEmailSuccess(false);
  };

  return (
    <View>
      <SettingsHelper>Your first name appears in the home greeting.</SettingsHelper>
      <SettingsDetailCard>
        <SettingsFieldLabel>First name</SettingsFieldLabel>
        <TextInput
          testID="settings-you-display-name"
          value={state.displayName}
          onChangeText={(value) =>
            setFitnessState((prev) => ({
              ...prev,
              displayName: sanitizeUserText(value),
            }))
          }
          placeholder="Your name"
          autoCapitalize="words"
          placeholderTextColor={colors.textTertiary}
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: colors.textPrimary,
            fontSize: 15,
          }}
        />
      </SettingsDetailCard>

      {sessionEmail ? (
        <>
          <SettingsHubSection title="Personal info">
            {emailEditing ? (
              <View className="px-4 py-3" style={{ gap: 12 }}>
                <SettingsFieldLabel>Email</SettingsFieldLabel>
                <TextInput
                  testID="settings-you-email-input"
                  value={emailIn}
                  onChangeText={(value) => {
                    setEmailIn(value);
                    setEmailError(null);
                    setEmailSuccess(false);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textTertiary}
                  style={{
                    marginTop: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    color: colors.textPrimary,
                    fontSize: 15,
                  }}
                />
                {emailError ? (
                  <Text style={{ color: "#f87171", fontSize: 13 }}>{emailError}</Text>
                ) : null}
                {emailSuccess ? (
                  <Text style={{ color: "#78c8ff", fontSize: 13, lineHeight: 18 }}>
                    A confirmation link has been sent to your new email. It won&apos;t update until you confirm.
                  </Text>
                ) : null}
                <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                  <SettingsPrimaryButton
                    label="Save"
                    disabled={emailBusy || !emailIn.includes("@")}
                    onPress={async () => {
                      setEmailBusy(true);
                      setEmailError(null);
                      setEmailSuccess(false);
                      const result = await updateEmail(emailIn);
                      setEmailBusy(false);
                      if (result.error) {
                        setEmailError(result.error);
                        return;
                      }
                      setEmailSuccess(true);
                    }}
                  />
                  <SettingsPrimaryButton label="Cancel" disabled={emailBusy} onPress={resetEmailEdit} />
                </View>
              </View>
            ) : (
              <>
                <SettingsRow
                  icon={<Text style={{ color: colors.textTertiary }}>✉</Text>}
                  label="Email"
                  trailing={sessionEmail}
                  testID="settings-you-email-row"
                  onPress={() => {
                    setEmailIn(sessionEmail);
                    setEmailEditing(true);
                    setEmailError(null);
                    setEmailSuccess(false);
                  }}
                />
                <SettingsRow
                  icon={<Text style={{ color: colors.textTertiary }}>🛡</Text>}
                  label="Change password"
                  testID="settings-you-change-password-row"
                  isLast
                  onPress={() => router.push("/(tabs)/settings/you/change-password")}
                />
              </>
            )}
          </SettingsHubSection>

          <SettingsHubSection title="Connected accounts">
            {providers.length > 0 ? (
              providers.map((provider, index) => (
                <SettingsRow
                  key={provider}
                  label={providerLabel(provider)}
                  trailing="Connected"
                  isLast={index === providers.length - 1}
                  disabled
                />
              ))
            ) : (
              <SettingsRow label="Email & password" trailing="Connected" isLast disabled />
            )}
          </SettingsHubSection>
        </>
      ) : null}
    </View>
  );
}
