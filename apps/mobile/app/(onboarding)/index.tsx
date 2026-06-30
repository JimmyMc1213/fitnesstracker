import {
  canRevisitFutureYouPhoto,
  DEFAULT_UNIT_PREFERENCES,
  ONBOARDING_STEP_ACTIVITY,
  ONBOARDING_STEP_FUTURE_YOU_MOTIVATION,
  ONBOARDING_STEP_FUTURE_YOU_PHOTO,
  ONBOARDING_STEP_PACE,
  ONBOARDING_STEP_PAYWALL,
  ONBOARDING_STEP_FUTURE_YOU_SUCCESS,
} from "@newyouai/core";
import type { UserGender } from "@newyouai/types";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { DateOfBirthPicker } from "@/components/onboarding/DateOfBirthPicker";
import { FutureYouReadyBanner } from "@/components/onboarding/FutureYouReadyBanner";
import { NotificationPreferencesPicker } from "@/components/onboarding/NotificationPreferencesPicker";
import { OnboardingNotificationPrompt } from "@/components/onboarding/OnboardingNotificationPrompt";
import { OnboardingFutureYouSuccess } from "@/components/onboarding/OnboardingFutureYouSuccess";
import { OnboardingPaywall } from "@/components/onboarding/OnboardingPaywall";
import { OnboardingPurchaseWelcomeSplash } from "@/components/onboarding/OnboardingPurchaseWelcomeSplash";
import { OnboardingPlanReady } from "@/components/onboarding/OnboardingPlanReady";
import { FutureYouGenerationPill } from "@/components/onboarding/FutureYouGenerationPill";
import { OnboardingFutureYouMotivation } from "@/components/onboarding/OnboardingFutureYouMotivation";
import { OnboardingFutureYouPhoto } from "@/components/onboarding/OnboardingFutureYouPhoto";
import { OnboardingGoalWeightReinforcement } from "@/components/onboarding/OnboardingGoalWeightReinforcement";
import { OnboardingHeightInput } from "@/components/onboarding/OnboardingHeightInput";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { WeightRulerPicker } from "@/components/onboarding/WeightRulerPicker";
import { PacePicker } from "@/components/onboarding/PacePicker";
import { PrimaryGoalPicker } from "@/components/onboarding/PrimaryGoalPicker";
import { OnboardingPillStack, OnboardingSegment } from "@/components/onboarding/OnboardingSegment";
import { OnboardingStepPlaceholder } from "@/components/onboarding/OnboardingStepPlaceholder";
import { OnboardingThemePicker } from "@/components/onboarding/OnboardingThemePicker";
import { ScreenTransition, type NavDirection } from "@/components/motion/ScreenTransition";
import { EquipmentSetupPicker } from "@/components/onboarding/EquipmentSetupPicker";
import { ExperienceLevelPicker } from "@/components/onboarding/ExperienceLevelPicker";
import { OnboardingIconOptionPicker } from "@/components/onboarding/OnboardingIconOptionPicker";
import { OnboardingSplitReveal } from "@/components/onboarding/OnboardingSplitReveal";
import { OnboardingDailyFuelPlan } from "@/components/onboarding/OnboardingDailyFuelPlan";
import { OnboardingMacroEditConfirmSheet } from "@/components/onboarding/OnboardingMacroEditConfirmSheet";
import { OnboardingPlanBuilding } from "@/components/onboarding/OnboardingPlanBuilding";
import { ReferralSourcePicker } from "@/components/onboarding/ReferralSourcePicker";
import { UnitPreferencePicker } from "@/components/onboarding/UnitPreferencePicker";
import { GradientCard } from "@/components/ui/GradientCard";
import {
  isTrainingScheduleValid,
  WorkoutWeekCalendarPicker,
} from "@/components/onboarding/WorkoutWeekCalendarPicker";
import { useFutureYouGenerationPoll } from "@/hooks/useFutureYouGenerationPoll";
import { useFutureYouOnboarding } from "@/hooks/useFutureYouOnboarding";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { useFitnessState } from "@/context/FitnessContext";
import { stopOnboardingPreview } from "@/lib/devPreviewOnboarding";
import { finishOnboarding } from "@/lib/finishOnboarding";
import { canAccessFutureYouSuccessScreen } from "@/lib/futureYouSuccessModel";
import { useOnboardingWizard } from "@/hooks/useOnboardingWizard";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ACTIVITY_LEVELS, activityLevelLabel } from "@/lib/activityLevel";
import { isFutureYouPhotoBlocked } from "@/lib/futureYouAge";
import { isFutureYouReadyBannerVisible, isFutureYouGenerationPillVisible } from "@/lib/futureYouGenerationPillModel";
import { onboardingPlanReadyContinueLabel } from "@/lib/futureYouPaywallModel";
import { buildOnboardingPlanSnapshot } from "@/lib/onboardingPlanSnapshot";
import {
  anyNotificationEnabled,
  ONBOARDING_NOTIFICATION_DEFAULTS,
} from "@/lib/notificationPreferences";
import { requestNotificationPermission } from "@/lib/notificationPermission";
import { ageFromDateOfBirth } from "@/lib/onboardingProfile";
import { SESSION_LENGTH_OPTIONS } from "@/lib/workout/buildWeeklyRoutine";
import {
  clampGoalWeightLbs,
  defaultGoalWeightLbs,
  goalWeightDirectionLabel,
  goalWeightRangeLbs,
  isGoalWeightValid,
  normalizeGoalOnSelect,
} from "@/lib/goalWeight";
import { isUnitPreferencesComplete } from "@/lib/onboardingDefaults";
import {
  goalWeightReinforcementParts,
  goalWeightReinforcementSubtext,
  trainingScheduleReinforcementParts,
  trainingScheduleReinforcementSubtext,
} from "@/lib/onboardingReinforcementCopy";
import {
  DIETARY_RESTRICTIONS,
  ONBOARDING_BARRIERS,
  barrierIcon,
  barrierLabel,
  dietaryRestrictionIcon,
  dietaryRestrictionLabel,
  toggleDietaryRestriction,
  toggleSurveySelection,
  TRAINING_STYLES,
  trainingStyleIcon,
  trainingStyleLabel,
} from "@/lib/onboardingMotivationSurvey";
import { shouldConfirmMacroEditOnContinue } from "@/lib/onboardingMacroEdit";
import { isValidOnboardingDateOfBirth } from "@/lib/onboardingProfile";
import {
  calculateNutritionTargets,
  isMacrosValid,
  nutritionCalcInputFromOnboardingProfile,
} from "@/lib/nutritionCalculator";
import {
  onboardingScreenKey,
  parseOnboardingScreenKey,
  type OnboardingScreenLayerFlags,
} from "@/lib/onboardingScreenKey";
import {
  DEFAULT_ONBOARDING_CURRENT_WEIGHT_LBS,
  isValidOnboardingHeightIn,
  isValidWeighInLbs,
} from "@/lib/unitConversions";

const GENDERS: UserGender[] = ["male", "female", "other"];

function genderLabel(gender: UserGender): string {
  if (gender === "male") return "Male";
  if (gender === "female") return "Female";
  return "Other";
}

export default function OnboardingWizardScreen() {
  const { colors, theme, setTheme } = useAppTheme();
  const { ob } = useOnboardingTheme();
  const {
    hydrated,
    stepIndex,
    navDirection,
    profile,
    unitPreferences,
    draftTheme,
    displayName,
    goNext,
    goBack,
    goToStep,
    setProfile,
    setUnitPreferences,
    setDraftTheme,
    futureYou,
    patchFutureYou,
    experienceLevel,
    equipmentSetup,
    sessionLength,
    setExperienceLevel,
    setEquipmentSetup,
    setSessionLength,
    draftTemplates,
    macros,
    setMacros,
    notificationPrefs,
    setNotificationPrefs,
    subscriptionTier,
  } = useOnboardingWizard();

  const { setOnboardingComplete } = useOnboardingState();
  const { replaceFitnessState } = useFitnessState();
  const [finishingOnboarding, setFinishingOnboarding] = useState(false);
  const [showPurchaseWelcomeSplash, setShowPurchaseWelcomeSplash] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  const futureYouFlow = useFutureYouOnboarding({
    goToStep,
    patchFutureYou,
    futureYou,
    profile,
  });

  const [goalWeightReinforcement, setGoalWeightReinforcement] = useState(false);
  const [scheduleReinforcement, setScheduleReinforcement] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<NavDirection>("forward");
  const [macroContinueConfirmOpen, setMacroContinueConfirmOpen] = useState(false);
  const dobAge = profile.dateOfBirth ? ageFromDateOfBirth(profile.dateOfBirth) : null;

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

  const activeMacros = macros ?? computedMacros;

  const pollFutureYouEnabled =
    stepIndex >= ONBOARDING_STEP_ACTIVITY &&
    stepIndex <= ONBOARDING_STEP_FUTURE_YOU_SUCCESS &&
    isFutureYouGenerationPillVisible(futureYou);

  const generationPollStatus = useFutureYouGenerationPoll({
    futureYou: futureYou ?? {},
    pollEnabled: pollFutureYouEnabled,
    onFutureYouPatch: patchFutureYou,
    autoRetryOnFailure: true,
    onAutoRetry: futureYouFlow.retryFutureYouGeneration,
  });

  const generationPill = useMemo(() => {
    if (!pollFutureYouEnabled) {
      return undefined;
    }
    return (
      <FutureYouGenerationPill
        status={generationPollStatus}
        retrying={futureYou?.generationRetrying}
        motivationId={futureYou?.motivationId}
        goal={profile.goal ?? "maintain"}
        gender={profile.gender ?? "other"}
      />
    );
  }, [
    pollFutureYouEnabled,
    generationPollStatus,
    futureYou?.generationRetrying,
    futureYou?.motivationId,
    profile.goal,
    profile.gender,
  ]);

  const activeTheme = draftTheme ?? theme;
  const dobValid = isValidOnboardingDateOfBirth(profile.dateOfBirth);

  const prevStepIndexRef = useRef(stepIndex);

  // Keep the slide direction in lock-step with navigation. We sync during render
  // (not in an effect) so `transitionDirection` is already correct on the SAME
  // render the active screen changes — an effect lags one render behind and makes
  // the transition play the previous navigation's direction (e.g. a back press
  // animating forward). Reinforcement sub-steps set their own direction directly;
  // those are preserved here because navDirection doesn't change for flag toggles.
  const [prevNavDirection, setPrevNavDirection] = useState<NavDirection>(navDirection);
  if (navDirection !== prevNavDirection) {
    setPrevNavDirection(navDirection);
    setTransitionDirection(navDirection);
  }

  useEffect(() => {
    const prevStep = prevStepIndexRef.current;
    prevStepIndexRef.current = stepIndex;

    if (stepIndex === 9 && prevStep > 9) {
      setGoalWeightReinforcement(false);
    }
    if (stepIndex === 15 && prevStep > 15) {
      setScheduleReinforcement(false);
    }
  }, [stepIndex]);

  useEffect(() => {
    if (stepIndex !== 9) return;
    if (profile.goal === "maintain") return;
    if (profile.goalWeightLbs != null) return;
    setProfile((p) => ({
      ...p,
      goalWeightLbs: defaultGoalWeightLbs(p.goal as "cut" | "bulk", p.weightLbs),
    }));
  }, [stepIndex, profile.goal, profile.goalWeightLbs, profile.weightLbs, setProfile]);

  useEffect(() => {
    if (stepIndex !== ONBOARDING_STEP_FUTURE_YOU_SUCCESS) return;
    const pollStatus = futureYou?.generationStatus ?? "idle";
    const futureYouBlocked = isFutureYouPhotoBlocked(dobAge);
    if (!canAccessFutureYouSuccessScreen(futureYou, futureYouBlocked, pollStatus, subscriptionTier)) {
      goToStep(ONBOARDING_STEP_PAYWALL, { subscriptionTier: null });
    }
  }, [stepIndex, futureYou, dobAge, subscriptionTier, goToStep]);

  useEffect(() => {
    if (!hydrated || activeTheme === theme) return;
    setTheme(activeTheme);
  }, [hydrated, activeTheme, theme, setTheme]);

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  function renderOnboardingStep(forStep: number, layerFlags: OnboardingScreenLayerFlags): ReactNode {
  if (forStep === 1) {
    return (
      <OnboardingThemePicker
        step={forStep}
        value={draftTheme ?? theme}
        onChange={(nextTheme) => {
          setDraftTheme(nextTheme);
          setTheme(nextTheme);
        }}
        onContinue={() => {
          const selected = draftTheme ?? theme;
          setTheme(selected);
          goToStep(2, { theme: selected });
        }}
      />
    );
  }

  if (forStep === 2) {
    return (
      <OnboardingShell
        step={forStep}
        title="What's your gender?"
        subtitle="This will be used to calibrate your custom plan."
        scrollEnabled={false}
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!profile.gender}
        testID="onboarding-step-2"
      >
        <OnboardingPillStack>
          {GENDERS.map((g) => (
            <OnboardingSegment
              key={g}
              testID={`onboarding-gender-${g}`}
              selected={profile.gender === g}
              onPress={() => setProfile((p) => ({ ...p, gender: g }))}
            >
              {genderLabel(g)}
            </OnboardingSegment>
          ))}
        </OnboardingPillStack>
      </OnboardingShell>
    );
  }

  if (forStep === 3) {
    return (
      <OnboardingShell
        step={forStep}
        title="When were you born?"
        subtitle="This will be used to calibrate your custom plan."
        scrollEnabled={false}
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!dobValid}
        testID="onboarding-step-3"
      >
        <DateOfBirthPicker
          value={profile.dateOfBirth}
          onChange={(dateOfBirth) => setProfile((p) => ({ ...p, dateOfBirth }))}
        />
        {!dobValid && profile.dateOfBirth ? (
          <Text className="mt-3 text-center text-sm" style={{ color: "#f87171" }}>
            Enter a valid date of birth (13+)
          </Text>
        ) : null}
      </OnboardingShell>
    );
  }

  if (forStep === 4) {
    return (
      <OnboardingShell
        step={forStep}
        title="Where did you hear about us?"
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!profile.referralSource}
        testID="onboarding-step-4"
      >
        <ReferralSourcePicker
          value={profile.referralSource}
          onChange={(referralSource) => setProfile((p) => ({ ...p, referralSource }))}
        />
      </OnboardingShell>
    );
  }

  if (forStep === 5) {
    return (
      <OnboardingShell
        step={forStep}
        title="Choose your units"
        subtitle="Weight, height, and volume display across the app."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!isUnitPreferencesComplete(unitPreferences)}
        testID="onboarding-step-5"
      >
        <UnitPreferencePicker value={unitPreferences} onChange={setUnitPreferences} />
      </OnboardingShell>
    );
  }

  if (forStep === 6) {
    const hUnit = unitPreferences.heightUnit ?? DEFAULT_UNIT_PREFERENCES.heightUnit;
    const heightStepValid = isValidOnboardingHeightIn(profile.heightIn);

    return (
      <OnboardingShell
        step={forStep}
        title="How tall are you?"
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!heightStepValid}
        testID="onboarding-step-6"
      >
        <GradientCard spacious>
          <OnboardingHeightInput
            unit={hUnit}
            heightIn={profile.heightIn}
            resetKey={hUnit}
            onHeightChange={(heightIn) => setProfile((p) => ({ ...p, heightIn }))}
          />
          {!heightStepValid ? (
            <Text className="mt-2.5 text-sm" style={{ color: "#f87171" }}>
              Enter a height between 4&apos;0&quot; and 8&apos;0&quot;
            </Text>
          ) : null}
        </GradientCard>
      </OnboardingShell>
    );
  }

  if (forStep === 7) {
    const wUnit = unitPreferences.weightUnit ?? DEFAULT_UNIT_PREFERENCES.weightUnit;
    const weightStepValid = isValidWeighInLbs(profile.weightLbs);
    const currentWeightLbs = isValidWeighInLbs(profile.weightLbs)
      ? profile.weightLbs
      : DEFAULT_ONBOARDING_CURRENT_WEIGHT_LBS;

    return (
      <OnboardingShell
        step={forStep}
        title="What's your current weight?"
        subtitle="Slide the ruler to set your weight."
        scrollEnabled={false}
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!weightStepValid}
        testID="onboarding-step-7"
      >
        <WeightRulerPicker
          valueLbs={currentWeightLbs}
          minLbs={70}
          maxLbs={450}
          unit={wUnit}
          directionLabel="Current weight"
          onChange={(weightLbs) => setProfile((p) => ({ ...p, weightLbs, goalWeightLbs: undefined }))}
        />
      </OnboardingShell>
    );
  }

  if (forStep === 8) {
    return (
      <OnboardingShell
        step={forStep}
        title="What's your primary goal?"
        subtitle="NewYou adjusts calories and coaching for your goal."
        scrollEnabled={false}
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!profile.goal}
        testID="onboarding-step-8"
      >
        <PrimaryGoalPicker
          value={profile.goal}
          onChange={(goal) => setProfile((p) => normalizeGoalOnSelect(p, goal))}
        />
      </OnboardingShell>
    );
  }

  if (forStep === 9 && profile.goal && profile.goal !== "maintain") {
    const wUnit = unitPreferences.weightUnit ?? DEFAULT_UNIT_PREFERENCES.weightUnit;
    const goal = profile.goal;
    const { minLbs, maxLbs } = goalWeightRangeLbs(goal, profile.weightLbs);
    const valueLbs = clampGoalWeightLbs(
      profile.goalWeightLbs ?? defaultGoalWeightLbs(goal, profile.weightLbs),
      minLbs,
      maxLbs,
    );
    const reinforcement = goalWeightReinforcementParts(profile, wUnit ?? "lbs");
    const showGoalWeightReinforcement = layerFlags.goalWeightReinforcement;
    const goalWeightValid = isGoalWeightValid(profile, profile.weightLbs);

    return (
      <OnboardingShell
        step={forStep}
        title={showGoalWeightReinforcement ? "" : "What is your desired weight?"}
        hideTitle={showGoalWeightReinforcement}
        contentCentered={showGoalWeightReinforcement}
        onBack={() => {
          if (showGoalWeightReinforcement) {
            setTransitionDirection("back");
            setGoalWeightReinforcement(false);
            return;
          }
          goBack();
        }}
        onContinue={() => {
          if (!showGoalWeightReinforcement) {
            if (!goalWeightValid) return;
            setTransitionDirection("forward");
            setGoalWeightReinforcement(true);
            return;
          }
          goNext();
        }}
        continueDisabled={!showGoalWeightReinforcement && !goalWeightValid}
        testID={showGoalWeightReinforcement ? "onboarding-step-9-reinforcement" : "onboarding-step-9"}
      >
        {showGoalWeightReinforcement ? (
          <OnboardingGoalWeightReinforcement
            headline={
              <Text>
                {reinforcement.verb}{" "}
                <Text style={{ color: ob.gold }}>{reinforcement.delta}</Text>
                {reinforcement.tail}
              </Text>
            }
            subtext={goalWeightReinforcementSubtext()}
          />
        ) : (
          <WeightRulerPicker
            valueLbs={valueLbs}
            minLbs={minLbs}
            maxLbs={maxLbs}
            unit={wUnit}
            directionLabel={goalWeightDirectionLabel(goal)}
            onChange={(goalWeightLbs) => setProfile((p) => ({ ...p, goalWeightLbs }))}
          />
        )}
      </OnboardingShell>
    );
  }

  if (forStep === ONBOARDING_STEP_PACE) {
    return (
      <OnboardingShell
        step={forStep}
        title="How fast do you want to get there?"
        subtitle="Honest answer. We'll set the plan in the real world."
        scrollEnabled={false}
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!profile.pace}
        testID="onboarding-step-10"
      >
        <PacePicker
          value={profile.pace}
          onChange={(pace) => setProfile((p) => ({ ...p, pace }))}
        />
      </OnboardingShell>
    );
  }

  if (forStep === ONBOARDING_STEP_FUTURE_YOU_PHOTO) {
    return (
      <OnboardingShell
        step={forStep}
        title={
          <Text className="text-[36px] font-bold leading-tight" style={{ color: colors.textPrimary }}>
            See your <Text style={{ color: ob.gold }}>New You</Text>
          </Text>
        }
        onBack={goBack}
        onContinue={goNext}
        hideContinue
        compactFooter
        contentFill
        footerGhostAction={{ label: "Skip for now", onPress: futureYouFlow.skipFutureYouPhoto }}
        testID="onboarding-step-100"
      >
        <OnboardingFutureYouPhoto
          gender={profile.gender}
          age={dobAge}
          photoPreview={futureYouFlow.photoPreview}
          photoSaved={Boolean(futureYou?.photoStoragePath && !futureYouFlow.photoPreview)}
          photoAiConsentAt={futureYou?.photoAiConsentAt}
          uploading={futureYouFlow.uploading}
          uploadError={futureYouFlow.uploadError}
          onPickFromCamera={futureYouFlow.pickFromCamera}
          onPickFromGallery={futureYouFlow.pickFromGallery}
          onConfirmPhoto={() => void futureYouFlow.continueFutureYouPhoto()}
          onRetryUpload={() => void futureYouFlow.continueFutureYouPhoto()}
          onClearPhoto={futureYouFlow.clearPhoto}
          onGrantAiConsent={futureYouFlow.grantAiConsent}
        />
      </OnboardingShell>
    );
  }

  if (forStep === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION) {
    const gender = profile.gender ?? "other";

    return (
      <OnboardingShell
        step={forStep}
        title="What's your why?"
        subtitle="Pick one focus, we'll personalize your Future You while you finish onboarding."
        onBack={goBack}
        onContinue={() => void futureYouFlow.continueFutureYouMotivation()}
        continueDisabled={!futureYou?.motivationId || futureYouFlow.generating}
        continueLabel={futureYouFlow.generating ? "Starting…" : "Continue"}
        testID="onboarding-step-101"
      >
        <OnboardingFutureYouMotivation
          goal={profile.goal ?? "maintain"}
          gender={gender}
          selectedId={futureYou?.motivationId}
          onSelect={futureYouFlow.selectMotivation}
        />
        {futureYouFlow.generateError ? (
          <Text className="mt-3 text-center text-sm" style={{ color: "#f87171" }}>
            {futureYouFlow.generateError}
          </Text>
        ) : null}
      </OnboardingShell>
    );
  }

  if (forStep === ONBOARDING_STEP_ACTIVITY) {
    const showBackToPhoto = canRevisitFutureYouPhoto(futureYou);

    return (
      <OnboardingShell
        step={forStep}
        title="How active are you outside the gym?"
        subtitle="Helps us size your daily fuel targets."
        scrollEnabled={false}
        onBack={showBackToPhoto ? goBack : undefined}
        onContinue={goNext}
        continueDisabled={!profile.activityLevel}
        generationPill={generationPill}
        testID="onboarding-step-11"
      >
        <OnboardingPillStack>
          {ACTIVITY_LEVELS.map((level) => (
            <OnboardingSegment
              key={level}
              selected={profile.activityLevel === level}
              onPress={() => setProfile((p) => ({ ...p, activityLevel: level }))}
            >
              {activityLevelLabel(level)}
            </OnboardingSegment>
          ))}
        </OnboardingPillStack>
      </OnboardingShell>
    );
  }

  if (forStep === 12) {
    return (
      <OnboardingShell
        step={forStep}
        title="What's your training experience?"
        subtitle="Rep ranges and starting weights in your templates."
        scrollEnabled={false}
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!experienceLevel}
        generationPill={generationPill}
        testID="onboarding-step-12"
      >
        <ExperienceLevelPicker value={experienceLevel} onChange={setExperienceLevel} />
      </OnboardingShell>
    );
  }

  if (forStep === 13) {
    return (
      <OnboardingShell
        step={forStep}
        title="What equipment do you have?"
        subtitle="Exercises will match what you can perform."
        scrollEnabled={false}
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!equipmentSetup}
        generationPill={generationPill}
        testID="onboarding-step-13"
      >
        <EquipmentSetupPicker value={equipmentSetup} onChange={setEquipmentSetup} />
      </OnboardingShell>
    );
  }

  if (forStep === 14) {
    return (
      <OnboardingShell
        step={forStep}
        title="How long do you want to train?"
        subtitle="We'll size your workouts to fit your session."
        scrollEnabled={false}
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!sessionLength}
        generationPill={generationPill}
        testID="onboarding-step-14"
      >
        <OnboardingPillStack>
          {SESSION_LENGTH_OPTIONS.map(({ value, label }) => (
            <OnboardingSegment
              key={value}
              selected={sessionLength === value}
              onPress={() => setSessionLength(value)}
            >
              {label}
            </OnboardingSegment>
          ))}
        </OnboardingPillStack>
      </OnboardingShell>
    );
  }

  if (forStep === 15) {
    const workoutDays =
      profile.workoutDaysPerWeek ?? profile.trainingWeekdays?.length ?? 0;
    const scheduleReinforcementCopy = trainingScheduleReinforcementParts(workoutDays);
    const showScheduleReinforcement = layerFlags.scheduleReinforcement;

    return (
      <OnboardingShell
        step={forStep}
        title={showScheduleReinforcement ? "" : "Which days can you train?"}
        hideTitle={showScheduleReinforcement}
        subtitle={showScheduleReinforcement ? undefined : "Pick the days that work for your week."}
        contentCentered={showScheduleReinforcement}
        scrollEnabled={false}
        onBack={() => {
          if (showScheduleReinforcement) {
            setTransitionDirection("back");
            setScheduleReinforcement(false);
            return;
          }
          goBack();
        }}
        onContinue={() => {
          if (!showScheduleReinforcement) {
            if (!isTrainingScheduleValid(profile)) return;
            setTransitionDirection("forward");
            setScheduleReinforcement(true);
            return;
          }
          goNext();
        }}
        continueDisabled={!showScheduleReinforcement && !isTrainingScheduleValid(profile)}
        generationPill={generationPill}
        testID={showScheduleReinforcement ? "onboarding-step-15-reinforcement" : "onboarding-step-15"}
      >
        {showScheduleReinforcement ? (
          <OnboardingGoalWeightReinforcement
            headline={
              <Text>
                {scheduleReinforcementCopy.verb}{" "}
                <Text style={{ color: ob.gold }}>
                  {scheduleReinforcementCopy.accentBeforeWeek}
                  {"\n"}
                  {scheduleReinforcementCopy.accentWeek}
                </Text>
                {scheduleReinforcementCopy.tail}
              </Text>
            }
            subtext={trainingScheduleReinforcementSubtext()}
          />
        ) : (
          <GradientCard padding={16}>
            <WorkoutWeekCalendarPicker
              profile={profile}
              onChange={(next) => setProfile((p) => ({ ...p, ...next }))}
            />
          </GradientCard>
        )}
      </OnboardingShell>
    );
  }

  if (forStep === 17) {
    const barrierOptions = ONBOARDING_BARRIERS.map((id) => ({
      id,
      label: barrierLabel(id),
      icon: barrierIcon(id),
    }));

    return (
      <OnboardingShell
        step={forStep}
        title="What's held you back before?"
        subtitle="Be honest. NewYou is built around your answer"
        scrollEnabled={false}
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!profile.barriers?.length}
        generationPill={generationPill}
        testID="onboarding-step-17"
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

  if (forStep === 18) {
    const restrictionOptions = DIETARY_RESTRICTIONS.map((id) => ({
      id,
      label: dietaryRestrictionLabel(id),
      icon: dietaryRestrictionIcon(id),
    }));

    return (
      <OnboardingShell
        step={forStep}
        title="Any foods you avoid?"
        subtitle="We'll keep your nutrition suggestions on track"
        contentCentered
        scrollEnabled={false}
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!profile.dietaryRestrictions?.length}
        generationPill={generationPill}
        testID="onboarding-step-18"
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

  if (forStep === 20) {
    return (
      <OnboardingPlanBuilding
        onComplete={() => {
          setMacros(computedMacros);
          goToStep(21, { macros: computedMacros });
        }}
      />
    );
  }

  if (forStep === 21) {
    const pollStatus = futureYou?.generationStatus ?? "idle";

    return (
      <>
        <OnboardingShell
          step={forStep}
          title="Your fuel targets"
          subtitle="NewYou calculated these from your stats and goal. Tap any number to adjust."
          onBack={goBack}
          onContinue={() => {
            if (
              shouldConfirmMacroEditOnContinue(activeMacros, computedMacros, futureYou, pollStatus)
            ) {
              setMacroContinueConfirmOpen(true);
              return;
            }
            goToStep(22, { macros: activeMacros });
          }}
          continueDisabled={!isMacrosValid(activeMacros)}
          generationPill={generationPill}
          testID="onboarding-step-21"
        >
          <OnboardingDailyFuelPlan
            macros={activeMacros}
            computedMacros={computedMacros}
            onChangeMacros={setMacros}
            onReset={() => setMacros(computedMacros)}
          />
        </OnboardingShell>
        {macroContinueConfirmOpen ? (
          <OnboardingMacroEditConfirmSheet
            onCancel={() => setMacroContinueConfirmOpen(false)}
            onConfirm={() => {
              setMacroContinueConfirmOpen(false);
              goToStep(22, { macros: activeMacros });
            }}
          />
        ) : null}
      </>
    );
  }

  if (forStep === 22) {
    return (
      <OnboardingShell
        step={forStep}
        title=""
        hideTitle
        contentCentered
        onBack={goBack}
        onContinue={() => goToStep(23, { macros: activeMacros })}
        continueLabel="Show training plan"
        generationPill={generationPill}
        testID="onboarding-step-22"
      >
        <OnboardingGoalWeightReinforcement
          headline={
            <Text>
              <Text style={{ color: ob.gold }}>Protein</Text> is your{"\n"}
              <Text style={{ color: ob.gold }}>#1</Text> priority
            </Text>
          }
          subtext={`Hit ${activeMacros.p}g daily. Consistent protein protects muscle.`}
        />
      </OnboardingShell>
    );
  }

  if (forStep === 23) {
    const templates = draftTemplates ?? [];

    return (
      <OnboardingShell
        step={forStep}
        title="Here's your training plan"
        subtitle="NewYou built this from your schedule and experience. You can edit your workouts anytime in the app."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={templates.length === 0}
        continueLabel="Let's go"
        generationPill={generationPill}
        testID="onboarding-step-23"
      >
        <OnboardingSplitReveal templates={templates} />
      </OnboardingShell>
    );
  }

  if (forStep === 24) {
    return (
      <OnboardingShell
        step={forStep}
        title=""
        hideTitle
        contentCentered
        generationPill={generationPill}
        onBack={goBack}
        onContinue={() => goToStep(25)}
        hideFooter
        testID="onboarding-step-24"
      >
        <OnboardingNotificationPrompt onChoice={() => goToStep(25)} />
      </OnboardingShell>
    );
  }

  if (forStep === 25) {
    const remindersEnabled = anyNotificationEnabled(notificationPrefs);

    function skipReminders() {
      setNotificationPrefs({ ...ONBOARDING_NOTIFICATION_DEFAULTS });
      goToStep(26, { notificationPrefs: { ...ONBOARDING_NOTIFICATION_DEFAULTS } });
    }

    async function continueFromReminders() {
      if (remindersEnabled) {
        await requestNotificationPermission();
      }
      goNext();
    }

    return (
      <OnboardingShell
        step={forStep}
        title="Stay on track"
        subtitle="NewYou works best when it knows your schedule. Totally optional, change anytime"
        onBack={goBack}
        onContinue={remindersEnabled ? continueFromReminders : skipReminders}
        continueLabel={remindersEnabled ? "Set up notifications" : "Skip for now"}
        continueTone="dark"
        footerGhostAction={remindersEnabled ? { label: "Skip for now", onPress: skipReminders } : undefined}
        generationPill={generationPill}
        testID="onboarding-step-25"
      >
        <NotificationPreferencesPicker
          value={notificationPrefs}
          onChange={setNotificationPrefs}
          variant="onboarding"
        />
      </OnboardingShell>
    );
  }

  if (forStep === 26) {
    const name = displayName.trim() || "Friend";
    const templates = draftTemplates ?? [];
    const pollStatus = futureYou?.generationStatus ?? "idle";
    const futureYouBlocked = isFutureYouPhotoBlocked(dobAge);
    const showFutureYouReadyBanner = isFutureYouReadyBannerVisible(futureYou, pollStatus);
    const planSnapshot = buildOnboardingPlanSnapshot({
      displayName: name,
      macros: activeMacros,
      profile,
      templates,
      volumeUnit: isUnitPreferencesComplete(unitPreferences) ? unitPreferences.volumeUnit : "oz",
    });

    return (
      <OnboardingShell
        step={forStep}
        title={`${name}, your plan is ready`}
        headlineClassName="text-[28px] font-bold leading-tight tracking-tight"
        subtitle="Everything is set. Your coach is ready when you are."
        subtitleClassName="mt-1 text-[16px] font-normal leading-snug"
        onBack={goBack}
        onContinue={() => goToStep(ONBOARDING_STEP_PAYWALL)}
        continueLabel={onboardingPlanReadyContinueLabel(futureYou, futureYouBlocked)}
        continueTone="gold"
        compactFooter
        testID="onboarding-step-26"
      >
        {showFutureYouReadyBanner ? <FutureYouReadyBanner /> : null}
        <OnboardingPlanReady planSnapshot={planSnapshot} />
      </OnboardingShell>
    );
  }

  if (forStep === ONBOARDING_STEP_PAYWALL) {
    const name = displayName.trim() || "Friend";
    const templates = draftTemplates ?? [];
    const pollStatus = futureYou?.generationStatus ?? "idle";
    const futureYouBlocked = isFutureYouPhotoBlocked(dobAge);
    const planSnapshot = buildOnboardingPlanSnapshot({
      displayName: name,
      macros: activeMacros,
      profile,
      templates,
      volumeUnit: isUnitPreferencesComplete(unitPreferences) ? unitPreferences.volumeUnit : "oz",
    });

    return (
      <OnboardingPaywall
        planSnapshot={planSnapshot}
        futureYou={futureYou}
        generationStatus={pollStatus}
        photoBlocked={futureYouBlocked}
        weightUnit={unitPreferences.weightUnit ?? "lbs"}
        onBack={goBack}
        onReuploadFutureYou={() =>
          futureYouFlow.startFutureYouReupload(ONBOARDING_STEP_PAYWALL)
        }
        onPurchaseStart={() => {
          setPurchaseComplete(false);
          setShowPurchaseWelcomeSplash(true);
        }}
        onPurchaseSuccess={() => {
          setPurchaseComplete(true);
          goToStep(ONBOARDING_STEP_FUTURE_YOU_SUCCESS, { subscriptionTier: "pro" });
        }}
        onPurchaseError={() => {
          setShowPurchaseWelcomeSplash(false);
          setPurchaseComplete(false);
        }}
      />
    );
  }

  if (forStep === ONBOARDING_STEP_FUTURE_YOU_SUCCESS && subscriptionTier === "pro") {
    const name = displayName.trim() || "Friend";
    const templates = draftTemplates ?? [];
    const pollStatus = futureYou?.generationStatus ?? "idle";
    const futureYouBlocked = isFutureYouPhotoBlocked(dobAge);
    const planSnapshot = buildOnboardingPlanSnapshot({
      displayName: name,
      macros: activeMacros,
      profile,
      templates,
      volumeUnit: isUnitPreferencesComplete(unitPreferences) ? unitPreferences.volumeUnit : "oz",
    });
    const activeTheme = draftTheme ?? theme;

    async function handleFinishOnboarding() {
      if (
        !experienceLevel ||
        !equipmentSetup ||
        !sessionLength ||
        !draftTemplates?.length ||
        !isUnitPreferencesComplete(unitPreferences)
      ) {
        return;
      }
      setFinishingOnboarding(true);
      try {
        const nextState = await finishOnboarding({
          displayName: name,
          profile,
          unitPreferences,
          experienceLevel,
          equipmentSetup,
          sessionLength,
          draftTemplates: templates,
          macros: activeMacros,
          notificationPrefs,
          subscriptionTier: "pro",
          theme: activeTheme,
          futureYou,
        });
        replaceFitnessState(nextState);
        await setOnboardingComplete(true);
        stopOnboardingPreview();
        router.replace("/(tabs)/home");
      } finally {
        setFinishingOnboarding(false);
      }
    }

    return (
      <OnboardingFutureYouSuccess
        planSnapshot={planSnapshot}
        futureYou={futureYou}
        generationStatus={pollStatus}
        photoBlocked={futureYouBlocked}
        subscriptionTier="pro"
        displayName={name}
        weightUnit={unitPreferences.weightUnit ?? "lbs"}
        onContinue={() => void handleFinishOnboarding()}
        onBack={goBack}
        continuing={finishingOnboarding}
        onReported={(jobId) => patchFutureYou({ reportedJobId: jobId })}
        onReupload={() =>
          futureYouFlow.startFutureYouReupload(ONBOARDING_STEP_FUTURE_YOU_SUCCESS)
        }
      />
    );
  }

  if (forStep === 19) {
    const styleOptions = TRAINING_STYLES.map((id) => ({
      id,
      label: trainingStyleLabel(id),
      icon: trainingStyleIcon(id),
    }));

    return (
      <OnboardingShell
        step={forStep}
        title="How do you train best?"
        subtitle="Your coach will match your style from day one"
        scrollEnabled={false}
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!profile.trainingStyle}
        generationPill={generationPill}
        testID="onboarding-step-19"
      >
        <OnboardingIconOptionPicker
          options={styleOptions}
          selected={profile.trainingStyle}
          onToggle={(id) => setProfile((p) => ({ ...p, trainingStyle: id }))}
        />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step={forStep}
      title="Onboarding"
      onBack={forStep > 0 ? goBack : undefined}
      onContinue={goNext}
      generationPill={generationPill}
    >
      <OnboardingStepPlaceholder step={forStep} goal={profile.goal} />
    </OnboardingShell>
  );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenTransition
        activeKey={onboardingScreenKey(stepIndex, {
          goalWeightReinforcement,
          scheduleReinforcement,
          templateReview: false,
        })}
        variant="stack"
        direction={transitionDirection}
      >
        {(key) => {
          const parsed = parseOnboardingScreenKey(key);
          return renderOnboardingStep(parsed.step, parsed);
        }}
      </ScreenTransition>
      {showPurchaseWelcomeSplash ? (
        <OnboardingPurchaseWelcomeSplash
          purchaseComplete={purchaseComplete}
          onComplete={() => {
            setShowPurchaseWelcomeSplash(false);
            setPurchaseComplete(false);
          }}
        />
      ) : null}
    </View>
  );
}
