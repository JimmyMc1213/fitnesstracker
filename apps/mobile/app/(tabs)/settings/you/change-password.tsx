import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";

import { CenterDialog, TabScreenFade } from "@/components/motion";
import {
  SettingsFormMessage,
  SettingsHelper,
  SettingsPrimaryButton,
} from "@/components/settings/SettingsLayout";
import { SettingsScreenChrome } from "@/components/settings/SettingsScreenChrome";
import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTabScreenInsets } from "@/lib/tabScreenInsets";
import {
  formatPasswordChangeSentMessage,
  PASSWORD_CHANGE_BUTTON_LABEL,
  PASSWORD_CHANGE_CANCEL_LABEL,
  PASSWORD_CHANGE_CONFIRM_LABEL,
  PASSWORD_CHANGE_CONFIRM_MESSAGE,
  PASSWORD_CHANGE_CONFIRM_TITLE,
  PASSWORD_CHANGE_DONE_LABEL,
  PASSWORD_CHANGE_HELPER,
} from "@newyouai/core";

export default function ChangePasswordScreen() {
  const { colors } = useAppTheme();
  const { contentPaddingBottom } = useTabScreenInsets();
  const { sessionEmail, requestPasswordChangeEmail } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendConfirmationEmail() {
    setBusy(true);
    setError(null);
    const result = await requestPasswordChangeEmail();
    setBusy(false);
    if (result.error) {
      setShowConfirm(false);
      setError(result.error);
      return;
    }
    setShowConfirm(false);
    setShowSuccess(true);
  }

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
          <SettingsHelper>{PASSWORD_CHANGE_HELPER}</SettingsHelper>

          {error ? (
            <View style={{ marginBottom: 16 }}>
              <SettingsFormMessage tone="error">{error}</SettingsFormMessage>
            </View>
          ) : null}

          <SettingsPrimaryButton
            testID="settings-change-password-submit"
            label={PASSWORD_CHANGE_BUTTON_LABEL}
            fullWidth
            disabled={busy}
            onPress={() => {
              setError(null);
              setShowConfirm(true);
            }}
          />
        </ScrollView>
      </SettingsScreenChrome>

      {showConfirm ? (
        <WorkoutConfirmSheet
          sheetTestID="settings-change-password-confirm-sheet"
          cancelTestID="settings-change-password-confirm-cancel"
          confirmTestID="settings-change-password-confirm-send"
          title={PASSWORD_CHANGE_CONFIRM_TITLE}
          message={PASSWORD_CHANGE_CONFIRM_MESSAGE}
          cancelLabel={PASSWORD_CHANGE_CANCEL_LABEL}
          confirmLabel={busy ? "Sending…" : PASSWORD_CHANGE_CONFIRM_LABEL}
          confirmPrimary
          onCancel={() => {
            if (!busy) setShowConfirm(false);
          }}
          onConfirm={() => {
            if (busy) return;
            void sendConfirmationEmail();
          }}
        />
      ) : null}

      {showSuccess && sessionEmail ? (
        <CenterDialog
          open
          onClose={() => setShowSuccess(false)}
          panelStyle={{ padding: 0, maxWidth: 384 }}
        >
          <View testID="settings-change-password-success-sheet" className="w-full overflow-hidden rounded-2xl">
            <View className="px-7 py-7">
              <Text
                testID="settings-change-password-success-message"
                className="text-base leading-6"
                style={{ color: colors.textPrimary }}
              >
                {formatPasswordChangeSentMessage(sessionEmail)}
              </Text>
            </View>
            <View className="border-t" style={{ borderColor: colors.border }}>
              <Pressable
                testID="settings-change-password-success-done"
                onPress={() => setShowSuccess(false)}
                className="items-center py-3.5"
              >
                <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
                  {PASSWORD_CHANGE_DONE_LABEL}
                </Text>
              </Pressable>
            </View>
          </View>
        </CenterDialog>
      ) : null}
    </TabScreenFade>
  );
}
