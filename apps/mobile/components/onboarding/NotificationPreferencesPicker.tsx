import { normalizeTimeHHmm } from "@newyouai/core";
import type { NotificationPreferences } from "@newyouai/types";
import { Pressable, Switch, Text, TextInput, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import type { NotificationPermissionState } from "@/lib/notificationPermission";
import { permissionStatusLabel, requestNotificationPermission } from "@/lib/notificationPermission";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  formatNotificationTimeDisplay,
} from "@/lib/notificationPreferences";

type ReminderRowConfig = {
  label: string;
  onboardingLabel?: string;
  subtitle: string;
  settingsHintPrefix: string;
  enabledKey: keyof Pick<
    NotificationPreferences,
    | "workoutReminderEnabled"
    | "nutritionCheckInEnabled"
    | "morningCheckInEnabled"
    | "weeklyReviewEnabled"
  >;
  timeKey: keyof Pick<
    NotificationPreferences,
    | "workoutReminderTime"
    | "nutritionCheckInTime"
    | "morningCheckInTime"
    | "weeklyReviewTime"
  >;
  timeAriaLabel: string;
};

const REMINDER_ROWS: ReminderRowConfig[] = [
  {
    label: "Workout reminder",
    subtitle: "On your training days",
    settingsHintPrefix: "On training days",
    enabledKey: "workoutReminderEnabled",
    timeKey: "workoutReminderTime",
    timeAriaLabel: "Workout reminder time",
  },
  {
    label: "Nutrition check-in",
    onboardingLabel: "Daily fuel check-in",
    subtitle: "Log your meals before the day ends",
    settingsHintPrefix: "Daily",
    enabledKey: "nutritionCheckInEnabled",
    timeKey: "nutritionCheckInTime",
    timeAriaLabel: "Nutrition check-in time",
  },
  {
    label: "Morning check-in",
    subtitle: "Start your day with your plan",
    settingsHintPrefix: "Every morning",
    enabledKey: "morningCheckInEnabled",
    timeKey: "morningCheckInTime",
    timeAriaLabel: "Morning check-in time",
  },
  {
    label: "Weekly review",
    subtitle: "Every Monday morning recap",
    settingsHintPrefix: "Every Monday",
    enabledKey: "weeklyReviewEnabled",
    timeKey: "weeklyReviewTime",
    timeAriaLabel: "Weekly review time",
  },
];

function OnboardingNotificationRow({
  row,
  enabled,
  time,
  onToggle,
  onTimeChange,
}: {
  row: ReminderRowConfig;
  enabled: boolean;
  time: string;
  onToggle: () => void;
  onTimeChange: (next: string) => void;
}) {
  const { colors } = useAppTheme();
  const label = row.onboardingLabel ?? row.label;
  const defaultTime = DEFAULT_NOTIFICATION_PREFERENCES[row.timeKey];

  return (
    <View
      className="rounded-2xl border p-4"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
      testID={`notification-row-${row.enabledKey}`}
    >
      <View className="flex-row items-center gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>
            {label}
          </Text>
          <Text className="mt-0.5 text-sm" style={{ color: colors.textSecondary }}>
            {row.subtitle}
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.accent }}
          accessibilityLabel={enabled ? `${label} on` : `${label} off`}
        />
      </View>
      {enabled ? (
        <View className="mt-3">
          <Text className="mb-1 text-xs font-medium uppercase tracking-wide" style={{ color: colors.textTertiary }}>
            Reminder time
          </Text>
          <TextInput
            value={time}
            onChangeText={(next) => onTimeChange(normalizeTimeHHmm(next, defaultTime))}
            placeholder={defaultTime}
            placeholderTextColor={colors.textTertiary}
            keyboardType="numbers-and-punctuation"
            className="rounded-xl border px-3 py-2.5 text-base"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.textPrimary,
            }}
            accessibilityLabel={`${label} time`}
            testID={`notification-time-${row.timeKey}`}
          />
        </View>
      ) : null}
    </View>
  );
}

function SettingsNotificationRow({
  row,
  enabled,
  time,
  onToggle,
  onTimeChange,
}: {
  row: ReminderRowConfig;
  enabled: boolean;
  time: string;
  onToggle: () => void;
  onTimeChange: (next: string) => void;
}) {
  const { colors } = useAppTheme();
  const defaultTime = DEFAULT_NOTIFICATION_PREFERENCES[row.timeKey];

  return (
    <View
      className="rounded-2xl border p-4"
      style={{ borderColor: colors.border, backgroundColor: colors.card, gap: 10 }}
      testID={`notification-row-${row.enabledKey}`}
    >
      <View className="flex-row items-center gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-[14px] font-semibold" style={{ color: colors.textPrimary }}>
            {row.label}
          </Text>
          <Text className="mt-0.5 text-xs" style={{ color: colors.textTertiary }}>
            {row.settingsHintPrefix} · default {formatNotificationTimeDisplay(defaultTime)}
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.accent }}
          accessibilityLabel={enabled ? `${row.label} on` : `${row.label} off`}
        />
      </View>
      <View>
        <Text className="mb-1 text-xs" style={{ color: colors.textTertiary }}>Reminder time</Text>
        <TextInput
          value={time}
          onChangeText={(next) => onTimeChange(normalizeTimeHHmm(next, defaultTime))}
          editable={enabled}
          placeholder={defaultTime}
          placeholderTextColor={colors.textTertiary}
          keyboardType="numbers-and-punctuation"
          className="rounded-[10px] border px-3 py-2.5 text-base"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.backgroundSecondary,
            color: colors.textPrimary,
            opacity: enabled ? 1 : 0.45,
          }}
          accessibilityLabel={row.timeAriaLabel}
          testID={`notification-time-${row.timeKey}`}
        />
      </View>
    </View>
  );
}

type Props = {
  value: NotificationPreferences;
  onChange: (next: NotificationPreferences) => void;
  variant?: "default" | "onboarding" | "settings";
  showPermissionHint?: boolean;
  permission?: NotificationPermissionState;
  onPermissionChange?: (next: NotificationPermissionState) => void;
};

export function NotificationPreferencesPicker({
  value,
  onChange,
  variant = "default",
  showPermissionHint = false,
  permission,
  onPermissionChange,
}: Props) {
  const { colors } = useAppTheme();
  const permissionGranted = permission === "granted";

  function patch(partial: Partial<NotificationPreferences>) {
    onChange({ ...value, ...partial });
  }

  if (variant === "onboarding") {
    return (
      <View testID="notification-preferences-picker" className="gap-3">
        {REMINDER_ROWS.map((row) => (
          <OnboardingNotificationRow
            key={row.enabledKey}
            row={row}
            enabled={value[row.enabledKey]}
            time={value[row.timeKey]}
            onToggle={() => patch({ [row.enabledKey]: !value[row.enabledKey] })}
            onTimeChange={(next) => patch({ [row.timeKey]: next })}
          />
        ))}
        <Text className="text-center text-xs leading-5" style={{ color: colors.textTertiary }}>
          Reminders work while NewYou is open. Background notifications coming soon.
        </Text>
      </View>
    );
  }

  const settingsVariant = variant === "settings" || variant === "default";

  return (
    <View testID="notification-preferences-picker" className="gap-3">
      {settingsVariant
        ? REMINDER_ROWS.map((row) => (
            <SettingsNotificationRow
              key={row.enabledKey}
              row={row}
              enabled={value[row.enabledKey]}
              time={value[row.timeKey]}
              onToggle={() => patch({ [row.enabledKey]: !value[row.enabledKey] })}
              onTimeChange={(next) => patch({ [row.timeKey]: next })}
            />
          ))
        : null}

      {permission != null && !permissionGranted ? (
        <Text className="text-xs leading-5" style={{ color: colors.textTertiary }}>
          {permissionStatusLabel(permission)}
        </Text>
      ) : null}

      {showPermissionHint && permission != null && !permissionGranted && permission !== "unsupported" ? (
        <Pressable
          testID="notification-request-permission"
          onPress={async () => {
            const next = await requestNotificationPermission();
            onPermissionChange?.(next);
          }}
          className="self-start rounded-[10px] border px-3.5 py-2.5"
          style={{ borderColor: colors.border, backgroundColor: colors.backgroundTertiary }}
        >
          <Text className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>
            Enable notifications
          </Text>
        </Pressable>
      ) : null}

      <Text className="text-xs leading-5" style={{ color: colors.textTertiary }}>
        Reminders work while NewYou is open. Background notifications coming soon.
      </Text>
    </View>
  );
}
