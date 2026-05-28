import { useEffect, useMemo, useRef, useState } from "react";

import { buildCoachContext, getHomeCoachPlan, getWeighInReactionForDisplay } from "../coachEngine";
import { buildHabitsForDateKey, planWeekIndex, pruneHabitsDoneByDay } from "../data";
import { dailyHabitTemplatesFromState, habitsForDateKey, HomeDailyHabitsCard } from "../HomeDailyHabitsCard";
import { activeWeekFocusCommitments, HomeWeekFocusCard } from "../HomeWeekFocusCard";
import { HomeSundayCheckInCard } from "../HomeSundayCheckInCard";
import { formatDateKeyEyebrow, localDateKey } from "../dailyPlan";
import { MobilityRoutineFlow } from "../stretch/MobilityRoutineFlow";
import { isMobilityHabit } from "../mobilityHabit";
import { HomeDashboardCarousel } from "../HomeDashboardCarousel";
import { homeGreetingTitle } from "../homeGreeting";
import { IconChevR, IconSettings } from "../icons";
import { effectiveNutritionTotalsForDateKey } from "../nutritionTotals";
import { WeighInCoachReaction } from "../WeighInCoachReaction";
import { WeighInSheet } from "../WeighInSheet";
import { ScreenHeader } from "../shared";
import type { ScreenProps } from "../types";

export function ScreenHome({
  state,
  setState,
  navigate,
  homeReselectRequest,
  onHomeReselectHandled,
  mobilityPreviewRequest,
  onMobilityPreviewRequestHandled,
  onMobilitySessionOpenChange,
  sundayCheckIn,
}: ScreenProps) {
  const T = state.nutritionTargets;
  const [clock, setClock] = useState(() => new Date());
  const dateKeyToday = localDateKey(clock);
  const [viewDateKey, setViewDateKey] = useState(dateKeyToday);
  const activeDateKey = viewDateKey;
  const isViewingToday = activeDateKey === dateKeyToday;

  const totals = effectiveNutritionTotalsForDateKey(state.nutritionManualByDay, state.nutritionItemsByDay, activeDateKey);
  const dayEntry = state.weightLog.find((e) => e.dateKey === activeDateKey);

  const [weighInOpen, setWeighInOpen] = useState(false);
  const [mobilityPreviewOpen, setMobilityPreviewOpen] = useState(false);
  const handledMobilityPreviewRequestRef = useRef(0);

  useEffect(() => {
    if (!homeReselectRequest) return;
    setWeighInOpen(false);
    setMobilityPreviewOpen(false);
    onHomeReselectHandled?.();
  }, [homeReselectRequest, onHomeReselectHandled]);

  const weekFocus = useMemo(
    () =>
      activeWeekFocusCommitments(
        state.weekFocusCommitments ?? [],
        state.weekFocusWeekStartKey ?? null,
        dateKeyToday,
      ),
    [state.weekFocusCommitments, state.weekFocusWeekStartKey, dateKeyToday],
  );
  const weekFocusNumber = planWeekIndex(new Date(`${dateKeyToday}T12:00:00`), state.planStartIso);

  useEffect(() => {
    if (!mobilityPreviewRequest || mobilityPreviewRequest <= handledMobilityPreviewRequestRef.current) return;
    handledMobilityPreviewRequestRef.current = mobilityPreviewRequest;
    setMobilityPreviewOpen(true);
    onMobilityPreviewRequestHandled?.();
  }, [mobilityPreviewRequest, onMobilityPreviewRequestHandled]);

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

  return (
    <MobilityRoutineFlow
      state={state}
      setState={setState}
      previewOpen={mobilityPreviewOpen}
      onPreviewOpenChange={setMobilityPreviewOpen}
      onSessionOpenChange={onMobilitySessionOpenChange}
      dismissRequest={homeReselectRequest}
    >
    <div className="screen" style={{ position: "relative" }}>
      <ScreenHeader
        eyebrow={headerEyebrow}
        title={headerTitle}
        right={
          <button
            type="button"
            className="tap"
            onClick={() => navigate("settings")}
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

      {isViewingToday && sundayCheckIn?.available && sundayCheckIn.data ? (
        <HomeSundayCheckInCard
          data={sundayCheckIn.data}
          completed={sundayCheckIn.completed}
          unitPreferences={state.unitPreferences}
          onReview={sundayCheckIn.onOpenFlow}
        />
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

      {weighInReaction ? (
        <WeighInCoachReaction adjustment={weighInReaction} displayName={greetingName} />
      ) : null}

      {isViewingToday && weekFocus.length > 0 && state.weekFocusWeekStartKey ? (
        <HomeWeekFocusCard
          commitments={weekFocus}
          weekStartKey={state.weekFocusWeekStartKey}
          dateKey={dateKeyToday}
          weekNumber={weekFocusNumber}
        />
      ) : null}

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
        onOpenMobilityPreview={() => setMobilityPreviewOpen(true)}
      />

      <HomeDailyHabitsCard
        habits={activeHabits}
        dailyHabitTemplates={dailyHabitTemplatesFromState(state.habitTemplates)}
        stepsTarget={state.stepsTarget}
        planStartIso={state.planStartIso}
        dateKey={activeDateKey}
        readOnly={!isViewingToday}
        onToggle={toggleHabit}
        onMobilityPress={() => setMobilityPreviewOpen(true)}
        onOpenWeighIn={() => setWeighInOpen(true)}
        onSaveHabitTemplates={saveDailyHabitTemplates}
      />

      <div style={{ height: 8 }} />

      <WeighInSheet
        open={weighInOpen}
        onClose={() => setWeighInOpen(false)}
        dateKey={dateKeyToday}
        existing={dayEntry}
        unitPreferences={state.unitPreferences}
        setState={setState}
      />
    </div>
    </MobilityRoutineFlow>
  );
}
