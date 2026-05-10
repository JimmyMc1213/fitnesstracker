import { useEffect, useRef, useState, type ComponentType } from "react";

import { buildSundayReviewPreview } from "./weeklyAdjustment";
import {
  loadTasksForToday,
  localDateKey,
  persistTasksForToday,
} from "./dailyPlan";
import { buildHabitsForDateKey } from "./data";
import { buildAppStateFromPersisted } from "./buildAppState";
import { FitnessSyncContext } from "./FitnessSyncContext";
import { useFitnessCloudSync } from "./fitnessCloudSync";
import {
  loadPersistedSlice,
  savePersistedSlice,
  sliceFromAppState,
} from "./persistFitnessSlice";
import {
  IconChart,
  IconDumbbell,
  IconFork,
  IconHabits,
  IconHome,
} from "./icons";
import { ScreenHome } from "./screens/ScreenHome";
import { ScreenNutrition } from "./screens/ScreenNutrition";
import { ScreenProgress } from "./screens/ScreenProgress";
import { ScreenHabits } from "./screens/ScreenHabits";
import { ScreenStretch } from "./screens/ScreenStretch";
import { ScreenWorkout } from "./screens/ScreenWorkout";
import { SundayReviewSheet } from "./SundayReviewSheet";
import type { AppState, ScreenProps, TabId } from "./types";

/** Dev only: `?previewSunday=1` treats "now" as noon on this week's Sunday so the review sheet is visible any day. */
function sundayNoonForCurrentWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  return x;
}

function buildInitialState(): AppState {
  return buildAppStateFromPersisted(loadPersistedSlice());
}

export function FitnessApp() {
  const [tab, setTab] = useState<TabId>("home");
  const [state, setState] = useState<AppState>(buildInitialState);

  const syncSig = JSON.stringify(sliceFromAppState(state));
  const fitnessSync = useFitnessCloudSync(syncSig, state, setState);

  const activeDayKey = useRef(localDateKey(new Date()));

  useEffect(() => {
    persistTasksForToday(state.dailyTasks, state.nutritionTargets, state.planStartIso, state.stepsTarget);
  }, [state.dailyTasks, state.nutritionTargets, state.planStartIso, state.stepsTarget]);

  useEffect(() => {
    savePersistedSlice({
      nutritionLog: state.nutritionLog,
      nutritionManualByDay: state.nutritionManualByDay,
      nutritionItemsByDay: state.nutritionItemsByDay,
      nutritionPresets: state.nutritionPresets,
      workout: state.workout,
      customExercises: state.customExercises,
      workoutTemplates: state.workoutTemplates,
      workoutsCompletedByDay: state.workoutsCompletedByDay,
      nutritionTargets: state.nutritionTargets,
      weightLog: state.weightLog,
      lastAdjustmentSundayKey: state.lastAdjustmentSundayKey,
      sundayReviewCompletedKey: state.sundayReviewCompletedKey,
      adjustmentHistory: state.adjustmentHistory,
      nightlyStretchCompletedArizonaKey: state.nightlyStretchCompletedArizonaKey,
      nightlyStretchBlockIdsByArizonaDay: state.nightlyStretchBlockIdsByArizonaDay,
      displayName: state.displayName,
      habitTemplates: state.habitTemplates,
      habitsDoneByDay: state.habitsDoneByDay,
      planStartIso: state.planStartIso,
      stepsTarget: state.stepsTarget,
    });
  }, [
    state.nutritionLog,
    state.nutritionManualByDay,
    state.nutritionItemsByDay,
    state.nutritionPresets,
    state.workout,
    state.customExercises,
    state.workoutTemplates,
    state.workoutsCompletedByDay,
    state.nutritionTargets,
    state.weightLog,
    state.lastAdjustmentSundayKey,
    state.sundayReviewCompletedKey,
    state.adjustmentHistory,
    state.nightlyStretchCompletedArizonaKey,
    state.nightlyStretchBlockIdsByArizonaDay,
    state.displayName,
    state.habitTemplates,
    state.habitsDoneByDay,
    state.planStartIso,
    state.stepsTarget,
  ]);

  useEffect(() => {
    const rolloverIfNeeded = () => {
      const today = localDateKey(new Date());
      if (today === activeDayKey.current) return;
      activeDayKey.current = today;
      setState((s) => {
        const tasks = loadTasksForToday(s.nutritionTargets, s.planStartIso, s.stepsTarget);
        const habits = buildHabitsForDateKey(s.habitTemplates, s.habitsDoneByDay, today);
        return { ...s, dailyTasks: tasks, habits };
      });
    };

    window.addEventListener("focus", rolloverIfNeeded);
    const id = window.setInterval(rolloverIfNeeded, 60_000);
    return () => {
      window.removeEventListener("focus", rolloverIfNeeded);
      window.clearInterval(id);
    };
  }, []);

  const TABS: { id: TabId; label: string; Icon: typeof IconHome }[] = [
    { id: "home", label: "Home", Icon: IconHome },
    { id: "habits", label: "Habits", Icon: IconHabits },
    { id: "nutrition", label: "Nutrition", Icon: IconFork },
    { id: "workout", label: "Workout", Icon: IconDumbbell },
    { id: "progress", label: "Progress", Icon: IconChart },
  ];

  const screens: Record<TabId, ComponentType<ScreenProps>> = {
    home: ScreenHome,
    habits: ScreenHabits,
    nutrition: ScreenNutrition,
    workout: ScreenWorkout,
    progress: ScreenProgress,
    stretch: ScreenStretch,
  };

  const Current = screens[tab];
  const hideTabBar = tab === "stretch";

  useEffect(() => {
    document.documentElement.classList.toggle("has-main-tabbar", !hideTabBar);
    return () => {
      document.documentElement.classList.remove("has-main-tabbar");
    };
  }, [hideTabBar]);

  const previewSundayUi =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("previewSunday") === "1";
  const reviewNow = previewSundayUi ? sundayNoonForCurrentWeek(new Date()) : new Date();
  const sundayPreview = buildSundayReviewPreview(state, reviewNow);
  const showSundayReview =
    sundayPreview !== null &&
    (previewSundayUi || sundayPreview.thisSundayKey !== state.sundayReviewCompletedKey);

  return (
    <FitnessSyncContext.Provider value={fitnessSync}>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          maxWidth: "100%",
          background: "var(--bg)",
          color: "var(--text)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
        }}
      >
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Current state={state} setState={setState} navigate={setTab} />
        </div>

        {!hideTabBar && (
          <nav className="tabbar" aria-label="Main">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  className="tab tap"
                  aria-current={active}
                  onClick={() => setTab(t.id)}
                >
                  <t.Icon size={22} stroke={1.6} />
                  <span className="tlabel">{t.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {showSundayReview && sundayPreview ? (
          <SundayReviewSheet
            preview={sundayPreview}
            nutritionTargets={state.nutritionTargets}
            setState={setState}
            reviewClock={previewSundayUi ? reviewNow : undefined}
          />
        ) : null}
      </div>
    </FitnessSyncContext.Provider>
  );
}
