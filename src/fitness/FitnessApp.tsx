import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { motion } from "framer-motion";

import { buildAppStateFromPersisted } from "./buildAppState";
import { seedDefaultData } from "./defaultSeed";
import { localDateKey } from "./dailyPlan";
import { buildHabitsForDateKey } from "./data";
import { AuthScreen } from "./AuthScreen";
import { FitnessSyncContext, useFitnessSync } from "./FitnessSyncContext";
import { useFitnessCloudSync } from "./fitnessCloudSync";
import { migratePersistedFitnessSlice } from "./migrateTrainingSchedule";
import { withProgressPicsDefaults } from "./progressPics";
import {
  FITNESS_LOCAL_STORAGE_KEY,
  loadPersistedSlice,
  savePersistedSlice,
  sliceFromAppState,
} from "./persistFitnessSlice";
import { ScreenHome } from "./screens/ScreenHome";
import { ScreenNutrition } from "./screens/ScreenNutrition";
import { ScreenProgress } from "./screens/ScreenProgress";
import { ScreenSettings } from "./screens/ScreenSettings";
import { ScreenWorkout } from "./screens/ScreenWorkout";
import { dismissWorkoutSummary, applyTemplateOrderUpdate, dismissTemplateOrderUpdatePrompt } from "./finishWorkout";
import { MOTION_DURATIONS, ScreenTransition, useLockVisualViewportScroll } from "./motion";
import { DevOnboardingToolbar } from "./DevOnboardingToolbar";
import {
  clearDevPreviewOnboardingUrl,
  isDevPreviewOnboardingEnabled,
  isDevToolbarVisible,
  isOnboardingPreviewToolsActive,
} from "./devPreviewOnboarding";
import { AppSplashScreen } from "./AppSplashScreen";
import { OnboardingFlow } from "./OnboardingFlow";
import { OnboardingWelcomeScreen } from "./OnboardingWelcomeScreen";
import { clearOnboardingDraftStorage, initialOnboardingWizardDraft } from "./onboardingDraft";
import { captureOAuthReturnForSaveProgress } from "./oauthReturnCapture";
import { finalizeSignedInAppAccess, shouldSkipOnboarding } from "./onboardingSkip";
import {
  IconBarbell,
  IconToolsKitchen2,
  IconTrendingUp,
} from "@tabler/icons-react";
import { IconHome } from "./icons";
import { registerNotificationServiceWorker } from "./registerNotificationServiceWorker";
import { checkAndFireDueNotifications } from "./notificationScheduler";
import { SundayWeeklyCheckInFlow } from "./SundayWeeklyCheckInFlow";
import { useSundayWeeklyCheckIn } from "./useSundayWeeklyCheckIn";
import { WorkoutSummarySheet } from "./WorkoutSummarySheet";
import { UpdateTemplateOrderConfirmSheet } from "./workout/UpdateTemplateOrderConfirmSheet";
import { ThemeProvider } from "./ThemeContext";
import type { AppTheme } from "./theme";
import type { AppState, NavigateFn, ScreenProps, TabId } from "./types";

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

function OnboardingGate({
  state,
  setState,
  children,
  onSignIn,
  introWelcomeDone,
  onLeavePreview,
  hideDevToolbar = false,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  children: ReactNode;
  onSignIn?: () => void;
  introWelcomeDone?: boolean;
  onLeavePreview?: () => void;
  hideDevToolbar?: boolean;
}) {
  const sync = useFitnessSync();
  const previewToolsActive = isOnboardingPreviewToolsActive();
  const [previewOnboardingDismissed, setPreviewOnboardingDismissed] = useState(false);
  const [previewOnboardingRequested, setPreviewOnboardingRequested] = useState(false);
  const devPreviewEnabled = previewToolsActive && isDevPreviewOnboardingEnabled();
  const forcePreview =
    previewToolsActive &&
    !previewOnboardingDismissed &&
    (devPreviewEnabled || previewOnboardingRequested);

  function dismissPreviewOnboarding() {
    if (!previewToolsActive) return;
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
          onComplete={previewToolsActive ? dismissPreviewOnboarding : undefined}
          onSignIn={onSignIn}
          introWelcomeDone={introWelcomeDone}
        />
      ) : (
        children
      )}
      {isDevToolbarVisible() && !hideDevToolbar ? (
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
  const [sundayCheckInPresent, setSundayCheckInPresent] = useState(false);
  const sundayWeeklyCheckIn = useSundayWeeklyCheckIn(state, setState);
  const [screenTransitionVariant, setScreenTransitionVariant] = useState<"fade" | "stack">("fade");
  const [tabBarEnterDelayed, setTabBarEnterDelayed] = useState(false);
  const [logFoodOpenRequest, setLogFoodOpenRequest] = useState(0);
  const [mobilityPreviewRequest, setMobilityPreviewRequest] = useState(0);
  const [mobilitySessionOpen, setMobilitySessionOpen] = useState(false);
  const [homeReselectRequest, setHomeReselectRequest] = useState(0);
  const [logFoodOverlayOpen, setLogFoodOverlayOpen] = useState(false);
  const [routineEditorOpen, setRoutineEditorOpen] = useState(false);
  const [progressGalleryOpen, setProgressGalleryOpen] = useState(false);
  const [introWelcomeDone, setIntroWelcomeDone] = useState(false);
  const [bootSplashMounted, setBootSplashMounted] = useState(true);
  const [minHoldElapsed, setMinHoldElapsed] = useState(false);
  const [signInRestorePending, setSignInRestorePending] = useState(false);
  const [welcomeSignInError, setWelcomeSignInError] = useState<string | null>(null);

  useEffect(() => {
    setState((s) => {
      if (Array.isArray(s.progressPics) && s.progressPicsLock !== undefined) return s;
      return withProgressPicsDefaults(s);
    });
  }, [setState]);

  useEffect(() => {
    const id = window.setTimeout(() => setMinHoldElapsed(true), 800);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (tab !== "nutrition") setLogFoodOverlayOpen(false);
  }, [tab]);

  useEffect(() => {
    if (homeReselectRequest > 0) sundayWeeklyCheckIn.closeFlow();
  }, [homeReselectRequest, sundayWeeklyCheckIn.closeFlow]);

  const syncSig = JSON.stringify(sliceFromAppState(state));
  const fitnessSync = useFitnessCloudSync(syncSig, state, setState);

  useEffect(() => {
    if (fitnessSync.welcomeResetNonce === 0) return;
    setIntroWelcomeDone(false);
    setSignInRestorePending(false);
    setWelcomeSignInError(null);
    setTab("home");
  }, [fitnessSync.welcomeResetNonce]);

  const activeDayKey = useRef(localDateKey(new Date()));
  const stateRef = useRef(state);
  stateRef.current = state;

  const completeSignedInSession = () => {
    const persisted = loadPersistedSlice() ?? sliceFromAppState(stateRef.current);
    const nextSlice = shouldSkipOnboarding({
      persisted,
      sessionEmail: fitnessSync.sessionEmail,
      forcePreview: false,
    })
      ? finalizeSignedInAppAccess(persisted)
      : persisted;
    setState(buildAppStateFromPersisted(nextSlice));
    setWelcomeSignInError(null);
    setIntroWelcomeDone(shouldSkipOnboarding({
      persisted: nextSlice,
      sessionEmail: fitnessSync.sessionEmail,
      forcePreview: false,
    }));
    setSignInRestorePending(false);
  };

  const switchAccount = async () => {
    setWelcomeSignInError(null);
    setSignInRestorePending(false);
    setIntroWelcomeDone(false);
    await fitnessSync.signOut();
  };

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
        const weightLogged = s.weightLog.some((e) => e.dateKey === today);
        const habits = buildHabitsForDateKey(s.habitTemplates, s.habitsDoneByDay, today, { weightLogged });
        return { ...s, habits };
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
    { id: "nutrition", label: "Nutrition", Icon: IconToolsKitchen2 as typeof IconHome },
    { id: "workout", label: "Workout", Icon: IconBarbell as typeof IconHome },
    { id: "progress", label: "Progress", Icon: IconTrendingUp as typeof IconHome },
  ];

  const screens: Record<Exclude<TabId, "stretch">, ComponentType<ScreenProps>> = {
    home: ScreenHome,
    nutrition: ScreenNutrition,
    workout: ScreenWorkout,
    progress: ScreenProgress,
    settings: ScreenSettings,
  };

  const navigate: NavigateFn = (nextTab, options) => {
    if (nextTab === "stretch") {
      if (tab !== "home") setTab("home");
      setMobilityPreviewRequest((n) => n + 1);
      return;
    }

    if (nextTab === "home" && tab === "home") {
      setHomeReselectRequest((n) => n + 1);
      return;
    }

    if (tab === "settings" && nextTab === "home") {
      setTabBarEnterDelayed(true);
    }

    setScreenTransitionVariant("fade");
    setTab(nextTab);
    if (options?.openLogFood) setLogFoodOpenRequest((n) => n + 1);
    if (options?.openMobilityPreview) setMobilityPreviewRequest((n) => n + 1);
  };

  useEffect(() => {
    if (!tabBarEnterDelayed) return;
    const id = window.setTimeout(() => setTabBarEnterDelayed(false), MOTION_DURATIONS.tab);
    return () => window.clearTimeout(id);
  }, [tabBarEnterDelayed]);

  useLockVisualViewportScroll();

  const activeTab: Exclude<TabId, "stretch"> = tab === "stretch" ? "home" : tab;
  const Current = screens[activeTab];
  const showWorkoutSummary = state.workoutSummary != null;

  const hideTabBar =
    tab === "settings" ||
    tabBarEnterDelayed ||
    showWorkoutSummary ||
    logFoodOverlayOpen ||
    routineEditorOpen ||
    mobilitySessionOpen ||
    sundayCheckInPresent ||
    progressGalleryOpen;

  const devPreviewOnboarding = isOnboardingPreviewToolsActive() && isDevPreviewOnboardingEnabled();
  const introEligible = !state.onboardingComplete || devPreviewOnboarding;
  const restorableIntroDraft = initialOnboardingWizardDraft(state.onboardingDraft);
  const resumeIntroStep = restorableIntroDraft?.stepIndex ?? 0;

  const awaitingSessionBootstrap = fitnessSync.configured && !fitnessSync.sessionResolved;
  const needsAuth =
    fitnessSync.configured && fitnessSync.sessionResolved && fitnessSync.sessionEmail == null;
  const restoringAfterSignIn =
    signInRestorePending && fitnessSync.sessionEmail != null;
  const awaitingSignedInHydration =
    fitnessSync.configured &&
    fitnessSync.sessionEmail != null &&
    !fitnessSync.fitnessHydrated &&
    !state.onboardingComplete;

  const skipOnboardingForSession = shouldSkipOnboarding({
    persisted: sliceFromAppState(state),
    sessionEmail: fitnessSync.sessionEmail,
    forcePreview: false,
  });

  const showIntroWelcome =
    !needsAuth &&
    !awaitingSessionBootstrap &&
    !awaitingSignedInHydration &&
    !restoringAfterSignIn &&
    introEligible &&
    !introWelcomeDone &&
    !state.onboardingComplete &&
    !skipOnboardingForSession &&
    resumeIntroStep === 0;

  const onboardingInProgress = !state.onboardingComplete;

  const needsBootSplash =
    awaitingSessionBootstrap ||
    awaitingSignedInHydration ||
    restoringAfterSignIn ||
    (fitnessSync.sessionEmail != null && !fitnessSync.fitnessHydrated && !onboardingInProgress);

  const bootSplashOverlay = bootSplashMounted ? (
    <AppSplashScreen dismiss={!needsBootSplash && minHoldElapsed} onExitComplete={() => setBootSplashMounted(false)} />
  ) : null;

  const handleGetStarted = () => {
    setWelcomeSignInError(null);
    setIntroWelcomeDone(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("signIn") !== "1") return;
    if (!fitnessSync.sessionResolved) return;

    const url = new URL(window.location.href);
    url.searchParams.delete("signIn");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);

    if (fitnessSync.sessionEmail) {
      setSignInRestorePending(true);
      return;
    }
  }, [fitnessSync.sessionResolved, fitnessSync.sessionEmail]);

  useEffect(() => {
    if (!signInRestorePending) return;
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
        completeSignedInSession();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    signInRestorePending,
    fitnessSync.sessionEmail,
    fitnessSync.fitnessHydrated,
    fitnessSync.restoreFromCloud,
  ]);

  useEffect(() => {
    if (!signInRestorePending || !fitnessSync.sessionEmail) return;
    const id = window.setTimeout(() => {
      completeSignedInSession();
    }, 10_000);
    return () => window.clearTimeout(id);
  }, [signInRestorePending, fitnessSync.sessionEmail]);

  let mainContent: ReactNode = null;

  if (awaitingSessionBootstrap || awaitingSignedInHydration || restoringAfterSignIn) {
    mainContent = null;
  } else if (needsAuth) {
    mainContent = (
      <AuthScreen
        initialView="landing"
        externalError={welcomeSignInError}
        onSignInSuccess={() => setSignInRestorePending(true)}
      />
    );
  } else if (showIntroWelcome) {
    mainContent = (
      <OnboardingWelcomeScreen onGetStarted={handleGetStarted} onSignIn={() => void switchAccount()} />
    );
  } else {
    mainContent = (
      <>
        <OnboardingGate
          state={state}
          setState={setState}
          onSignIn={() => void switchAccount()}
          introWelcomeDone={introWelcomeDone}
          onLeavePreview={() => setIntroWelcomeDone(true)}
          hideDevToolbar={routineEditorOpen}
        >
          <div
            className={`app-tab-shell${hideTabBar ? " app-tab-shell--no-chrome" : ""}`}
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
              <ScreenTransition activeKey={activeTab} variant={screenTransitionVariant} layerBackground="transparent">
                <Current
                  state={state}
                  setState={setState}
                  navigate={navigate}
                  logFoodOpenRequest={activeTab === "nutrition" ? logFoodOpenRequest : undefined}
                  onLogFoodOpenRequestHandled={
                    activeTab === "nutrition" ? () => setLogFoodOpenRequest(0) : undefined
                  }
                  onLogFoodOpenChange={activeTab === "nutrition" ? setLogFoodOverlayOpen : undefined}
                  onRoutineEditorOpenChange={activeTab === "workout" ? setRoutineEditorOpen : undefined}
                  onProgressGalleryOpenChange={activeTab === "progress" ? setProgressGalleryOpen : undefined}
                  homeReselectRequest={homeReselectRequest}
                  onHomeReselectHandled={() => setHomeReselectRequest(0)}
                  mobilityPreviewRequest={activeTab === "home" ? mobilityPreviewRequest : undefined}
                  onMobilityPreviewRequestHandled={
                    activeTab === "home" ? () => setMobilityPreviewRequest(0) : undefined
                  }
                  onMobilitySessionOpenChange={activeTab === "home" ? setMobilitySessionOpen : undefined}
                  sundayCheckIn={
                    activeTab === "home"
                      ? {
                          available: sundayWeeklyCheckIn.available,
                          completed: sundayWeeklyCheckIn.completed,
                          data: sundayWeeklyCheckIn.data,
                          onOpenFlow: sundayWeeklyCheckIn.openFlow,
                        }
                      : undefined
                  }
                />
              </ScreenTransition>
            </div>

            <nav
              className={`tabbar${hideTabBar ? " tabbar--hidden" : ""}`}
              aria-label="Main"
              aria-hidden={hideTabBar}
            >
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className="tab tap"
                    aria-current={active}
                    tabIndex={hideTabBar ? -1 : undefined}
                    onClick={() => navigate(t.id)}
                  >
                    <motion.div
                      animate={{ scale: active ? 1.15 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    >
                      <t.Icon size={20} stroke={active ? 2.2 : 2} />
                    </motion.div>
                    <motion.span
                      className="tlabel"
                      animate={{ color: active ? "var(--text)" : "var(--tertiary)" }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                      {t.label}
                    </motion.span>
                  </button>
                );
              })}
            </nav>

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

            {state.pendingTemplateOrderUpdatePrompt ? (
              <UpdateTemplateOrderConfirmSheet
                templateName={state.pendingTemplateOrderUpdatePrompt.templateName}
                onUpdate={() => setState((s) => applyTemplateOrderUpdate(s))}
                onDismiss={() => setState((s) => dismissTemplateOrderUpdatePrompt(s))}
              />
            ) : null}
          </div>
        </OnboardingGate>

        <SundayWeeklyCheckInFlow
          open={sundayWeeklyCheckIn.flowOpen}
          data={sundayWeeklyCheckIn.data}
          unitPreferences={state.unitPreferences}
          onClose={sundayWeeklyCheckIn.closeFlow}
          onComplete={sundayWeeklyCheckIn.complete}
          onPresentChange={setSundayCheckInPresent}
        />
      </>
    );
  }

  return (
    <FitnessSyncContext.Provider value={fitnessSync}>
      <div
        className={bootSplashMounted ? "app-shell app-shell--splash-hidden" : "app-shell"}
        aria-hidden={bootSplashMounted}
      >
        {mainContent}
      </div>
      {bootSplashOverlay}
    </FitnessSyncContext.Provider>
  );
}
