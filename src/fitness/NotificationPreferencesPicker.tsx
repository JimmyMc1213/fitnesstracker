import { useEffect, useState } from "react";

import { formatNotificationTimeDisplay } from "./notificationPreferences";
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
  background: "#1A1A1A",
  color: "#fff",
};

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
      className="tap"
      aria-label={enabled ? `${label} on` : `${label} off`}
      aria-pressed={enabled}
      onClick={onToggle}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        background: enabled ? "#ffffff" : "rgba(255,255,255,0.1)",
        position: "relative",
        transition: "background .2s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: enabled ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: 999,
          background: enabled ? "#000" : "#ffffff",
          transition: "left .2s ease, background .2s ease",
        }}
      />
    </button>
  );
}

export function NotificationPreferencesPicker({
  value,
  onChange,
  showPermissionHint = false,
  permission: permissionProp,
  onPermissionChange,
  onOpenSettings,
}: {
  value: NotificationPreferences;
  onChange: (next: NotificationPreferences) => void;
  showPermissionHint?: boolean;
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Workout reminder</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              On training days · default {formatNotificationTimeDisplay("07:00")}
            </div>
          </div>
          <ReminderToggle
            enabled={value.workoutReminderEnabled}
            onToggle={() => patch({ workoutReminderEnabled: !value.workoutReminderEnabled })}
            label="Workout reminder"
          />
        </div>
        <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          Reminder time
          <input
            type="time"
            aria-label="Workout reminder time"
            value={value.workoutReminderTime}
            disabled={!value.workoutReminderEnabled}
            onChange={(e) => patch({ workoutReminderTime: e.target.value })}
            style={{
              ...TIME_INPUT_STYLE,
              opacity: value.workoutReminderEnabled ? 1 : 0.45,
            }}
          />
        </label>
      </div>

      <div className="card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Nutrition check-in</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              Daily · default {formatNotificationTimeDisplay("20:00")}
            </div>
          </div>
          <ReminderToggle
            enabled={value.nutritionCheckInEnabled}
            onToggle={() => patch({ nutritionCheckInEnabled: !value.nutritionCheckInEnabled })}
            label="Nutrition check-in"
          />
        </div>
        <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          Reminder time
          <input
            type="time"
            aria-label="Nutrition check-in time"
            value={value.nutritionCheckInTime}
            disabled={!value.nutritionCheckInEnabled}
            onChange={(e) => patch({ nutritionCheckInTime: e.target.value })}
            style={{
              ...TIME_INPUT_STYLE,
              opacity: value.nutritionCheckInEnabled ? 1 : 0.45,
            }}
          />
        </label>
      </div>

      {!permissionGranted ? (
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.45)" }}>
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
                    color: "#fff",
                    fontSize: "inherit",
                    fontWeight: 600,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Settings → Reminders
                </button>
              ) : (
                <strong style={{ color: "rgba(255,255,255,0.7)" }}>Settings → Reminders</strong>
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
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
          }}
        >
          Enable notifications
        </button>
      ) : null}

      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.38)" }}>
        Reminders work while Fitcoach is open. Background notifications coming soon.
      </p>
    </div>
  );
}
