import { useEffect, useState } from "react";

import {
  REST_TIMER_PRESETS,
  clampRestTimerSeconds,
  formatRestDuration,
  MAX_REST_TIMER_SECONDS,
  MIN_REST_TIMER_SECONDS,
} from "./restTimerPreferences";
import { PRESET_SELECTED_BG, PRESET_SELECTED_BORDER, PRESET_SELECTED_COLOR } from "./workoutUiTokens";

type Props = {
  value: number;
  onChange: (seconds: number) => void;
  /** RestTimerSheet uses tighter preset chips; settings uses default padding. */
  variant?: "settings" | "sheet";
};

export function RestTimerDurationPicker({ value, onChange, variant = "settings" }: Props) {
  const [customIn, setCustomIn] = useState(String(value));

  useEffect(() => {
    setCustomIn(String(value));
  }, [value]);

  function commitCustom(raw: string) {
    const n = parseInt(raw, 10);
    const val = clampRestTimerSeconds(Number.isFinite(n) ? n : value);
    setCustomIn(String(val));
    onChange(val);
  }

  const presetPadding = variant === "sheet" ? "10px 8px" : "10px 14px";
  const presetFlex = variant === "sheet" ? "1 1 calc(25% - 6px)" : undefined;
  const presetMinWidth = variant === "sheet" ? 64 : undefined;

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {REST_TIMER_PRESETS.map((sec) => {
          const selected = value === sec;
          return (
            <button
              key={sec}
              type="button"
              className="tap"
              aria-pressed={selected}
              onClick={() => onChange(sec)}
              style={{
                flex: presetFlex,
                minWidth: presetMinWidth,
                padding: presetPadding,
                borderRadius: 10,
                border: selected ? `0.5px solid ${PRESET_SELECTED_BORDER}` : "0.5px solid var(--border)",
                background: selected ? PRESET_SELECTED_BG : "var(--surface-1)",
                color: selected ? PRESET_SELECTED_COLOR : "var(--text-muted-soft)",
                fontSize: 13,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {sec}s
            </button>
          );
        })}
      </div>
      <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        Custom (seconds)
        <input
          type="number"
          min={MIN_REST_TIMER_SECONDS}
          max={MAX_REST_TIMER_SECONDS}
          step={5}
          inputMode="numeric"
          className="input"
          style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
          value={customIn}
          onChange={(e) => {
            const v = e.target.value;
            setCustomIn(v);
            if (v === "" || v === "-") return;
            const n = parseInt(v, 10);
            if (!Number.isFinite(n)) return;
            if (n >= MIN_REST_TIMER_SECONDS && n <= MAX_REST_TIMER_SECONDS) {
              onChange(n);
            }
          }}
          onBlur={() => commitCustom(customIn)}
          aria-label="Custom rest duration in seconds"
        />
      </label>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginTop: 8 }}>
        {MIN_REST_TIMER_SECONDS}s–{formatRestDuration(MAX_REST_TIMER_SECONDS)} allowed
      </div>
    </>
  );
}
