import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";

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
import { migratePersistedFitnessSlice } from "./migrateTrainingSchedule";
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
import { DevOnboardingToolbar } from "./DevOnboardingToolbar";
import {
  clearDevPreviewOnboardingUrl,
  isDevPreviewOnboardingEnabled,
} from "./devPreviewOnboarding";
import { OnboardingFlow } from "./OnboardingFlow";
import { OnboardingWelcomeScreen } from "./OnboardingWelcomeScreen";
import { clearOnboardingDraftStorage, initialOnboardingWizardDraft } from "./onboardingDraft";
import { captureOAuthReturnForSaveProgress } from "./oauthReturnCapture";
import { shouldSkipOnboarding } from "./onboardingSkip";
import { saveSyncMeta } from "./syncMeta";
import { registerNotificationServiceWorker } from "./registerNotificationServiceWorker";
import { checkAndFireDueNotifications } from "./notificationScheduler";
import { WorkoutSummarySheet } from "./WorkoutSummarySheet";
import { StreakLostSheet } from "./StreakLostSheet";
import { resolveWorkoutDaysPerWeek } from "./trainingCalendar";
import { ThemeProvider } from "./ThemeContext";
import type { AppTheme } from "./theme";
import type { AppState, NavigateFn, ScreenProps, StreakLossNotice, TabId } from "./types";

captureOAuthReturnForSaveProgress();

function buildInitialState(): AppState {
  if (typeof localStorage !== "undefined" && !localStorage.getItem(FITNESS_LOCAL_STORAGE_KEY)) {
    seedDefaultData();
  }
  const raw = loadPersistedSlice() ?? {};
  const { slice, dirty } = migratePersistedFitnessSlice(raw);
  const merged = { ...raw, ...slice };
  const gymmyDraft = initialOnboardingWizardDraft(null);
  if (gymmyDraft && !merged.onboardingComplete) {
    merged.onboardingDraft = gymmyDraft;
    merged.onboardingComplete = false;
  }
  if (dirty) {
    savePersistedSlice(sliceFromAppState(buildAppStateFromPersisted(merged)));
  }
  return buildAppStateFromPersisted(merged);
}

function HydrationSplash() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        color: "var(--text-secondary)",
        fontSize: 15,
        fontWeight: 500,
      }}
    >
      Loading your plan…
    </div>
  );
}

function workoutDaysPerWeekFromState(s: AppState) {
  return resolveWorkoutDaysPerWeek(s.workoutTemplates, s.onboardingProfile?.workoutDaysPerWeek);
}

function AuthGate({
  children,
  initialAuthView,
}: {
  children: ReactNode;
  initialAuthView: "landing" | "signin" | "signup";
}) {
  const sync = useFitnessSync();
  if (sync.configured && !sync.sessionEmail) {
    return <AuthScreen initialView={initialAuthView} />;
  }
  return <>{children}</>;
}

function OnboardingGate({
  state,
  setState,
  children,
  onSignIn,
  introWelcomeDone,
  onLeavePreview,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  children: ReactNode;
  onSignIn?: () => void;
  introWelcomeDone?: boolean;
  onLeavePreview?: () => void;
}) {
  const sync = useFitnessSync();
  const [previewOnboardingDismissed, setPreviewOnboardingDismissed] = useState(false);
  const [previewOnboardingRequested, setPreviewOnboardingRequested] = useState(false);
  const devPreviewEnabled = import.meta.env.DEV && isDevPreviewOnboardingEnabled();
  const forcePreview =
    import.meta.env.DEV &&
    !previewOnboardingDismissed &&
    (devPreviewEnabled || previewOnboardingRequested);

  function dismissPreviewOnboarding() {
    if (!import.meta.env.DEV) return;
    setPreviewOnboardingDismissed(true);
    setPreviewOnboardingRequested(false);
    clearDevPreviewOnboardingUrl();
    clearOnboardingDraftStorage();
    onLeavePreview?.();
    setState((s) => {
      const next = { ...s, onboardingComplete: true, onboardingDraft: null };
      savePersistedSlice(sliceFromAppState(next));
      return next;
    });
  }

  function openPreviewOnboarding() {
    setPreviewOnboardingDismissed(false);
    setPreviewOnboardingRequested(true);
  }

  const restorableDraft = initialOnboardingWizardDraft(state.onboardingDraft);

  const skipOnboarding = shouldSkipOnboarding({
    persisted: sliceFromAppState(state),
    sessionEmail: sync.sessionEmail,
    forcePreview: false,
  });

  const showOnboarding =
    forcePreview || (!previewOnboardingDismissed && !state.onboardingComplete && !skipOnboarding);

  return (
    <>
      {showOnboarding ? (
        <OnboardingFlow
          setState={setState}
          initialDraft={restorableDraft}
          accountDisplayName={state.displayName}
          previewMode={forcePreview}
          onComplete={import.meta.env.DEV ? dismissPreviewOnboarding : undefined}
          onSignIn={onSignIn}
          introWelcomeDone={introWelcomeDone}
        />
      ) : (
        children
      )}
      {import.meta.env.DEV ? (
        <DevOnboardingToolbar
          onboardingOpen={showOnboarding}
          onOpenOnboarding={openPreviewOnboarding}
          onCloseOnboarding={dismissPreviewOnboarding}
        />
      ) : null}
    </>
  );
}

export function FitnessApp() {
  const [state, setState] = useState<AppState>(buildInitialState);

  const handlePersistTheme = (theme: AppTheme) => {
    setState((s) => {
      if (s.theme === theme) return s;
      const next = { ...s, theme };
      savePersistedSlice(sliceFromAppState(next));
      return next;
    });
  };

  return (
    <ThemeProvider persistedTheme={state.theme} onPersistTheme={handlePersistTheme}>
      <FitnessAppMain state={state} setState={setState} />
    </ThemeProvider>
  );
}

function FitnessAppMain({
  state,
  setState,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
  const [tab, setTab] = useState<TabId>("home");
  const [logFoodOpenRequest, setLogFoodOpenRequest] = useState(0);
  const [homeReselectRequest, setHomeReselectRequest] = useState(0);
  const [logFoodOverlayOpen, setLogFoodOverlayOpen] = useState(false);
  const [previewStreakLostDismissed, setPreviewStreakLostDismissed] = useState(false);
  const [authViewOverride, setAuthViewOverride] = useState<"landing" | "signin" | "signup" | null>(null);
  const [introWelcomeDone, setIntroWelcomeDone] = useState(false);
  const [welcomeSignInFlow, setWelcomeSignInFlow] = useState(false);
  const [welcomeSignInError, setWelcomeSignInError] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== "nutrition") setLogFoodOverlayOpen(false);
  }, [tab]);

  const syncSig = JSON.stringify(sliceFromAppState(state));
  const fitnessSync = useFitnessCloudSync(syncSig, state, setState);
  const daysPerWeek = workoutDaysPerWeekFromState(state);

  const activeDayKey = useRef(localDateKey(new Date()));
  const todayKey = localDateKey(new Date());
  const stateRef = useRef(state);
  stateRef.current = state;

  const completeWelcomeSignIn = () => {
    setState((s) => {
      const nextSlice = {
        ...sliceFromAppState(s),
        onboardingComplete: true,
        onboardingDraft: null,
      };
      savePersistedSlice(nextSlice);
      return buildAppStateFromPersisted(nextSlice);
    });
    setWelcomeSignInError(null);
    setIntroWelcomeDone(true);
    setWelcomeSignInFlow(false);
    setAuthViewOverride(null);
  };

  useEffect(() => {
    persistTasksForToday(
      state.dailyTasks,
      state.nutritionTargets,
      state.planStartIso,
      state.stepsTarget,
      state.workoutTemplates,
      daysPerWeek,
    );
  }, [state.dailyTasks, state.nutritionTargets, state.planStartIso, state.stepsTarget, state.workoutTemplates, daysPerWeek]);

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
        const tasks = loadTasksForToday(
          s.nutritionTargets,
          s.planStartIso,
          s.stepsTarget,
          s.workoutTemplates,
          resolveWorkoutDaysPerWeek(s.workoutTemplates, s.onboardingProfile?.workoutDaysPerWeek),
        );
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
    if (nextTab === "home" && tab === "home") {
      setHomeReselectRequest((n) => n + 1);
      return;
    }
    setTab(nextTab);
    if (options?.openLogFood) setLogFoodOpenRequest((n) => n + 1);
  };

  const Current = screens[tab];
  const showWorkoutSummary = state.workoutSummary != null;

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

  const hideTabBar = tab === "stretch" || showWorkoutSummary || showStreakLost || logFoodOverlayOpen;

  const isNewUser = !state.onboardingComplete;
  const needsAuth = fitnessSync.configured && !fitnessSync.sessionEmail;
  const devPreviewOnboarding = import.meta.env.DEV && isDevPreviewOnboardingEnabled();
  const introEligible = isNewUser || devPreviewOnboarding;
  const restorableIntroDraft = initialOnboardingWizardDraft(state.onboardingDraft);
  const resumeIntroStep = restorableIntroDraft?.stepIndex ?? 0;
  const showIntroWelcome =
    introEligible && !introWelcomeDone && !state.onboardingComplete && resumeIntroStep === 0;

  const handleOnboardingSignIn = () => {
    setWelcomeSignInError(null);
    setWelcomeSignInFlow(true);
    setAuthViewOverride("signin");
    clearOnboardingDraftStorage();
    saveSyncMeta({ lastSeenRemoteUpdatedAtMs: 0 });
    setState((s) => {
      if (!s.onboardingDraft) return s;
      const next = { ...s, onboardingDraft: null };
      savePersistedSlice(sliceFromAppState(next));
      return next;
    });
    void fitnessSync.signOut();
  };

  const handleGetStarted = () => {
    setWelcomeSignInError(null);
    setWelcomeSignInFlow(false);
    setAuthViewOverride(null);
    setIntroWelcomeDone(true);
  };

  useEffect(() => {
    if (!welcomeSignInFlow || authViewOverride !== "signin") return;
    if (!fitnessSync.sessionEmail || !fitnessSync.fitnessHydrated) return;

    let cancelled = false;

    void (async () => {
      try {
        await Promise.race([
          fitnessSync.restoreFromCloud(),
          new Promise<void>((resolve) => window.setTimeout(resolve, 8000)),
        ]);
      } catch {
        /* restoreFromCloud records lastError */
      }
      if (!cancelled) {
        completeWelcomeSignIn();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    welcomeSignInFlow,
    authViewOverride,
    fitnessSync.sessionEmail,
    fitnessSync.fitnessHydrated,
    fitnessSync.restoreFromCloud,
  ]);

  useEffect(() => {
    if (!welcomeSignInFlow || !fitnessSync.sessionEmail) return;
    const id = window.setTimeout(() => {
      completeWelcomeSignIn();
    }, 10_000);
    return () => window.clearTimeout(id);
  }, [welcomeSignInFlow, fitnessSync.sessionEmail]);

  const initialAuthView: "landing" | "signin" | "signup" =
    authViewOverride ??
    (isNewUser && needsAuth ? "signup" : "landing");

  if (authViewOverride === "signin") {
    if (fitnessSync.sessionEmail && welcomeSignInFlow) {
      return (
        <FitnessSyncContext.Provider value={fitnessSync}>
          <HydrationSplash />
        </FitnessSyncContext.Provider>
      );
    }

    return (
      <FitnessSyncContext.Provider value={fitnessSync}>
        <AuthScreen
          initialView="signin"
          fromWelcome
          externalError={welcomeSignInError}
          onGetStarted={handleGetStarted}
        />
      </FitnessSyncContext.Provider>
    );
  }

  if (showIntroWelcome) {
    return (
      <FitnessSyncContext.Provider value={fitnessSync}>
        <OnboardingWelcomeScreen onGetStarted={handleGetStarted} onSignIn={handleOnboardingSignIn} />
      </FitnessSyncContext.Provider>
    );
  }

  const showAuthFromIntro = authViewOverride != null && needsAuth;

  if (showAuthFromIntro) {
    return (
      <FitnessSyncContext.Provider value={fitnessSync}>
        <AuthScreen initialView={authViewOverride} />
      </FitnessSyncContext.Provider>
    );
  }

  const onboardingInProgress = !state.onboardingComplete;

  return (
    <FitnessSyncContext.Provider value={fitnessSync}>
      {!fitnessSync.fitnessHydrated && fitnessSync.sessionEmail && !onboardingInProgress ? (
        <HydrationSplash />
      ) : (
      <>
      <OnboardingGate
        state={state}
        setState={setState}
        onSignIn={handleOnboardingSignIn}
        introWelcomeDone={introWelcomeDone}
        onLeavePreview={() => setIntroWelcomeDone(true)}
      >
      <AuthGate initialAuthView={initialAuthView}>
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
              onLogFoodOpenRequestHandled={
                tab === "nutrition" ? () => setLogFoodOpenRequest(0) : undefined
              }
              onLogFoodOpenChange={tab === "nutrition" ? setLogFoodOverlayOpen : undefined}
              homeReselectRequest={homeReselectRequest}
              onHomeReselectHandled={() => setHomeReselectRequest(0)}
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
      </AuthGate>
      </OnboardingGate>
      </>
      )}
    </FitnessSyncContext.Provider>
  );
}
