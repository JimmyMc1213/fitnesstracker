import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import {
  SettingsDetailCard,
  SettingsFieldLabel,
  SettingsHelper,
  SettingsPrimaryButton,
} from "@/components/settings/SettingsLayout";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function ChangePasswordScreen() {
  const { colors } = useAppTheme();
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
    <ScrollView
      className="px-screen-x"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
      testID="settings-panel-you-change-password"
    >
      <Pressable
        onPress={() => router.back()}
        className="mb-4 self-start rounded-full border px-4 py-2"
        style={{ borderColor: colors.border }}
        testID="settings-panel-back"
      >
        <Text style={{ color: colors.textPrimary }}>Back</Text>
      </Pressable>

      <Text className="mb-4 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
        Change Password
      </Text>

      <SettingsHelper>Enter your current password, then choose a new one.</SettingsHelper>

      <SettingsDetailCard>
        <SettingsFieldLabel>Current password</SettingsFieldLabel>
        <TextInput
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

        <SettingsFieldLabel>New password</SettingsFieldLabel>
        <TextInput
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

        <SettingsFieldLabel>Confirm new password</SettingsFieldLabel>
        <TextInput
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

        {error ? <Text style={{ color: "#f87171", fontSize: 13 }}>{error}</Text> : null}
        {success ? <Text style={{ color: "#78c8ff", fontSize: 13 }}>Password updated.</Text> : null}

        <SettingsPrimaryButton
          testID="settings-change-password-submit"
          label="Update password"
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
      </SettingsDetailCard>
    </ScrollView>
  );
}
