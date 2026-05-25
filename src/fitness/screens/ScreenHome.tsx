import { useEffect, useMemo, useRef, useState } from "react";

import { buildCoachContext, getHomeCoachPlan, getWeighInReactionForDisplay } from "../coachEngine";
import { buildHabitsForDateKey, pruneHabitsDoneByDay } from "../data";
import { dailyHabitTemplatesFromState, habitsForDateKey, HomeDailyHabitsCard } from "../HomeDailyHabitsCard";
import { arizonaCalendarDateKey, formatDateKeyEyebrow, isArizonaEightPmOrLater, localDateKey } from "../dailyPlan";
import { isMobilityHabit } from "../mobilityHabit";
import { HomeDashboardCarousel } from "../HomeDashboardCarousel";
import { homeGreetingTitle } from "../homeGreeting";
import { IconCheck, IconChevR, IconSettings } from "../icons";
import { formatNotificationTimeDisplay } from "../notificationPreferences";
import { SettingsSheet } from "../SettingsSheet";
import { effectiveNutritionTotalsForDateKey } from "../nutritionTotals";
import { WeighInCoachReaction } from "../WeighInCoachReaction";
import { WeighInSheet } from "../WeighInSheet";
import { SundayWeeklyCheckInCard } from "../SundayWeeklyCheckInCard";
import {
  buildSundayCheckInData,
  dismissSundayCheckIn,
  shouldShowSundayCheckIn,
  sundayNoonForCurrentWeek,
} from "../sundayCheckIn";
import { ScreenHeader, PrimaryButton } from "../shared";
import type { ScreenProps } from "../types";

export function ScreenHome({
  state,
  setState,
  navigate,
  homeReselectRequest,
  onHomeReselectHandled,
}: ScreenProps) {
  const T = state.nutritionTargets;
  const [clock, setClock] = useState(() => new Date());
  const dateKeyToday = localDateKey(clock);
  const [viewDateKey, setViewDateKey] = useState(dateKeyToday);
  const activeDateKey = viewDateKey;
  const isViewingToday = activeDateKey === dateKeyToday;

  const totals = effectiveNutritionTotalsForDateKey(state.nutritionManualByDay, state.nutritionItemsByDay, activeDateKey);
  const dayEntry = state.weightLog.find((e) => e.dateKey === activeDateKey);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [weighInOpen, setWeighInOpen] = useState(false);

  useEffect(() => {
    if (!homeReselectRequest) return;
    setSettingsOpen(false);
    setWeighInOpen(false);
    onHomeReselectHandled?.();
  }, [homeReselectRequest, onHomeReselectHandled]);

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
    const ctx = buildCoachContext(state, activeDateKey, isViewingToday ? clock : new Date(`${activeDateKey}T12:00:00`));
    return {
      coachPlan: isViewingToday ? getHomeCoachPlan(ctx) : null,
      coachCtx: ctx,
    };
  }, [state, activeDateKey, clock, isViewingToday]);

  const headerEyebrow = formatDateKeyEyebrow(activeDateKey);
  const headerTitle = isViewingToday
    ? homeGreetingTitle(greetingName, todayForGreeting)
    : new Date(activeDateKey.replace(/-/g, "/")).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

  const arizonaTodayKey = arizonaCalendarDateKey(clock);
  const showNightlyStretchWindow = isViewingToday && isArizonaEightPmOrLater(clock);
  const nightlyStretchDone = state.nightlyStretchCompletedArizonaKey === arizonaTodayKey;
  const stretchReminderEnabled = state.notificationPreferences.nightlyStretchReminderEnabled;
  const stretchReminderTimeLabel = formatNotificationTimeDisplay(
    state.notificationPreferences.nightlyStretchReminderTime,
  );
  const nightlyStretchLabel = stretchReminderEnabled
    ? `Nightly stretching · ${stretchReminderTimeLabel}`
    : "Nightly stretching";
  const fuelLabel = isViewingToday ? "Fuel · Today" : "Fuel";

  const showWeighInFullCard = isViewingToday && !dayEntry;

  const activeHabits = habitsForDateKey(state, activeDateKey, dateKeyToday);

  function toggleHabit(id: string) {
    if (isMobilityHabit(id)) return;
    setState((s) => {
      const doneMap = s.habitsDoneByDay[activeDateKey] ?? {};
      const nextDone = !doneMap[id];
      const habitsDoneByDay = {
        ...s.habitsDoneByDay,
        [activeDateKey]: { ...doneMap, [id]: nextDone },
      };
      const weightLogged = s.weightLog.some((e) => e.dateKey === activeDateKey);
      const habits =
        activeDateKey === dateKeyToday
          ? buildHabitsForDateKey(s.habitTemplates, habitsDoneByDay, activeDateKey, { weightLogged })
          : s.habits;
      return {
        ...s,
        habits,
        habitsDoneByDay,
      };
    });
  }

  function saveDailyHabitTemplates(templates: typeof state.habitTemplates) {
    setState((s) => {
      const mobilityTemplates = s.habitTemplates.filter((t) => isMobilityHabit(t.id));
      const nextTemplates = [...templates, ...mobilityTemplates];
      const templateIds = new Set(nextTemplates.map((h) => h.id));
      const habitsDoneByDay = pruneHabitsDoneByDay(s.habitsDoneByDay, templateIds);
      const weightLogged = s.weightLog.some((e) => e.dateKey === dateKeyToday);
      return {
        ...s,
        habitTemplates: nextTemplates,
        habitsDoneByDay,
        habits: buildHabitsForDateKey(nextTemplates, habitsDoneByDay, dateKeyToday, { weightLogged }),
      };
    });
  }

  const weighInReaction = useMemo(() => {
    if (!isViewingToday || !dayEntry || !coachCtx) return null;
    return getWeighInReactionForDisplay(coachCtx, dayEntry);
  }, [isViewingToday, dayEntry, coachCtx]);

  const previewSundayUi =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("previewSunday") === "1";
  const reviewClock = previewSundayUi ? sundayNoonForCurrentWeek(clock) : clock;
  const showSundayCheckIn =
    isViewingToday &&
    state.onboardingComplete &&
    shouldShowSundayCheckIn(state, clock, previewSundayUi);
  const sundayCheckInData = useMemo(() => {
    if (!showSundayCheckIn) return null;
    return buildSundayCheckInData(state, reviewClock);
  }, [state, reviewClock, showSundayCheckIn]);

  function dismissWeeklyCheckIn() {
    setState((s) => dismissSundayCheckIn(s, reviewClock));
  }

  return (
    <div className="screen" style={{ position: "relative" }}>
      <ScreenHeader
        eyebrow={headerEyebrow}
        title={headerTitle}
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
              color: "var(--text-secondary)",
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
            color: "var(--text-secondary)",
            fontSize: 13,
            fontWeight: 600,
            textAlign: "left",
          }}
        >
          Back to today
        </button>
      ) : null}

      {showWeighInFullCard ? (
        <button
          type="button"
          className="tap card"
          onClick={() => setWeighInOpen(true)}
          aria-label="Log morning weigh-in"
          style={{
            padding: 16,
            marginTop: 18,
            borderColor: "var(--border-strong)",
            display: "flex",
            alignItems: "center",
            gap: 14,
            width: "100%",
            textAlign: "left",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: "var(--surface-3)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-secondary)" }}>+</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-primary)" }}>Morning weigh-in</div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, marginTop: 4 }}>
              Log weight and optional progress photo
            </div>
          </div>
          <IconChevR size={14} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
        </button>
      ) : null}

      {weighInReaction ? <WeighInCoachReaction adjustment={weighInReaction} /> : null}

      <HomeDashboardCarousel
        totals={totals}
        targets={T}
        dateKey={activeDateKey}
        isToday={isViewingToday}
        label={fuelLabel}
        coachCtx={coachCtx}
        coachPlan={coachPlan}
        state={state}
        onNavigate={navigate}
      />

      <HomeDailyHabitsCard
        habits={activeHabits}
        dailyHabitTemplates={dailyHabitTemplatesFromState(state.habitTemplates)}
        stepsTarget={state.stepsTarget}
        planStartIso={state.planStartIso}
        dateKey={activeDateKey}
        readOnly={!isViewingToday}
        onToggle={toggleHabit}
        onMobilityPress={() => navigate("stretch", { startStretchSession: true })}
        onOpenWeighIn={() => setWeighInOpen(true)}
        onSaveHabitTemplates={saveDailyHabitTemplates}
      />

      {sundayCheckInData ? (
        <SundayWeeklyCheckInCard
          data={sundayCheckInData}
          unitPreferences={state.unitPreferences}
          onDismiss={dismissWeeklyCheckIn}
        />
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
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-primary)" }}>Nightly stretching</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, marginTop: 4 }}>
                Finished · tap to open your full routine
              </div>
            </div>
            <IconChevR size={18} stroke={2} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
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
              {nightlyStretchLabel}
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)", fontWeight: 400 }}>
              Open your routine for the full checklist, hips, hamstrings, spine, activation. Mark complete when you finish.
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

      <div style={{ height: 8 }} />

      <SettingsSheet
        open={settingsOpen}
        state={state}
        setState={setState}
        onClose={() => setSettingsOpen(false)}
      />

      <WeighInSheet
        open={weighInOpen}
        onClose={() => setWeighInOpen(false)}
        dateKey={dateKeyToday}
        existing={dayEntry}
        unitPreferences={state.unitPreferences}
        setState={setState}
      />
    </div>
  );
}
