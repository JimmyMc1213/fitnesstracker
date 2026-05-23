import { useEffect, useMemo, useState } from "react";

import { buildCoachContext } from "../coachEngine";
import { localDateKey } from "../dailyPlan";
import { LogFoodScreen } from "../LogFoodScreen";
import { buildMacroPaceSnapshot } from "../macroPace";
import { effectiveNutritionTotalsForDateKey } from "../nutritionTotals";
import { MacroBar, MacroRing, ScreenHeader } from "../shared";
import { TodayFoodLogCard, todayFoodLogHandlers } from "../TodayFoodLogCard";
import { WaterTrackerCard } from "../WaterTrackerCard";
import { appendWaterLogEntry, removeWaterLogEntry } from "../waterIntake";
import type { ScreenProps } from "../types";

/**
 * Nutrition tab: hero macro rings, coached pace copy, hydration, today's food log, and Log Food FAB.
 */
export function ScreenNutrition({ state, setState, logFoodOpenRequest, onLogFoodOpenChange }: ScreenProps) {
  const T = state.nutritionTargets;
  const todayKey = localDateKey(new Date());
  const totals = effectiveNutritionTotalsForDateKey(
    state.nutritionManualByDay,
    state.nutritionItemsByDay,
    todayKey,
  );

  const coachCtx = useMemo(() => buildCoachContext(state, todayKey), [state, todayKey]);
  const macroPace = useMemo(() => buildMacroPaceSnapshot(coachCtx), [coachCtx]);
  const kcalLeft = Math.max(0, T.cal - totals.cal);

  const [logFoodOpen, setLogFoodOpen] = useState(false);

  useEffect(() => {
    if (logFoodOpenRequest && logFoodOpenRequest > 0) setLogFoodOpen(true);
  }, [logFoodOpenRequest]);

  useEffect(() => {
    onLogFoodOpenChange?.(logFoodOpen);
  }, [logFoodOpen, onLogFoodOpenChange]);

  const waterEntries = state.waterLogByDay[todayKey] ?? [];
  const todayFoodItems = state.nutritionItemsByDay[todayKey] ?? [];
  const foodHandlers = useMemo(() => todayFoodLogHandlers(setState, todayKey), [setState, todayKey]);
  const showMacroPace = T.p > 0;

  return (
    <div className="screen" style={{ height: "100%", position: "relative" }}>
      <ScreenHeader
        eyebrow={new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(",", "").toUpperCase()}
        title="Nutrition"
      />

      <div className="card" style={{ padding: 18, marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <MacroRing value={totals.cal} target={T.cal} size={132} stroke={6} animate={true} />
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
                Today
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
                {kcalLeft} kcal left
              </div>
            </div>
            <MacroBar label="Protein" value={totals.p} target={T.p} />
            <MacroBar label="Carbs" value={totals.c} target={T.c} />
            <MacroBar label="Fat" value={totals.f} target={T.f} />
          </div>
        </div>
        {showMacroPace ? (
          <p
            style={{
              margin: "14px 0 0",
              paddingTop: 14,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              fontSize: 13,
              lineHeight: 1.5,
              color: macroPace.status === "behind" ? "rgba(255,200,120,0.95)" : "rgba(255,255,255,0.52)",
              fontWeight: 500,
            }}
          >
            {macroPace.hint}
          </p>
        ) : null}
      </div>

      <WaterTrackerCard
        dateKey={todayKey}
        targetOz={state.waterDailyTargetOz}
        entries={waterEntries}
        readOnly={false}
        isToday
        onAddOz={(oz) => setState((s) => appendWaterLogEntry(s, todayKey, oz))}
        onRemoveEntry={(entryId) => setState((s) => removeWaterLogEntry(s, todayKey, entryId))}
      />

      <TodayFoodLogCard
        dateKey={todayKey}
        items={todayFoodItems}
        onRemove={foodHandlers.onRemove}
        onUpdate={foodHandlers.onUpdate}
      />

      <button
        type="button"
        className="tap"
        aria-label="Log food"
        onClick={() => setLogFoodOpen(true)}
        style={{
          position: "fixed",
          right: 22,
          bottom: "calc(88px + env(safe-area-inset-bottom))",
          width: 56,
          height: 56,
          borderRadius: 999,
          border: "none",
          background: "var(--pos, #d4d4d4)",
          color: "#07080c",
          fontSize: 28,
          fontWeight: 600,
          lineHeight: 1,
          display: "grid",
          placeItems: "center",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.45)",
          zIndex: 50,
        }}
      >
        +
      </button>

      <LogFoodScreen
        open={logFoodOpen}
        onClose={() => setLogFoodOpen(false)}
        dateKey={todayKey}
        state={state}
        setState={setState}
      />

      <div style={{ height: 96 }} />
    </div>
  );
}
