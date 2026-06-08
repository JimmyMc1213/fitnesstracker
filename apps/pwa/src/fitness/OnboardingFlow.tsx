import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { localDateKey } from "./dailyPlan";
import {
  buildHabitsForDateKey,
  habitTemplatesFromOnboarding,
  pruneHabitsDoneByDay,
} from "./data";
import { ensureMobilityHabitTemplate } from "./mobilityHabit";
import { ExperienceLevelPicker } from "./ExperienceLevelPicker";
import { EquipmentSetupPicker } from "./EquipmentSetupPicker";
import {
  activityLevelLabel,
  calculateNutritionTargets,
} from "./nutritionCalculator";
import { NotificationPreferencesPicker } from "./NotificationPreferencesPicker";
import { ONBOARDING_NOTIFICATION_DEFAULTS, anyNotificationEnabled } from "./notificationPreferences";
import { requestNotificationPermission } from "./notificationPermission";
import {
  ageFromDateOfBirth,
  completeOnboardingProfile,
  DEFAULT_ONBOARDING_CURRENT_WEIGHT_LBS,
  DEFAULT_ONBOARDING_PROFILE,
  FRESH_ONBOARDING_PROFILE,
  normalizeOnboardingProfile,
  nutritionCalcInputFromOnboardingProfile,
  progressGoalFromOnboarding,
} from "./onboardingProfile";
import {
  buildOnboardingDraft,
  clearOnboardingDraftStorage,
  initialOnboardingWizardDraft,
  saveOnboardingDraftToLocalStorage,
  type OnboardingDraftInput,
} from "./onboardingDraft";
import { OnboardingDailyFuelPlan } from "./OnboardingDailyFuelPlan";
import { OnboardingMacroEditConfirmSheet } from "./OnboardingMacroEditConfirmSheet";
import { shouldConfirmMacroEditOnContinue } from "./onboardingMacroEdit";
import { OnboardingGoalWeightReinforcement } from "./OnboardingGoalWeightReinforcement";
import { OnboardingPlanBuilding } from "./OnboardingPlanBuilding";
import { OnboardingIconOptionPicker } from "./OnboardingIconOptionPicker";
import { OnboardingWelcomeScreen } from "./OnboardingWelcomeScreen";
import { OnboardingThemePicker } from "./OnboardingThemePicker";
import { useTheme } from "./ThemeContext";
import { readStoredTheme, type AppTheme } from "./theme";
import { OnboardingFutureYouMotivation } from "./OnboardingFutureYouMotivation";
import { OnboardingFutureYouPhoto } from "./OnboardingFutureYouPhoto";
import { fireFutureYouSuccessConfetti } from "./confetti";
import { OnboardingPaywall } from "./OnboardingPaywall";
import { onboardingPlanReadyContinueLabel } from "./futureYouPaywallModel";
import { OnboardingFutureYouSuccess } from "./OnboardingFutureYouSuccess";
import { canAccessFutureYouSuccessScreen, isFutureYouSuccessHeroVisible } from "./futureYouSuccessModel";
import { mergeFutureYouDraft, canRevisitFutureYouPhoto } from "./futureYouDraft";
import { isFutureYouPhotoBlocked } from "./futureYouAge";
import {
  buildFutureYouGenerateProfile,
  FutureYouGenerateError,
  startFutureYouGeneration,
} from "./futureYouGenerateService";
import { futureYouTimelineFromProfile } from "./futureYouTimeline";
import { FutureYouUploadError, uploadFutureYouPhoto } from "./futureYouUploadService";
import { FutureYouGenerationPill } from "./FutureYouGenerationPill";
import { FutureYouGenerationPillProvider } from "./FutureYouGenerationPillContext";
import { FutureYouReadyBanner } from "./FutureYouReadyBanner";
import {
  isFutureYouGenerationPillVisible,
  isFutureYouReadyBannerVisible,
} from "./futureYouGenerationPillModel";
import { useFutureYouGenerationPoll } from "./useFutureYouGenerationPoll";
import { compressImageToJpegDataUrl } from "./imageCompress";
import {
  clampOnboardingStepIndex,
  isOnboardingBackIntoGoalLockBlocked,
  isOnboardingBackLocked,
  ONBOARDING_STEP_ACTIVITY,
  ONBOARDING_STEP_FUTURE_YOU_MOTIVATION,
  ONBOARDING_STEP_FUTURE_YOU_PHOTO,
  ONBOARDING_STEP_FUTURE_YOU_SUCCESS,
  ONBOARDING_STEP_PAYWALL,
  ONBOARDING_STEP_PACE,
} from "./onboardingSteps";
import {
  backStepFromFutureYouPhoto,
  isGoalWeightOrPaceStep,
  isMaintainGoal,
  isOnboardingGoalEditNavigationBlocked,
  isOnboardingIntoGoalLockNavigationBlocked,
  nextStepAfterGoal,
  resolveOnboardingStepOnRestore,
} from "./onboardingRouting";
import { buildOnboardingPlanSnapshot } from "./onboardingPlanSnapshot";
import { OnboardingPlanReady } from "./OnboardingPlanReady";
import { OnboardingPillStack, OnboardingSegment } from "./OnboardingSegment";
import { OnboardingShell, ONBOARDING_TOTAL_STEPS } from "./OnboardingShell";
import {
  goalWeightDirectionLabel,
  goalWeightReinforcementParts,
  goalWeightReinforcementSubtext,
  trainingScheduleReinforcementParts,
  trainingScheduleReinforcementSubtext,
} from "./onboardingReinforcementCopy";
import {
  DIETARY_RESTRICTIONS,
  ONBOARDING_BARRIERS,
  TRAINING_STYLES,
  barrierEmoji,
  barrierLabel,
  dietaryRestrictionEmoji,
  dietaryRestrictionLabel,
  toggleDietaryRestriction,
  toggleSurveySelection,
  trainingStyleEmoji,
  trainingStyleLabel,
} from "./onboardingMotivationSurvey";
import { OnboardingNotificationPrompt } from "./OnboardingNotificationPrompt";
import { OnboardingSplitReveal } from "./OnboardingSplitReveal";
import { isTrainingScheduleValid, WorkoutWeekCalendarPicker } from "./WorkoutWeekCalendarPicker";
import { UnitPreferencePicker } from "./UnitPreferencePicker";
import { defaultTrainingWeekdaysForProfile } from "./workoutWeekCalendar";
import {
  DEFAULT_UNIT_PREFERENCES,
  isValidWeighInLbs,
} from "./unitPreferences";
import { DateOfBirthWheelPicker } from "./DateOfBirthWheelPicker";
import { defaultGoalWeightLbs, goalWeightRangeLbs, WeightRulerPicker } from "./WeightRulerPicker";
import { clampGoalWeightLbs, isGoalWeightValid } from "./goalSettings";
import { ReferralSourcePicker } from "./ReferralSourcePicker";
import { OnboardingHeightInput } from "./OnboardingHeightInput";
import { sessionDurationFromSessionLength, sessionLengthFromDuration } from "./workoutSplitByDays";
import { restSecondsForSessionLength } from "./sessionLengthConfig";
import { buildWeeklyRoutineTemplates } from "./buildWeeklyRoutine";
import { ScreenTransition, type NavDirection } from "./motion";
import type {
  ActivityLevel,
  AppState,
  ExperienceLevel,
  EquipmentSetup,
  GoalPace,
  MacroTotals,
  NotificationPreferences,
  NutritionGoal,
  OnboardingDraft,
  OnboardingProfile,
  SessionLength,
  SubscriptionTier,
  UnitPreferences,
  UserGender,
  WorkoutRoutineTemplate,
  FutureYouDraft,
} from "./types";

const TOTAL_STEPS = ONBOARDING_TOTAL_STEPS;
const GOALS: NutritionGoal[] = ["cut", "bulk", "maintain"];
const ACTIVITY_LEVELS: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "very_active"];
const GENDERS: UserGender[] = ["male", "female", "other"];
const PACES: { value: GoalPace; label: string; hint?: string }[] = [
  { value: "slow", label: "Slow and steady (~0.5 lb/wk)" },
  { value: "balanced", label: "Balanced (~1 lb/wk)" },
  { value: "aggressive", label: "Aggressive (~1.5 lb/wk)", hint: "Faster results, but harder to keep muscle if nutrition slips." },
];
const SESSION_LENGTH_OPTIONS: { value: SessionLength; label: string }[] = [
  { value: "under_30", label: "Less than 30 min" },
  { value: "30_45", label: "30–45 min" },
  { value: "45_60", label: "45 min – 1 hour" },
  { value: "60_90", label: "1 hour – 1.5 hours" },
  { value: "90_plus", label: "1.5 hours+" },
];

function defaultDateOfBirthFromAge(age: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  d.setMonth(5);
  d.setDate(15);
  return localDateKey(d);
}

function isMacrosValid(macros: MacroTotals): boolean {
  return (
    macros.cal >= 1200 &&
    macros.cal <= 6000 &&
    macros.p >= 50 &&
    macros.p <= 400 &&
    macros.c >= 0 &&
    macros.c <= 800 &&
    macros.f >= 20 &&
    macros.f <= 300
  );
}

/** Clamp saved step indices from older onboarding flows. */
function migrateOnboardingStepIndex(stepIndex: number): number {
  return clampOnboardingStepIndex(stepIndex);
}

function onboardingScreenKey(step: number, goalWeightReinforcement: boolean): string {
  if (step === 9 && goalWeightReinforcement) return "9-reinforcement";
  if (step === ONBOARDING_STEP_FUTURE_YOU_PHOTO) return "10b-photo";
  if (step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION) return "10c-motivation";
  return String(step);
}

function buildDraftTemplatesFromSelections(
  profile: OnboardingProfile,
  experienceLevel: ExperienceLevel,
  equipmentSetup: EquipmentSetup,
  sessionLength: SessionLength,
): WorkoutRoutineTemplate[] {
  return buildWeeklyRoutineTemplates(profile, experienceLevel, equipmentSetup, sessionLength);
}

function onboardingStateFromDraft(draft: OnboardingDraft) {
  const weekdays =
    draft.profile.trainingWeekdays?.length ?
      draft.profile.trainingWeekdays
    : draft.stepIndex > 15 && draft.profile.workoutDaysPerWeek ?
      defaultTrainingWeekdaysForProfile(draft.profile.workoutDaysPerWeek)
    : draft.profile.trainingWeekdays;
  const profile = {
    ...draft.profile,
    trainingWeekdays: weekdays,
    dateOfBirth: draft.profile.dateOfBirth ?? (draft.profile.age ? defaultDateOfBirthFromAge(draft.profile.age) : undefined),
  };
  const sessionLength =
    draft.sessionLength ?? sessionLengthFromDuration(draft.profile.sessionDuration);
  const templatesFromDraft =
    draft.draftTemplates?.length ?
      draft.draftTemplates.map((t) => ({ ...t, exercises: [...t.exercises] }))
    : draft.experienceLevel && draft.equipmentSetup && sessionLength ?
      buildDraftTemplatesFromSelections(profile, draft.experienceLevel, draft.equipmentSetup, sessionLength)
    : [];
  return {
    step: resolveOnboardingStepOnRestore(migrateOnboardingStepIndex(draft.stepIndex), profile.goal, draft.futureYou),
    displayName: draft.displayName,
    unitPreferences: { ...draft.unitPreferences },
    experienceLevel: draft.experienceLevel,
    equipmentSetup: draft.equipmentSetup,
    sessionLength,
    profile,
    draftTemplates: templatesFromDraft,
    macros:
      draft.macros ?
        { ...draft.macros }
      : profile.gender && profile.goal && profile.activityLevel ?
        calculateNutritionTargets(nutritionCalcInputFromOnboardingProfile(profile))
      : { cal: 0, p: 0, c: 0, f: 0 },
    notificationPrefs: { ...(draft.notificationPrefs ?? ONBOARDING_NOTIFICATION_DEFAULTS) },
    theme: draft.theme ?? readStoredTheme(),
    futureYou: draft.futureYou ? { ...draft.futureYou } : undefined,
  };
}

export function OnboardingFlow({
  setState,
  onComplete,
  onSignIn,
  accountDisplayName = "",
  initialDraft,
  previewMode = false,
  skipWelcomeStep = false,
}: {
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onComplete?: () => void;
  onSignIn?: () => void;
  accountDisplayName?: string;
  initialDraft?: OnboardingDraft | null;
  previewMode?: boolean;
  /** Supabase auth entry already showed marketing welcome — start at theme picker. */
  skipWelcomeStep?: boolean;
}) {
  const { theme: activeTheme, setTheme } = useTheme();
  const restored = initialOnboardingWizardDraft(initialDraft);
  const initial = restored ? onboardingStateFromDraft(restored) : null;
  const [step, setStep] = useState(() => {
    const restoredStep = initial?.step ?? 0;
    if (skipWelcomeStep && restoredStep === 0) return 1;
    return restoredStep;
  });
  const displayName = accountDisplayName.trim() || (initial?.displayName ?? "").trim();
  const [unitPreferences, setUnitPreferences] = useState<UnitPreferences>(() => initial?.unitPreferences ?? { ...DEFAULT_UNIT_PREFERENCES });
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | undefined>(() => initial?.experienceLevel);
  const [equipmentSetup, setEquipmentSetup] = useState<EquipmentSetup | undefined>(() => initial?.equipmentSetup);
  const [sessionLength, setSessionLength] = useState<SessionLength | undefined>(() => initial?.sessionLength);
  const [profile, setProfile] = useState<OnboardingProfile>(() => {
    if (initial?.profile) {
      const base = normalizeOnboardingProfile(initial.profile) ?? { ...DEFAULT_ONBOARDING_PROFILE };
      return {
        ...base,
        dateOfBirth: base.dateOfBirth ?? (base.age ? defaultDateOfBirthFromAge(base.age) : undefined),
      };
    }
    return { ...FRESH_ONBOARDING_PROFILE };
  });
  const [draftTemplates, setDraftTemplates] = useState<WorkoutRoutineTemplate[]>(() => initial?.draftTemplates ?? []);
  const [macros, setMacros] = useState<MacroTotals>(
    () => initial?.macros ?? { cal: 0, p: 0, c: 0, f: 0 },
  );
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(
    () => initial?.notificationPrefs ?? { ...ONBOARDING_NOTIFICATION_DEFAULTS },
  );
  const [goalWeightReinforcement, setGoalWeightReinforcement] = useState(false);
  const [navDirection, setNavDirection] = useState<NavDirection>("forward");
  const [draftTheme, setDraftTheme] = useState<AppTheme>(
    () => initial?.theme ?? restored?.theme ?? readStoredTheme(),
  );
  const [futureYou, setFutureYou] = useState<FutureYouDraft>(() =>
    initial?.futureYou ? { ...initial.futureYou } : {},
  );
  const [pendingSubscriptionTier, setPendingSubscriptionTier] = useState<SubscriptionTier | null>(() =>
    restored?.subscriptionTier === "pro" ? "pro" : null,
  );
  const [futureYouPhotoPreview, setFutureYouPhotoPreview] = useState<string | null>(null);
  const [futureYouUploading, setFutureYouUploading] = useState(false);
  const [futureYouUploadError, setFutureYouUploadError] = useState<string | null>(null);
  const [futureYouGenerating, setFutureYouGenerating] = useState(false);
  const [futureYouGenerateError, setFutureYouGenerateError] = useState<string | null>(null);
  const [macroContinueConfirmOpen, setMacroContinueConfirmOpen] = useState(false);

  const dobAge = useMemo(
    () => (profile.dateOfBirth ? ageFromDateOfBirth(profile.dateOfBirth) : null),
    [profile.dateOfBirth],
  );

  const profileForCalc = useMemo(
    () => ({
      ...profile,
      age: dobAge ?? profile.age,
    }),
    [profile, dobAge],
  );

  const computedMacros = useMemo(
    () => calculateNutritionTargets(nutritionCalcInputFromOnboardingProfile(profileForCalc, dobAge ?? undefined)),
    [profileForCalc, dobAge],
  );

  const planSnapshot = useMemo(
    () =>
      buildOnboardingPlanSnapshot({
        displayName: displayName.trim() || "Friend",
        macros,
        profile: profileForCalc,
        templates: draftTemplates,
        volumeUnit: unitPreferences.volumeUnit,
      }),
    [displayName, macros, profileForCalc, draftTemplates, unitPreferences.volumeUnit],
  );

  const heightValid = profile.heightIn >= 48 && profile.heightIn <= 96;
  const heightStepValid = heightValid;
  const weightStepValid = isValidWeighInLbs(profile.weightLbs);
  const dobValid = dobAge != null && dobAge >= 13 && dobAge <= 100;
  const paceValid = profile.goal === "maintain" || profile.pace != null;
  const futureYouBlocked = isFutureYouPhotoBlocked(dobAge);

  const formRef = useRef({
    step,
    displayName,
    unitPreferences,
    experienceLevel,
    equipmentSetup,
    sessionLength,
    profile,
    draftTemplates,
    macros,
    notificationPrefs,
    draftTheme,
    futureYou,
  });
  formRef.current = {
    step,
    displayName,
    unitPreferences,
    experienceLevel,
    equipmentSetup,
    sessionLength,
    profile,
    draftTemplates,
    macros,
    notificationPrefs,
    draftTheme,
    futureYou,
  };

  useEffect(() => {
    const fromDraft = initial?.theme ?? restored?.theme;
    if (fromDraft === "dark" || fromDraft === "light") {
      setTheme(fromDraft);
    }
  }, [initial?.theme, restored?.theme, setTheme]);

  useEffect(() => {
    const onLeave = () => {
      const f = formRef.current;
      saveOnboardingDraftToLocalStorage(
        buildOnboardingDraft({
          stepIndex: f.step,
          displayName: f.displayName,
          unitPreferences: f.unitPreferences,
          experienceLevel: f.experienceLevel,
          equipmentSetup: f.equipmentSetup,
          sessionLength: f.sessionLength,
          profile: f.profile,
          draftTemplates: f.draftTemplates,
          macros: f.macros,
          notificationPrefs: f.notificationPrefs,
          theme: f.draftTheme,
          futureYou: f.futureYou,
        }),
      );
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, []);

  useEffect(() => {
    if (step !== 21) setMacroContinueConfirmOpen(false);
  }, [step]);

  useEffect(() => {
    if (step !== 7) return;
    setProfile((p) => {
      if (isValidWeighInLbs(p.weightLbs)) return p;
      return { ...p, weightLbs: DEFAULT_ONBOARDING_CURRENT_WEIGHT_LBS };
    });
  }, [step]);

  useEffect(() => {
    if (step !== 9) {
      setGoalWeightReinforcement(false);
      return;
    }
    if (isMaintainGoal(profile.goal)) return;
    if (profile.goalWeightLbs != null) return;
    setProfile((p) => ({
      ...p,
      goalWeightLbs: defaultGoalWeightLbs(p.goal as "cut" | "bulk", p.weightLbs),
    }));
  }, [step, profile.goal, profile.goalWeightLbs, profile.weightLbs]);

  const pollFutureYouEnabled =
    step >= ONBOARDING_STEP_ACTIVITY &&
    step <= ONBOARDING_STEP_FUTURE_YOU_SUCCESS &&
    isFutureYouGenerationPillVisible(futureYou);

  const generationPollStatus = useFutureYouGenerationPoll({
    futureYou,
    pollEnabled: pollFutureYouEnabled,
    previewMode,
    onFutureYouPatch: (patch) => {
      setFutureYou((current) => {
        const next = mergeFutureYouDraft(current, patch);
        const f = formRef.current;
        saveOnboardingDraftToLocalStorage(
          buildOnboardingDraft({
            stepIndex: f.step,
            displayName: f.displayName,
            unitPreferences: f.unitPreferences,
            experienceLevel: f.experienceLevel,
            equipmentSetup: f.equipmentSetup,
            sessionLength: f.sessionLength,
            profile: f.profile,
            draftTemplates: f.draftTemplates,
            macros: f.macros,
            notificationPrefs: f.notificationPrefs,
            theme: f.draftTheme,
            futureYou: next,
          }),
        );
        return next;
      });
    },
  });

  const generationPill =
    pollFutureYouEnabled ?
      <FutureYouGenerationPill
        status={generationPollStatus}
        motivationId={futureYou.motivationId}
        goal={profile.goal ?? "cut"}
        gender={profile.gender ?? "other"}
      />
    : null;

  function persistDraftSync(nextStepIndex: number, overrides?: Partial<OnboardingDraftInput>) {
    const subscriptionTierForDraft =
      overrides && Object.prototype.hasOwnProperty.call(overrides, "subscriptionTier") ?
        (overrides.subscriptionTier ?? undefined)
      : (pendingSubscriptionTier ?? undefined);
    const draft = buildOnboardingDraft({
      stepIndex: nextStepIndex,
      displayName,
      unitPreferences,
      experienceLevel,
      equipmentSetup,
      sessionLength,
      profile,
      draftTemplates,
      macros,
      notificationPrefs,
      theme: draftTheme,
      futureYou,
      subscriptionTier: subscriptionTierForDraft,
      ...overrides,
    });
    saveOnboardingDraftToLocalStorage(draft);
    setState((s) => ({ ...s, onboardingComplete: false, onboardingDraft: draft }));
  }

  function patchFutureYou(patch: Partial<FutureYouDraft>) {
    setFutureYou((current) => mergeFutureYouDraft(current, patch));
  }

  function futureYouSkippedDraft() {
    return mergeFutureYouDraft(futureYou, {
      photoSkipped: true,
      photoUploaded: false,
      photoStoragePath: undefined,
      motivationId: undefined,
      motivationIsGeneric: undefined,
      generationStatus: "idle",
      generationJobId: undefined,
      onboardingGoalLocked: true,
    });
  }

  async function onPickFutureYouPhoto(file: File) {
    setFutureYouUploadError(null);
    try {
      const preview = await compressImageToJpegDataUrl(file);
      setFutureYouPhotoPreview(preview);
      const consentAt = futureYou.photoAiConsentAt ?? new Date().toISOString();
      patchFutureYou({
        photoSkipped: false,
        photoUploaded: false,
        photoStoragePath: undefined,
        photoAiConsentAt: consentAt,
      });
    } catch (error) {
      if (error instanceof FutureYouUploadError) {
        setFutureYouUploadError(error.message);
        return;
      }
      setFutureYouUploadError("Could not read that photo. Try another image.");
    }
  }

  function skipFutureYouPhoto() {
    setFutureYouPhotoPreview(null);
    setFutureYouUploadError(null);
    const nextFutureYou = futureYouSkippedDraft();
    setFutureYou(nextFutureYou);
    goToStep(ONBOARDING_STEP_ACTIVITY, { futureYou: nextFutureYou });
  }

  async function continueFutureYouMotivation() {
    const motivationId = futureYou.motivationId?.trim();
    if (!motivationId || !futureYou.photoStoragePath || futureYouGenerating) return;

    if (
      futureYou.generationJobId &&
      futureYou.generationStatus &&
      futureYou.generationStatus !== "idle" &&
      futureYou.generationStatus !== "failed"
    ) {
      goToStep(ONBOARDING_STEP_ACTIVITY);
      return;
    }

    setFutureYouGenerateError(null);
    setFutureYouGenerating(true);
    try {
      const gender = profile.gender ?? "other";
      const generateProfile = buildFutureYouGenerateProfile({
        goal: profile.goal ?? "maintain",
        gender,
        weightLbs: profile.weightLbs,
        goalWeightLbs: profile.goalWeightLbs,
      });
      const timeline = futureYouTimelineFromProfile(profileForCalc);
      const result =
        previewMode ?
          { jobId: crypto.randomUUID(), status: "generating" as const }
        : await startFutureYouGeneration({
            sourcePath: futureYou.photoStoragePath,
            motivationId,
            profile: generateProfile,
            timeline,
          });
      const nextFutureYou = mergeFutureYouDraft(futureYou, {
        motivationId,
        motivationIsGeneric: futureYou.motivationIsGeneric,
        generationJobId: result.jobId,
        generationStatus: result.status,
      });
      setFutureYou(nextFutureYou);
      goToStep(ONBOARDING_STEP_ACTIVITY, { futureYou: nextFutureYou });
    } catch (error) {
      const message =
        error instanceof FutureYouGenerateError ?
          error.message
        : "Could not start generation. Try again.";
      setFutureYouGenerateError(message);
    } finally {
      setFutureYouGenerating(false);
    }
  }

  async function continueFutureYouPhoto(previewOverride?: string, consentAtOverride?: string) {
    const preview = previewOverride ?? futureYouPhotoPreview;
    const consentAt = consentAtOverride ?? futureYou.photoAiConsentAt;
    if (futureYouBlocked || !preview || !consentAt) return;
    setFutureYouUploadError(null);
    setFutureYouUploading(true);
    try {
      const uploaded =
        previewMode ?
          { path: `users/preview/source/${crypto.randomUUID()}.jpg`, uploadId: "preview", bucket: "future-you" }
        : await uploadFutureYouPhoto(preview);
      const nextFutureYou = mergeFutureYouDraft(futureYou, {
        photoSkipped: false,
        photoUploaded: true,
        photoAiConsentAt: consentAt,
        photoStoragePath: uploaded.path,
        onboardingGoalLocked: true,
      });
      setFutureYou(nextFutureYou);
      goToStep(ONBOARDING_STEP_FUTURE_YOU_MOTIVATION, { futureYou: nextFutureYou });
    } catch (error) {
      const message =
        error instanceof FutureYouUploadError ?
          error.message
        : "Photo upload failed. Try again.";
      setFutureYouUploadError(message);
    } finally {
      setFutureYouUploading(false);
    }
  }

  function goToStep(next: number, overrides?: Partial<OnboardingDraftInput>, direction?: NavDirection) {
    const mergedFutureYou = { ...futureYou, ...overrides?.futureYou };
    if (isOnboardingGoalEditNavigationBlocked(step, next)) return;
    if (isOnboardingIntoGoalLockNavigationBlocked(step, next, mergedFutureYou)) return;
    setNavDirection(direction ?? (next >= step ? "forward" : "back"));
    persistDraftSync(next, overrides);
    setStep(next);
  }

  function goNext() {
    const overrides: Partial<OnboardingDraftInput> = {};

    if (isGoalWeightOrPaceStep(step) && isMaintainGoal(profile.goal)) {
      const goalLocked = mergeFutureYouDraft(futureYou, { onboardingGoalLocked: true });
      patchFutureYou({ onboardingGoalLocked: true });
      overrides.futureYou = goalLocked;
      goToStep(ONBOARDING_STEP_FUTURE_YOU_PHOTO, overrides);
      return;
    }

    if (step === 8) {
      if (isMaintainGoal(profile.goal)) {
        const goalLocked = mergeFutureYouDraft(futureYou, { onboardingGoalLocked: true });
        patchFutureYou({ onboardingGoalLocked: true });
        overrides.futureYou = goalLocked;
      }
      goToStep(nextStepAfterGoal(profile.goal), overrides);
      return;
    }

    if (step === ONBOARDING_STEP_PACE) {
      if (!paceValid) return;
      const goalLocked = mergeFutureYouDraft(futureYou, { onboardingGoalLocked: true });
      patchFutureYou({ onboardingGoalLocked: true });
      overrides.futureYou = goalLocked;
      goToStep(ONBOARDING_STEP_FUTURE_YOU_PHOTO, overrides);
      return;
    }

    if (step === ONBOARDING_STEP_FUTURE_YOU_PHOTO) {
      return;
    }

    if (step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION) {
      void continueFutureYouMotivation();
      return;
    }

    if (step === 9 && profile.goal !== "maintain" && !goalWeightReinforcement) {
      setNavDirection("forward");
      setGoalWeightReinforcement(true);
      return;
    }

    if (step === 15) {
      if (!experienceLevel || !equipmentSetup || !sessionLength) return;
      const templates = buildDraftTemplatesFromSelections(profile, experienceLevel, equipmentSetup, sessionLength);
      overrides.draftTemplates = templates;
      overrides.sessionLength = sessionLength;
      setDraftTemplates(templates);
    }

    if (step === 21) {
      if (
        shouldConfirmMacroEditOnContinue(
          macros,
          computedMacros,
          futureYou,
          generationPollStatus,
        )
      ) {
        setMacroContinueConfirmOpen(true);
        return;
      }
      overrides.macros = macros;
      goToStep(22, overrides);
      return;
    }

    if (step === 22) {
      overrides.macros = macros;
      goToStep(23, overrides);
      return;
    }

    if (step === 23) {
      goToStep(24, overrides);
      return;
    }

    if (step === 24) {
      goToStep(25, overrides);
      return;
    }

    if (step === 25) {
      goToStep(26, overrides);
      return;
    }

    if (step === 26) {
      goToStep(27, overrides);
      return;
    }

    const next = Math.min(step + 1, TOTAL_STEPS - 1);
    if (step === ONBOARDING_STEP_PACE && profile.goal !== "maintain" && !profile.pace) {
      return;
    }
    goToStep(next, overrides);
  }

  function goBack() {
    if (isOnboardingBackLocked(step, futureYou)) return;

    if (step === ONBOARDING_STEP_ACTIVITY && canRevisitFutureYouPhoto(futureYou)) {
      goToStep(ONBOARDING_STEP_FUTURE_YOU_PHOTO);
      return;
    }

    if (step === 9 && goalWeightReinforcement) {
      setNavDirection("back");
      setGoalWeightReinforcement(false);
      return;
    }
    if (step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION) {
      goToStep(ONBOARDING_STEP_FUTURE_YOU_PHOTO);
      return;
    }
    if (step === ONBOARDING_STEP_FUTURE_YOU_PHOTO) {
      if (canRevisitFutureYouPhoto(futureYou)) {
        goToStep(ONBOARDING_STEP_ACTIVITY);
        return;
      }
      goToStep(backStepFromFutureYouPhoto(profile.goal));
      return;
    }
    if (step === 21) {
      goToStep(19);
      return;
    }
    if (step === 23) {
      goToStep(22);
      return;
    }
    if (step === 22) {
      goToStep(21);
      return;
    }
    if (step === ONBOARDING_STEP_FUTURE_YOU_SUCCESS) {
      setPendingSubscriptionTier(null);
      goToStep(ONBOARDING_STEP_PAYWALL, { subscriptionTier: null });
      return;
    }
    if (step === ONBOARDING_STEP_PAYWALL) {
      goToStep(26);
      return;
    }
    const prev = step - 1;
    if (isOnboardingBackIntoGoalLockBlocked(step, prev, futureYou)) return;
    goToStep(Math.max(prev, 0));
  }

  function handlePlanBuildingComplete() {
    setMacros(computedMacros);
    goToStep(21, { macros: computedMacros });
  }

  function goToReminderPicker() {
    goToStep(25);
  }

  async function handleNotificationPromptChoice() {
    await requestNotificationPermission();
    goToReminderPicker();
  }

  function skipReminders() {
    setNotificationPrefs({ ...ONBOARDING_NOTIFICATION_DEFAULTS });
    goNext();
  }

  function finish(subscriptionTier: SubscriptionTier, notificationPreferences: NotificationPreferences) {
    if (!previewMode) {
      clearOnboardingDraftStorage();
    }
    const planStartIso = localDateKey(new Date());
    const age = profile.dateOfBirth ? (ageFromDateOfBirth(profile.dateOfBirth) ?? profile.age) : profile.age;
    const finalProfile = completeOnboardingProfile(
      {
        ...profile,
        sessionDuration: sessionDurationFromSessionLength(sessionLength!),
      },
      age,
    );
    const progressGoal = progressGoalFromOnboarding(finalProfile);
    setState((s) => {
      const stepsTarget = s.stepsTarget;
      const waterDailyTargetOz = s.waterDailyTargetOz;
      const habitTemplates = ensureMobilityHabitTemplate(habitTemplatesFromOnboarding(stepsTarget, waterDailyTargetOz, unitPreferences.volumeUnit));
      const templateIds = new Set(habitTemplates.map((h) => h.id));
      const habitsDoneByDay = pruneHabitsDoneByDay(s.habitsDoneByDay, templateIds);
      const todayKey = localDateKey(new Date());
      return {
        ...s,
        displayName: displayName.trim(),
        unitPreferences,
        unitPreferencesChosen: true,
        experienceLevel: experienceLevel!,
        experienceLevelChosen: true,
        equipmentSetup: equipmentSetup!,
        equipmentSetupChosen: true,
        onboardingProfile: finalProfile,
        onboardingComplete: true,
        onboardingDraft: null,
        workoutTemplates: draftTemplates,
        nutritionTargets: macros,
        notificationPreferences,
        progressGoal,
        planStartIso,
        subscriptionTier,
        theme: activeTheme,
        futureYou: Object.keys(futureYou).length > 0 ? { ...futureYou } : undefined,
        habitTemplates,
        habitsDoneByDay,
        habits: buildHabitsForDateKey(habitTemplates, habitsDoneByDay, todayKey, {
          weightLogged: s.weightLog.some((e) => e.dateKey === todayKey),
        }),
        restTimerDefaultSeconds: restSecondsForSessionLength(sessionLength!),
      };
    });
    onComplete?.();
  }

  async function finishWithTier(tier: SubscriptionTier) {
    let prefs = notificationPrefs;
    if (anyNotificationEnabled(prefs)) {
      await requestNotificationPermission();
    }
    finish(tier, prefs);
  }

  function handlePaywallSubscribe(tier: SubscriptionTier) {
    setPendingSubscriptionTier(tier);
    goToStep(ONBOARDING_STEP_FUTURE_YOU_SUCCESS, { subscriptionTier: tier });
  }

  useEffect(() => {
    if (step !== ONBOARDING_STEP_FUTURE_YOU_SUCCESS || pendingSubscriptionTier !== "pro") return;
    if (!isFutureYouSuccessHeroVisible(futureYou, futureYouBlocked)) return;
    let stop: (() => void) | undefined;
    const id = window.setTimeout(() => {
      stop = fireFutureYouSuccessConfetti(4000);
    }, 280);
    return () => {
      window.clearTimeout(id);
      stop?.();
    };
  }, [step, pendingSubscriptionTier, futureYou, futureYouBlocked]);

  useEffect(() => {
    if (step !== ONBOARDING_STEP_FUTURE_YOU_SUCCESS || previewMode) return;
    if (
      canAccessFutureYouSuccessScreen(
        futureYou,
        futureYouBlocked,
        generationPollStatus,
        pendingSubscriptionTier,
      )
    ) {
      return;
    }
    setPendingSubscriptionTier(null);
    goToStep(ONBOARDING_STEP_PAYWALL, { subscriptionTier: null });
  }, [
    step,
    previewMode,
    futureYou,
    futureYouBlocked,
    generationPollStatus,
    pendingSubscriptionTier,
  ]);

  function renderCurrentStep(): ReactNode {
  if (step === 0) {
    return (
      <OnboardingWelcomeScreen
        signInPrompt="switch-account"
        onGetStarted={goNext}
        onSignIn={onSignIn}
      />
    );
  }

  if (step === 1) {
    return (
      <OnboardingThemePicker
        step={step}
        value={draftTheme}
        onChange={(nextTheme) => {
          setDraftTheme(nextTheme);
          setTheme(nextTheme);
        }}
        onBack={goBack}
        onContinue={() => {
          setTheme(draftTheme);
          goToStep(2, { theme: draftTheme });
        }}
      />
    );
  }

  if (step === 2) {
    return (
      <OnboardingShell step={step} title="What's your gender?" subtitle="This will be used to calibrate your custom plan." onBack={goBack} onContinue={goNext} continueDisabled={!profile.gender}>
        <OnboardingPillStack>
          {GENDERS.map((g) => (
            <OnboardingSegment key={g} selected={profile.gender === g} onClick={() => setProfile((p) => ({ ...p, gender: g }))}>
              {g === "male" ? "Male" : g === "female" ? "Female" : "Other"}
            </OnboardingSegment>
          ))}
        </OnboardingPillStack>
      </OnboardingShell>
    );
  }

  if (step === 3) {
    const dobValue = profile.dateOfBirth;

    return (
      <OnboardingShell
        step={step}
        title="When were you born?"
        subtitle="This will be used to calibrate your custom plan."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!dobValid}
      >
        <DateOfBirthWheelPicker
          value={dobValue}
          onChange={(dateOfBirth) => setProfile((p) => ({ ...p, dateOfBirth }))}
        />
        {!dobValid && profile.dateOfBirth ? (
          <p style={{ margin: "12px 0 0", fontSize: 13, color: "rgba(248,113,113,0.9)", textAlign: "center" }}>
            Enter a valid date of birth (13+)
          </p>
        ) : null}
      </OnboardingShell>
    );
  }

  if (step === 4) {
    return (
      <OnboardingShell
        step={step}
        title="Where did you hear about us?"
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!profile.referralSource}
      >
        <ReferralSourcePicker
          value={profile.referralSource}
          onChange={(referralSource) => setProfile((p) => ({ ...p, referralSource }))}
        />
      </OnboardingShell>
    );
  }

  if (step === 5) {
    return (
      <OnboardingShell step={step} title="Choose your units" subtitle="Weight, height, and volume display across the app." onBack={goBack} onContinue={goNext}>
        <div className="onboarding-gradient-card onboarding-gradient-card--spacious">
          <UnitPreferencePicker value={unitPreferences} onChange={setUnitPreferences} />
        </div>
      </OnboardingShell>
    );
  }

  if (step === 6) {
    const hUnit = unitPreferences.heightUnit;

    return (
      <OnboardingShell
        step={step}
        title="How tall are you?"
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!heightStepValid}
      >
        <div className="onboarding-gradient-card">
          <OnboardingHeightInput
            unit={hUnit}
            heightIn={profile.heightIn}
            resetKey={hUnit}
            onHeightChange={(heightIn) => setProfile((p) => ({ ...p, heightIn }))}
          />
          {!heightStepValid ? (
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "rgba(248,113,113,0.9)" }}>Enter a height between 4&apos;0&quot; and 8&apos;0&quot;</p>
          ) : null}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 7) {
    const wUnit = unitPreferences.weightUnit;
    const currentWeightLbs = isValidWeighInLbs(profile.weightLbs)
      ? profile.weightLbs
      : DEFAULT_ONBOARDING_CURRENT_WEIGHT_LBS;

    return (
      <OnboardingShell
        step={step}
        title="What's your current weight?"
        subtitle="Slide the ruler to set your weight."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!weightStepValid}
        contentClassName="onboarding-shell__content--compact"
      >
        <WeightRulerPicker
          valueLbs={currentWeightLbs}
          minLbs={70}
          maxLbs={450}
          unit={wUnit}
          directionLabel="Current weight"
          onChange={(weightLbs) => setProfile((p) => ({ ...p, weightLbs }))}
        />
      </OnboardingShell>
    );
  }

  if (step === 8) {
    return (
      <OnboardingShell step={step} title="What's your primary goal?" subtitle="Gymmy adjusts calories and coaching for your goal." onBack={goBack} onContinue={goNext} continueDisabled={!profile.goal}>
        <OnboardingPillStack>
          {GOALS.map((g) => (
            <OnboardingSegment key={g} selected={profile.goal === g} onClick={() => setProfile((p) => ({ ...p, goal: g }))}>
              {g === "cut" ? "Lose weight" : g === "bulk" ? "Build muscle" : "Maintain and perform"}
            </OnboardingSegment>
          ))}
        </OnboardingPillStack>
      </OnboardingShell>
    );
  }

  if (step === 9) {
    const wUnit = unitPreferences.weightUnit;
    const goal = profile.goal as "cut" | "bulk";
    const { minLbs, maxLbs } = goalWeightRangeLbs(goal, profile.weightLbs);
    const valueLbs = clampGoalWeightLbs(profile.goalWeightLbs ?? defaultGoalWeightLbs(goal, profile.weightLbs), minLbs, maxLbs);
    const reinforcement = goalWeightReinforcementParts(profile, wUnit);

    return (
      <OnboardingShell
        step={step}
        title={goalWeightReinforcement ? "" : "What is your desired weight?"}
        hideHeader={goalWeightReinforcement}
        contentClassName={goalWeightReinforcement ? "onboarding-shell__content--centered" : undefined}
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!goalWeightReinforcement && !isGoalWeightValid(profile, profile.weightLbs)}
      >
        {goalWeightReinforcement ? (
          <OnboardingGoalWeightReinforcement
            headline={
              <>
                {reinforcement.verb}{" "}
                <span className="onboarding-goal-weight-accent">{reinforcement.delta}</span>
                {reinforcement.tail}
              </>
            }
            subtext={goalWeightReinforcementSubtext()}
          />
        ) : (
          <WeightRulerPicker
            valueLbs={valueLbs}
            minLbs={minLbs}
            maxLbs={maxLbs}
            unit={wUnit}
            directionLabel={goalWeightDirectionLabel(profile.goal!)}
            onChange={(goalWeightLbs) => setProfile((p) => ({ ...p, goalWeightLbs }))}
          />
        )}
      </OnboardingShell>
    );
  }

  if (step === ONBOARDING_STEP_PACE) {
    return (
      <OnboardingShell
        step={step}
        title="How fast do you want to get there?"
        subtitle="Honest answer. We'll set the plan in the real world."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!paceValid}
      >
        <OnboardingPillStack>
          {PACES.map(({ value, label, hint }) => (
            <div key={value}>
              <OnboardingSegment selected={profile.pace === value} onClick={() => setProfile((p) => ({ ...p, pace: value }))}>
                {label}
              </OnboardingSegment>
              {hint && profile.pace === value ? (
                <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-secondary)", paddingLeft: 16 }}>{hint}</p>
              ) : null}
            </div>
          ))}
        </OnboardingPillStack>
      </OnboardingShell>
    );
  }

  if (step === ONBOARDING_STEP_FUTURE_YOU_PHOTO) {
    return (
      <OnboardingShell
        step={step}
        title={
          <>
            See your <span className="onboarding-goal-weight-accent">Future You</span>
          </>
        }
        subtitle="Upload a photo to see what you could look like and get a personalized plan to help you get there."
        helperClassName="onboarding-helper--future-you"
        contentClassName="onboarding-shell__content--compact onboarding-shell__content--future-you"
        shellClassName="onboarding-shell--future-you"
        compactFooter
        hideContinue
        footerGhostAction={{ label: "Skip", onClick: skipFutureYouPhoto }}
        onBack={goBack}
        onContinue={goNext}
      >
        <OnboardingFutureYouPhoto
          gender={profile.gender}
          age={dobAge}
          photoPreview={futureYouPhotoPreview}
          photoSaved={Boolean(futureYou.photoStoragePath && !futureYouPhotoPreview)}
          photoAiConsentAt={futureYou.photoAiConsentAt}
          uploading={futureYouUploading}
          uploadError={futureYouUploadError}
          onPickPhoto={onPickFutureYouPhoto}
          onConfirmPhoto={() => void continueFutureYouPhoto()}
          onRetryUpload={() => void continueFutureYouPhoto()}
          onGrantAiConsent={() => {
            if (!futureYou.photoAiConsentAt) {
              patchFutureYou({ photoAiConsentAt: new Date().toISOString() });
            }
          }}
          onClearPhoto={() => {
            setFutureYouPhotoPreview(null);
            setFutureYouUploadError(null);
            patchFutureYou({ photoUploaded: false, photoStoragePath: undefined });
          }}
        />
      </OnboardingShell>
    );
  }

  if (step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION) {
    const gender = profile.gender ?? "other";

    return (
      <OnboardingShell
        step={step}
        title="What's your why?"
        subtitle="Pick one focus — we'll personalize your Future You while you finish onboarding."
        contentClassName="onboarding-shell__content--compact"
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!futureYou.motivationId || futureYouGenerating}
        continueLabel={futureYouGenerating ? "Starting…" : "Continue"}
      >
        <OnboardingFutureYouMotivation
          goal={profile.goal ?? "maintain"}
          gender={gender}
          selectedId={futureYou.motivationId}
          onSelect={(motivationId, isGeneric) => {
            setFutureYouGenerateError(null);
            patchFutureYou({ motivationId, motivationIsGeneric: isGeneric });
          }}
        />
        {futureYouGenerateError ? (
          <p role="alert" className="future-you-motivation-step__error">
            {futureYouGenerateError}
          </p>
        ) : null}
      </OnboardingShell>
    );
  }

  if (step === ONBOARDING_STEP_ACTIVITY) {
    const showBackToPhoto = canRevisitFutureYouPhoto(futureYou);
    return (
      <OnboardingShell
        step={step}
        title="How active are you outside the gym?"
        subtitle="Helps us size your daily fuel targets."
        onBack={showBackToPhoto ? goBack : undefined}
        onContinue={goNext}
        continueDisabled={!profile.activityLevel}
      >
        <OnboardingPillStack>
          {ACTIVITY_LEVELS.map((level) => (
            <OnboardingSegment key={level} selected={profile.activityLevel === level} onClick={() => setProfile((p) => ({ ...p, activityLevel: level }))}>
              {activityLevelLabel(level)}
            </OnboardingSegment>
          ))}
        </OnboardingPillStack>
      </OnboardingShell>
    );
  }

  if (step === 12) {
    return (
      <OnboardingShell step={step} title="What's your training experience?" subtitle="Rep ranges and starting weights in your templates." onBack={goBack} onContinue={goNext} continueDisabled={!experienceLevel}>
        <ExperienceLevelPicker value={experienceLevel} onChange={setExperienceLevel} />
      </OnboardingShell>
    );
  }

  if (step === 13) {
    return (
      <OnboardingShell step={step} title="What equipment do you have?" subtitle="Exercises will match what you can perform." onBack={goBack} onContinue={goNext} continueDisabled={!equipmentSetup}>
        <EquipmentSetupPicker value={equipmentSetup} onChange={setEquipmentSetup} />
      </OnboardingShell>
    );
  }

  if (step === 14) {
    return (
      <OnboardingShell
        step={step}
        title="How long do you want to train?"
        subtitle="We'll size your workouts to fit your session."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!sessionLength}
      >
        <OnboardingPillStack>
          {SESSION_LENGTH_OPTIONS.map(({ value, label }) => (
            <OnboardingSegment
              key={value}
              selected={sessionLength === value}
              onClick={() => setSessionLength(value)}
            >
              {label}
            </OnboardingSegment>
          ))}
        </OnboardingPillStack>
      </OnboardingShell>
    );
  }

  if (step === 15) {
    return (
      <OnboardingShell
        step={step}
        title="Which days can you train?"
        subtitle="Pick the days that work for your week."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!isTrainingScheduleValid(profile)}
      >
        <div className="onboarding-gradient-card onboarding-gradient-card--spacious">
          <WorkoutWeekCalendarPicker profile={profile} onChange={(next) => setProfile((p) => ({ ...p, ...next }))} />
        </div>
      </OnboardingShell>
    );
  }

  if (step === 16) {
    const scheduleReinforcement = trainingScheduleReinforcementParts(profile.workoutDaysPerWeek!);

    return (
      <OnboardingShell
        step={step}
        title=""
        hideHeader
        contentClassName="onboarding-shell__content--centered"
        onBack={goBack}
        onContinue={goNext}
      >
        <OnboardingGoalWeightReinforcement
          headline={
            <>
              {scheduleReinforcement.verb}{" "}
              <span className="onboarding-goal-weight-accent">{scheduleReinforcement.accent}</span>
              {scheduleReinforcement.tail}
            </>
          }
          subtext={trainingScheduleReinforcementSubtext()}
        />
      </OnboardingShell>
    );
  }

  if (step === 17) {
    const barrierOptions = ONBOARDING_BARRIERS.map((id) => ({
      id,
      label: barrierLabel(id),
      emoji: barrierEmoji(id),
    }));

    return (
      <OnboardingShell
        step={step}
        title="What's held you back before?"
        subtitle="Be honest. Gymmy is built around your answer"
        contentClassName="onboarding-shell__content--centered"
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!profile.barriers?.length}
      >
        <OnboardingIconOptionPicker
          options={barrierOptions}
          selected={profile.barriers}
          multi
          onToggle={(id) =>
            setProfile((p) => ({
              ...p,
              barriers: toggleSurveySelection(p.barriers, id),
            }))
          }
        />
      </OnboardingShell>
    );
  }

  if (step === 18) {
    const restrictionOptions = DIETARY_RESTRICTIONS.map((id) => ({
      id,
      label: dietaryRestrictionLabel(id),
      emoji: dietaryRestrictionEmoji(id),
    }));

    return (
      <OnboardingShell
        step={step}
        title="Any foods you avoid?"
        subtitle="We'll keep your nutrition suggestions on track"
        contentClassName="onboarding-shell__content--centered"
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!profile.dietaryRestrictions?.length}
      >
        <OnboardingIconOptionPicker
          options={restrictionOptions}
          selected={profile.dietaryRestrictions}
          multi
          onToggle={(id) =>
            setProfile((p) => ({
              ...p,
              dietaryRestrictions: toggleDietaryRestriction(p.dietaryRestrictions, id),
            }))
          }
        />
      </OnboardingShell>
    );
  }

  if (step === 19) {
    const styleOptions = TRAINING_STYLES.map((id) => ({
      id,
      label: trainingStyleLabel(id),
      emoji: trainingStyleEmoji(id),
    }));

    return (
      <OnboardingShell
        step={step}
        title="How do you train best?"
        subtitle="Your coach will match your style from day one"
        contentClassName="onboarding-shell__content--centered"
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!profile.trainingStyle}
      >
        <OnboardingIconOptionPicker
          options={styleOptions}
          selected={profile.trainingStyle}
          onToggle={(id) => setProfile((p) => ({ ...p, trainingStyle: id }))}
        />
      </OnboardingShell>
    );
  }

  if (step === 20) {
    return <OnboardingPlanBuilding onComplete={handlePlanBuildingComplete} />;
  }

  if (step === 21) {
    return (
      <>
        <OnboardingShell
          step={step}
          title="Your fuel targets"
          subtitle="Gymmy calculated these from your stats and goal. Tap any number to adjust."
          onBack={goBack}
          onContinue={goNext}
          continueDisabled={!isMacrosValid(macros)}
        >
          <OnboardingDailyFuelPlan
            macros={macros}
            computedMacros={computedMacros}
            onChangeMacros={setMacros}
            onReset={() => setMacros(computedMacros)}
          />
        </OnboardingShell>
        {macroContinueConfirmOpen ?
          <OnboardingMacroEditConfirmSheet
            onCancel={() => setMacroContinueConfirmOpen(false)}
            onConfirm={() => {
              setMacroContinueConfirmOpen(false);
              goToStep(22, { macros });
            }}
          />
        : null}
      </>
    );
  }

  if (step === 22) {
    return (
      <OnboardingShell
        step={step}
        title=""
        hideHeader
        contentClassName="onboarding-shell__content--centered"
        onBack={goBack}
        onContinue={goNext}
        continueLabel="Show training plan"
      >
        <OnboardingGoalWeightReinforcement
          headline={
            <>
              <span className="onboarding-goal-weight-accent">Protein</span> is your{" "}
              <span className="onboarding-goal-weight-accent">#1</span> priority
            </>
          }
          subtext={`Hit ${macros.p}g daily. Consistent protein protects muscle.`}
        />
      </OnboardingShell>
    );
  }

  if (step === 23) {
    return (
      <OnboardingShell
        step={step}
        title="Here's your training plan"
        subtitle="Gymmy built this from your schedule and experience. Looks good?"
        onBack={goBack}
        onContinue={goNext}
        continueLabel="Let's go"
      >
        <OnboardingSplitReveal templates={draftTemplates} />
      </OnboardingShell>
    );
  }

  if (step === 24) {
    return (
      <OnboardingShell
        step={step}
        title=""
        hideHeader
        onBack={goBack}
        onContinue={goToReminderPicker}
        hideFooter
        contentClassName="onboarding-shell__content--centered"
      >
        <OnboardingNotificationPrompt onChoice={handleNotificationPromptChoice} />
      </OnboardingShell>
    );
  }

  if (step === 25) {
    const remindersEnabled = anyNotificationEnabled(notificationPrefs);
    return (
      <OnboardingShell
        step={step}
        title="Stay on track"
        subtitle="Gymmy works best when it knows your schedule. Totally optional, change anytime"
        onBack={goBack}
        onContinue={remindersEnabled ? goNext : skipReminders}
        continueLabel={remindersEnabled ? "Set up notifications" : "Skip for now"}
        continueTone="dark"
        compactFooter
        contentClassName="onboarding-shell__content--compact"
        footerGhostAction={remindersEnabled ? { label: "Skip for now", onClick: skipReminders } : undefined}
      >
        <NotificationPreferencesPicker value={notificationPrefs} onChange={setNotificationPrefs} variant="onboarding" />
      </OnboardingShell>
    );
  }

  if (step === 26) {
    const name = displayName.trim() || "Friend";
    const showFutureYouReadyBanner = isFutureYouReadyBannerVisible(futureYou, generationPollStatus);
    return (
      <OnboardingShell
        step={step}
        title={`${name}, your plan is ready`}
        subtitle="Everything is set. Your coach is ready when you are."
        headlineClassName="onboarding-headline--plan-ready"
        helperClassName="onboarding-helper--plan-ready"
        afterHeadline={showFutureYouReadyBanner ? <FutureYouReadyBanner /> : undefined}
        hideGenerationPill
        onBack={goBack}
        onContinue={goNext}
        continueLabel={onboardingPlanReadyContinueLabel(futureYou, futureYouBlocked)}
        continueTone="gold"
        compactFooter
        contentClassName="onboarding-shell__content--plan-ready"
      >
        <OnboardingPlanReady planSnapshot={planSnapshot} />
      </OnboardingShell>
    );
  }

  if (step === ONBOARDING_STEP_PAYWALL) {
    return (
      <OnboardingPaywall
        planSnapshot={planSnapshot}
        futureYou={futureYou}
        generationStatus={generationPollStatus}
        gender={profile.gender}
        photoBlocked={futureYouBlocked}
        previewMode={previewMode}
        onSelectTier={handlePaywallSubscribe}
        onBack={goBack}
      />
    );
  }

  if (step === ONBOARDING_STEP_FUTURE_YOU_SUCCESS && pendingSubscriptionTier === "pro") {
    return (
      <OnboardingFutureYouSuccess
        timeline={planSnapshot.timeline}
        planSnapshot={planSnapshot}
        futureYou={futureYou}
        generationStatus={generationPollStatus}
        gender={profile.gender}
        photoBlocked={futureYouBlocked}
        subscriptionTier={pendingSubscriptionTier}
        displayName={displayName}
        previewMode={previewMode}
        onContinue={() => void finishWithTier(pendingSubscriptionTier)}
      />
    );
  }

  return null;
  }

  const screen = renderCurrentStep();
  if (!screen) return null;

  return (
    <FutureYouGenerationPillProvider pill={generationPill}>
      <ScreenTransition
        activeKey={onboardingScreenKey(step, goalWeightReinforcement)}
        variant="stack"
        direction={navDirection}
        style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}
      >
        {screen}
      </ScreenTransition>
    </FutureYouGenerationPillProvider>
  );
}
