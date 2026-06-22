import { router } from "expo-router";
import { useCallback, useState, type ReactNode } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import {
  formatVolumeFromOz,
  ISSUE_REPORT_SETTINGS_LABEL,
  nutritionGoalLabel,
  nutritionGoalSettingsLabel,
} from "@newyouai/core";

import { FutureYouDeleteConfirmSheet } from "@/components/future-you/FutureYouDeleteConfirmSheet";
import { TabScreenFade } from "@/components/motion/TabScreenFade";
import { ReportIssueDialog } from "@/components/settings/ReportIssueDialog";
import { SettingsScreenChrome } from "@/components/settings/SettingsScreenChrome";
import {
  IconBell,
  IconDocument,
  IconDroplet,
  IconDumbbell,
  IconFlag,
  IconHabits,
  IconLogout,
  IconMail,
  IconMoon,
  IconRun,
  IconScale,
  IconSettings,
  IconShield,
  IconSpeakerphone,
  IconSun,
  IconSync,
  IconToolsKitchen2,
} from "@/components/icons/FitnessIcons";
import { SettingsRowIcon } from "@/components/settings/SettingsRowIcon";
import { useAuth } from "@/context/AuthContext";
import { useFitnessState } from "@/context/FitnessContext";
import { useFitnessSync } from "@/context/FitnessSyncContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { deleteUserAccount, isDeleteAccountDryRunEnabled } from "@/lib/deleteUserAccount";
import { stopOnboardingPreview } from "@/lib/devPreviewOnboarding";
import { EQUIPMENT_SETUP_LABELS } from "@/lib/equipmentSetup";
import { resetLocalAfterAccountDelete } from "@/lib/resetAfterAccountDelete";
import type { SettingsPanelId } from "@/lib/settingsPanelRegistry";
import {
  SETTINGS_PRIVACY_POLICY_URL,
  SETTINGS_SUPPORT_EMAIL,
  SETTINGS_TERMS_URL,
} from "@/lib/settingsLinks";
import { getSupabase } from "@/lib/supabaseClient";
import { formatWeightFromLbs } from "@/lib/unitConversions";
import { volumeUnitLabel, weightUnitLabel } from "@/lib/unitLabels";
import {
  SettingsHubSection,
  SettingsProfileCard,
  SettingsRow,
} from "@/components/settings/SettingsLayout";
import { useTabScreenInsets } from "@/lib/tabScreenInsets";
import { formatRestDuration } from "@/lib/workout/restTimerPreferences";

function rowIcon(node: ReactNode) {
  return <SettingsRowIcon>{node}</SettingsRowIcon>;
}

function openPanel(panelId: SettingsPanelId) {
  router.push(`/(tabs)/settings/${panelId}`);
}

async function openExternalUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    // Best-effort, device may block unknown schemes.
  }
}

export default function SettingsHubScreen() {
  const { colors, theme } = useAppTheme();
  const { contentPaddingBottom } = useTabScreenInsets();
  const { configured, session, sessionEmail, signOut } = useAuth();
  const { lastSyncedLabel } = useFitnessSync();
  const { state, replaceFitnessState } = useFitnessState();

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [deleteAccountStep, setDeleteAccountStep] = useState<null | "warn" | "final">(null);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [deleteAccountNotice, setDeleteAccountNotice] = useState<string | null>(null);
  const [deleteAccountBusy, setDeleteAccountBusy] = useState(false);
  const [reportIssueOpen, setReportIssueOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    stopOnboardingPreview();
    const next = await resetLocalAfterAccountDelete();
    replaceFitnessState(next);
    await signOut();
    router.replace("/(auth)");
  }, [replaceFitnessState, signOut]);

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
      invokeDeleteUser: (body) => sb.functions.invoke("delete-user", { method: "POST", body }),
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

  if (!state) {
    return (
      <SettingsScreenChrome
        title="Settings"
        onBack={() => router.back()}
        backLabel="Back to home"
        testID="settings-hub"
      >
        <View className="flex-1 px-screen-x" />
      </SettingsScreenChrome>
    );
  }

  const volumeUnit = state.unitPreferences.volumeUnit;
  const weightUnit = state.unitPreferences.weightUnit;
  const accountTrailing = !configured
    ? "Not configured"
    : sessionEmail
      ? (lastSyncedLabel ?? "Signed in")
      : "Sign in";
  const nutritionTargets = state.nutritionTargets;

  return (
    <>
      <TabScreenFade>
      <SettingsScreenChrome
        title="Settings"
        onBack={() => router.back()}
        backLabel="Back to home"
        testID="settings-hub"
      >
        <ScrollView
          className="px-screen-x"
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: contentPaddingBottom }}
        >
        <SettingsProfileCard name={state.displayName} onPress={() => openPanel("you")} />

        <SettingsHubSection title="Account">
          <SettingsRow
            icon={rowIcon(<IconSync size={16} stroke={1.6} color={colors.textPrimary} />)}
            label="Sync & backup"
            trailing={accountTrailing}
            testID="settings-row-account"
            onPress={() => openPanel("account")}
          />
        </SettingsHubSection>

        <SettingsHubSection title="Preferences">
          <SettingsRow
            icon={rowIcon(
              theme === "dark" ? (
                <IconMoon size={16} stroke={1.6} color={colors.textPrimary} />
              ) : (
                <IconSun size={16} stroke={1.6} color={colors.textPrimary} />
              ),
            )}
            label="Appearance"
            trailing={theme === "dark" ? "Dark" : "Light"}
            testID="settings-row-appearance"
            onPress={() => openPanel("appearance")}
          />
          <SettingsRow
            icon={rowIcon(<IconScale size={16} stroke={1.6} color={colors.textPrimary} />)}
            label="Units"
            trailing={`${weightUnitLabel(weightUnit)}, ${volumeUnitLabel(volumeUnit)}`}
            testID="settings-row-units"
            onPress={() => openPanel("units")}
          />
        </SettingsHubSection>

        <SettingsHubSection title="Goals & tracking">
          <SettingsRow
            icon={rowIcon(<IconToolsKitchen2 size={16} stroke={1.6} color={colors.textPrimary} />)}
            label="Fuel targets"
            trailing={`${nutritionTargets.cal} cal`}
            testID="settings-row-fuel-targets"
            onPress={() => openPanel("fuel-targets")}
          />
          <SettingsRow
            icon={rowIcon(<IconDroplet size={16} stroke={1.6} color={colors.textPrimary} />)}
            label="Hydration"
            trailing={formatVolumeFromOz(state.waterDailyTargetOz, volumeUnit)}
            testID="settings-row-hydration"
            onPress={() => openPanel("hydration")}
          />
          {state.onboardingProfile ? (
            <SettingsRow
              icon={rowIcon(<IconFlag size={16} stroke={1.6} color={colors.textPrimary} />)}
              label="Goal"
              trailing={
                state.progressGoal
                  ? `${nutritionGoalLabel(state.onboardingProfile.goal ?? "maintain")} · ${formatWeightFromLbs(state.progressGoal.goalWeightLowLbs, weightUnit)}–${formatWeightFromLbs(state.progressGoal.goalWeightHighLbs, weightUnit)} ${weightUnitLabel(weightUnit)}`
                  : nutritionGoalSettingsLabel(state.onboardingProfile.goal ?? "maintain")
              }
              testID="settings-row-goal"
              onPress={() => openPanel("goal")}
            />
          ) : null}
          <SettingsRow
            icon={rowIcon(<IconBell size={16} stroke={1.6} color={colors.textPrimary} />)}
            label="Tracking reminders"
            testID="settings-row-reminders"
            onPress={() => openPanel("reminders")}
          />
          <SettingsRow
            icon={rowIcon(<IconRun size={16} stroke={1.6} color={colors.textPrimary} />)}
            label="Steps"
            trailing={`${state.stepsTarget.toLocaleString()} steps`}
            testID="settings-row-program"
            onPress={() => openPanel("program")}
          />
        </SettingsHubSection>

        <SettingsHubSection title="Training">
          <SettingsRow
            icon={rowIcon(<IconSettings size={16} stroke={1.6} color={colors.textPrimary} />)}
            label="Rest timer"
            trailing={formatRestDuration(state.restTimerDefaultSeconds)}
            testID="settings-row-rest-timer"
            onPress={() => openPanel("rest-timer")}
          />
          <SettingsRow
            icon={rowIcon(<IconDumbbell size={16} stroke={1.6} color={colors.textPrimary} />)}
            label="Equipment"
            trailing={EQUIPMENT_SETUP_LABELS[state.equipmentSetup]}
            testID="settings-row-equipment"
            onPress={() => openPanel("equipment")}
          />
        </SettingsHubSection>

        <SettingsHubSection title="Habits">
          <SettingsRow
            icon={rowIcon(<IconHabits size={16} stroke={1.6} color={colors.textPrimary} />)}
            label="Daily habits checklist"
            trailing={`${state.habitTemplates.length} habits`}
            testID="settings-row-habits"
            onPress={() => openPanel("habits")}
          />
        </SettingsHubSection>

        <SettingsHubSection title="Help & support">
          <SettingsRow
            icon={rowIcon(<IconFlag size={16} stroke={1.6} color={colors.textPrimary} />)}
            label={ISSUE_REPORT_SETTINGS_LABEL}
            testID="settings-row-report-issue"
            onPress={() => setReportIssueOpen(true)}
          />
          <SettingsRow
            icon={rowIcon(<IconMail size={16} stroke={1.6} color={colors.textPrimary} />)}
            label="Support email"
            testID="settings-row-support-email"
            onPress={() => void openExternalUrl(`mailto:${SETTINGS_SUPPORT_EMAIL}`)}
          />
          <SettingsComingSoonRow
            icon={rowIcon(<IconSpeakerphone size={16} stroke={1.6} color={colors.textPrimary} />)}
            label="Request a feature"
            isLast
          />
        </SettingsHubSection>

        <SettingsHubSection title="Legal">
          <SettingsRow
            icon={rowIcon(<IconDocument size={16} stroke={1.6} color={colors.textPrimary} />)}
            label="Terms of service"
            testID="settings-row-terms"
            onPress={() => void openExternalUrl(SETTINGS_TERMS_URL)}
          />
          <SettingsRow
            icon={rowIcon(<IconShield size={16} stroke={1.6} color={colors.textPrimary} />)}
            label="Privacy policy"
            testID="settings-row-privacy"
            isLast
            onPress={() => void openExternalUrl(SETTINGS_PRIVACY_POLICY_URL)}
          />
        </SettingsHubSection>

        <SettingsHubSection title="Socials">
          <SettingsComingSoonRow
            icon={rowIcon(<Text className="text-[10px] font-bold" style={{ color: colors.textPrimary }}>IG</Text>)}
            label="Instagram"
          />
          <SettingsComingSoonRow
            icon={rowIcon(<Text className="text-[10px] font-bold" style={{ color: colors.textPrimary }}>TT</Text>)}
            label="TikTok"
          />
          <SettingsComingSoonRow
            icon={rowIcon(<Text className="text-[10px] font-bold" style={{ color: colors.textPrimary }}>X</Text>)}
            label="X"
            isLast
          />
        </SettingsHubSection>

        {sessionEmail ? (
          <SettingsHubSection title="Account actions">
            <SettingsRow
              icon={rowIcon(<IconLogout size={16} stroke={1.6} color={colors.textPrimary} />)}
              label="Sign out"
              trailing=""
              testID="settings-sign-out"
              isLast
              onPress={() => setShowSignOutConfirm(true)}
            />
          </SettingsHubSection>
        ) : null}

        {sessionEmail ? (
          <View className="mt-2">
            {deleteAccountNotice ? (
              <Text className="mb-2 text-center text-[13px]" style={{ color: colors.textSecondary }}>
                {deleteAccountNotice}
              </Text>
            ) : null}
            {deleteAccountError ? (
              <Text className="mb-2 text-center text-[13px]" style={{ color: "#f87171" }}>
                {deleteAccountError}
              </Text>
            ) : null}
            <Pressable
              disabled={deleteAccountBusy}
              className="items-center rounded-xl border px-4 py-3.5"
              style={{ borderColor: colors.border, opacity: deleteAccountBusy ? 0.55 : 1 }}
              testID="settings-delete-account"
              onPress={() => {
                setDeleteAccountError(null);
                setDeleteAccountNotice(null);
                setDeleteAccountStep("warn");
              }}
            >
              <Text className="text-[15px] font-semibold" style={{ color: "#f87171" }}>
                Delete Account
              </Text>
            </Pressable>
          </View>
        ) : null}
        </ScrollView>
      </SettingsScreenChrome>
      </TabScreenFade>

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

      <ReportIssueDialog open={reportIssueOpen} onClose={() => setReportIssueOpen(false)} />

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
    </>
  );
}

function SettingsComingSoonRow({
  icon,
  label,
  isLast,
}: {
  icon?: ReactNode;
  label: string;
  isLast?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <SettingsRow
      icon={icon}
      label={label}
      isLast={isLast}
      disabled
      trailing={
        <Text className="text-[12px] font-medium" style={{ color: colors.textTertiary }}>
          Coming soon
        </Text>
      }
    />
  );
}
