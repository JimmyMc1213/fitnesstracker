import { useEffect, useState } from "react";

import { IconCheck, IconChevR, IconSettings } from "../icons";
import { arizonaCalendarDateKey, isArizonaEightPmOrLater, localDateKey } from "../dailyPlan";
import { SettingsSheet } from "../SettingsSheet";
import { effectiveNutritionTotalsForDateKey } from "../nutritionTotals";
import { SUNDAY_PREP_STEPS } from "../jimmy-seed-data";
import { StreakWeeklyHeader } from "../StreakWeeklyHeader";
import { MacroBar, MacroRing, ScreenHeader } from "../shared";
import { formatWeightFromLbs, weightUnitLabel } from "../unitPreferences";
import type { ScreenProps } from "../types";

export function ScreenHome({ state, setState, navigate }: ScreenProps) {
  const T = state.nutritionTargets;
  const dateKeyToday = localDateKey(new Date());
  const totals = effectiveNutritionTotalsForDateKey(state.nutritionManualByDay, state.nutritionItemsByDay, dateKeyToday);
  const todayEntry = state.weightLog.find((e) => e.dateKey === dateKeyToday);

  const wUnit = state.unitPreferences.weightUnit;
  const [clock, setClock] = useState(() => new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);

  const greetingName = state.displayName.trim();
  const isLocalSunday = new Date().getDay() === 0;

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const todayEyebrow = new Date()
    .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    .replace(",", "")
    .toUpperCase();

  const arizonaTodayKey = arizonaCalendarDateKey(clock);
  const showNightlyStretchWindow = isArizonaEightPmOrLater(clock);
  const nightlyStretchDone = state.nightlyStretchCompletedArizonaKey === arizonaTodayKey;

  return (
    <div className="screen page-transition" style={{ position: "relative" }}>
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

      <button
        type="button"
        className="tap card"
        onClick={() => navigate("progress")}
        aria-label={todayEntry ? "View or update weigh-in on Progress" : "Log weigh-in on Progress"}
        style={{
          padding: 16,
          marginTop: 18,
          borderColor: todayEntry ? "rgba(74,222,128,0.25)" : "rgba(74,222,128,0.18)",
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
            background: todayEntry ? "rgba(74,222,128,0.18)" : "rgba(255,255,255,0.06)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {todayEntry ? (
            <IconCheck size={22} stroke={2.4} style={{ color: "rgb(74,222,128)" }} />
          ) : (
            <span style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>+</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", color: "#fff" }}>
            {todayEntry ? "Weigh-in logged" : "Morning weigh-in"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 4 }}>
            {todayEntry
              ? `${formatWeightFromLbs(todayEntry.weightLbs, wUnit)} ${weightUnitLabel(wUnit)} · tap to update on Progress`
              : "Log weight and optional photo on the Progress tab"}
          </div>
        </div>
        <IconChevR size={14} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
      </button>

      {isLocalSunday ? (
        <div className="card" style={{ padding: 18, marginTop: 18, borderColor: "rgba(255,200,120,0.28)" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,200,120,0.8)",
              marginBottom: 10,
            }}
          >
            Sunday meal prep
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            {SUNDAY_PREP_STEPS.map((step) => (
              <li key={step} style={{ fontSize: 12, lineHeight: 1.45, color: "rgba(255,255,255,0.68)", fontWeight: 500 }}>
                {step}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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
