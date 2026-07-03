import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import { Image, Linking, ScrollView, Text, View } from "react-native";
import {
  formatVolumeFromOz,
  FEATURE_REQUEST_SETTINGS_LABEL,
  ISSUE_REPORT_SETTINGS_LABEL,
  nutritionGoalLabel,
  nutritionGoalSettingsLabel,
} from "@newyouai/core";

import { TabScreenFade } from "@/components/motion/TabScreenFade";
import { ReportIssueDialog } from "@/components/settings/ReportIssueDialog";
import { RequestFeatureDialog } from "@/components/settings/RequestFeatureDialog";
import { SettingsScreenChrome } from "@/components/settings/SettingsScreenChrome";
import {
  IconBell,
  IconDocument,
  IconDroplet,
  IconDumbbell,
  IconFlag,
  IconHabits,
  IconMail,
  IconMoon,
  IconRun,
  IconScale,
  IconSettings,
  IconShield,
  IconSpeakerphone,
  IconSun,
  IconToolsKitchen2,
} from "@/components/icons/FitnessIcons";
import { SettingsRowIcon } from "@/components/settings/SettingsRowIcon";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { EQUIPMENT_SETUP_LABELS } from "@/lib/equipmentSetup";
import type { SettingsPanelId } from "@/lib/settingsPanelRegistry";
import {
  SETTINGS_PRIVACY_POLICY_URL,
  SETTINGS_SUPPORT_EMAIL,
  SETTINGS_TERMS_URL,
} from "@/lib/settingsLinks";
import { settingsGoldIconColors } from "@/lib/settingsUiTokens";
import { formatWeightFromLbs } from "@/lib/unitConversions";
import { volumeUnitLabel, weightUnitLabel } from "@/lib/unitLabels";
import {
  SettingsHubSection,
  SettingsProfileCard,
  SettingsRow,
} from "@/components/settings/SettingsLayout";
import { useTabScreenInsets } from "@/lib/tabScreenInsets";
import { formatRestDuration } from "@/lib/workout/restTimerPreferences";

const SOCIAL_LOGOS = {
  instagram: require("@/assets/brand-icons/instagram.png"),
  tiktok: require("@/assets/brand-icons/tiktok.png"),
  x: require("@/assets/brand-icons/x.png"),
} as const;

function SocialLogo({ source }: { source: number }) {
  return (
    <Image source={source} style={{ width: 20, height: 20 }} resizeMode="contain" />
  );
}

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
  const { state } = useFitnessState();

  const [reportIssueOpen, setReportIssueOpen] = useState(false);
  const [featureRequestOpen, setFeatureRequestOpen] = useState(false);

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
  const nutritionTargets = state.nutritionTargets;
  const goldIcon = settingsGoldIconColors(theme);

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
          <SettingsRow
            icon={rowIcon(<IconSpeakerphone size={16} stroke={2} color={goldIcon.iconColor} />)}
            label={FEATURE_REQUEST_SETTINGS_LABEL}
            labelColor={goldIcon.iconColor}
            testID="settings-row-request-feature"
            isLast
            onPress={() => setFeatureRequestOpen(true)}
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
            icon={rowIcon(<SocialLogo source={SOCIAL_LOGOS.instagram} />)}
            label="Instagram"
          />
          <SettingsComingSoonRow
            icon={rowIcon(<SocialLogo source={SOCIAL_LOGOS.tiktok} />)}
            label="TikTok"
          />
          <SettingsComingSoonRow
            icon={rowIcon(<SocialLogo source={SOCIAL_LOGOS.x} />)}
            label="X"
            isLast
          />
        </SettingsHubSection>
        </ScrollView>
      </SettingsScreenChrome>
      </TabScreenFade>

      <ReportIssueDialog open={reportIssueOpen} onClose={() => setReportIssueOpen(false)} />
      <RequestFeatureDialog open={featureRequestOpen} onClose={() => setFeatureRequestOpen(false)} />
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
