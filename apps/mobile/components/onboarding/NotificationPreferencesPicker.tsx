import { normalizeTimeHHmm } from "@newyouai/core";
import type { NotificationPreferences } from "@newyouai/types";
import { Pressable, Switch, Text, TextInput, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/notificationPreferences";

type ReminderRowConfig = {
  label: string;
  onboardingLabel?: string;
  subtitle: string;
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
};

const REMINDER_ROWS: ReminderRowConfig[] = [
  {
    label: "Workout reminder",
    subtitle: "On your training days",
    enabledKey: "workoutReminderEnabled",
    timeKey: "workoutReminderTime",
  },
  {
    label: "Nutrition check-in",
    onboardingLabel: "Daily fuel check-in",
    subtitle: "Log your meals before the day ends",
    enabledKey: "nutritionCheckInEnabled",
    timeKey: "nutritionCheckInTime",
  },
  {
    label: "Morning check-in",
    subtitle: "Start your day with your plan",
    enabledKey: "morningCheckInEnabled",
    timeKey: "morningCheckInTime",
  },
  {
    label: "Weekly review",
    subtitle: "Every Monday morning recap",
    enabledKey: "weeklyReviewEnabled",
    timeKey: "weeklyReviewTime",
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

type Props = {
  value: NotificationPreferences;
  onChange: (next: NotificationPreferences) => void;
  variant?: "default" | "onboarding";
};

export function NotificationPreferencesPicker({ value, onChange, variant = "default" }: Props) {
  const { colors } = useAppTheme();

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
          Reminders work while Gymmy is open. Background notifications coming soon.
        </Text>
      </View>
    );
  }

  return (
    <View testID="notification-preferences-picker" className="gap-3">
      {REMINDER_ROWS.map((row) => (
        <View
          key={row.enabledKey}
          className="flex-row items-center justify-between rounded-2xl border p-4"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>
            {row.label}
          </Text>
          <Pressable onPress={() => patch({ [row.enabledKey]: !value[row.enabledKey] })}>
            <Switch
              value={value[row.enabledKey]}
              onValueChange={() => patch({ [row.enabledKey]: !value[row.enabledKey] })}
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </Pressable>
        </View>
      ))}
    </View>
  );
}
