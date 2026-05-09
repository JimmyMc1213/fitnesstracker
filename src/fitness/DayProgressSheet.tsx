import { IconCheck } from "./icons";

import type { MouseEvent } from "react";

import { formatDayHeading, getDayProgressDetail } from "./dailyStreak";
import type { AppState } from "./types";

function ListBlock({ title, lines, muted }: { title: string; lines: string[]; muted?: boolean }) {
  if (lines.length === 0) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <div className="label" style={{ marginBottom: 8 }}>
        {title}
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {lines.map((t, i) => (
          <li
            key={`${title}-${i}-${t}`}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              fontSize: 13,
              fontWeight: muted ? 500 : 600,
              color: muted ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.9)",
              lineHeight: 1.35,
            }}
          >
            <span style={{ flexShrink: 0, marginTop: 2, opacity: muted ? 0.45 : 0.92 }}>
              {muted ? (
                <span style={{ width: 16, height: 16, borderRadius: 999, border: "1px solid rgba(255,255,255,0.28)", display: "block" }} />
              ) : (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    background: "rgba(74,222,128,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-hidden
                >
                  <IconCheck size={10} stroke={2.25} style={{ color: "#4ade80" }} />
                </span>
              )}
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DayProgressSheet({
  state,
  dateKey,
  todayKey,
  onClose,
}: {
  state: AppState;
  dateKey: string;
  todayKey: string;
  onClose: () => void;
}) {
  const isFuture = dateKey > todayKey;
  const detail = isFuture ? null : getDayProgressDetail(state, dateKey);

  function onBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      role="presentation"
      onMouseDown={onBackdropMouseDown}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.52)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "12px 12px calc(24px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-progress-title"
        className="card"
        style={{
          width: "100%",
          maxWidth: 440,
          maxHeight: "min(82vh, 560px)",
          overflow: "auto",
          padding: "18px 18px 20px",
          background: "#121212",
          borderColor: "var(--border)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.45)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="between" style={{ alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div id="day-progress-title" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", flex: 1, minWidth: 0 }}>
            {formatDayHeading(dateKey)}
          </div>
          <button type="button" className="tap" onClick={onClose} aria-label="Close" style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>
            Done
          </button>
        </div>

        {isFuture ? (
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.42)", lineHeight: 1.45 }}>
            This day hasn’t started yet — check back when it arrives.
          </p>
        ) : detail ? (
          <>
            <div
              style={{
                borderRadius: 12,
                border: "0.5px solid var(--border)",
                padding: "14px 16px",
                background: "rgba(255,255,255,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--tertiary)", fontWeight: 500 }}>
                CALORIES (LOGGED)
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
                {Math.round(detail.calories)}
                <span style={{ fontSize: 12, fontWeight: 550, marginLeft: 6, color: "rgba(255,255,255,0.4)" }}>kcal</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 550, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                P {Math.round(detail.protein)} · C {Math.round(detail.carbs)} · F {Math.round(detail.fat)} g
              </div>
            </div>

            <ListBlock title="Complete" lines={detail.items.filter((i) => i.done).map((i) => i.label)} />
            <ListBlock title="Not yet" lines={detail.items.filter((i) => !i.done).map((i) => i.label)} muted />
          </>
        ) : null}
      </div>
    </div>
  );
}
