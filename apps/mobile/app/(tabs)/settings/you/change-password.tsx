import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import {
  SettingsFormField,
  SettingsFormMessage,
  SettingsHelper,
  SettingsPrimaryButton,
  SettingsTextField,
} from "@/components/settings/SettingsLayout";
import { SettingsScreenChrome } from "@/components/settings/SettingsScreenChrome";
import { TabScreenFade } from "@/components/motion/TabScreenFade";
import { GradientCard } from "@/components/ui/GradientCard";
import { useAuth } from "@/context/AuthContext";
import { useTabScreenInsets } from "@/lib/tabScreenInsets";

export default function ChangePasswordScreen() {
  const { contentPaddingBottom } = useTabScreenInsets();
  const { changePassword } = useAuth();
  const [currentPasswordIn, setCurrentPasswordIn] = useState("");
  const [newPasswordIn, setNewPasswordIn] = useState("");
  const [confirmPasswordIn, setConfirmPasswordIn] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canSubmit =
    !busy && currentPasswordIn.length > 0 && newPasswordIn.length > 0 && confirmPasswordIn.length > 0;

  return (
    <TabScreenFade>
    <SettingsScreenChrome
      title="Change password"
      onBack={() => router.back()}
      testID="settings-panel-you-change-password"
    >
      <ScrollView
        className="px-screen-x"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: contentPaddingBottom }}
      >
        <SettingsHelper>Enter your current password, then choose a new one.</SettingsHelper>

        <GradientCard spacious testID="settings-change-password-form">
          <View style={{ gap: 16 }}>
            <SettingsFormField label="Current password">
              <SettingsTextField
                testID="settings-change-password-current"
                value={currentPasswordIn}
                onChangeText={(value) => {
                  setCurrentPasswordIn(value);
                  setError(null);
                  setSuccess(false);
                }}
                secureTextEntry
                autoComplete="current-password"
                placeholder="Current password"
              />
            </SettingsFormField>

            <SettingsFormField label="New password">
              <SettingsTextField
                testID="settings-change-password-new"
                value={newPasswordIn}
                onChangeText={(value) => {
                  setNewPasswordIn(value);
                  setError(null);
                  setSuccess(false);
                }}
                secureTextEntry
                autoComplete="new-password"
                placeholder="New password"
              />
            </SettingsFormField>

            <SettingsFormField label="Confirm new password">
              <SettingsTextField
                testID="settings-change-password-confirm"
                value={confirmPasswordIn}
                onChangeText={(value) => {
                  setConfirmPasswordIn(value);
                  setError(null);
                  setSuccess(false);
                }}
                secureTextEntry
                autoComplete="new-password"
                placeholder="Confirm new password"
              />
            </SettingsFormField>

            {error ? <SettingsFormMessage tone="error">{error}</SettingsFormMessage> : null}
            {success ? <SettingsFormMessage tone="success">Password updated.</SettingsFormMessage> : null}

            <SettingsPrimaryButton
              testID="settings-change-password-submit"
              label="Update password"
              fullWidth
              disabled={!canSubmit}
              onPress={async () => {
                if (newPasswordIn !== confirmPasswordIn) {
                  setError("New passwords don't match.");
                  setSuccess(false);
                  return;
                }
                setBusy(true);
                setError(null);
                setSuccess(false);
                const result = await changePassword(currentPasswordIn, newPasswordIn);
                setBusy(false);
                if (result.error) {
                  setError(result.error);
                  return;
                }
                setCurrentPasswordIn("");
                setNewPasswordIn("");
                setConfirmPasswordIn("");
                setSuccess(true);
              }}
            />
          </View>
        </GradientCard>
      </ScrollView>
    </SettingsScreenChrome>
    </TabScreenFade>
  );
}
