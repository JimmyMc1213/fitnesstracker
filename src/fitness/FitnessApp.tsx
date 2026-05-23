import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";

import { buildSundayReviewPreview } from "./weeklyAdjustment";
import { buildAppStateFromPersisted } from "./buildAppState";
import { dismissStreakLossNotice, getPendingStreakLossNotice } from "./dailyStreak";
import { seedDefaultData } from "./defaultSeed";
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
  IconHome,
} from "./icons";
import { ScreenHome } from "./screens/ScreenHome";
import { ScreenNutrition } from "./screens/ScreenNutrition";
import { ScreenProgress } from "./screens/ScreenProgress";
import { ScreenStretch } from "./screens/ScreenStretch";
import { ScreenWorkout } from "./screens/ScreenWorkout";
import { dismissWorkoutSummary } from "./finishWorkout";
import { ScreenTransition } from "./motion";
import { SundayReviewSheet } from "./SundayReviewSheet";
import { OnboardingFlow } from "./OnboardingFlow";
import { shouldSkipOnboarding } from "./onboardingSkip";
import { registerNotificationServiceWorker } from "./registerNotificationServiceWorker";
import { checkAndFireDueNotifications } from "./notificationScheduler";
import { WorkoutSummarySheet } from "./WorkoutSummarySheet";
import { StreakLostSheet } from "./StreakLostSheet";
import type { AppState, NavigateFn, ScreenProps, StreakLossNotice, TabId } from "./types";

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
    seedDefaultData();
  }
  return buildAppStateFromPersisted(loadPersistedSlice());
}

function AuthGate({ children }: { children: ReactNode }) {
  const sync = useFitnessSync();
  if (sync.configured && !sync.sessionEmail) return <AuthScreen />;
  return <>{children}</>;
}

function OnboardingGate({
  state,
  setState,
  children,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  children: ReactNode;
}) {
  const sync = useFitnessSync();
  const forcePreviewParam =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("previewOnboarding") === "1";
  const [previewOnboardingDismissed, setPreviewOnboardingDismissed] = useState(false);
  const forcePreview = forcePreviewParam && !previewOnboardingDismissed;

  function dismissPreviewOnboarding() {
    if (!forcePreviewParam) return;
    setPreviewOnboardingDismissed(true);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("previewOnboarding");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }

  if (state.onboardingComplete && !forcePreview) return <>{children}</>;

  const skip = shouldSkipOnboarding({
    persisted: loadPersistedSlice(),
    sessionEmail: sync.sessionEmail,
    forcePreview,
  });
  if (skip && !forcePreview) return <>{children}</>;

  return <OnboardingFlow setState={setState} onComplete={dismissPreviewOnboarding} />;
}

export function FitnessApp() {
  const [tab, setTab] = useState<TabId>("home");
  const [logFoodOpenRequest, setLogFoodOpenRequest] = useState(0);
  const [logFoodOverlayOpen, setLogFoodOverlayOpen] = useState(false);
  const [state, setState] = useState<AppState>(buildInitialState);
  const [previewStreakLostDismissed, setPreviewStreakLostDismissed] = useState(false);

  useEffect(() => {
    if (tab !== "nutrition") setLogFoodOverlayOpen(false);
  }, [tab]);

  const syncSig = JSON.stringify(sliceFromAppState(state));
  const fitnessSync = useFitnessCloudSync(syncSig, state, setState);

  const activeDayKey = useRef(localDateKey(new Date()));
  const todayKey = localDateKey(new Date());
  const stateRef = useRef(state);
  stateRef.current = state;

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
    void registerNotificationServiceWorker();
  }, []);

  const schedulerRunningRef = useRef(false);

  useEffect(() => {
    if (!state.onboardingComplete) return;

    const runScheduler = async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      if (schedulerRunningRef.current) return;
      schedulerRunningRef.current = true;
      try {
        await checkAndFireDueNotifications(stateRef.current, setState);
      } finally {
        schedulerRunningRef.current = false;
      }
    };

    const initialId = window.setTimeout(() => void runScheduler(), 1500);
    const intervalId = window.setInterval(() => void runScheduler(), 60_000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") void runScheduler();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearTimeout(initialId);
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [state.onboardingComplete]);

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
    { id: "nutrition", label: "Nutrition", Icon: IconFork },
    { id: "workout", label: "Workout", Icon: IconDumbbell },
    { id: "progress", label: "Progress", Icon: IconChart },
  ];

  const screens: Record<TabId, ComponentType<ScreenProps>> = {
    home: ScreenHome,
    nutrition: ScreenNutrition,
    workout: ScreenWorkout,
    progress: ScreenProgress,
    stretch: ScreenStretch,
  };

  const navigate: NavigateFn = (nextTab, options) => {
    setTab(nextTab);
    if (options?.openLogFood) setLogFoodOpenRequest((n) => n + 1);
  };

  const Current = screens[tab];
  const showWorkoutSummary = state.workoutSummary != null;

  const previewSundayUi =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("previewSunday") === "1";
  const previewStreakLostUi =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("previewStreakLost") === "1";
  const pendingStreakLoss = getPendingStreakLossNotice(state, todayKey);
  const previewStreakLossNotice: StreakLossNotice = {
    lostCount: Math.max(state.streakSessionBaseline?.count ?? 3, 1),
    breakDateKey: todayKey,
  };
  const streakLossNotice = previewStreakLostUi ? previewStreakLossNotice : pendingStreakLoss;
  const showStreakLost =
    state.onboardingComplete &&
    streakLossNotice !== null &&
    !showWorkoutSummary &&
    !(previewStreakLostUi && previewStreakLostDismissed);

  const reviewNow = previewSundayUi ? sundayNoonForCurrentWeek(new Date()) : new Date();
  const sundayPreview = buildSundayReviewPreview(state, reviewNow);
  const showSundayReview =
    sundayPreview !== null &&
    (previewSundayUi || sundayPreview.thisSundayKey !== state.sundayReviewCompletedKey);

  const hideTabBar = tab === "stretch" || showWorkoutSummary || showStreakLost || logFoodOverlayOpen;

  return (
    <FitnessSyncContext.Provider value={fitnessSync}>
      <AuthGate>
      <OnboardingGate state={state} setState={setState}>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          maxWidth: "100%",
          background: "transparent",
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
          <ScreenTransition activeKey={tab}>
            <Current
              state={state}
              setState={setState}
              navigate={navigate}
              logFoodOpenRequest={tab === "nutrition" ? logFoodOpenRequest : undefined}
              onLogFoodOpenChange={tab === "nutrition" ? setLogFoodOverlayOpen : undefined}
            />
          </ScreenTransition>
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
                  onClick={() => navigate(t.id)}
                >
                  <t.Icon size={22} stroke={1.6} />
                  <span className="tlabel">{t.label}</span>
                </button>
              );
            })}
          </nav>
        ) : null}

        {streakLossNotice ? (
          <StreakLostSheet
            open={showStreakLost}
            state={state}
            notice={streakLossNotice}
            todayKey={todayKey}
            onContinue={() => {
              if (previewStreakLostUi) {
                setPreviewStreakLostDismissed(true);
                return;
              }
              setState((s) => dismissStreakLossNotice(s, streakLossNotice));
            }}
          />
        ) : null}

        {sundayPreview ? (
          <SundayReviewSheet
            open={showSundayReview}
            preview={sundayPreview}
            nutritionTargets={state.nutritionTargets}
            unitPreferences={state.unitPreferences}
            setState={setState}
            reviewClock={previewSundayUi ? reviewNow : undefined}
          />
        ) : null}

        {state.workoutSummary ? (
          <WorkoutSummarySheet
            open={showWorkoutSummary}
            summary={state.workoutSummary}
            unitPreferences={state.unitPreferences}
            onDone={() => {
              setState((s) => dismissWorkoutSummary(s));
              navigate("home");
            }}
          />
        ) : null}
      </div>
      </OnboardingGate>
      </AuthGate>
    </FitnessSyncContext.Provider>
  );
}
