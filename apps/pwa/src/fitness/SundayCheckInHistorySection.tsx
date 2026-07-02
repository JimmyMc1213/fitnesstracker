import { useMemo, useState } from "react";

import { IconChevR, IconX } from "./icons";
import { BottomSheet, bottomSheetPanelTheme } from "./motion";
import { SectionLabel } from "./shared";
import { coalesceSundayCheckInRecord } from "./sundayCheckInHistory";
import { COACH_CARD_BG, COACH_CARD_BORDER } from "./workoutUiTokens";
import { formatWeightFromLbs, weightUnitLabel } from "./unitPreferences";
import type { SundayCheckInWeekRecord, UnitPreferences } from "./types";

const SUCCESS_GREEN = "#22c55e";
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

function sortCheckInHistory(history: SundayCheckInWeekRecord[]): SundayCheckInWeekRecord[] {
  return history
    .map(coalesceSundayCheckInRecord)
    .sort((a, b) => b.weekStartKey.localeCompare(a.weekStartKey));
}

type ListProps = {
  history: SundayCheckInWeekRecord[];
  unitPreferences: UnitPreferences;
  maxRows?: number;
};

export function SundayCheckInHistoryList({ history, unitPreferences, maxRows }: ListProps) {
  const [selected, setSelected] = useState<SundayCheckInWeekRecord | null>(null);
  const sorted = useMemo(() => sortCheckInHistory(history), [history]);
  const visible = maxRows != null ? sorted.slice(0, maxRows) : sorted;

  if (visible.length === 0) return null;

  return (
    <>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {visible.map((record, i) => (
          <RecapListRow
            key={record.weekStartKey}
            record={record}
            unitPreferences={unitPreferences}
            showDivider={i < visible.length - 1}
            onOpen={() => setSelected(record)}
          />
        ))}
      </div>

      <RecapDetailSheet
        record={selected}
        unitPreferences={unitPreferences}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

type SectionProps = {
  history: SundayCheckInWeekRecord[];
  unitPreferences: UnitPreferences;
  onShowPrevious?: () => void;
};

export function SundayCheckInHistorySection({ history, unitPreferences, onShowPrevious }: SectionProps) {
  const sorted = useMemo(() => sortCheckInHistory(history), [history]);

  if (sorted.length === 0) return null;

  const hasPrevious = sorted.length > 1;

  return (
    <>
      <SectionLabel>Weekly check-ins</SectionLabel>
      <SundayCheckInHistoryList history={history} unitPreferences={unitPreferences} maxRows={1} />
      {hasPrevious && onShowPrevious ? (
        <button
          type="button"
          className="tap"
          onClick={onShowPrevious}
          style={{
            marginTop: 10,
            border: "none",
            padding: 0,
            background: "transparent",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--accent)",
          }}
        >
          Show previous weeks
        </button>
      ) : null}
    </>
  );
}

function RecapListRow({
  record,
  unitPreferences,
  showDivider,
  onOpen,
}: {
  record: SundayCheckInWeekRecord;
  unitPreferences: UnitPreferences;
  showDivider: boolean;
  onOpen: () => void;
}) {
  const wUnit = unitPreferences.weightUnit;
  const range = formatWeekRange(record.weekStartKey);
  const weightText =
    record.weightDeltaLbs != null
      ? `${record.weightDeltaLbs > 0 ? "+" : ""}${formatWeightFromLbs(record.weightDeltaLbs, wUnit)} ${weightUnitLabel(wUnit)}`
      : null;

  return (
    <button
      type="button"
      className="tap"
      onClick={onOpen}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "14px 16px",
        border: "none",
        borderBottom: showDivider ? "0.5px solid var(--divider-subtle)" : "none",
        background: "transparent",
        color: "inherit",
      }}
    >
      <div className="between" style={{ gap: 10, alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-ghost)", fontVariantNumeric: "tabular-nums" }}>
            Week {record.weekNumber} · {range}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "var(--text-primary)",
              lineHeight: 1.3,
            }}
          >
            {record.headline || `Week ${record.weekNumber} recap`}
          </div>
          <div style={{ marginTop: 5, fontSize: 12, lineHeight: 1.4, color: "var(--text-secondary)", fontWeight: 500 }}>
            {record.workoutsCompleted}/{record.workoutsPlanned} workouts · {record.proteinDaysHit}/7 protein
            {weightText ? ` · ${weightText}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {record.onTrack ? (
            <span
              style={{
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#fff",
                padding: "3px 7px",
                borderRadius: 999,
                background: SUCCESS_GREEN,
              }}
            >
              On track
            </span>
          ) : null}
          <IconChevR size={14} style={{ color: "var(--text-tertiary)" }} aria-hidden />
        </div>
      </div>
    </button>
  );
}

function RecapDetailSheet({
  record,
  unitPreferences,
  onClose,
}: {
  record: SundayCheckInWeekRecord | null;
  unitPreferences: UnitPreferences;
  onClose: () => void;
}) {
  const safe = record ? coalesceSundayCheckInRecord(record) : null;
  const wUnit = unitPreferences.weightUnit;

  return (
    <BottomSheet
      open={safe != null}
      onClose={onClose}
      zIndex={220}
      ariaLabel="Weekly check-in recap"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        maxHeight: "min(85vh, 640px)",
        overflowY: "auto",
        padding: 16,
      }}
    >
      {safe ? (
        <div style={{ padding: "4px 4px 8px" }}>
          <div className="between" style={{ alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-ghost)",
                }}
              >
                Week {safe.weekNumber} · {formatWeekRange(safe.weekStartKey)}
              </div>
              <h2
                style={{
                  margin: "8px 0 0",
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.25,
                  color: "var(--text-primary)",
                }}
              >
                {safe.headline || `Week ${safe.weekNumber} recap`}
              </h2>
            </div>
            <button
              type="button"
              className="tap"
              onClick={onClose}
              aria-label="Close recap"
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

          {safe.summary ? (
            <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.45, color: "var(--text-soft)", fontWeight: 500 }}>
              {safe.summary}
            </p>
          ) : null}

          <StatGrid record={safe} unitPreferences={unitPreferences} />

          {safe.dayFlags.length === 7 ? (
            <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", gap: 3 }}>
              {safe.dayFlags.split("").map((flag, i) => (
                <MiniDayCell key={`${safe.weekStartKey}-${i}`} flag={flag} label={DAY_LABELS[i] ?? ""} />
              ))}
            </div>
          ) : null}

          {safe.weightInsight ? (
            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 12,
                background: COACH_CARD_BG,
                border: `0.5px solid ${COACH_CARD_BORDER}`,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-ghost)", marginBottom: 6 }}>
                Coach
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--text-soft)", fontWeight: 500 }}>
                {safe.weightInsight}
              </p>
            </div>
          ) : null}

          {safe.wins.length > 0 ? (
            <RecapBulletSection title="Wins" emoji="✅" items={safe.wins} tone="success" />
          ) : null}

          {safe.watch.length > 0 ? (
            <RecapBulletSection title="Worth watching" emoji="🚨" items={safe.watch} tone="warning" />
          ) : null}

          {safe.commitments.length > 0 ? (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                Week focus
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {safe.commitments.map((title) => (
                  <div
                    key={title}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "var(--surface-1)",
                      border: "0.5px solid var(--divider-subtle)",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {title}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {safe.weightEndLbs != null ? (
            <p style={{ margin: "16px 0 0", fontSize: 12, color: "var(--text-ghost)", fontWeight: 500 }}>
              End weight: {formatWeightFromLbs(safe.weightEndLbs, wUnit)} {weightUnitLabel(wUnit)}
            </p>
          ) : null}
        </div>
      ) : null}
    </BottomSheet>
  );
}

function StatGrid({ record, unitPreferences }: { record: SundayCheckInWeekRecord; unitPreferences: UnitPreferences }) {
  const wUnit = unitPreferences.weightUnit;
  const weightText =
    record.weightDeltaLbs != null
      ? `${record.weightDeltaLbs > 0 ? "+" : ""}${formatWeightFromLbs(record.weightDeltaLbs, wUnit)} ${weightUnitLabel(wUnit)}`
      : "—";

  const items = [
    { label: "Workouts", value: `${record.workoutsCompleted}/${record.workoutsPlanned}` },
    { label: "Protein", value: `${record.proteinDaysHit}/7` },
    { label: "Weight Δ", value: weightText },
    { label: "Weigh-ins", value: `${record.weighInsThisWeek}/7` },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            background: "var(--surface-1)",
            border: "0.5px solid var(--divider-subtle)",
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-ghost)" }}>
            {item.label}
          </div>
          <div style={{ marginTop: 4, fontSize: 15, fontWeight: 800, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function RecapBulletSection({
  title,
  emoji,
  items,
  tone,
}: {
  title: string;
  emoji: string;
  items: string[];
  tone: "success" | "warning";
}) {
  const dot = tone === "success" ? SUCCESS_GREEN : "#ef4444";
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span aria-hidden>{emoji}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{title}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((text) => (
          <div
            key={text}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--surface-1)",
              border: "0.5px solid var(--divider-subtle)",
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 999, background: dot, marginTop: 6, flexShrink: 0 }} />
            <span style={{ fontSize: 13, lineHeight: 1.45, color: "var(--text-soft)", fontWeight: 500 }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniDayCell({ flag, label }: { flag: string; label: string }) {
  const workout = flag === "w" || flag === "b";
  const protein = flag === "p" || flag === "b";
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 0 }}>
      <div
        style={{
          width: "100%",
          maxWidth: 24,
          aspectRatio: "1",
          borderRadius: 6,
          background: workout ? "var(--primary)" : "var(--surface-1)",
          border: workout ? "none" : "0.5px solid var(--divider-subtle)",
        }}
      />
      <div style={{ width: "65%", height: 2, borderRadius: 999, background: protein ? SUCCESS_GREEN : "transparent" }} />
      <span style={{ fontSize: 9, fontWeight: 600, color: "var(--text-ghost)" }}>{label}</span>
    </div>
  );
}

function formatWeekRange(weekStartKey: string): string {
  const start = new Date(`${weekStartKey}T12:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const startFmt = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endFmt = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${startFmt} – ${endFmt}`;
}
