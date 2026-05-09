import { useEffect, useRef, useState } from "react";

import { IconCheck, IconChevR, IconSettings } from "../icons";
import { arizonaCalendarDateKey, isArizonaEightPmOrLater, localDateKey } from "../dailyPlan";
import { SettingsSheet } from "../SettingsSheet";
import { compressImageToJpegDataUrl } from "../imageCompress";
import { effectiveNutritionTotalsForDateKey } from "../nutritionTotals";
import { StreakWeeklyHeader } from "../StreakWeeklyHeader";
import { MacroBar, MacroRing, ScreenHeader } from "../shared";
import type { ScreenProps } from "../types";

export function ScreenHome({ state, setState, navigate }: ScreenProps) {
  const T = state.nutritionTargets;
  const dateKeyToday = localDateKey(new Date());
  const totals = effectiveNutritionTotalsForDateKey(state.nutritionManualByDay, state.nutritionItemsByDay, dateKeyToday);
  const todayEntry = state.weightLog.find((e) => e.dateKey === dateKeyToday);

  const [lbsDraft, setLbsDraft] = useState(() => (todayEntry ? String(todayEntry.weightLbs) : ""));
  const [photoPreview, setPhotoPreview] = useState<string | null>(todayEntry?.photoDataUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [clock, setClock] = useState(() => new Date());
  const [morningWeighInEditing, setMorningWeighInEditing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const greetingName = state.displayName.trim();

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setMorningWeighInEditing(false);
  }, [dateKeyToday]);

  useEffect(() => {
    setLbsDraft(todayEntry ? String(todayEntry.weightLbs) : "");
    setPhotoPreview(todayEntry?.photoDataUrl ?? null);
  }, [dateKeyToday, todayEntry?.weightLbs, todayEntry?.photoDataUrl]);

  async function onPickPhoto(f: File) {
    try {
      const url = await compressImageToJpegDataUrl(f);
      setPhotoPreview(url);
    } catch {
      /* ignore */
    }
  }

  function saveWeighIn() {
    const lbs = parseFloat(lbsDraft);
    if (!Number.isFinite(lbs) || lbs < 70 || lbs > 450) return;
    setState((s) => {
      const key = localDateKey(new Date());
      const nextLog = s.weightLog.filter((e) => e.dateKey !== key);
      nextLog.push({ dateKey: key, weightLbs: lbs, photoDataUrl: photoPreview ?? undefined });
      nextLog.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
      return { ...s, weightLog: nextLog };
    });
    setMorningWeighInEditing(false);
  }

  function cancelWeighInRedo() {
    if (!todayEntry) return;
    setMorningWeighInEditing(false);
    setLbsDraft(String(todayEntry.weightLbs));
    setPhotoPreview(todayEntry.photoDataUrl ?? null);
  }

  const todayEyebrow = new Date()
    .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    .replace(",", "")
    .toUpperCase();

  const arizonaTodayKey = arizonaCalendarDateKey(clock);
  const showNightlyStretchWindow = isArizonaEightPmOrLater(clock);
  const nightlyStretchDone = state.nightlyStretchCompletedArizonaKey === arizonaTodayKey;

  return (
    <div className="screen" style={{ position: "relative" }}>
      <ScreenHeader
        eyebrow={todayEyebrow}
        title={greetingName ? `Morning, ${greetingName}` : "Morning"}
        right={
          <button
            type="button"
            className="tap"
            onClick={() => setSettingsOpen(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: "0.5px solid var(--border)",
              display: "grid",
              placeItems: "center",
              color: "rgba(255,255,255,0.5)",
            }}
            aria-label="Settings"
          >
            <IconSettings size={16} />
          </button>
        }
      />

      <StreakWeeklyHeader state={state} todayKey={dateKeyToday} />

      {todayEntry && !morningWeighInEditing ? (
        <button
          type="button"
          className="tap card"
          onClick={() => setMorningWeighInEditing(true)}
          aria-label="Edit morning weigh-in"
          style={{
            padding: 16,
            marginTop: 18,
            borderColor: "rgba(74,222,128,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 14,
            width: "100%",
            textAlign: "left",
            background: "var(--card)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: "rgba(74,222,128,0.18)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <IconCheck size={22} stroke={2.4} style={{ color: "rgb(74,222,128)" }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", color: "#fff" }}>Morning weigh-in</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 4 }}>
              Tap to fix a mistake or update weight / photo.
            </div>
          </div>
        </button>
      ) : (
        <div className="card" style={{ padding: 18, marginTop: 18, borderColor: "rgba(74,222,128,0.25)" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(74,222,128,0.75)",
              marginBottom: 8,
            }}
          >
            Morning weigh-in
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>
            Step on the scale <strong style={{ color: "#fff", fontWeight: 600 }}>after the bathroom</strong>,{" "}
            <strong style={{ color: "#fff", fontWeight: 600 }}>before food or drink</strong>. Optional progress photo — same
            stance/lighting when you can.
          </p>
          <div className="between" style={{ alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 100 }}>
              <label htmlFor="wi-lbs" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em" }}>
                Weight (lbs)
              </label>
              <input
                id="wi-lbs"
                type="number"
                inputMode="decimal"
                className="input"
                style={{ marginTop: 6, fontSize: 18, fontWeight: 600 }}
                placeholder="172.4"
                value={lbsDraft}
                onChange={(e) => setLbsDraft(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && onPickPhoto(e.target.files[0])} />
              <button
                type="button"
                className="tap"
                onClick={() => fileRef.current?.click()}
                style={{
                  border: "0.5px solid var(--border)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {photoPreview ? "Change photo" : "Add progress photo"}
              </button>
              {photoPreview ? (
                <button type="button" className="tap" onClick={() => setPhotoPreview(null)} style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                  Remove photo
                </button>
              ) : null}
            </div>
          </div>
          {photoPreview ? (
            <div style={{ marginTop: 14, borderRadius: 12, overflow: "hidden", border: "0.5px solid var(--border)", maxHeight: 220 }}>
              <img src={photoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          ) : null}
          <button
            type="button"
            className="tap"
            onClick={saveWeighIn}
            style={{
              marginTop: 16,
              width: "100%",
              background: "#ffffff",
              color: "#000",
              borderRadius: 12,
              padding: 14,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Save today&apos;s weigh-in
          </button>
          {todayEntry ? (
            <button
              type="button"
              className="tap"
              onClick={cancelWeighInRedo}
              style={{
                marginTop: 10,
                width: "100%",
                padding: 10,
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              Cancel · keep saved entry
            </button>
          ) : null}
        </div>
      )}

      {showNightlyStretchWindow ? (
        nightlyStretchDone ? (
          <button
            type="button"
            className="tap card"
            onClick={() => navigate("stretch")}
            aria-label="Open nightly stretching routine"
            style={{
              padding: 16,
              marginTop: 18,
              borderColor: "rgba(196,181,253,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              width: "100%",
              textAlign: "left",
              background: "var(--card)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "rgba(196,181,253,0.12)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <IconCheck size={22} stroke={2.4} style={{ color: "rgb(196,181,253)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", color: "#fff" }}>Nightly stretching</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 4 }}>
                Finished · tap to open your full routine
              </div>
            </div>
            <IconChevR size={18} stroke={2} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
          </button>
        ) : (
          <button
            type="button"
            className="tap card"
            onClick={() => navigate("stretch")}
            aria-label="Open nightly stretching routine"
            style={{
              padding: 18,
              marginTop: 18,
              borderColor: "rgba(196,181,253,0.28)",
              width: "100%",
              textAlign: "left",
              background: "var(--card)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(196,181,253,0.75)",
                marginBottom: 8,
              }}
            >
              Nightly stretching · Arizona 8pm+
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>
              Open your routine for the full checklist — hips, hamstrings, spine, activation. Mark complete when you finish.
            </p>
            <div
              style={{
                width: "100%",
                background: "#ffffff",
                color: "#000",
                borderRadius: 12,
                padding: 14,
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                pointerEvents: "none",
              }}
            >
              Open full routine
              <IconChevR size={16} stroke={2.5} />
            </div>
          </button>
        )
      ) : null}

      <div className="card" style={{ padding: 18, marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <MacroRing value={totals.cal} target={T.cal} size={132} stroke={6} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ marginBottom: 2 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.25)",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Fuel · Today
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 500,
                  marginTop: 4,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {Math.max(0, T.cal - totals.cal)} kcal left
              </div>
            </div>
            <MacroBar label="Protein" value={totals.p} target={T.p} />
            <MacroBar label="Carbs" value={totals.c} target={T.c} />
            <MacroBar label="Fat" value={totals.f} target={T.f} />
          </div>
        </div>
      </div>

      <div style={{ height: 8 }} />

      {settingsOpen ? <SettingsSheet state={state} setState={setState} onClose={() => setSettingsOpen(false)} /> : null}
    </div>
  );
}
