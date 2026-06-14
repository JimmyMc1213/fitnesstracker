import { localDateKey, mergeFutureYouDraft } from "@newyouai/core";
import { useEffect, useMemo, useState } from "react";
import { Switch, Text, View } from "react-native";

import { NotificationPreferencesPicker } from "@/components/onboarding/NotificationPreferencesPicker";
import { SettingsHubSection } from "@/components/settings/SettingsLayout";
import { useFitnessState } from "@/context/FitnessContext";
import { useNotificationScheduler } from "@/context/NotificationSchedulerContext";
import { useFutureYouEntry } from "@/hooks/useFutureYouEntry";
import { useAppTheme } from "@/hooks/useAppTheme";
import { shouldShowHomeNewYouHeaderButton } from "@/lib/futureYouHomeEntryModel";
import {
  type NotificationPermissionState,
} from "@/lib/notificationPermission";

export function RemindersPanel() {
  const { colors } = useAppTheme();
  const { state, setFitnessState } = useFitnessState();
  const { permission: schedulerPermission, refreshPermission, triggerSync } = useNotificationScheduler();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionState>("undetermined");

  const todayKey = localDateKey(new Date());
  const futureYouEntry = useFutureYouEntry(state);

  useEffect(() => {
    void refreshPermission().then(setNotificationPermission);
  }, [refreshPermission]);

  useEffect(() => {
    if (schedulerPermission !== notificationPermission) {
      setNotificationPermission(schedulerPermission);
    }
  }, [schedulerPermission, notificationPermission]);

  const futureYouReminderSettingVisible = useMemo(() => {
    if (!state?.onboardingComplete) return false;
    const eligible = shouldShowHomeNewYouHeaderButton({
      mode: futureYouEntry.mode,
      photoBlocked: futureYouEntry.photoBlocked,
      onboardingComplete: state.onboardingComplete,
      futureYou: state.futureYou,
      todayDateKey: todayKey,
    });
    return eligible || state.futureYou?.remindersMuted === true;
  }, [state, futureYouEntry, todayKey]);

  if (!state) return null;

  const newYouRemindersEnabled = state.futureYou?.remindersMuted !== true;

  return (
    <View>
      {futureYouReminderSettingVisible ? (
        <SettingsHubSection title="NewYou">
          <View className="flex-row items-center px-4 py-3.5">
            <View className="mr-3 w-5 items-center justify-center">
              <Text style={{ color: colors.textTertiary }}>✨</Text>
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[15px] font-medium" style={{ color: colors.textPrimary }}>
                Home reminders
              </Text>
              <Text className="mt-0.5 text-[12px]" style={{ color: colors.textTertiary }}>
                Nudge to add a photo for your AI preview
              </Text>
            </View>
            <Switch
              testID="settings-newyou-reminders-toggle"
              value={newYouRemindersEnabled}
              onValueChange={(enabled) =>
                setFitnessState((prev) => ({
                  ...prev,
                  futureYou: mergeFutureYouDraft(prev.futureYou, { remindersMuted: !enabled }),
                }))
              }
              trackColor={{ false: colors.border, true: colors.accent }}
              accessibilityLabel={newYouRemindersEnabled ? "NewYou reminders on" : "NewYou reminders off"}
            />
          </View>
        </SettingsHubSection>
      ) : null}

      <NotificationPreferencesPicker
        variant="settings"
        value={state.notificationPreferences}
        onChange={(notificationPreferences) =>
          setFitnessState((prev) => ({
            ...prev,
            notificationPreferences,
          }))
        }
        permission={notificationPermission}
        onPermissionChange={async (next) => {
          setNotificationPermission(next);
          await refreshPermission();
          await triggerSync();
        }}
        showPermissionHint
      />
    </View>
  );
}
