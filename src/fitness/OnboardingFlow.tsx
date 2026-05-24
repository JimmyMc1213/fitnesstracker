import { useEffect, useMemo, useRef, useState } from "react";

import { loadTasksForToday, localDateKey } from "./dailyPlan";
import { DEFAULT_EXPERIENCE_LEVEL } from "./experienceLevel";
import { ExperienceLevelPicker } from "./ExperienceLevelPicker";
import { DEFAULT_EQUIPMENT_SETUP } from "./equipmentSetup";
import { EquipmentSetupPicker } from "./EquipmentSetupPicker";
import {
  activityLevelLabel,
  calculateNutritionTargets,
  nutritionGoalLabel,
} from "./nutritionCalculator";
import { NotificationPreferencesPicker } from "./NotificationPreferencesPicker";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "./notificationPreferences";
import { requestNotificationPermission } from "./notificationPermission";
import { ageFromDateOfBirth, DEFAULT_ONBOARDING_PROFILE, progressGoalFromOnboarding } from "./onboardingProfile";
import {
  buildOnboardingDraft,
  clearOnboardingDraftStorage,
  initialOnboardingWizardDraft,
  saveOnboardingDraftToLocalStorage,
  type OnboardingDraftInput,
} from "./onboardingDraft";
import { OnboardingInterstitial } from "./OnboardingInterstitial";
import { OnboardingPaywall } from "./OnboardingPaywall";
import { OnboardingPlanReady } from "./OnboardingPlanReady";
import { OnboardingSegment } from "./OnboardingSegment";
import { OnboardingShell, ONBOARDING_TOTAL_STEPS } from "./OnboardingShell";
import { OnboardingSplitReveal } from "./OnboardingSplitReveal";
import { OnboardingTemplateReview } from "./OnboardingTemplateReview";
import { isTrainingScheduleValid, WorkoutWeekCalendarPicker } from "./WorkoutWeekCalendarPicker";
import { UnitPreferencePicker } from "./UnitPreferencePicker";
import { defaultTrainingWeekdaysForProfile } from "./workoutWeekCalendar";
import {
  DEFAULT_UNIT_PREFERENCES,
  cmFromInches,
  formatWeightFromLbs,
  inchesFromCm,
  parseWeightToLbs,
} from "./unitPreferences";
import { buildWorkoutTemplatesForDays } from "./workoutSplitByDays";
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

function defaultDateOfBirthFromAge(age: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  d.setMonth(5);
  d.setDate(15);
  return localDateKey(d);
}

function isGoalWeightValid(profile: OnboardingProfile): boolean {
  if (profile.goal === "maintain") return true;
  const target = profile.goalWeightLbs;
  if (target == null || !Number.isFinite(target)) return false;
  const w = profile.weightLbs;
  if (Math.abs(target - w) < 3) return false;
  if (profile.goal === "cut") return target >= w - 80 && target <= w - 5;
  if (profile.goal === "bulk") return target >= w + 3 && target <= w + 50;
  return false;
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

function onboardingStateFromDraft(draft: OnboardingDraft) {
  const weekdays =
    draft.profile.trainingWeekdays?.length ?
      draft.profile.trainingWeekdays
    : defaultTrainingWeekdaysForProfile(draft.profile.workoutDaysPerWeek);
  const profile = {
    ...draft.profile,
    trainingWeekdays: weekdays,
    dateOfBirth: draft.profile.dateOfBirth ?? defaultDateOfBirthFromAge(draft.profile.age),
  };
  const templatesFromDraft =
    draft.draftTemplates?.length ?
      draft.draftTemplates.map((t) => ({ ...t, exercises: [...t.exercises] }))
    : buildWorkoutTemplatesForDays(
        profile.workoutDaysPerWeek,
        draft.experienceLevel,
        draft.equipmentSetup,
        weekdays,
      );
  return {
    step: Math.min(draft.stepIndex, TOTAL_STEPS - 1),
    displayName: draft.displayName,
    unitPreferences: { ...draft.unitPreferences },
    experienceLevel: draft.experienceLevel,
    equipmentSetup: draft.equipmentSetup,
    profile,
    draftTemplates: templatesFromDraft,
    macros: draft.macros ? { ...draft.macros } : calculateNutritionTargets(profile),
    notificationPrefs: { ...(draft.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFERENCES) },
  };
}

export function OnboardingFlow({
  setState,
  onComplete,
  initialDraft,
  previewMode = false,
}: {
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onComplete?: () => void;
  initialDraft?: OnboardingDraft | null;
  previewMode?: boolean;
}) {
  const restored = initialOnboardingWizardDraft(initialDraft);
  const initial = restored ? onboardingStateFromDraft(restored) : null;
  const [step, setStep] = useState(() => initial?.step ?? 0);
  const [displayName, setDisplayName] = useState(() => initial?.displayName ?? "");
  const [unitPreferences, setUnitPreferences] = useState<UnitPreferences>(() => initial?.unitPreferences ?? { ...DEFAULT_UNIT_PREFERENCES });
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(() => initial?.experienceLevel ?? DEFAULT_EXPERIENCE_LEVEL);
  const [equipmentSetup, setEquipmentSetup] = useState<EquipmentSetup>(() => initial?.equipmentSetup ?? DEFAULT_EQUIPMENT_SETUP);
  const [profile, setProfile] = useState<OnboardingProfile>(() => {
    const base = initial?.profile ?? { ...DEFAULT_ONBOARDING_PROFILE };
    return {
      ...base,
      dateOfBirth: base.dateOfBirth ?? defaultDateOfBirthFromAge(base.age),
    };
  });
  const [draftTemplates, setDraftTemplates] = useState<WorkoutRoutineTemplate[]>(
    () =>
      initial?.draftTemplates ??
      buildWorkoutTemplatesForDays(5, DEFAULT_EXPERIENCE_LEVEL, DEFAULT_EQUIPMENT_SETUP),
  );
  const [macros, setMacros] = useState<MacroTotals>(() => initial?.macros ?? calculateNutritionTargets(DEFAULT_ONBOARDING_PROFILE));
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(
    () => initial?.notificationPrefs ?? { ...DEFAULT_NOTIFICATION_PREFERENCES },
  );

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

  const computedMacros = useMemo(() => calculateNutritionTargets(profileForCalc), [profileForCalc]);

  const heightValid = profile.heightIn >= 48 && profile.heightIn <= 96;
  const weightValid = profile.weightLbs >= 70 && profile.weightLbs <= 450;
  const dobValid = dobAge != null && dobAge >= 13 && dobAge <= 100;
  const displayNameValid = !displayName.trim() || (displayName.trim().length >= 1 && displayName.trim().length <= 40);
  const templatesValid = draftTemplates.length > 0 && draftTemplates.every((t) => t.exercises.length > 0);
  const paceValid = profile.goal === "maintain" || profile.pace != null;

  const formRef = useRef({
    step,
    displayName,
    unitPreferences,
    experienceLevel,
    equipmentSetup,
    profile,
    draftTemplates,
    macros,
    notificationPrefs,
  });
  formRef.current = {
    step,
    displayName,
    unitPreferences,
    experienceLevel,
    equipmentSetup,
    profile,
    draftTemplates,
    macros,
    notificationPrefs,
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
          profile: f.profile,
          draftTemplates: f.draftTemplates,
          macros: f.macros,
          notificationPrefs: f.notificationPrefs,
        }),
      );
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, []);

  useEffect(() => {
    if (step !== 20) return;
    const id = window.setTimeout(() => {
      goToStep(21);
    }, 3500);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function persistDraftSync(nextStepIndex: number, overrides?: Partial<OnboardingDraftInput>) {
    const draft = buildOnboardingDraft({
      stepIndex: nextStepIndex,
      displayName,
      unitPreferences,
      experienceLevel,
      equipmentSetup,
      profile,
      draftTemplates,
      macros,
      notificationPrefs,
      ...overrides,
    });
    saveOnboardingDraftToLocalStorage(draft);
    setState((s) => ({ ...s, onboardingComplete: false, onboardingDraft: draft }));
  }

  function goToStep(next: number, overrides?: Partial<OnboardingDraftInput>) {
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

    if (step === 14) {
      const weekdays =
        profile.trainingWeekdays?.length ?
          profile.trainingWeekdays
        : defaultTrainingWeekdaysForProfile(profile.workoutDaysPerWeek);
      overrides.draftTemplates = buildWorkoutTemplatesForDays(
        profile.workoutDaysPerWeek,
        experienceLevel,
        equipmentSetup,
        weekdays,
      );
      setDraftTemplates(overrides.draftTemplates);
      goToStep(15, overrides);
      return;
    }

    if (step === 15) {
      overrides.macros = computedMacros;
      setMacros(computedMacros);
      goToStep(17, overrides);
      return;
    }

    if (step === 16) {
      overrides.macros = macros;
      goToStep(17, overrides);
      return;
    }

    if (step === 17) {
      overrides.macros = macros;
      goToStep(18, overrides);
      return;
    }

    if (step === 19) {
      goToStep(20, overrides);
      return;
    }

    if (step === 21) {
      goToStep(22, overrides);
      return;
    }

    const next = Math.min(step + 1, TOTAL_STEPS - 1);
    if (step === 11 && profile.goal !== "maintain" && !profile.pace) {
      return;
    }
    goToStep(next, overrides);
  }

  function goBack() {
    if (step === 11) {
      goToStep(prevBeforeActivity());
      return;
    }
    if (step === 17) {
      goToStep(15);
      return;
    }
    if (step === 16) {
      goToStep(15);
      return;
    }
    if (step === 22) {
      goToStep(21);
      return;
    }
    goToStep(Math.max(step - 1, 0));
  }

  function goEditSplit() {
    goToStep(16);
  }

  function finish(subscriptionTier: SubscriptionTier, notificationPreferences: NotificationPreferences) {
    if (previewMode) {
      onComplete?.();
      return;
    }

    clearOnboardingDraftStorage();
    const planStartIso = localDateKey(new Date());
    const age = profile.dateOfBirth ? (ageFromDateOfBirth(profile.dateOfBirth) ?? profile.age) : profile.age;
    const finalProfile: OnboardingProfile = { ...profile, age };
    const progressGoal = progressGoalFromOnboarding(finalProfile);
    setState((s) => ({
      ...s,
      displayName: displayName.trim(),
      unitPreferences,
      unitPreferencesChosen: true,
      experienceLevel,
      experienceLevelChosen: true,
      equipmentSetup,
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
      dailyTasks: loadTasksForToday(macros, planStartIso, s.stepsTarget, draftTemplates, finalProfile.workoutDaysPerWeek),
    }));
    onComplete?.();
  }

  async function finishWithTier(tier: SubscriptionTier) {
    let prefs = notificationPrefs;
    if (prefs.workoutReminderEnabled || prefs.nutritionCheckInEnabled) {
      await requestNotificationPermission();
    }
    finish(tier, prefs);
  }

  if (step === 0) {
    return (
      <OnboardingShell step={step} title="Gymmy" subtitle="The only app you need to reach your fitness goals" onContinue={goNext} hideProgress>
        <ul style={{ margin: "8px 0 0", padding: "0 0 0 20px", color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.6 }}>
          <li>Coach you through every workout</li>
          <li>Track your fuel and progress</li>
          <li>Never need another app</li>
        </ul>
      </OnboardingShell>
    );
  }

  if (step === 1) {
    return (
      <OnboardingInterstitial
        step={step}
        title="Your transformation starts here"
        subtitle="Unlike trackers, Gymmy coaches you session by session based on what you actually did last time."
        onBack={goBack}
        onContinue={goNext}
      />
    );
  }

  if (step === 2) {
    return (
      <OnboardingShell
        step={step}
        title="What should we call you?"
        subtitle="Used in your Home greeting and coach notes."
        onBack={goBack}
        onContinue={goNext}
        continueLabel={displayName.trim() ? "Continue" : "Skip for now"}
        continueDisabled={!displayNameValid}
      >
        <div className="card" style={{ padding: 16 }}>
          <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            First name
            <input
              className="input"
              style={{ marginTop: 8 }}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jimmy"
              autoCapitalize="words"
              autoComplete="given-name"
              aria-label="First name"
            />
          </label>
        </div>
      </OnboardingShell>
    );
  }

  if (step === 3) {
    return (
      <OnboardingShell step={step} title="What's your gender?" subtitle="Used for calorie calculations." onBack={goBack} onContinue={goNext}>
        <div style={{ display: "flex", gap: 8 }}>
          {GENDERS.map((g) => (
            <OnboardingSegment key={g} selected={profile.gender === g} onClick={() => setProfile((p) => ({ ...p, gender: g }))}>
              {g === "male" ? "Male" : g === "female" ? "Female" : "Other"}
            </OnboardingSegment>
          ))}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 4) {
    return (
      <OnboardingShell
        step={step}
        title="When were you born?"
        subtitle="Used for calorie targets and age-appropriate recommendations."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!dobValid}
      >
        <div className="card" style={{ padding: 16 }}>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            Date of birth
            <input
              type="date"
              aria-label="Date of birth"
              value={profile.dateOfBirth ?? ""}
              max={localDateKey(new Date())}
              onChange={(e) => setProfile((p) => ({ ...p, dateOfBirth: e.target.value }))}
              style={{ display: "block", width: "100%", marginTop: 8, padding: 10, borderRadius: 10, border: "0.5px solid var(--border)", background: "#1A1A1A", color: "#fff" }}
            />
          </label>
          {!dobValid && profile.dateOfBirth ? (
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "rgba(248,113,113,0.9)" }}>Enter a valid date of birth (13+)</p>
          ) : null}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 5) {
    return (
      <OnboardingShell step={step} title="Choose your units" subtitle="Weight and height display across the app." onBack={goBack} onContinue={goNext}>
        <div className="card" style={{ padding: 20 }}>
          <UnitPreferencePicker value={unitPreferences} onChange={setUnitPreferences} />
        </div>
      </OnboardingShell>
    );
  }

  if (step === 6) {
    const hUnit = unitPreferences.heightUnit;
    const heightCm = Math.round(cmFromInches(profile.heightIn));
    const heightFt = Math.floor(profile.heightIn / 12);
    const heightInRem = Math.round(profile.heightIn % 12);

    return (
      <OnboardingShell
        step={step}
        title="How tall are you?"
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!heightValid}
      >
        <div className="card" style={{ padding: 16 }}>
          {hUnit === "cm" ? (
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              Height (cm)
              <input
                type="number"
                aria-label="Height in centimeters"
                value={heightCm}
                onChange={(e) => {
                  const inches = inchesFromCm(parseFloat(e.target.value));
                  if (inches != null) setProfile((p) => ({ ...p, heightIn: inches }));
                }}
                style={{ display: "block", width: "100%", marginTop: 8, padding: 10, borderRadius: 10, border: "0.5px solid var(--border)", background: "#1A1A1A", color: "#fff" }}
              />
            </label>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <label style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                Ft
                <input
                  type="number"
                  aria-label="Height feet"
                  value={heightFt}
                  onChange={(e) => {
                    const ft = parseInt(e.target.value, 10);
                    if (!Number.isFinite(ft)) return;
                    setProfile((p) => ({ ...p, heightIn: ft * 12 + (p.heightIn % 12) }));
                  }}
                  style={{ display: "block", width: "100%", marginTop: 8, padding: 10, borderRadius: 10, border: "0.5px solid var(--border)", background: "#1A1A1A", color: "#fff" }}
                />
              </label>
              <label style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                In
                <input
                  type="number"
                  aria-label="Height inches"
                  value={heightInRem}
                  onChange={(e) => {
                    const inch = parseInt(e.target.value, 10);
                    if (!Number.isFinite(inch)) return;
                    setProfile((p) => ({ ...p, heightIn: Math.floor(p.heightIn / 12) * 12 + inch }));
                  }}
                  style={{ display: "block", width: "100%", marginTop: 8, padding: 10, borderRadius: 10, border: "0.5px solid var(--border)", background: "#1A1A1A", color: "#fff" }}
                />
              </label>
            </div>
          )}
          {!heightValid ? (
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "rgba(248,113,113,0.9)" }}>Enter a height between 4&apos;0&quot; and 8&apos;0&quot;</p>
          ) : null}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 7) {
    const wUnit = unitPreferences.weightUnit;
    const weightDisplay = wUnit === "kg" ? profile.weightLbs / 2.2046226218 : profile.weightLbs;

    return (
      <OnboardingShell
        step={step}
        title="What's your current weight?"
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!weightValid}
      >
        <div className="card" style={{ padding: 16 }}>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            Weight ({wUnit})
            <input
              type="number"
              aria-label="Body weight"
              value={Number.isFinite(weightDisplay) ? Math.round(weightDisplay * 10) / 10 : ""}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                if (!Number.isFinite(n)) return;
                setProfile((p) => ({ ...p, weightLbs: parseWeightToLbs(n, wUnit) }));
              }}
              style={{ display: "block", width: "100%", marginTop: 8, padding: 10, borderRadius: 10, border: "0.5px solid var(--border)", background: "#1A1A1A", color: "#fff" }}
            />
          </label>
          {!weightValid ? (
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "rgba(248,113,113,0.9)" }}>Enter a weight between 70 and 450 lbs</p>
          ) : null}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 8) {
    return (
      <OnboardingShell step={step} title="What's your primary goal?" subtitle="Gymmy adjusts calories and coaching for your goal." onBack={goBack} onContinue={goNext}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {GOALS.map((g) => (
            <OnboardingSegment key={g} selected={profile.goal === g} onClick={() => setProfile((p) => ({ ...p, goal: g }))}>
              {g === "cut" ? "Lose weight" : g === "bulk" ? "Build muscle" : "Maintain and perform"}
            </OnboardingSegment>
          ))}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 9) {
    const wUnit = unitPreferences.weightUnit;
    const display =
      profile.goalWeightLbs != null ?
        wUnit === "kg" ?
          profile.goalWeightLbs / 2.2046226218
        : profile.goalWeightLbs
      : "";

    return (
      <OnboardingShell
        step={step}
        title="What's your goal weight?"
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!isGoalWeightValid(profile)}
      >
        <div className="card" style={{ padding: 16 }}>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            Goal weight ({wUnit})
            <input
              type="number"
              aria-label="Goal weight"
              value={display}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                if (!Number.isFinite(n)) return;
                setProfile((p) => ({ ...p, goalWeightLbs: parseWeightToLbs(n, wUnit) }));
              }}
              style={{ display: "block", width: "100%", marginTop: 8, padding: 10, borderRadius: 10, border: "0.5px solid var(--border)", background: "#1A1A1A", color: "#fff" }}
            />
          </label>
          {!isGoalWeightValid(profile) ? (
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "rgba(248,113,113,0.9)" }}>
              Goal weight should be {profile.goal === "cut" ? "5–80 lbs below" : "3–50 lbs above"} your current weight (min 3 lb difference).
            </p>
          ) : null}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 10) {
    return (
      <OnboardingShell step={step} title="How fast do you want to get there?" onBack={goBack} onContinue={goNext} continueDisabled={!paceValid}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PACES.map(({ value, label, hint }) => (
            <div key={value}>
              <OnboardingSegment selected={profile.pace === value} onClick={() => setProfile((p) => ({ ...p, pace: value }))}>
                {label}
              </OnboardingSegment>
              {hint && profile.pace === value ? (
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)", paddingLeft: 4 }}>{hint}</p>
              ) : null}
            </div>
          ))}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 11) {
    return (
      <OnboardingShell step={step} title="How active are you outside the gym?" onBack={goBack} onContinue={goNext}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ACTIVITY_LEVELS.map((level) => (
            <OnboardingSegment key={level} selected={profile.activityLevel === level} onClick={() => setProfile((p) => ({ ...p, activityLevel: level }))}>
              {activityLevelLabel(level)}
            </OnboardingSegment>
          ))}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 12) {
    return (
      <OnboardingShell step={step} title="What's your training experience?" subtitle="Rep ranges and starting weights in your templates." onBack={goBack} onContinue={goNext}>
        <div className="card" style={{ padding: 20 }}>
          <ExperienceLevelPicker value={experienceLevel} onChange={setExperienceLevel} />
        </div>
      </OnboardingShell>
    );
  }

  if (step === 13) {
    return (
      <OnboardingShell step={step} title="What equipment do you have?" subtitle="Exercises will match what you can perform." onBack={goBack} onContinue={goNext}>
        <div className="card" style={{ padding: 20 }}>
          <EquipmentSetupPicker value={equipmentSetup} onChange={setEquipmentSetup} />
        </div>
      </OnboardingShell>
    );
  }

  if (step === 14) {
    return (
      <OnboardingShell
        step={step}
        title="Which days can you train?"
        subtitle="Pick the days that work for your week."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!isTrainingScheduleValid(profile)}
      >
        <div className="card" style={{ padding: 20 }}>
          <WorkoutWeekCalendarPicker profile={profile} onChange={(next) => setProfile((p) => ({ ...p, ...next }))} />
        </div>
      </OnboardingShell>
    );
  }

  if (step === 15) {
    return (
      <OnboardingShell
        step={step}
        title="Here's your training plan"
        subtitle="Gymmy built this split from your schedule and experience."
        onBack={goBack}
        onContinue={goNext}
        onSecondary={goEditSplit}
        secondaryLabel="Edit"
      >
        <OnboardingSplitReveal templates={draftTemplates} />
      </OnboardingShell>
    );
  }

  if (step === 16) {
    return (
      <OnboardingShell
        step={step}
        title="Customize your program"
        subtitle="Reorder exercises, adjust targets, or swap moves."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!templatesValid}
      >
        <OnboardingTemplateReview templates={draftTemplates} onChange={setDraftTemplates} />
      </OnboardingShell>
    );
  }

  if (step === 17) {
    return (
      <OnboardingShell
        step={step}
        title="Your daily fuel plan"
        subtitle="Based on your stats and goal. Adjust if you know better."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!isMacrosValid(macros)}
      >
        <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
            Goal: {nutritionGoalLabel(profile.goal)} · {formatWeightFromLbs(profile.weightLbs, unitPreferences.weightUnit)} {unitPreferences.weightUnit}
            {profile.pace ? ` · ${profile.pace} pace` : ""}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            Mifflin–St Jeor TDEE with goal and pace adjustment (~{computedMacros.cal} kcal calculated).
          </p>
          {(["cal", "p", "c", "f"] as const).map((key) => (
            <label key={key} style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              {key === "cal" ? "Calories" : key === "p" ? "Protein (g)" : key === "c" ? "Carbs (g)" : "Fat (g)"}
              <input
                type="number"
                aria-label={key}
                value={macros[key]}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (Number.isFinite(n) && n >= 0) setMacros((m) => ({ ...m, [key]: n }));
                }}
                style={{ display: "block", width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "0.5px solid var(--border)", background: "#1A1A1A", color: "#fff" }}
              />
            </label>
          ))}
          <button
            type="button"
            className="tap"
            style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", background: "none", border: "none", textAlign: "left", padding: 0 }}
            onClick={() => setMacros(computedMacros)}
          >
            Reset to calculated values
          </button>
        </div>
      </OnboardingShell>
    );
  }

  if (step === 18) {
    return (
      <OnboardingInterstitial
        step={step}
        title="Protein is your #1 priority"
        subtitle="Hit your protein target every day and the rest handles itself."
        onBack={goBack}
        onContinue={goNext}
      />
    );
  }

  if (step === 19) {
    return (
      <OnboardingShell
        step={step}
        title="Stay on track"
        subtitle="Optional reminders. Pro feature when gated — collect preference now."
        onBack={goBack}
        onContinue={goNext}
      >
        <NotificationPreferencesPicker value={notificationPrefs} onChange={setNotificationPrefs} showPermissionHint />
        <p style={{ margin: "12px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          Add Gymmy to your home screen for the best notification experience.
        </p>
      </OnboardingShell>
    );
  }

  if (step === 20) {
    return (
      <OnboardingShell step={step} title="Building your coaching plan…" hideProgress hideFooter onContinue={() => {}}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
          {["Calculating targets", "Building your split", "Setting up your coach", "Ready"].map((label, i) => (
            <div key={label} style={{ fontSize: 14, color: i <= 2 ? "rgba(255,255,255,0.75)" : "rgba(74,222,128,0.9)", fontWeight: i === 3 ? 700 : 500 }}>
              {label}
              {i < 3 ? "…" : ""}
            </div>
          ))}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 21) {
    const name = displayName.trim() || "Friend";
    return (
      <OnboardingShell step={step} title={`${name}, your plan is ready`} onBack={goBack} onContinue={goNext} continueLabel="See my options">
        <OnboardingPlanReady displayName={displayName} macros={macros} profile={profile} templates={draftTemplates} />
      </OnboardingShell>
    );
  }

  return <OnboardingPaywall onSelectTier={(tier) => void finishWithTier(tier)} />;
}
