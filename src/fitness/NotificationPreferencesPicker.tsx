import { useEffect, useState } from "react";

import { DEFAULT_NOTIFICATION_PREFERENCES, formatNotificationTimeDisplay } from "./notificationPreferences";
import { TimeWheelPicker } from "./TimeWheelPicker";
import {
  getNotificationPermission,
  permissionStatusLabel,
  requestNotificationPermission,
  type NotificationPermissionState,
} from "./notificationPermission";
import type { NotificationPreferences } from "./types";

const TIME_INPUT_STYLE = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: 10,
  borderRadius: 10,
  border: "0.5px solid var(--border)",
  background: "var(--card-2)",
  color: "var(--text-primary)",
};

type ReminderRowConfig = {
  label: string;
  /** Onboarding uses friendlier copy where it differs from Settings. */
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

function ReminderToggle({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className="tap notification-picker__toggle"
      aria-label={enabled ? `${label} on` : `${label} off`}
      aria-pressed={enabled}
      onClick={onToggle}
    >
      <div className="notification-picker__toggle-knob" />
    </button>
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
  const defaultTime = DEFAULT_NOTIFICATION_PREFERENCES[row.timeKey];

  return (
    <div className="card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{row.label}</div>
          <div style={{ fontSize: 12, color: "var(--text-faint-soft)", marginTop: 2 }}>
            {row.settingsHintPrefix} · default {formatNotificationTimeDisplay(defaultTime)}
          </div>
        </div>
        <ReminderToggle enabled={enabled} onToggle={onToggle} label={row.label} />
      </div>
      <label style={{ fontSize: 12, color: "var(--text-faint-soft)" }}>
        Reminder time
        <input
          type="time"
          aria-label={row.timeAriaLabel}
          value={time}
          disabled={!enabled}
          onChange={(e) => onTimeChange(e.target.value)}
          style={{
            ...TIME_INPUT_STYLE,
            opacity: enabled ? 1 : 0.45,
          }}
        />
      </label>
    </div>
  );
}

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
  return (
    <div className="notification-picker__row notification-picker__row--stacked">
      <div className="notification-picker__row-head">
        <div className="notification-picker__info">
          <span className="notification-picker__label">{row.onboardingLabel ?? row.label}</span>
          <span className="notification-picker__hint">{row.subtitle}</span>
        </div>
        <ReminderToggle
          enabled={enabled}
          onToggle={onToggle}
          label={row.onboardingLabel ?? row.label}
        />
      </div>
      <div
        className={`notification-picker__time-wrap${enabled ? " notification-picker__time-wrap--open" : ""}`}
        aria-hidden={!enabled}
      >
        <div className="notification-picker__time-inner">
          <TimeWheelPicker
            value={time}
            onChange={onTimeChange}
            ariaLabel={row.timeAriaLabel}
            inline
          />
        </div>
      </div>
    </div>
  );
}

export function NotificationPreferencesPicker({
  value,
  onChange,
  showPermissionHint = false,
  variant = "default",
  permission: permissionProp,
  onPermissionChange,
  onOpenSettings,
}: {
  value: NotificationPreferences;
  onChange: (next: NotificationPreferences) => void;
  showPermissionHint?: boolean;
  /** Onboarding uses expandable toggles with inline time pickers. */
  variant?: "default" | "onboarding";
  permission?: NotificationPermissionState;
  onPermissionChange?: (next: NotificationPermissionState) => void;
  /** Opens in-app Settings (e.g. from Home gear), used when permission was denied during onboarding. */
  onOpenSettings?: () => void;
}) {
  const [internalPermission, setInternalPermission] = useState(getNotificationPermission);
  const permission = permissionProp ?? internalPermission;

  function setPermission(next: NotificationPermissionState) {
    if (permissionProp === undefined) setInternalPermission(next);
    onPermissionChange?.(next);
  }

  useEffect(() => {
    const refresh = () => setPermission(getNotificationPermission());
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [permissionProp, onPermissionChange]);

  const permissionGranted = permission === "granted";

  async function handleRequestPermission() {
    const next = await requestNotificationPermission();
    setPermission(next);
  }

  function patch(partial: Partial<NotificationPreferences>) {
    onChange({ ...value, ...partial });
  }

  if (variant === "onboarding") {
    return (
      <div className="notification-picker notification-picker--onboarding">
        <div className="notification-picker__list notification-picker__list--onboarding">
          {REMINDER_ROWS.map((row, index) => (
            <div key={row.enabledKey}>
              {index > 0 ? <div className="notification-picker__divider" aria-hidden /> : null}
              <OnboardingNotificationRow
                row={row}
                enabled={value[row.enabledKey]}
                time={value[row.timeKey]}
                onToggle={() => patch({ [row.enabledKey]: !value[row.enabledKey] })}
                onTimeChange={(next) => patch({ [row.timeKey]: next })}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {REMINDER_ROWS.map((row) => (
        <SettingsNotificationRow
          key={row.enabledKey}
          row={row}
          enabled={value[row.enabledKey]}
          time={value[row.timeKey]}
          onToggle={() => patch({ [row.enabledKey]: !value[row.enabledKey] })}
          onTimeChange={(next) => patch({ [row.timeKey]: next })}
        />
      ))}

      {!permissionGranted ? (
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--text-faint-soft)" }}>
          {permissionStatusLabel(permission)}
          {showPermissionHint && permission !== "unsupported" ? (
            <>
              {" "}
              After setup, open{" "}
              {onOpenSettings ? (
                <button
                  type="button"
                  className="tap"
                  onClick={onOpenSettings}
                  style={{
                    padding: 0,
                    border: "none",
                    background: "none",
                    color: "var(--text-primary)",
                    fontSize: "inherit",
                    fontWeight: 600,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Settings → Reminders
                </button>
              ) : (
                <strong style={{ color: "var(--text-soft)" }}>Settings → Reminders</strong>
              )}{" "}
              on Home to enable notifications.
            </>
          ) : null}
        </p>
      ) : null}

      {showPermissionHint && !permissionGranted && permission !== "unsupported" ? (
        <button
          type="button"
          className="tap"
          onClick={() => void handleRequestPermission()}
          style={{
            alignSelf: "flex-start",
            padding: "10px 14px",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 13,
            border: "0.5px solid var(--border)",
            background: "var(--surface-3)",
            color: "var(--text-primary)",
          }}
        >
          Enable notifications
        </button>
      ) : null}

      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--text-ghost)" }}>
        Reminders work while Fitcoach is open. Background notifications coming soon.
      </p>
    </div>
  );
}
