import { useEffect, useMemo, useState } from "react";

import { localDateKey } from "../dailyPlan";
import { IconPlus } from "../icons";
import { LogFoodScreen } from "../LogFoodScreen";
import { effectiveNutritionTotalsForDateKey } from "../nutritionTotals";
import { MacroBar, MacroRing, ScreenHeader } from "../shared";
import { TodayFoodLogCard, todayFoodLogHandlers } from "../TodayFoodLogCard";
import { WaterTrackerCard } from "../WaterTrackerCard";
import { appendWaterLogEntry, removeWaterLogEntry } from "../waterIntake";
import type { NutritionLoggedItem, ScreenProps } from "../types";

/**
 * Nutrition tab: macro rings, hydration, today's food log, and Log Food FAB.
 */
export function ScreenNutrition({ state, setState, logFoodOpenRequest, onLogFoodOpenRequestHandled, onLogFoodOpenChange }: ScreenProps) {
  const T = state.nutritionTargets;
  const todayKey = localDateKey(new Date());
  const totals = effectiveNutritionTotalsForDateKey(
    state.nutritionManualByDay,
    state.nutritionItemsByDay,
    todayKey,
  );

  const kcalLeft = Math.max(0, T.cal - totals.cal);
  const proteinLeft = Math.max(0, T.p - totals.p);
  const proteinPriorityAccent = "rgba(255, 200, 120, 0.95)";

  const [logFoodOpen, setLogFoodOpen] = useState(false);
  const [editingFoodItem, setEditingFoodItem] = useState<NutritionLoggedItem | null>(null);

  useEffect(() => {
    if (logFoodOpenRequest && logFoodOpenRequest > 0) {
      setLogFoodOpen(true);
      onLogFoodOpenRequestHandled?.();
    }
  }, [logFoodOpenRequest, onLogFoodOpenRequestHandled]);

  useEffect(() => {
    onLogFoodOpenChange?.(logFoodOpen);
  }, [logFoodOpen, onLogFoodOpenChange]);

  const waterEntries = state.waterLogByDay[todayKey] ?? [];
  const todayFoodItems = state.nutritionItemsByDay[todayKey] ?? [];
  const foodHandlers = useMemo(() => todayFoodLogHandlers(setState, todayKey), [setState, todayKey]);

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
                  color: "var(--text-whisper)",
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
                  color: "var(--text-secondary)",
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
        {T.p > 0 && proteinLeft > 0 ? (
          <p
            style={{
              margin: "14px 0 0",
              paddingTop: 14,
              borderTop: "1px solid var(--divider-subtle)",
              fontSize: 13,
              lineHeight: 1.5,
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            <span style={{ color: proteinPriorityAccent, fontWeight: 600 }}>
              {Math.round(proteinLeft)}g
            </span>{" "}
            of protein to go. This is your{" "}
            <span style={{ color: proteinPriorityAccent, fontWeight: 600 }}>#1</span> priority.
          </p>
        ) : null}
      </div>

      <WaterTrackerCard
        dateKey={todayKey}
        targetOz={state.waterDailyTargetOz}
        entries={waterEntries}
        readOnly={false}
        isToday
        volumeUnit={state.unitPreferences.volumeUnit}
        onAddOz={(oz) => setState((s) => appendWaterLogEntry(s, todayKey, oz))}
        onRemoveEntry={(entryId) => setState((s) => removeWaterLogEntry(s, todayKey, entryId))}
      />

      <TodayFoodLogCard
        dateKey={todayKey}
        items={todayFoodItems}
        onRemove={foodHandlers.onRemove}
        onEdit={(item) => {
          setEditingFoodItem(item);
          setLogFoodOpen(true);
        }}
      />

      <button
        type="button"
        className="tap"
        aria-label="Log food"
        onClick={() => {
          setEditingFoodItem(null);
          setLogFoodOpen(true);
        }}
        style={{
          position: "fixed",
          right: 22,
          bottom: "var(--tabbar-fab-offset)",
          width: 56,
          height: 56,
          borderRadius: 999,
          border: "none",
          background: "var(--pos, #4ade80)",
          color: "#07080c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.45)",
          zIndex: 50,
        }}
      >
        <IconPlus size={28} stroke={2.5} />
      </button>

      <LogFoodScreen
        open={logFoodOpen}
        onClose={() => {
          setLogFoodOpen(false);
          setEditingFoodItem(null);
        }}
        dateKey={todayKey}
        state={state}
        setState={setState}
        editItem={editingFoodItem}
      />

    </div>
  );
}
