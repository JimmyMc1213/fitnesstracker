import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";

import { FutureYouDeleteConfirmSheet } from "@/components/future-you/FutureYouDeleteConfirmSheet";
import { IconLogout } from "@/components/icons/FitnessIcons";
import {
  SettingsFormField,
  SettingsFormMessage,
  SettingsHelper,
  SettingsHubSection,
  SettingsPrimaryButton,
  SettingsProfileHeader,
  SettingsRow,
  SettingsSecondaryButton,
  SettingsTextField,
} from "@/components/settings/SettingsLayout";
import { SettingsRowIcon } from "@/components/settings/SettingsRowIcon";
import { GradientCard } from "@/components/ui/GradientCard";
import { useAuth } from "@/context/AuthContext";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { connectedAuthProviders } from "@/lib/accountAuth";
import { stopOnboardingPreview } from "@/lib/devPreviewOnboarding";
import { sanitizeUserText } from "@/lib/userText";

function providerLabel(provider: string): string {
  if (provider === "apple") return "Apple Sign-In";
  if (provider === "google") return "Google";
  if (provider === "email") return "Email & password";
  return provider;
}

export function YouPanel() {
  const { colors } = useAppTheme();
  const { sessionEmail, session, updateEmail, signOut } = useAuth();
  const { state, setFitnessState } = useFitnessState();
  const [emailEditing, setEmailEditing] = useState(false);
  const [emailIn, setEmailIn] = useState(sessionEmail ?? "");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleSignOut = useCallback(async () => {
    stopOnboardingPreview();
    await signOut();
    router.replace("/(auth)");
  }, [signOut]);

  if (!state) return null;

  const providers = connectedAuthProviders(session);

  const resetEmailEdit = () => {
    setEmailEditing(false);
    setEmailIn(sessionEmail ?? "");
    setEmailError(null);
    setEmailSuccess(false);
  };

  return (
    <View className="gap-4">
      <SettingsHelper>Your first name appears in the home greeting.</SettingsHelper>

      <GradientCard spacious testID="settings-you-profile">
        <SettingsProfileHeader name={state.displayName} email={sessionEmail} />

        <View style={{ gap: 16, marginTop: 20 }}>
          <SettingsFormField label="First name">
            <SettingsTextField
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
            />
          </SettingsFormField>
        </View>
      </GradientCard>

      {sessionEmail ? (
        <>
          <SettingsHubSection title="Personal info">
            {emailEditing ? (
              <View className="px-4 py-4" style={{ gap: 14 }}>
                <SettingsFormField label="Email">
                  <SettingsTextField
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
                  />
                </SettingsFormField>
                {emailError ? <SettingsFormMessage tone="error">{emailError}</SettingsFormMessage> : null}
                {emailSuccess ? (
                  <SettingsFormMessage tone="success">
                    A confirmation link has been sent to your new email. It won&apos;t update until you confirm.
                  </SettingsFormMessage>
                ) : null}
                <View className="flex-row" style={{ gap: 10 }}>
                  <SettingsPrimaryButton
                    label="Save"
                    expand
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
                  <SettingsSecondaryButton label="Cancel" disabled={emailBusy} onPress={resetEmailEdit} />
                </View>
              </View>
            ) : (
              <>
                <SettingsRow
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

          <SettingsHubSection title="Account actions">
            <SettingsRow
              icon={
                <SettingsRowIcon>
                  <IconLogout size={16} stroke={1.6} color={colors.textPrimary} />
                </SettingsRowIcon>
              }
              label="Sign out"
              trailing=""
              testID="settings-sign-out"
              isLast
              onPress={() => setShowSignOutConfirm(true)}
            />
          </SettingsHubSection>
        </>
      ) : null}

      {showSignOutConfirm ? (
        <FutureYouDeleteConfirmSheet
          title="Sign out?"
          cancelLabel="Cancel"
          confirmLabel="Sign out"
          message="Your local data stays on this device, but cloud sync pauses until you sign in again."
          sheetTestID="settings-sign-out-sheet"
          cancelTestID="settings-sign-out-cancel"
          confirmTestID="settings-sign-out-confirm"
          onCancel={() => setShowSignOutConfirm(false)}
          onConfirm={() => {
            setShowSignOutConfirm(false);
            void handleSignOut();
          }}
        />
      ) : null}
    </View>
  );
}
