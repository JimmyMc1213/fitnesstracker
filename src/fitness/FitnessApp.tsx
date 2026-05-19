import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";

import { buildSundayReviewPreview } from "./weeklyAdjustment";
import { buildAppStateFromPersisted } from "./buildAppState";
import { seedJimmyData } from "./jimmy-seed-data";
import {
  loadTasksForToday,
  localDateKey,
  persistTasksForToday,
} from "./dailyPlan";
import { buildHabitsForDateKey } from "./data";
import { AuthScreen } from "./AuthScreen";
import { FitnessSyncContext, useFitnessSync } from "./FitnessSyncContext";
import { useFitnessCloudSync } from "./fitnessCloudSync";
import {
  FITNESS_LOCAL_STORAGE_KEY,
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
import { dismissWorkoutSummary } from "./finishWorkout";
import { SundayReviewSheet } from "./SundayReviewSheet";
import { WorkoutSummarySheet } from "./WorkoutSummarySheet";
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
  if (typeof localStorage !== "undefined" && !localStorage.getItem(FITNESS_LOCAL_STORAGE_KEY)) {
    seedJimmyData();
  }
  return buildAppStateFromPersisted(loadPersistedSlice());
}

function AuthGate({ children }: { children: ReactNode }) {
  const sync = useFitnessSync();
  if (sync.configured && !sync.sessionEmail) return <AuthScreen />;
  return <>{children}</>;
}

export function FitnessApp() {
  const [tab, setTab] = useState<TabId>("home");
  const [state, setState] = useState<AppState>(buildInitialState);

  const syncSig = JSON.stringify(sliceFromAppState(state));
  const fitnessSync = useFitnessCloudSync(syncSig, state, setState);

  const activeDayKey = useRef(localDateKey(new Date()));

  useEffect(() => {
    persistTasksForToday(
      state.dailyTasks,
      state.nutritionTargets,
      state.planStartIso,
      state.stepsTarget,
      state.workoutTemplates,
    );
  }, [state.dailyTasks, state.nutritionTargets, state.planStartIso, state.stepsTarget, state.workoutTemplates]);

  useEffect(() => {
    savePersistedSlice(sliceFromAppState(state));
  }, [syncSig]);

  useEffect(() => {
    const rolloverIfNeeded = () => {
      const today = localDateKey(new Date());
      if (today === activeDayKey.current) return;
      activeDayKey.current = today;
      setState((s) => {
        const tasks = loadTasksForToday(s.nutritionTargets, s.planStartIso, s.stepsTarget, s.workoutTemplates);
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
  const showWorkoutSummary = state.workoutSummary != null;
  const hideTabBar = tab === "stretch" || showWorkoutSummary;

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
      <AuthGate>
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
          <Current key={tab} state={state} setState={setState} navigate={setTab} />
        </div>

        {!hideTabBar ? (
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
        ) : null}

        {showSundayReview && sundayPreview ? (
          <SundayReviewSheet
            preview={sundayPreview}
            nutritionTargets={state.nutritionTargets}
            setState={setState}
            reviewClock={previewSundayUi ? reviewNow : undefined}
          />
        ) : null}

        {showWorkoutSummary && state.workoutSummary ? (
          <WorkoutSummarySheet
            summary={state.workoutSummary}
            onDone={() => {
              setState((s) => dismissWorkoutSummary(s));
              setTab("home");
            }}
          />
        ) : null}
      </div>
      </AuthGate>
    </FitnessSyncContext.Provider>
  );
}
