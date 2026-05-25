import { useEffect, useState, type FormEvent } from "react";

import { DeleteConfirmSheet } from "./DeleteConfirmSheet";
import { IconDroplet } from "./icons";
import {
  formatWaterVolume,
  formatWaterVolumeAlt,
  formatVolumeFromOz,
  parseVolumeToOz,
  totalWaterOzForDateKey,
  waterQuickAddPresets,
} from "./waterIntake";
import type { VolumeUnit, WaterLogEntry } from "./types";

type WaterTrackerCardProps = {
  dateKey: string;
  targetOz: number;
  entries: WaterLogEntry[];
  readOnly: boolean;
  isToday: boolean;
  volumeUnit: VolumeUnit;
  onAddOz: (oz: number) => void;
  onRemoveEntry?: (entryId: string) => void;
};

export function WaterTrackerCard({
  dateKey,
  targetOz,
  entries,
  readOnly,
  isToday,
  volumeUnit,
  onAddOz,
  onRemoveEntry,
}: WaterTrackerCardProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);
  const [showEarlier, setShowEarlier] = useState(false);
  const [pendingRemoveEntryId, setPendingRemoveEntryId] = useState<string | null>(null);

  const total = totalWaterOzForDateKey({ [dateKey]: entries }, dateKey);
  const pct = targetOz > 0 ? Math.max(0, Math.min(1, total / targetOz)) : 0;
  const sectionLabel = isToday ? "Hydration · Today" : "Hydration";
  const sortedEntries = [...entries].sort((a, b) => b.loggedAtMs - a.loggedAtMs);
  const earlierCount = Math.max(0, sortedEntries.length - 1);
  const visibleEntries = showEarlier ? sortedEntries : sortedEntries.slice(0, 1);

  useEffect(() => {
    if (sortedEntries.length <= 1) setShowEarlier(false);
  }, [sortedEntries.length]);

  function formatLoggedTime(ms: number): string {
    return new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }

  const quickAddPresets = waterQuickAddPresets(volumeUnit);
  const customMin = volumeUnit === "L" ? 0.1 : 1;
  const customMax = volumeUnit === "L" ? 3.8 : 128;
  const customStep = volumeUnit === "L" ? 0.1 : 1;

  function renderEntryRow(entry: WaterLogEntry, showDivider: boolean) {
    const displayAmount = formatWaterVolume(entry.amountOz, volumeUnit);
    return (
      <div
        key={entry.id}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          paddingBottom: showDivider ? 8 : 0,
          borderBottom: showDivider ? "1px solid var(--divider-subtle)" : undefined,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
            +{displayAmount}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, marginTop: 2 }}>
            {formatLoggedTime(entry.loggedAtMs)}
          </div>
        </div>
        {!readOnly && onRemoveEntry ? (
          <button
            type="button"
            className="tap"
            aria-label={`Remove ${displayAmount} logged at ${formatLoggedTime(entry.loggedAtMs)}`}
            onClick={() => setPendingRemoveEntryId(entry.id)}
            style={{
              flexShrink: 0,
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,120,120,0.95)",
              padding: "6px 10px",
              borderRadius: 8,
              border: "none",
              background: "rgba(255,80,80,0.12)",
            }}
          >
            Remove
          </button>
        ) : null}
      </div>
    );
  }
  const parsedCustomAmount = volumeUnit === "L" ? parseFloat(customAmount) : parseInt(customAmount, 10);
  const parsedCustomOz =
    volumeUnit === "L" ? parseVolumeToOz(parsedCustomAmount, "L") : parsedCustomAmount;
  const isCustomValid =
    customAmount !== "" &&
    Number.isFinite(parsedCustomAmount) &&
    parsedCustomOz > 0 &&
    parsedCustomOz <= 128;

  function handleCustomAdd(e?: FormEvent) {
    e?.preventDefault();
    const amount = volumeUnit === "L" ? parseFloat(customAmount) : parseInt(customAmount, 10);
    const oz = volumeUnit === "L" ? parseVolumeToOz(amount, "L") : amount;
    if (!Number.isFinite(oz) || oz <= 0 || oz > 128) {
      setCustomError(volumeUnit === "L" ? "Enter 0.1-3.8 L" : "Enter 1-128 oz");
      return;
    }
    onAddOz(Math.round(oz));
    setCustomAmount("");
    setCustomError(null);
  }

  return (
    <div className="card" style={{ padding: 18, marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: "rgba(10,132,255,0.12)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <IconDroplet size={18} stroke={1.8} style={{ color: "rgba(10,132,255,0.9)" }} />
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-faint-soft)",
          }}
        >
          {sectionLabel}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 400 }}>Water</span>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
              {formatVolumeFromOz(total, volumeUnit)}
              <span style={{ color: "var(--text-ghost)", fontWeight: 400 }}>
                {" "}
                / {formatWaterVolume(targetOz, volumeUnit)}
              </span>
            </span>
            <div style={{ fontSize: 11, color: "var(--text-faint-soft)", fontWeight: 500, marginTop: 2 }}>
              {formatWaterVolumeAlt(total, volumeUnit)} · target {formatWaterVolume(targetOz, volumeUnit)}
            </div>
          </div>
        </div>
        <div className="barTrack">
          <div
            className="barFill"
            style={{ width: `${pct * 100}%`, background: "rgba(10,132,255,0.85)" }}
          />
        </div>
      </div>

      {sortedEntries.length > 0 ? (
        <div
          style={{
            marginTop: 14,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {visibleEntries.map((entry, idx) => renderEntryRow(entry, idx < visibleEntries.length - 1))}
          {earlierCount > 0 ? (
            <button
              type="button"
              className="tap"
              onClick={() => setShowEarlier((v) => !v)}
              aria-expanded={showEarlier}
              style={{
                marginTop: 2,
                padding: 0,
                border: "none",
                background: "none",
                textAlign: "left",
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(10,132,255,0.95)",
              }}
            >
              {showEarlier
                ? "Hide earlier entries"
                : `Show ${earlierCount} earlier ${earlierCount === 1 ? "entry" : "entries"}`}
            </button>
          ) : null}
        </div>
      ) : null}

      {!readOnly ? (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {quickAddPresets.map((preset) => {
              const oz = volumeUnit === "L" ? Math.round(parseVolumeToOz(preset, "L")) : preset;
              const label = volumeUnit === "L" ? `+${preset} L` : `+${preset} oz`;
              return (
              <button
                key={preset}
                type="button"
                className="tap"
                onClick={() => onAddOz(oz)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "0.5px solid var(--border)",
                  background: "var(--surface-1)",
                  color: "var(--text-muted-soft)",
                  fontSize: 13,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {label}
              </button>
              );
            })}
          </div>

          <form
            onSubmit={handleCustomAdd}
            style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "stretch" }}
          >
            <input
              type="number"
              min={customMin}
              max={customMax}
              step={customStep}
              inputMode="decimal"
              className="input"
              placeholder={volumeUnit === "L" ? "Custom L" : "Custom oz"}
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                if (customError) setCustomError(null);
              }}
              aria-label={volumeUnit === "L" ? "Custom water amount in liters" : "Custom water amount in ounces"}
              aria-invalid={customError ? true : undefined}
              style={{ flex: 1, fontVariantNumeric: "tabular-nums" }}
            />
            <button
              type="submit"
              className="tap"
              disabled={!isCustomValid}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                background: "rgba(10,132,255,0.22)",
                color: "#0A84FF",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              Add
            </button>
          </form>
          {customError ? (
            <div style={{ fontSize: 11, color: "rgba(255,120,120,0.85)", marginTop: 6, fontWeight: 500 }}>
              {customError}
            </div>
          ) : null}
        </>
      ) : null}
      {pendingRemoveEntryId && onRemoveEntry ? (
        <DeleteConfirmSheet
          title="Remove water entry?"
          cancelLabel="Keep entry"
          confirmLabel="Remove entry"
          message={
            <>
              Remove{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {formatWaterVolume(
                  entries.find((e) => e.id === pendingRemoveEntryId)?.amountOz ?? 0,
                  volumeUnit,
                )}
              </strong>{" "}
              from today&apos;s log?
            </>
          }
          onCancel={() => setPendingRemoveEntryId(null)}
          onConfirm={() => {
            onRemoveEntry(pendingRemoveEntryId);
            setPendingRemoveEntryId(null);
          }}
        />
      ) : null}
    </div>
  );
}
