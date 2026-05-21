import { useState, type FormEvent } from "react";

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
};

export function WaterTrackerCard({ dateKey, targetOz, entries, readOnly, isToday, onAddOz }: WaterTrackerCardProps) {
  const [customOz, setCustomOz] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  const total = totalWaterOzForDateKey({ [dateKey]: entries }, dateKey);
  const pct = targetOz > 0 ? Math.max(0, Math.min(1, total / targetOz)) : 0;
  const sectionLabel = isToday ? "Hydration · Today" : "Hydration";
  const parsedCustomOz = parseInt(customOz, 10);
  const isCustomValid =
    customOz !== "" && Number.isFinite(parsedCustomOz) && parsedCustomOz > 0 && parsedCustomOz <= 128;

  function handleCustomAdd(e?: FormEvent) {
    e?.preventDefault();
    const n = parseInt(customOz, 10);
    if (!Number.isFinite(n) || n <= 0 || n > 128) {
      setCustomError("Enter 1–128 oz");
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
            color: "rgba(255,255,255,0.45)",
          }}
        >
          {sectionLabel}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>Water</span>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
              {Math.round(total)}
              <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
                {" "}
                / {targetOz} oz
              </span>
            </span>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500, marginTop: 2 }}>
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
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.65)",
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
    </div>
  );
}
