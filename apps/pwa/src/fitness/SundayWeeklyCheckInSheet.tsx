import { useEffect, useState } from "react";

import { getSundayCheckInCoachNote } from "./coachEngine";
import { IconX } from "./icons";
import {
  bottomSheetPanelTheme,
  CenterDialog,
  closeAfterMotion,
  MOTION_DURATIONS,
} from "./motion";
import { PrimaryButton } from "./shared";
import { formatWeightFromLbs, weightUnitLabel } from "./unitPreferences";
import type { SundayCheckInData } from "./sundayCheckIn";
import type { UnitPreferences } from "./types";

const panelStyle = {
  ...bottomSheetPanelTheme,
  width: "100%",
  maxWidth: 400,
  maxHeight: "min(85vh, 540px)",
  overflowY: "auto",
  padding: 20,
} as const;

type Props = {
  open: boolean;
  data: SundayCheckInData | null;
  unitPreferences: UnitPreferences;
  onDismiss: () => void;
  onPresentChange?: (present: boolean) => void;
};

export function SundayWeeklyCheckInSheet({
  open,
  data,
  unitPreferences,
  onDismiss,
  onPresentChange,
}: Props) {
  const [closing, setClosing] = useState(false);
  const visible = open && data != null && !closing;

  useEffect(() => {
    if (!open) setClosing(false);
  }, [open]);

  useEffect(() => {
    onPresentChange?.(visible);
  }, [visible, onPresentChange]);

  function finishDismiss() {
    setClosing(true);
    closeAfterMotion(() => {
      onDismiss();
      setClosing(false);
    }, MOTION_DURATIONS.backdrop);
  }

  const panelData = data;
  if (!panelData && !closing) return null;

  return (
    <CenterDialog
      open={visible && panelData != null}
      zIndex={300}
      ariaLabel="Weekly check-in"
      panelStyle={panelStyle}
      backdropStyle={{
        backdropFilter: "blur(14px) saturate(120%)",
        WebkitBackdropFilter: "blur(14px) saturate(120%)",
      }}
    >
      {panelData ? (
        <SundayWeeklyCheckInContent
          data={panelData}
          unitPreferences={unitPreferences}
          onDismiss={finishDismiss}
        />
      ) : null}
    </CenterDialog>
  );
}

export function SundayWeeklyCheckInContent({
  data,
  unitPreferences,
  onDismiss,
}: {
  data: SundayCheckInData;
  unitPreferences: UnitPreferences;
  onDismiss: () => void;
}) {
  const wUnit = unitPreferences.weightUnit;
  const title = data.displayName
    ? `Week ${data.weekNumber} recap, ${data.displayName}`
    : `Week ${data.weekNumber} recap`;

  const weightDisplay =
    data.lastWeightLbs != null
      ? `${formatWeightFromLbs(data.lastWeightLbs, wUnit)} ${weightUnitLabel(wUnit)}`
      : "—";

  const coachNote = getSundayCheckInCoachNote({
    workoutsCompleted: data.workoutsCompleted,
    workoutsPlanned: data.workoutsPlanned,
    proteinDaysHit: data.proteinDaysHit,
  });

  return (
    <>
      <div className="between" style={{ alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-ghost)",
            }}
          >
            Weekly check-in
          </div>
          <h2
            style={{
              margin: "6px 0 0",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              lineHeight: 1.25,
            }}
          >
            {title}
          </h2>
        </div>
        <button
          type="button"
          className="tap"
          onClick={onDismiss}
          aria-label="Dismiss weekly check-in"
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            border: "0.5px solid var(--border)",
            display: "grid",
            placeItems: "center",
            color: "var(--text-secondary)",
            background: "transparent",
            flexShrink: 0,
          }}
        >
          <IconX size={16} stroke={2} />
        </button>
      </div>

      {data.hasFullRecap ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <StatBlock
              label="Workouts"
              value={`${data.workoutsCompleted} / ${data.workoutsPlanned}`}
              sub="sessions done"
            />
            <StatBlock label="Protein" value={`${data.proteinDaysHit} / 7`} sub="days on target" />
            <StatBlock label="Weight" value={weightDisplay} sub="last logged" />
          </div>

          <p
            style={{
              margin: "14px 0 0",
              fontSize: 13,
              lineHeight: 1.45,
              color: "var(--text-soft)",
              fontWeight: 500,
            }}
          >
            {coachNote}
          </p>
        </>
      ) : (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.45,
            color: "var(--text-soft)",
            fontWeight: 500,
          }}
        >
          Log your weight a few times this week for a full recap.
        </p>
      )}

      <PrimaryButton block onClick={onDismiss} style={{ marginTop: 16, background: "var(--ob-gold)", color: "var(--ob-gold-on)" }}>
        Continue
      </PrimaryButton>
    </>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      style={{
        padding: "10px 8px",
        borderRadius: 10,
        background: "var(--surface-1)",
        border: "0.5px solid var(--divider-subtle)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--text-ghost)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          color: "var(--text-primary)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
      {sub ? (
        <div style={{ marginTop: 3, fontSize: 9, color: "var(--text-ghost)", fontWeight: 500 }}>{sub}</div>
      ) : null}
    </div>
  );
}
