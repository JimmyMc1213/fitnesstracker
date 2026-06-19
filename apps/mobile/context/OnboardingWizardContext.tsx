import {
  clampOnboardingStepIndex,
  DEFAULT_NOTIFICATION_PREFERENCES,
  mergeFutureYouDraft,
  resolveOnboardingStepOnRestore,
} from "@newyouai/core";
import type {
  AppTheme,
  EquipmentSetup,
  ExperienceLevel,
  FutureYouDraft,
  MacroTotals,
  NotificationPreferences,
  OnboardingDraft,
  OnboardingProfile,
  SessionLength,
  SubscriptionTier,
  UnitPreferences,
  WorkoutRoutineTemplate,
} from "@newyouai/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { NavDirection } from "@/components/motion";

import { EMPTY_WIZARD_UNIT_PREFERENCES, FRESH_ONBOARDING_PROFILE, freshWizardStateAtStep } from "@/lib/onboardingDefaults";
import { ONBOARDING_NOTIFICATION_DEFAULTS } from "@/lib/notificationPreferences";
import {
  buildOnboardingDraft,
  loadRestorableOnboardingDraft,
  persistOnboardingDraft,
  type OnboardingDraftInput,
} from "@/lib/onboardingStorage";
import { readStoredTheme } from "@/lib/themeStorage";
import {
  canNavigateWizardToStep,
  clampWizardStep,
  resolveWizardBackStep,
  resolveWizardNextStep,
} from "@/lib/onboardingWizardNavigation";
import { buildWeeklyRoutineTemplates } from "@/lib/workout/buildWeeklyRoutine";
import { isTrainingScheduleValid } from "@/lib/workout/workoutWeekCalendar";

type OnboardingWizardContextValue = {
  hydrated: boolean;
  stepIndex: number;
  displayName: string;
  profile: OnboardingProfile;
  unitPreferences: Partial<UnitPreferences>;
  experienceLevel?: ExperienceLevel;
  equipmentSetup?: EquipmentSetup;
  sessionLength?: SessionLength;
  draftTemplates?: WorkoutRoutineTemplate[];
  macros?: MacroTotals;
  notificationPrefs: NotificationPreferences;
  subscriptionTier: SubscriptionTier | null;
  draftTheme?: AppTheme;
  futureYou?: FutureYouDraft;
  patchFutureYou: (patch: Partial<FutureYouDraft>) => void;
  navDirection: NavDirection;
  goNext: () => void;
  goBack: () => void;
  goToStep: (next: number, overrides?: Partial<OnboardingDraftInput>) => void;
  setProfile: (updater: OnboardingProfile | ((prev: OnboardingProfile) => OnboardingProfile)) => void;
  setUnitPreferences: (next: Partial<UnitPreferences>) => void;
  setDraftTheme: (theme: AppTheme) => void;
  setExperienceLevel: (level: ExperienceLevel) => void;
  setEquipmentSetup: (setup: EquipmentSetup) => void;
  setSessionLength: (length: SessionLength) => void;
  setDraftTemplates: (templates: WorkoutRoutineTemplate[]) => void;
  setMacros: (macros: MacroTotals) => void;
  setNotificationPrefs: (prefs: NotificationPreferences) => void;
};

const OnboardingWizardContext = createContext<OnboardingWizardContextValue | null>(null);

function stateFromDraft(draft: OnboardingDraft) {
  const profile = { ...draft.profile };
  return {
    stepIndex: resolveOnboardingStepOnRestore(
      clampOnboardingStepIndex(draft.stepIndex),
      profile.goal,
      draft.futureYou,
    ),
    displayName: draft.displayName,
    profile,
    unitPreferences: { ...draft.unitPreferences },
    experienceLevel: draft.experienceLevel,
    equipmentSetup: draft.equipmentSetup,
    sessionLength: draft.sessionLength,
    draftTemplates: draft.draftTemplates?.map((t) => ({ ...t, exercises: [...t.exercises] })),
    macros: draft.macros ? { ...draft.macros } : undefined,
    notificationPrefs: { ...(draft.notificationPrefs ?? ONBOARDING_NOTIFICATION_DEFAULTS) },
    subscriptionTier: draft.subscriptionTier ?? null,
    draftTheme: draft.theme,
    futureYou: draft.futureYou ? { ...draft.futureYou } : undefined,
  };
}

const INITIAL_STATE = {
  stepIndex: 0,
  displayName: "",
  profile: { ...FRESH_ONBOARDING_PROFILE },
  unitPreferences: { ...EMPTY_WIZARD_UNIT_PREFERENCES },
  experienceLevel: undefined as ExperienceLevel | undefined,
  equipmentSetup: undefined as EquipmentSetup | undefined,
  sessionLength: undefined as SessionLength | undefined,
  draftTemplates: undefined as WorkoutRoutineTemplate[] | undefined,
  macros: undefined as MacroTotals | undefined,
  notificationPrefs: { ...ONBOARDING_NOTIFICATION_DEFAULTS },
  subscriptionTier: null as SubscriptionTier | null,
  draftTheme: undefined as AppTheme | undefined,
  futureYou: undefined as FutureYouDraft | undefined,
};

export function OnboardingWizardProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [navDirection, setNavDirection] = useState<NavDirection>("forward");
  const [wizardState, setWizardState] = useState(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [draft, storedTheme] = await Promise.all([
        loadRestorableOnboardingDraft(),
        readStoredTheme(),
      ]);
      if (cancelled) return;
      if (draft) {
        const fromDraft = stateFromDraft(draft);
        setWizardState({
          ...fromDraft,
          draftTheme: fromDraft.draftTheme ?? storedTheme,
        });
      } else {
        setWizardState({ ...INITIAL_STATE, draftTheme: storedTheme });
      }
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const persistDraft = useCallback(
    async (nextState: typeof INITIAL_STATE) => {
      const draft = buildOnboardingDraft({
        stepIndex: nextState.stepIndex,
        displayName: nextState.displayName,
        unitPreferences: nextState.unitPreferences as UnitPreferences,
        experienceLevel: nextState.experienceLevel,
        equipmentSetup: nextState.equipmentSetup,
        profile: nextState.profile,
        sessionLength: nextState.sessionLength,
        draftTemplates: nextState.draftTemplates,
        macros: nextState.macros,
        notificationPrefs: nextState.notificationPrefs,
        subscriptionTier: nextState.subscriptionTier,
        theme: nextState.draftTheme,
        futureYou: nextState.futureYou,
      });
      await persistOnboardingDraft(draft);
    },
    [],
  );

  const applyState = useCallback(
    (updater: (prev: typeof INITIAL_STATE) => typeof INITIAL_STATE) => {
      setWizardState((prev) => {
        const next = updater(prev);
        void persistDraft(next);
        return next;
      });
    },
    [persistDraft],
  );

  const goToStep = useCallback(
    (next: number, overrides?: Partial<OnboardingDraftInput>) => {
      setNavDirection(next > wizardState.stepIndex ? "forward" : "back");
      applyState((prev) => {
        const mergedFutureYou = overrides?.futureYou ?? prev.futureYou;
        const clamped = clampWizardStep(next);
        if (!canNavigateWizardToStep(prev.stepIndex, clamped, mergedFutureYou)) {
          return prev;
        }
        return {
          ...prev,
          stepIndex: clamped,
          displayName: overrides?.displayName ?? prev.displayName,
          unitPreferences: overrides?.unitPreferences ?? prev.unitPreferences,
          experienceLevel: overrides?.experienceLevel ?? prev.experienceLevel,
          equipmentSetup: overrides?.equipmentSetup ?? prev.equipmentSetup,
          profile: overrides?.profile ? { ...overrides.profile } : prev.profile,
          sessionLength: overrides?.sessionLength ?? prev.sessionLength,
          draftTemplates: overrides?.draftTemplates ?? prev.draftTemplates,
          macros: overrides?.macros ?? prev.macros,
          notificationPrefs: overrides?.notificationPrefs ?? prev.notificationPrefs,
          subscriptionTier: overrides?.subscriptionTier ?? prev.subscriptionTier,
          draftTheme: overrides?.theme ?? prev.draftTheme,
          futureYou: mergedFutureYou ? { ...mergedFutureYou } : prev.futureYou,
        };
      });
    },
    [applyState, wizardState.stepIndex],
  );

  const mergeOverrides = useCallback(
    (prev: typeof INITIAL_STATE, overrides?: Partial<OnboardingDraftInput>) => ({
      ...prev,
      displayName: overrides?.displayName ?? prev.displayName,
      unitPreferences: overrides?.unitPreferences ?? prev.unitPreferences,
      experienceLevel: overrides?.experienceLevel ?? prev.experienceLevel,
      equipmentSetup: overrides?.equipmentSetup ?? prev.equipmentSetup,
      profile: overrides?.profile ? { ...overrides.profile } : prev.profile,
      sessionLength: overrides?.sessionLength ?? prev.sessionLength,
      draftTemplates: overrides?.draftTemplates ?? prev.draftTemplates,
      macros: overrides?.macros ?? prev.macros,
      notificationPrefs: overrides?.notificationPrefs ?? prev.notificationPrefs,
      subscriptionTier: overrides?.subscriptionTier ?? prev.subscriptionTier,
      draftTheme: overrides?.theme ?? prev.draftTheme,
      futureYou: overrides?.futureYou ? { ...overrides.futureYou } : prev.futureYou,
    }),
    [],
  );

  const goNext = useCallback(() => {
    setNavDirection("forward");
    applyState((prev) => {
      if (prev.stepIndex === 0) {
        return {
          ...freshWizardStateAtStep(1),
          draftTheme: prev.draftTheme,
        };
      }

      if (prev.stepIndex === 15) {
        if (!prev.experienceLevel || !prev.equipmentSetup || !prev.sessionLength) return prev;
        if (!isTrainingScheduleValid(prev.profile)) return prev;
        const draftTemplates = buildWeeklyRoutineTemplates(
          prev.profile,
          prev.experienceLevel,
          prev.equipmentSetup,
          prev.sessionLength,
        );
        const next = clampWizardStep(16);
        if (!canNavigateWizardToStep(prev.stepIndex, next, prev.futureYou)) return prev;
        return {
          ...mergeOverrides(prev, {
            draftTemplates,
            sessionLength: prev.sessionLength,
          }),
          stepIndex: next,
        };
      }

      const resolved = resolveWizardNextStep(prev.stepIndex, prev.profile, prev.futureYou);
      if (!resolved) return prev;
      const { next, overrides } = resolved;
      const mergedFutureYou = overrides?.futureYou ?? prev.futureYou;
      const clamped = clampWizardStep(next);
      if (!canNavigateWizardToStep(prev.stepIndex, clamped, mergedFutureYou)) {
        return prev;
      }
      return {
        ...mergeOverrides(prev, overrides),
        stepIndex: clamped,
      };
    });
  }, [applyState, mergeOverrides]);

  const goBack = useCallback(() => {
    setNavDirection("back");
    applyState((prev) => {
      const prevStep = resolveWizardBackStep(prev.stepIndex, prev.profile, prev.futureYou);
      if (prevStep == null) return prev;
      const clamped = clampWizardStep(prevStep);
      if (!canNavigateWizardToStep(prev.stepIndex, clamped, prev.futureYou)) {
        return prev;
      }
      return { ...prev, stepIndex: clamped };
    });
  }, [applyState]);

  const setProfile = useCallback(
    (updater: OnboardingProfile | ((prev: OnboardingProfile) => OnboardingProfile)) => {
      applyState((prev) => ({
        ...prev,
        profile: typeof updater === "function" ? updater(prev.profile) : { ...updater },
      }));
    },
    [applyState],
  );

  const setUnitPreferences = useCallback(
    (next: Partial<UnitPreferences>) => {
      applyState((prev) => ({ ...prev, unitPreferences: { ...prev.unitPreferences, ...next } }));
    },
    [applyState],
  );

  const setDraftTheme = useCallback(
    (theme: AppTheme) => {
      applyState((prev) => ({ ...prev, draftTheme: theme }));
    },
    [applyState],
  );

  const setExperienceLevel = useCallback(
    (level: ExperienceLevel) => {
      applyState((prev) => ({ ...prev, experienceLevel: level }));
    },
    [applyState],
  );

  const setEquipmentSetup = useCallback(
    (setup: EquipmentSetup) => {
      applyState((prev) => ({ ...prev, equipmentSetup: setup }));
    },
    [applyState],
  );

  const setSessionLength = useCallback(
    (length: SessionLength) => {
      applyState((prev) => ({ ...prev, sessionLength: length }));
    },
    [applyState],
  );

  const setDraftTemplates = useCallback(
    (templates: WorkoutRoutineTemplate[]) => {
      applyState((prev) => ({
        ...prev,
        draftTemplates: templates.map((t) => ({ ...t, exercises: [...t.exercises] })),
      }));
    },
    [applyState],
  );

  const setMacros = useCallback(
    (macros: MacroTotals) => {
      applyState((prev) => ({ ...prev, macros: { ...macros } }));
    },
    [applyState],
  );

  const patchFutureYou = useCallback(
    (patch: Partial<FutureYouDraft>) => {
      applyState((prev) => ({
        ...prev,
        futureYou: mergeFutureYouDraft(prev.futureYou, patch),
      }));
    },
    [applyState],
  );

  const setNotificationPrefs = useCallback(
    (prefs: NotificationPreferences) => {
      applyState((prev) => ({ ...prev, notificationPrefs: { ...prefs } }));
    },
    [applyState],
  );

  const value = useMemo<OnboardingWizardContextValue>(
    () => ({
      hydrated,
      navDirection,
      ...wizardState,
      goNext,
      goBack,
      goToStep,
      setProfile,
      setUnitPreferences,
      setDraftTheme,
      patchFutureYou,
      setExperienceLevel,
      setEquipmentSetup,
      setSessionLength,
      setDraftTemplates,
      setMacros,
      setNotificationPrefs,
    }),
    [
      hydrated,
      navDirection,
      wizardState,
      goNext,
      goBack,
      goToStep,
      setProfile,
      setUnitPreferences,
      setDraftTheme,
      patchFutureYou,
      setExperienceLevel,
      setEquipmentSetup,
      setSessionLength,
      setDraftTemplates,
      setMacros,
      setNotificationPrefs,
    ],
  );

  return <OnboardingWizardContext.Provider value={value}>{children}</OnboardingWizardContext.Provider>;
}

export function useOnboardingWizardContext(): OnboardingWizardContextValue {
  const ctx = useContext(OnboardingWizardContext);
  if (!ctx) {
    throw new Error("useOnboardingWizardContext must be used within OnboardingWizardProvider");
  }
  return ctx;
}
