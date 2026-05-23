import { useEffect, useState } from "react";

import {
  arizonaCalendarDateKey,
  isArizonaEightPmOrLater,
} from "../dailyPlan";
import { IconCheck, IconChevL, IconChevR, IconX } from "../icons";
import { ScreenHeader, SectionLabel } from "../shared";
import { STRETCH_BLOCKS, STRETCH_INTRO } from "../stretchRoutine";
import type { ScreenProps } from "../types";

export function ScreenStretch({ state, setState, navigate }: ScreenProps) {
  const [clock, setClock] = useState(() => new Date());
  const [openBlockId, setOpenBlockId] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!openBlockId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenBlockId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openBlockId]);

  const arizonaTodayKey = arizonaCalendarDateKey(clock);
  const inEveningWindow = isArizonaEightPmOrLater(clock);
  const nightlyStretchDone = state.nightlyStretchCompletedArizonaKey === arizonaTodayKey;

  const completedIds = state.nightlyStretchBlockIdsByArizonaDay[arizonaTodayKey] ?? [];

  const doneCount = completedIds.filter((id) => STRETCH_BLOCKS.some((b) => b.id === id)).length;
  const totalBlocks = STRETCH_BLOCKS.length;

  const openBlock = openBlockId ? STRETCH_BLOCKS.find((b) => b.id === openBlockId) ?? null : null;

  function toggleStretchBlock(blockId: string) {
    setState((s) => {
      const prev = s.nightlyStretchBlockIdsByArizonaDay[arizonaTodayKey] ?? [];
      const has = prev.includes(blockId);
      const nextIds = has ? prev.filter((x) => x !== blockId) : [...prev, blockId];
      const allDone = STRETCH_BLOCKS.every((b) => nextIds.includes(b.id));

      let nightlyKey = s.nightlyStretchCompletedArizonaKey;
      if (allDone) nightlyKey = arizonaTodayKey;
      else if (nightlyKey === arizonaTodayKey) nightlyKey = null;

      const nextDayMap = { ...s.nightlyStretchBlockIdsByArizonaDay };
      if (nextIds.length === 0) delete nextDayMap[arizonaTodayKey];
      else nextDayMap[arizonaTodayKey] = nextIds;

      return {
        ...s,
        nightlyStretchBlockIdsByArizonaDay: nextDayMap,
        nightlyStretchCompletedArizonaKey: nightlyKey,
      };
    });
  }

  function toggleNightlyStretchDone() {
    setState((s) => {
      if (s.nightlyStretchCompletedArizonaKey === arizonaTodayKey) {
        const nextDayMap = { ...s.nightlyStretchBlockIdsByArizonaDay };
        delete nextDayMap[arizonaTodayKey];
        return {
          ...s,
          nightlyStretchCompletedArizonaKey: null,
          nightlyStretchBlockIdsByArizonaDay: nextDayMap,
        };
      }
      return {
        ...s,
        nightlyStretchCompletedArizonaKey: arizonaTodayKey,
        nightlyStretchBlockIdsByArizonaDay: {
          ...s.nightlyStretchBlockIdsByArizonaDay,
          [arizonaTodayKey]: STRETCH_BLOCKS.map((b) => b.id),
        },
      };
    });
  }

  return (
    <div className="screen page-transition" style={{ paddingBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
        <button
          type="button"
          className="tap"
          onClick={() => navigate("home")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 14,
            fontWeight: 600,
            color: "rgba(255,255,255,0.75)",
            padding: "6px 8px 6px 0",
          }}
          aria-label="Back to Home"
        >
          <IconChevL size={18} stroke={2} />
          Home
        </button>
      </div>

      <ScreenHeader eyebrow={inEveningWindow ? "Arizona · Evening" : "Your routine"} title="Nightly stretching" />

      {!inEveningWindow ? (
        <p style={{ margin: "0 0 16px", fontSize: 12, lineHeight: 1.55, color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>
          Reminder cues usually show after <strong style={{ color: "#fff", fontWeight: 600 }}>8 PM Arizona</strong>; the routine is always here whenever you want to run through it.
        </p>
      ) : (
        <p style={{ margin: "0 0 16px", fontSize: 12, lineHeight: 1.55, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
          Aim for about <strong style={{ color: "#fff", fontWeight: 600 }}>15-20 minutes total</strong>, drift longer on what feels glued from the day.
        </p>
      )}

      <div className="card" style={{ padding: 16, marginBottom: 16, borderColor: "rgba(196,181,253,0.22)" }}>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{STRETCH_INTRO}</p>
      </div>

      <SectionLabel
        right={
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
            {doneCount}/{totalBlocks}
          </span>
        }
      >
        Tonight&apos;s moves
      </SectionLabel>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
        {STRETCH_BLOCKS.map((block) => {
          const isDone = completedIds.includes(block.id);
          return (
            <div
              key={block.id}
              className="card"
              style={{
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderColor: "rgba(255,255,255,0.08)",
                opacity: isDone ? 0.62 : 1,
              }}
            >
              <button
                type="button"
                className="tap"
                aria-label={isDone ? `Mark ${block.title} not done` : `Mark ${block.title} done`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStretchBlock(block.id);
                }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  border: isDone ? "0.5px solid #fff" : "0.5px solid var(--border)",
                  background: isDone ? "#fff" : "transparent",
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {isDone ? <IconCheck size={12} stroke={2.8} style={{ color: "#000" }} /> : null}
              </button>
              <button
                type="button"
                className="tap"
                onClick={() => setOpenBlockId(block.id)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "left",
                  padding: "4px 0",
                  background: "none",
                  border: "none",
                  color: "inherit",
                  font: "inherit",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: isDone ? 500 : 600,
                    letterSpacing: "-0.01em",
                    color: isDone ? "rgba(255,255,255,0.55)" : "#fff",
                    textDecoration: isDone ? "line-through" : "none",
                  }}
                >
                  {block.title}
                </span>
                <IconChevR size={16} stroke={2} style={{ color: "rgba(255,255,255,0.28)", flexShrink: 0, marginLeft: "auto" }} />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="tap"
        onClick={toggleNightlyStretchDone}
        style={{
          width: "100%",
          marginTop: 8,
          background: nightlyStretchDone ? "transparent" : "#ffffff",
          color: nightlyStretchDone ? "rgba(255,255,255,0.9)" : "#000",
          border: nightlyStretchDone ? "0.5px solid rgba(255,255,255,0.25)" : "none",
          borderRadius: 12,
          padding: 14,
          fontSize: 14,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {nightlyStretchDone ? (
          <>
            Mark not done tonight
          </>
        ) : (
          <>
            <IconCheck size={16} stroke={2.5} />
            Mark tonight complete (all moves)
          </>
        )}
      </button>

      <p style={{ margin: "12px 0 0", fontSize: 11, lineHeight: 1.45, color: "rgba(255,255,255,0.35)", textAlign: "center", fontWeight: 400 }}>
        Checkboxes save for tonight&apos;s Arizona date · tapping a row opens cues and timing.
      </p>

      {openBlock ? (
        <div
          role="presentation"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setOpenBlockId(null)}
        >
          <div
            key={openBlock.id}
            role="dialog"
            aria-labelledby="stretch-detail-title"
            className="card page-transition"
            style={{
              width: "100%",
              maxWidth: 375,
              maxHeight: "78vh",
              overflow: "auto",
              padding: 0,
              marginBottom: 8,
              borderColor: "rgba(196,181,253,0.35)",
              background: "var(--card)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "16px 16px 12px", position: "sticky", top: 0, background: "var(--card)", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
              <div className="between" style={{ alignItems: "flex-start", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div id="stretch-detail-title" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", lineHeight: 1.25 }}>
                    {openBlock.title}
                  </div>
                  {openBlock.minutes ? (
                    <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(196,181,253,0.9)", marginTop: 8 }}>{openBlock.minutes}</div>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="tap"
                  onClick={() => setOpenBlockId(null)}
                  aria-label="Close"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    border: "0.5px solid var(--border)",
                    display: "grid",
                    placeItems: "center",
                    color: "rgba(255,255,255,0.55)",
                    flexShrink: 0,
                  }}
                >
                  <IconX size={16} stroke={2} />
                </button>
              </div>
            </div>
            <div style={{ padding: "14px 16px 18px" }}>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                {openBlock.cues.map((c, idx) => (
                  <li key={idx} style={{ marginBottom: 10 }}>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
