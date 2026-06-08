/**
 * Barcode flow for packaged foods (Open Food Facts, etc.). Not wired from Nutrition screen right now;
 * nutrition is manual macros only. Kept for later.
 */
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { CSSProperties } from "react";

import { IconCheck, IconFlash, IconKeyboard, IconX } from "../icons";
import type { AppState } from "../types";

type BarcodeScanOverlayProps = {
  setState: Dispatch<SetStateAction<AppState>>;
  onClose: () => void;
};

export function BarcodeScanOverlay({ setState, onClose }: BarcodeScanOverlayProps) {
  const [status, setStatus] = useState<"searching" | "found">("searching");
  const [flash, setFlash] = useState(false);
  const [scanY, setScanY] = useState(0);
  const [manualOpen, setManualOpen] = useState(false);

  useEffect(() => {
    let raf: number;
    let t = 0;
    const tick = () => {
      t += 1;
      setScanY(50 + Math.sin(t / 22) * 50);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (status !== "searching") return;
    const tm = window.setTimeout(() => setStatus("found"), 3400);
    return () => clearTimeout(tm);
  }, [status]);

  function logFood() {
    const loggedAtMs = Date.now();
    const food = {
      id: "i" + loggedAtMs,
      name: "Chobani Greek Yogurt",
      qty: "1 cup",
      cal: 150,
      p: 25,
      c: 9,
      f: 0,
      loggedAtMs,
    };
    setState((s) => ({
      ...s,
      nutritionLog: [...s.nutritionLog, food],
    }));
    onClose();
  }

  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", overflow: "hidden", zIndex: 40 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 30% 40%, #1a1a18 0%, #0a0a08 50%, #050503 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "42%",
            transform: "translate(-50%, -50%)",
            width: 180,
            height: 240,
            background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            border: "0.5px solid var(--divider-subtle)",
            borderRadius: 12,
          }}
        >
          <div style={{ position: "absolute", left: 16, right: 16, top: 50, height: 32, background: "var(--surface-3)", borderRadius: 4 }} />
          <div style={{ position: "absolute", left: 24, right: 24, top: 100, height: 8, background: "var(--surface-1)", borderRadius: 2 }} />
          <div style={{ position: "absolute", left: 24, right: 60, top: 116, height: 8, background: "var(--surface-1)", borderRadius: 2 }} />
          <div
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              bottom: 24,
              height: 50,
              background: "rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="120" height="36" viewBox="0 0 120 36">
              {Array.from({ length: 38 }).map((_, i) => {
                const w = ((i * 7919) % 5 < 2 ? 1 : i % 3 === 0 ? 2.5 : 1.5) as number;
                const x = i * 3.2;
                return <rect key={i} x={x} y="2" width={w} height="32" fill="rgba(255,255,255,0.85)" />;
              })}
            </svg>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          type="button"
          className="tap"
          onClick={onClose}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(10px)",
            border: "0.5px solid var(--border)",
            display: "grid",
            placeItems: "center",
            color: "var(--text-primary)",
          }}
          aria-label="Close"
        >
          <IconX size={18} />
        </button>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Scan</div>
        <button
          type="button"
          className="tap"
          onClick={() => setFlash((f) => !f)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: flash ? "#fff" : "rgba(0,0,0,0.5)",
            backdropFilter: "blur(10px)",
            border: flash ? "0.5px solid #fff" : "0.5px solid var(--border)",
            display: "grid",
            placeItems: "center",
            color: flash ? "#000" : "var(--text-primary)",
          }}
          aria-label="Flash"
        >
          <IconFlash size={18} />
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "40%",
          transform: "translate(-50%, -50%)",
          width: 260,
          height: 260,
          pointerEvents: "none",
        }}
      >
        {[
          { top: 0, left: 0, lines: ["t", "l"] as const },
          { top: 0, right: 0, lines: ["t", "r"] as const },
          { bottom: 0, left: 0, lines: ["b", "l"] as const },
          { bottom: 0, right: 0, lines: ["b", "r"] as const },
        ].map((corner, i) => {
          const { lines, ...pos } = corner;
          const box: CSSProperties = { position: "absolute", width: 28, height: 28, ...pos };
          const showT = (lines as readonly string[]).includes("t");
          const showL = (lines as readonly string[]).includes("l");
          const showB = (lines as readonly string[]).includes("b");
          const showR = (lines as readonly string[]).includes("r");
          return (
            <div key={i} style={box}>
              {showT && (
                <div style={{ position: "absolute", top: 0, [showL ? "left" : "right"]: 0, width: 28, height: 2, background: "var(--primary)" }} />
              )}
              {showL && <div style={{ position: "absolute", [showT ? "top" : "bottom"]: 0, left: 0, width: 2, height: 28, background: "var(--primary)" }} />}
              {showB && (
                <div style={{ position: "absolute", bottom: 0, [showL ? "left" : "right"]: 0, width: 28, height: 2, background: "var(--primary)" }} />
              )}
              {showR && <div style={{ position: "absolute", [showT ? "top" : "bottom"]: 0, right: 0, width: 2, height: 28, background: "var(--primary)" }} />}
            </div>
          );
        })}
        {status === "searching" && (
          <div
            style={{
              position: "absolute",
              left: 8,
              right: 8,
              top: `${scanY}%`,
              height: 1,
              background: "var(--primary)",
              boxShadow: "0 0 0 0.5px rgba(255,255,255,0.5)",
              transition: "top 50ms linear",
            }}
          />
        )}
        {status === "found" && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: "var(--primary)", color: "var(--primary-fg)", display: "grid", placeItems: "center" }}>
              <IconCheck size={26} stroke={2.5} />
            </div>
          </div>
        )}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: "64%", textAlign: "center", padding: "0 32px" }}>
        {status === "searching" ? (
          <>
            <div style={{ fontSize: 11, color: "var(--text-primary)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Searching…</div>
            <div style={{ fontSize: 13, color: "var(--text-muted-soft)", marginTop: 8, fontWeight: 400 }}>Center the barcode inside the frame</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 11, color: "var(--pos)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>✓ Match found</div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", marginTop: 8 }}>Chobani · Greek Yogurt</div>
            <div style={{ fontSize: 12, color: "var(--text-muted-soft)", marginTop: 6, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>150 cal · 25P · 9C · 0F</div>
          </>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "20px 20px 36px",
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 50%)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {status === "found" && (
          <button
            type="button"
            className="tap"
            onClick={logFood}
            style={{
              width: "100%",
              background: "var(--primary)",
              color: "var(--primary-fg)",
              borderRadius: 12,
              padding: 16,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            Add to today&apos;s log
          </button>
        )}
        <button
          type="button"
          className="tap"
          onClick={() => setManualOpen(true)}
          style={{
            width: "100%",
            background: "rgba(20,20,20,0.85)",
            backdropFilter: "blur(10px)",
            border: "0.5px solid var(--border)",
            borderRadius: 12,
            padding: 14,
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          <IconKeyboard size={16} /> Manual entry
        </button>
        <button type="button" className="tap" onClick={() => setStatus("searching")} style={{ fontSize: 12, color: "var(--text-ghost)", padding: 6, fontWeight: 500 }}>
          Scan another
        </button>
      </div>

      {manualOpen && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "flex-end",
            zIndex: 10,
          }}
          onClick={() => setManualOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setManualOpen(false);
          }}
          role="presentation"
        >
          <div
            style={{
              width: "100%",
              background: "#161616",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTop: "0.5px solid var(--border)",
              padding: "20px 20px 32px",
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-entry-title"
          >
            <div style={{ width: 32, height: 3, background: "var(--surface-4)", borderRadius: 999, margin: "0 auto 18px" }} />
            <div style={{ fontSize: 11, color: "var(--text-whisper)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Manual entry</div>
            <div id="manual-entry-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 6 }}>Enter UPC</div>
            <input
              className="input"
              style={{
                marginTop: 14,
                fontFamily: "var(--ui)",
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: "0.04em",
                background: "#1F1F1F",
              }}
              placeholder="0 00000 00000 0"
            />
            <button
              type="button"
              className="tap"
              onClick={() => {
                setManualOpen(false);
                setStatus("found");
              }}
              style={{
                marginTop: 12,
                width: "100%",
                background: "var(--primary)",
                color: "var(--primary-fg)",
                borderRadius: 12,
                padding: 14,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                fontSize: 14,
              }}
            >
              Look up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
