import { useEffect, useState, type FormEvent } from "react";

import { DeleteConfirmSheet } from "./DeleteConfirmSheet";
import { IconDroplet } from "./icons";
import {
  formatWaterLitersFromOz,
  formatWaterOz,
  totalWaterOzForDateKey,
  WATER_QUICK_ADD_OZ,
} from "./waterIntake";
import type { WaterLogEntry } from "./types";

type WaterTrackerCardProps = {
  dateKey: string;
  targetOz: number;
  entries: WaterLogEntry[];
  readOnly: boolean;
  isToday: boolean;
  onAddOz: (oz: number) => void;
  onRemoveEntry?: (entryId: string) => void;
};

export function WaterTrackerCard({
  dateKey,
  targetOz,
  entries,
  readOnly,
  isToday,
  onAddOz,
  onRemoveEntry,
}: WaterTrackerCardProps) {
  const [customOz, setCustomOz] = useState("");
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

  function renderEntryRow(entry: WaterLogEntry, showDivider: boolean) {
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
            +{Math.round(entry.amountOz)} oz
          </div>
          <div style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, marginTop: 2 }}>
            {formatLoggedTime(entry.loggedAtMs)}
          </div>
        </div>
        {!readOnly && onRemoveEntry ? (
          <button
            type="button"
            className="tap"
            aria-label={`Remove ${entry.amountOz} ounces logged at ${formatLoggedTime(entry.loggedAtMs)}`}
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
  const parsedCustomOz = parseInt(customOz, 10);
  const isCustomValid =
    customOz !== "" && Number.isFinite(parsedCustomOz) && parsedCustomOz > 0 && parsedCustomOz <= 128;

  function handleCustomAdd(e?: FormEvent) {
    e?.preventDefault();
    const n = parseInt(customOz, 10);
    if (!Number.isFinite(n) || n <= 0 || n > 128) {
      setCustomError("Enter 1-128 oz");
      return;
    }
    onAddOz(n);
    setCustomOz("");
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
              {Math.round(total)}
              <span style={{ color: "var(--text-ghost)", fontWeight: 400 }}>
                {" "}
                / {targetOz} oz
              </span>
            </span>
            <div style={{ fontSize: 11, color: "var(--text-faint-soft)", fontWeight: 500, marginTop: 2 }}>
              {formatWaterLitersFromOz(total)} · target {formatWaterOz(targetOz)}
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
            {WATER_QUICK_ADD_OZ.map((oz) => (
              <button
                key={oz}
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
                +{oz} oz
              </button>
            ))}
          </div>

          <form
            onSubmit={handleCustomAdd}
            style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "stretch" }}
          >
            <input
              type="number"
              min={1}
              max={128}
              step={1}
              inputMode="numeric"
              className="input"
              placeholder="Custom oz"
              value={customOz}
              onChange={(e) => {
                setCustomOz(e.target.value);
                if (customError) setCustomError(null);
              }}
              aria-label="Custom water amount in ounces"
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
                {Math.round(entries.find((e) => e.id === pendingRemoveEntryId)?.amountOz ?? 0)} oz
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
