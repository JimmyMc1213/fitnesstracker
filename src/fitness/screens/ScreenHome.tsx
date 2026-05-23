import { useEffect, useMemo, useRef, useState } from "react";

import { buildCoachContext, getHomeCoachPlan, getWeighInReactionForDisplay } from "../coachEngine";
import { coachTaskOpensFuelQuickLog, handleCoachTaskAction } from "../coachTaskActions";
import { habitsForDateKey, HomeDailyHabitsCard } from "../HomeDailyHabitsCard";
import { HomeFuelQuickLogSheet } from "../HomeFuelQuickLogSheet";
import { HomeWeighInInline } from "../HomeWeighInInline";
import { arizonaCalendarDateKey, formatDateKeyEyebrow, isArizonaEightPmOrLater, localDateKey } from "../dailyPlan";
import { HomeFuelStrip } from "../HomeFuelStrip";
import { homeGreetingTitle } from "../homeGreeting";
import { IconCheck, IconChevR, IconSettings } from "../icons";
import { SettingsSheet } from "../SettingsSheet";
import { effectiveNutritionTotalsForDateKey } from "../nutritionTotals";
import { StreakWeeklyHeader } from "../StreakWeeklyHeader";
import { TodaysCoachPlanCard } from "../TodaysCoachPlanCard";
import { WeighInCoachReaction } from "../WeighInCoachReaction";
import { WeeklySummaryCard } from "../WeeklySummaryCard";
import { ScreenHeader, PrimaryButton } from "../shared";
import type { ScreenProps } from "../types";

export function ScreenHome({ state, setState, navigate }: ScreenProps) {
  const T = state.nutritionTargets;
  const [clock, setClock] = useState(() => new Date());
  const dateKeyToday = localDateKey(clock);
  const [viewDateKey, setViewDateKey] = useState(dateKeyToday);
  const activeDateKey = viewDateKey;
  const isViewingToday = activeDateKey === dateKeyToday;

  const totals = effectiveNutritionTotalsForDateKey(state.nutritionManualByDay, state.nutritionItemsByDay, activeDateKey);
  const dayEntry = state.weightLog.find((e) => e.dateKey === activeDateKey);

  const wUnit = state.unitPreferences.weightUnit;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fuelQuickLogOpen, setFuelQuickLogOpen] = useState(false);

  const greetingName = state.displayName.trim();
  const todayForGreeting = isViewingToday ? clock : new Date(activeDateKey.replace(/-/g, "/"));

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (viewDateKey > dateKeyToday) setViewDateKey(dateKeyToday);
  }, [dateKeyToday, viewDateKey]);

  const prevTodayKeyRef = useRef(dateKeyToday);
  useEffect(() => {
    const prevToday = prevTodayKeyRef.current;
    if (prevToday !== dateKeyToday) {
      setViewDateKey((vk) => (vk === prevToday ? dateKeyToday : vk));
      prevTodayKeyRef.current = dateKeyToday;
    }
  }, [dateKeyToday]);

  const { coachPlan, coachCtx } = useMemo(() => {
    if (!isViewingToday) return { coachPlan: null, coachCtx: null };
    const ctx = buildCoachContext(state, dateKeyToday, clock);
    return { coachPlan: getHomeCoachPlan(ctx), coachCtx: ctx };
  }, [state, dateKeyToday, clock, isViewingToday]);

  const headerEyebrow = formatDateKeyEyebrow(activeDateKey);
  const headerTitle = isViewingToday
    ? homeGreetingTitle(greetingName, todayForGreeting)
    : new Date(activeDateKey.replace(/-/g, "/")).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
  const headerSubtitle = isViewingToday && coachPlan ? coachPlan.headline : undefined;

  const arizonaTodayKey = arizonaCalendarDateKey(clock);
  const showNightlyStretchWindow = isViewingToday && isArizonaEightPmOrLater(clock);
  const nightlyStretchDone = state.nightlyStretchCompletedArizonaKey === arizonaTodayKey;
  const fuelLabel = isViewingToday ? "Fuel · Today" : "Fuel";

  const showWeighInFullCard = isViewingToday && coachCtx?.scheduledWeighInDay === true && !dayEntry;
  const showWeighInInline = !!dayEntry && !showWeighInFullCard;

  const activeHabits = habitsForDateKey(state, activeDateKey, dateKeyToday);

  function toggleHabit(id: string) {
    setState((s) => {
      const hRow = s.habits.find((h) => h.id === id);
      const nextDone = !hRow?.done;
      const todayMap = { ...(s.habitsDoneByDay[activeDateKey] ?? {}), [id]: nextDone };
      const habits =
        activeDateKey === dateKeyToday
          ? s.habits.map((h) => (h.id === id ? { ...h, done: nextDone } : h))
          : s.habits;
      return {
        ...s,
        habits,
        habitsDoneByDay: { ...s.habitsDoneByDay, [activeDateKey]: todayMap },
      };
    });
  }

  const weighInReaction = useMemo(() => {
    if (!isViewingToday || !dayEntry || !coachCtx) return null;
    return getWeighInReactionForDisplay(coachCtx, dayEntry);
  }, [isViewingToday, dayEntry, coachCtx]);

  return (
    <div className="screen page-transition" style={{ position: "relative" }}>
      <ScreenHeader
        eyebrow={headerEyebrow}
        title={headerTitle}
        subtitle={headerSubtitle}
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

      {!isViewingToday ? (
        <button
          type="button"
          className="tap"
          onClick={() => setViewDateKey(dateKeyToday)}
          style={{
            marginTop: 4,
            padding: 0,
            border: "none",
            background: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: 13,
            fontWeight: 600,
            textAlign: "left",
          }}
        >
          Back to today
        </button>
      ) : null}

      {isViewingToday && coachPlan ? (
        <TodaysCoachPlanCard
          plan={coachPlan}
          onTaskAction={(task) => {
            if (coachTaskOpensFuelQuickLog(task)) {
              setFuelQuickLogOpen(true);
              return;
            }
            handleCoachTaskAction(task, navigate);
          }}
        />
      ) : null}

      <StreakWeeklyHeader
        state={state}
        todayKey={dateKeyToday}
        selectedDateKey={activeDateKey}
        onSelectDateKey={setViewDateKey}
        variant="compact"
        showLegend={isViewingToday}
      />

      <HomeFuelStrip
        totals={totals}
        targets={T}
        label={fuelLabel}
        onLogClick={isViewingToday ? () => setFuelQuickLogOpen(true) : undefined}
      />

      <HomeDailyHabitsCard
        habits={activeHabits}
        stepsTarget={state.stepsTarget}
        planStartIso={state.planStartIso}
        dateKey={activeDateKey}
        readOnly={!isViewingToday}
        onToggle={toggleHabit}
      />

      {showWeighInInline && dayEntry ? (
        <HomeWeighInInline entry={dayEntry} weightUnit={wUnit} onPress={() => navigate("progress")} />
      ) : null}

      {showWeighInFullCard ? (
        <button
          type="button"
          className="tap card"
          onClick={() => navigate("progress")}
          aria-label={dayEntry ? "View or update weigh-in on Progress" : "Log weigh-in on Progress"}
          style={{
            padding: 16,
            marginTop: 18,
            borderColor: "var(--border-strong)",
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
              background: "rgba(255,255,255,0.06)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>+</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", color: "#fff" }}>Morning weigh-in</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 4 }}>
              Log weight and optional photo on the Progress tab
            </div>
          </div>
          <IconChevR size={14} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
        </button>
      ) : null}

      {weighInReaction ? <WeighInCoachReaction adjustment={weighInReaction} /> : null}

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
            <PrimaryButton
              block
              disabled
              aria-hidden
              style={{ marginTop: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              Open full routine
              <IconChevR size={16} stroke={2.5} />
            </PrimaryButton>
          </button>
        )
      ) : null}

      {isViewingToday ? <WeeklySummaryCard state={state} todayKey={dateKeyToday} defaultCollapsed /> : null}

      <div style={{ height: 8 }} />

      {settingsOpen ? <SettingsSheet state={state} setState={setState} onClose={() => setSettingsOpen(false)} /> : null}

      {fuelQuickLogOpen && isViewingToday ? (
        <HomeFuelQuickLogSheet
          open={fuelQuickLogOpen}
          onClose={() => setFuelQuickLogOpen(false)}
          dateKey={dateKeyToday}
          state={state}
          setState={setState}
          onOpenFullLog={() => navigate("nutrition")}
        />
      ) : null}
    </div>
  );
}
