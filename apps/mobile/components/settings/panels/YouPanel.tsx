import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";

import { FutureYouDeleteConfirmSheet } from "@/components/future-you/FutureYouDeleteConfirmSheet";
import { EmailAccountDialog } from "@/components/settings/EmailAccountDialog";
import { IconLogout } from "@/components/icons/FitnessIcons";
import {
  SettingsFormField,
  SettingsHelper,
  SettingsHubSection,
  SettingsProfileHeader,
  SettingsRow,
  SettingsTextField,
} from "@/components/settings/SettingsLayout";
import { SettingsRowIcon } from "@/components/settings/SettingsRowIcon";
import { GradientCard } from "@/components/ui/GradientCard";
import { useAuth } from "@/context/AuthContext";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { connectedAuthProviders, hasEmailPasswordAuth } from "@/lib/accountAuth";
import { stopOnboardingPreview } from "@/lib/devPreviewOnboarding";
import { invokeDeleteUserAccount } from "@newyouai/api-client";

import { deleteUserAccount, isDeleteAccountDryRunEnabled } from "@/lib/deleteUserAccount";
import { resetLocalAfterAccountDelete } from "@/lib/resetAfterAccountDelete";
import { getSupabase, getSupabaseEnv } from "@/lib/supabaseClient";
import { sanitizeUserText } from "@/lib/userText";

// @refresh reset
function providerLabel(provider: string): string {
  if (provider === "apple") return "Apple Sign-In";
  if (provider === "google") return "Google";
  if (provider === "email") return "Email & password";
  return provider;
}

export function YouPanel() {
  const { colors } = useAppTheme();
  const { sessionEmail, session, signOut } = useAuth();
  const { state, setFitnessState, replaceFitnessState } = useFitnessState();
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [deleteAccountStep, setDeleteAccountStep] = useState<null | "warn" | "final">(null);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [deleteAccountNotice, setDeleteAccountNotice] = useState<string | null>(null);
  const [deleteAccountBusy, setDeleteAccountBusy] = useState(false);

  const handleSignOut = useCallback(async () => {
    stopOnboardingPreview();
    await signOut();
    router.replace("/(auth)");
  }, [signOut]);

  const handleDeleteAccount = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setDeleteAccountError("Add Supabase keys to sync.");
      return;
    }

    setDeleteAccountError(null);
    setDeleteAccountNotice(null);
    setDeleteAccountBusy(true);

    const dryRun = isDeleteAccountDryRunEnabled();
    const result = await deleteUserAccount({
      confirmed: true,
      userId: session?.user?.id,
      dryRun,
      invokeDeleteUser: (body) => invokeDeleteUserAccount(sb, getSupabaseEnv(), body),
      signOut,
      onDeleted: async () => {
        const next = await resetLocalAfterAccountDelete();
        replaceFitnessState(next);
      },
    });

    setDeleteAccountBusy(false);

    if (result.error) {
      setDeleteAccountError(result.error);
      return;
    }

    setDeleteAccountStep(null);
    if (result.dryRun) {
      setDeleteAccountNotice("Dry run OK, your account was not deleted.");
    }
  }, [replaceFitnessState, session?.user?.id, signOut]);

  if (!state) return null;

  const providers = connectedAuthProviders(session);
  const showEmailPassword = hasEmailPasswordAuth(session);

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
            {deleteAccountNotice ? (
              <View className="px-4 pt-3">
                <Text className="text-[13px]" style={{ color: colors.textSecondary }}>
                  {deleteAccountNotice}
                </Text>
              </View>
            ) : null}
            {deleteAccountError ? (
              <View className="px-4 pt-3">
                <Text className="text-[13px]" style={{ color: "#f87171" }}>
                  {deleteAccountError}
                </Text>
              </View>
            ) : null}
            {showEmailPassword ? (
              <>
                <SettingsRow
                  label="Email"
                  trailing={sessionEmail}
                  testID="settings-you-email-row"
                  onPress={() => setShowEmailDialog(true)}
                />
                <SettingsRow
                  label="Change password"
                  testID="settings-you-change-password-row"
                  onPress={() => router.push("/(tabs)/settings/you/change-password")}
                />
              </>
            ) : null}
            <SettingsRow
              label="Delete account"
              labelColor="#f87171"
              trailing=""
              testID="settings-delete-account"
              isLast
              disabled={deleteAccountBusy}
              onPress={() => {
                if (deleteAccountBusy) return;
                setDeleteAccountError(null);
                setDeleteAccountNotice(null);
                setDeleteAccountStep("warn");
              }}
            />
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

      {showEmailPassword ? (
        <EmailAccountDialog
          open={showEmailDialog}
          email={sessionEmail!}
          onClose={() => setShowEmailDialog(false)}
        />
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

      {deleteAccountStep === "warn" ? (
        <FutureYouDeleteConfirmSheet
          title="Delete account?"
          cancelLabel="Cancel"
          confirmLabel="Continue"
          message="This will permanently delete your account and all data stored in the cloud. You can cancel now if you only meant to sign out."
          sheetTestID="settings-delete-account-warn-sheet"
          cancelTestID="settings-delete-account-warn-cancel"
          confirmTestID="settings-delete-account-warn-continue"
          onCancel={() => setDeleteAccountStep(null)}
          onConfirm={() => setDeleteAccountStep("final")}
        />
      ) : null}

      {deleteAccountStep === "final" ? (
        <FutureYouDeleteConfirmSheet
          title="Delete account permanently?"
          cancelLabel="Cancel"
          confirmLabel="Delete account"
          confirmBusy={deleteAccountBusy}
          message="This will permanently delete your account and all your data. This cannot be undone."
          sheetTestID="settings-delete-account-final-sheet"
          cancelTestID="settings-delete-account-final-cancel"
          confirmTestID="settings-delete-account-final-confirm"
          onCancel={() => {
            if (!deleteAccountBusy) setDeleteAccountStep(null);
          }}
          onConfirm={() => {
            if (deleteAccountBusy) return;
            void handleDeleteAccount();
          }}
        />
      ) : null}
    </View>
  );
}
