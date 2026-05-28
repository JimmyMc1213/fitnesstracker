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
import { ageFromDateOfBirth, completeOnboardingProfile, DEFAULT_ONBOARDING_PROFILE, FRESH_ONBOARDING_PROFILE, normalizeOnboardingProfile, nutritionCalcInputFromOnboardingProfile, progressGoalFromOnboarding } from "./onboardingProfile";
import {
  buildOnboardingDraft,
  clearOnboardingDraftStorage,
  initialOnboardingWizardDraft,
  saveOnboardingDraftToLocalStorage,
  type OnboardingDraftInput,
} from "./onboardingDraft";
import { OnboardingDailyFuelPlan } from "./OnboardingDailyFuelPlan";
import { OnboardingGoalWeightReinforcement } from "./OnboardingGoalWeightReinforcement";
import { OnboardingPlanBuilding } from "./OnboardingPlanBuilding";
import { OnboardingIconOptionPicker } from "./OnboardingIconOptionPicker";
import { OnboardingWelcomeScreen } from "./OnboardingWelcomeScreen";
import { OnboardingThemePicker } from "./OnboardingThemePicker";
import { useTheme } from "./ThemeContext";
import type { AppTheme } from "./theme";
import { OnboardingPaywall } from "./OnboardingPaywall";
import { OnboardingSaveProgress } from "./OnboardingSaveProgress";
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
} from "./unitPreferences";
import { DateOfBirthWheelPicker } from "./DateOfBirthWheelPicker";
import { defaultGoalWeightLbs, goalWeightRangeLbs, WeightRulerPicker } from "./WeightRulerPicker";
import { clampGoalWeightLbs, isGoalWeightValid } from "./goalSettings";
import { ReferralSourcePicker } from "./ReferralSourcePicker";
import { OnboardingHeightInput } from "./OnboardingHeightInput";
import { OnboardingWeightInput } from "./OnboardingWeightInput";
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
  return Math.min(Math.max(0, Math.round(stepIndex)), TOTAL_STEPS - 1);
}

function onboardingScreenKey(step: number, goalWeightReinforcement: boolean): string {
  if (step === 9 && goalWeightReinforcement) return "9-reinforcement";
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
    step: Math.min(migrateOnboardingStepIndex(draft.stepIndex), TOTAL_STEPS - 1),
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
    theme: draft.theme ?? "light",
  };
}

export function OnboardingFlow({
  setState,
  onComplete,
  onSignIn,
  introWelcomeDone = false,
  accountDisplayName = "",
  initialDraft,
  previewMode = false,
}: {
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onComplete?: () => void;
  onSignIn?: () => void;
  introWelcomeDone?: boolean;
  accountDisplayName?: string;
  initialDraft?: OnboardingDraft | null;
  previewMode?: boolean;
}) {
  const { setTheme } = useTheme();
  const restored = initialOnboardingWizardDraft(initialDraft);
  const initial = restored ? onboardingStateFromDraft(restored) : null;
  const [step, setStep] = useState(() => {
    const restoredStep = initial?.step ?? 0;
    if (introWelcomeDone && restoredStep === 0) return 1;
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
  const [heightFieldsComplete, setHeightFieldsComplete] = useState(false);
  const [weightFieldComplete, setWeightFieldComplete] = useState(false);
  const [draftTheme, setDraftTheme] = useState<AppTheme>(() => initial?.theme ?? restored?.theme ?? "light");

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

  const heightValid = profile.heightIn >= 48 && profile.heightIn <= 96;
  const heightStepValid = heightValid && heightFieldsComplete;
  const weightValid = profile.weightLbs >= 70 && profile.weightLbs <= 450;
  const weightStepValid = weightValid && weightFieldComplete;
  const dobValid = dobAge != null && dobAge >= 13 && dobAge <= 100;
  const paceValid = profile.goal === "maintain" || profile.pace != null;

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
  };

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
        }),
      );
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, []);

  useEffect(() => {
    if (step === 0 && introWelcomeDone) {
      goToStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, introWelcomeDone]);

  useEffect(() => {
    if (step !== 9) {
      setGoalWeightReinforcement(false);
      return;
    }
    if (profile.goal === "maintain") return;
    if (profile.goalWeightLbs != null) return;
    setProfile((p) => ({
      ...p,
      goalWeightLbs: defaultGoalWeightLbs(p.goal as "cut" | "bulk", p.weightLbs),
    }));
  }, [step, profile.goal, profile.goalWeightLbs, profile.weightLbs]);

  function persistDraftSync(nextStepIndex: number, overrides?: Partial<OnboardingDraftInput>) {
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
      ...overrides,
    });
    saveOnboardingDraftToLocalStorage(draft);
    setState((s) => ({ ...s, onboardingComplete: false, onboardingDraft: draft }));
  }

  function goToStep(next: number, overrides?: Partial<OnboardingDraftInput>, direction?: NavDirection) {
    setNavDirection(direction ?? (next >= step ? "forward" : "back"));
    persistDraftSync(next, overrides);
    setStep(next);
  }

  function nextAfterGoal(): number {
    return profile.goal === "maintain" ? 11 : 9;
  }

  function prevBeforeActivity(): number {
    return profile.goal === "maintain" ? 8 : 10;
  }

  function goNext() {
    const overrides: Partial<OnboardingDraftInput> = {};

    if (step === 8) {
      goToStep(nextAfterGoal(), overrides);
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
      overrides.macros = computedMacros;
      setMacros(computedMacros);
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

    if (step === 27) {
      goToStep(28, overrides);
      return;
    }

    const next = Math.min(step + 1, TOTAL_STEPS - 1);
    if (step === 10 && profile.goal !== "maintain" && !profile.pace) {
      return;
    }
    goToStep(next, overrides);
  }

  function goBack() {
    if (step === 9 && goalWeightReinforcement) {
      setNavDirection("back");
      setGoalWeightReinforcement(false);
      return;
    }
    if (step === 11) {
      goToStep(prevBeforeActivity());
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
    if (step === 28) {
      goToStep(27);
      return;
    }
    goToStep(Math.max(step - 1, 0));
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
    if (previewMode) {
      onComplete?.();
      return;
    }

    clearOnboardingDraftStorage();
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
        theme: draftTheme,
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

  function renderCurrentStep(): ReactNode {
  if (step === 0) {
    if (introWelcomeDone) return null;
    return <OnboardingWelcomeScreen onGetStarted={goNext} onSignIn={onSignIn} />;
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
            onFieldsCompleteChange={setHeightFieldsComplete}
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

    return (
      <OnboardingShell
        step={step}
        title="What's your current weight?"
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!weightStepValid}
      >
        <div className="onboarding-gradient-card">
          <OnboardingWeightInput
            unit={wUnit}
            weightLbs={profile.weightLbs}
            resetKey={wUnit}
            onWeightChange={(weightLbs) => setProfile((p) => ({ ...p, weightLbs }))}
            onFieldCompleteChange={setWeightFieldComplete}
          />
          {!weightStepValid ? (
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "rgba(248,113,113,0.9)" }}>Enter a weight between 70 and 450 lbs</p>
          ) : null}
        </div>
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

  if (step === 10) {
    return (
      <OnboardingShell step={step} title="How fast do you want to get there?" subtitle="Honest answer. We'll set the plan in the real world." onBack={goBack} onContinue={goNext} continueDisabled={!paceValid}>
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

  if (step === 11) {
    return (
      <OnboardingShell step={step} title="How active are you outside the gym?" subtitle="Helps us size your daily fuel targets." onBack={goBack} onContinue={goNext} continueDisabled={!profile.activityLevel}>
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
    return (
      <OnboardingShell
        step={step}
        title={`${name}, your plan is ready`}
        subtitle="Everything is set. Your coach is ready when you are."
        headlineClassName="onboarding-headline--plan-ready"
        helperClassName="onboarding-helper--plan-ready"
        onBack={goBack}
        onContinue={goNext}
        continueLabel="Start my plan"
        continueTone="gold"
        compactFooter
        contentClassName="onboarding-shell__content--plan-ready"
      >
        <OnboardingPlanReady
          displayName={displayName}
          macros={macros}
          profile={profile}
          templates={draftTemplates}
          volumeUnit={unitPreferences.volumeUnit}
        />
      </OnboardingShell>
    );
  }

  if (step === 27) {
    return (
      <OnboardingShell
        step={step}
        title="Save your progress"
        subtitle="Sign in to keep your plan synced across devices."
        onBack={goBack}
        onContinue={goNext}
        hideFooter
        contentClassName="onboarding-shell__content--save-progress"
      >
        <OnboardingSaveProgress onSkip={goNext} onSignedIn={goNext} />
      </OnboardingShell>
    );
  }

  if (step === 28) {
    return <OnboardingPaywall onSelectTier={(tier) => void finishWithTier(tier)} onBack={goBack} />;
  }

  return null;
  }

  const screen = renderCurrentStep();
  if (!screen) return null;

  return (
    <ScreenTransition
      activeKey={onboardingScreenKey(step, goalWeightReinforcement)}
      variant="stack"
      direction={navDirection}
      style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}
    >
      {screen}
    </ScreenTransition>
  );
}
