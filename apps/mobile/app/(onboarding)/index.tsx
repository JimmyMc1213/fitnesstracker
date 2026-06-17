import {
  canRevisitFutureYouPhoto,
  ONBOARDING_STEP_ACTIVITY,
  ONBOARDING_STEP_FUTURE_YOU_MOTIVATION,
  ONBOARDING_STEP_FUTURE_YOU_PHOTO,
  ONBOARDING_STEP_PACE,
  ONBOARDING_STEP_PAYWALL,
  ONBOARDING_STEP_FUTURE_YOU_SUCCESS,
} from "@newyouai/core";
import type { UserGender } from "@newyouai/types";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { DateOfBirthPicker } from "@/components/onboarding/DateOfBirthPicker";
import { FutureYouReadyBanner } from "@/components/onboarding/FutureYouReadyBanner";
import { NotificationPreferencesPicker } from "@/components/onboarding/NotificationPreferencesPicker";
import { OnboardingNotificationPrompt } from "@/components/onboarding/OnboardingNotificationPrompt";
import { OnboardingFutureYouSuccess } from "@/components/onboarding/OnboardingFutureYouSuccess";
import { OnboardingPaywall } from "@/components/onboarding/OnboardingPaywall";
import { OnboardingPlanReady } from "@/components/onboarding/OnboardingPlanReady";
import { FutureYouGenerationPill } from "@/components/onboarding/FutureYouGenerationPill";
import { OnboardingFutureYouMotivation } from "@/components/onboarding/OnboardingFutureYouMotivation";
import { OnboardingFutureYouPhoto } from "@/components/onboarding/OnboardingFutureYouPhoto";
import { OnboardingGoalWeightReinforcement } from "@/components/onboarding/OnboardingGoalWeightReinforcement";
import { OnboardingHeightInput } from "@/components/onboarding/OnboardingHeightInput";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingWeightInput } from "@/components/onboarding/OnboardingWeightInput";
import { PacePicker } from "@/components/onboarding/PacePicker";
import { PrimaryGoalPicker } from "@/components/onboarding/PrimaryGoalPicker";
import { OnboardingPillStack, OnboardingSegment } from "@/components/onboarding/OnboardingSegment";
import { OnboardingStepPlaceholder } from "@/components/onboarding/OnboardingStepPlaceholder";
import { OnboardingThemePicker } from "@/components/onboarding/OnboardingThemePicker";
import { OnboardingWelcomeScreen } from "@/components/onboarding/OnboardingWelcomeScreen";
import { EquipmentSetupPicker } from "@/components/onboarding/EquipmentSetupPicker";
import { ExperienceLevelPicker } from "@/components/onboarding/ExperienceLevelPicker";
import { OnboardingIconOptionPicker } from "@/components/onboarding/OnboardingIconOptionPicker";
import { OnboardingSplitReveal } from "@/components/onboarding/OnboardingSplitReveal";
import { OnboardingDailyFuelPlan } from "@/components/onboarding/OnboardingDailyFuelPlan";
import { OnboardingMacroEditConfirmSheet } from "@/components/onboarding/OnboardingMacroEditConfirmSheet";
import { OnboardingPlanBuilding } from "@/components/onboarding/OnboardingPlanBuilding";
import { OnboardingTemplateReview } from "@/components/onboarding/OnboardingTemplateReview";
import { ReferralSourcePicker } from "@/components/onboarding/ReferralSourcePicker";
import { UnitPreferencePicker } from "@/components/onboarding/UnitPreferencePicker";
import {
  isTrainingScheduleValid,
  WorkoutWeekCalendarPicker,
} from "@/components/onboarding/WorkoutWeekCalendarPicker";
import { useFutureYouGenerationPoll } from "@/hooks/useFutureYouGenerationPoll";
import { useFutureYouOnboarding } from "@/hooks/useFutureYouOnboarding";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { stopOnboardingPreview } from "@/lib/devPreviewOnboarding";
import { finishOnboarding } from "@/lib/finishOnboarding";
import { canAccessFutureYouSuccessScreen } from "@/lib/futureYouSuccessModel";
import { useOnboardingWizard } from "@/hooks/useOnboardingWizard";
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
import {
  goalWeightReinforcementParts,
  goalWeightReinforcementSubtext,
} from "@/lib/onboardingReinforcementCopy";
import {
  DIETARY_RESTRICTIONS,
  dietaryRestrictionEmoji,
  dietaryRestrictionLabel,
  toggleDietaryRestriction,
  TRAINING_STYLES,
  trainingStyleEmoji,
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
  const {
    hydrated,
    stepIndex,
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
    setDraftTemplates,
    macros,
    setMacros,
    notificationPrefs,
    setNotificationPrefs,
    subscriptionTier,
  } = useOnboardingWizard();

  const { setOnboardingComplete } = useOnboardingState();
  const [finishingOnboarding, setFinishingOnboarding] = useState(false);

  const futureYouFlow = useFutureYouOnboarding({
    goToStep,
    patchFutureYou,
    futureYou,
    profile,
  });

  const [goalWeightReinforcement, setGoalWeightReinforcement] = useState(false);
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
  });

  const generationPill = useMemo(() => {
    if (!pollFutureYouEnabled) {
      return undefined;
    }
    return (
      <FutureYouGenerationPill
        status={generationPollStatus}
        motivationId={futureYou?.motivationId}
        goal={profile.goal ?? "maintain"}
        gender={profile.gender ?? "other"}
      />
    );
  }, [pollFutureYouEnabled, generationPollStatus, futureYou?.motivationId, profile.goal, profile.gender]);

  const activeTheme = draftTheme ?? theme;
  const dobValid = isValidOnboardingDateOfBirth(profile.dateOfBirth);

  useEffect(() => {
    if (stepIndex !== 9) {
      setGoalWeightReinforcement(false);
    }
  }, [stepIndex]);

  useEffect(() => {
    if (stepIndex !== ONBOARDING_STEP_FUTURE_YOU_SUCCESS) return;
    const pollStatus = futureYou?.generationStatus ?? "idle";
    const futureYouBlocked = isFutureYouPhotoBlocked(dobAge);
    if (!canAccessFutureYouSuccessScreen(futureYou, futureYouBlocked, pollStatus, subscriptionTier)) {
      goToStep(ONBOARDING_STEP_PAYWALL, { subscriptionTier: null });
    }
  }, [stepIndex, futureYou, dobAge, subscriptionTier, goToStep]);

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (stepIndex === 0) {
    return <OnboardingWelcomeScreen onGetStarted={goNext} />;
  }

  if (stepIndex === 1) {
    return (
      <OnboardingThemePicker
        step={stepIndex}
        value={activeTheme}
        onChange={(nextTheme) => {
          setDraftTheme(nextTheme);
          setTheme(nextTheme);
        }}
        onBack={goBack}
        onContinue={() => {
          setTheme(activeTheme);
          goToStep(2, { theme: activeTheme });
        }}
      />
    );
  }

  if (stepIndex === 2) {
    return (
      <OnboardingShell
        step={stepIndex}
        title="What's your gender?"
        subtitle="This will be used to calibrate your custom plan."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!profile.gender}
        testID="onboarding-step-2"
      >
        <OnboardingPillStack>
          {GENDERS.map((g) => (
            <OnboardingSegment
              key={g}
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

  if (stepIndex === 3) {
    return (
      <OnboardingShell
        step={stepIndex}
        title="When were you born?"
        subtitle="This will be used to calibrate your custom plan."
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

  if (stepIndex === 4) {
    return (
      <OnboardingShell
        step={stepIndex}
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

  if (stepIndex === 5) {
    return (
      <OnboardingShell
        step={stepIndex}
        title="Choose your units"
        subtitle="Weight, height, and volume display across the app."
        onBack={goBack}
        onContinue={goNext}
        testID="onboarding-step-5"
      >
        <UnitPreferencePicker value={unitPreferences} onChange={setUnitPreferences} />
      </OnboardingShell>
    );
  }

  if (stepIndex === 6) {
    const hUnit = unitPreferences.heightUnit;
    const heightStepValid = isValidOnboardingHeightIn(profile.heightIn);

    return (
      <OnboardingShell
        step={stepIndex}
        title="How tall are you?"
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!heightStepValid}
        testID="onboarding-step-6"
      >
        <View
          className="rounded-2xl border p-4"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
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
        </View>
      </OnboardingShell>
    );
  }

  if (stepIndex === 7) {
    const wUnit = unitPreferences.weightUnit;
    const currentWeightLbs = isValidWeighInLbs(profile.weightLbs)
      ? profile.weightLbs
      : DEFAULT_ONBOARDING_CURRENT_WEIGHT_LBS;
    const weightStepValid = isValidWeighInLbs(profile.weightLbs);

    return (
      <OnboardingShell
        step={stepIndex}
        title="What's your current weight?"
        subtitle="Enter your weight in your preferred unit."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!weightStepValid}
        testID="onboarding-step-7"
      >
        <View
          className="rounded-2xl border p-4"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <OnboardingWeightInput
            unit={wUnit}
            weightLbs={currentWeightLbs}
            resetKey={wUnit}
            onWeightChange={(weightLbs) => setProfile((p) => ({ ...p, weightLbs }))}
          />
        </View>
      </OnboardingShell>
    );
  }

  if (stepIndex === 8) {
    return (
      <OnboardingShell
        step={stepIndex}
        title="What's your primary goal?"
        subtitle="NewYou adjusts calories and coaching for your goal."
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

  if (stepIndex === 9 && profile.goal && profile.goal !== "maintain") {
    const wUnit = unitPreferences.weightUnit;
    const goal = profile.goal;
    const { minLbs, maxLbs } = goalWeightRangeLbs(goal, profile.weightLbs);
    const valueLbs = clampGoalWeightLbs(
      profile.goalWeightLbs ?? defaultGoalWeightLbs(goal, profile.weightLbs),
      minLbs,
      maxLbs,
    );
    const reinforcement = goalWeightReinforcementParts(profile, wUnit);
    const goalWeightValid = isGoalWeightValid(profile, profile.weightLbs);

    return (
      <OnboardingShell
        step={stepIndex}
        title={goalWeightReinforcement ? "" : "What is your desired weight?"}
        hideTitle={goalWeightReinforcement}
        contentCentered={goalWeightReinforcement}
        onBack={() => {
          if (goalWeightReinforcement) {
            setGoalWeightReinforcement(false);
            return;
          }
          goBack();
        }}
        onContinue={() => {
          if (!goalWeightReinforcement) {
            if (!goalWeightValid) return;
            setGoalWeightReinforcement(true);
            return;
          }
          goNext();
        }}
        continueDisabled={!goalWeightReinforcement && !goalWeightValid}
        testID="onboarding-step-9"
      >
        {goalWeightReinforcement ? (
          <OnboardingGoalWeightReinforcement
            headline={
              <Text>
                {reinforcement.verb}{" "}
                <Text style={{ color: colors.accent }}>{reinforcement.delta}</Text>
                {reinforcement.tail}
              </Text>
            }
            subtext={goalWeightReinforcementSubtext()}
          />
        ) : (
          <View
            className="rounded-2xl border p-4"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text className="mb-3 text-sm" style={{ color: colors.textSecondary }}>
              {goalWeightDirectionLabel(goal)}
            </Text>
            <OnboardingWeightInput
              unit={wUnit}
              weightLbs={valueLbs}
              resetKey={`${goal}-${wUnit}`}
              onWeightChange={(goalWeightLbs) =>
                setProfile((p) => ({
                  ...p,
                  goalWeightLbs: clampGoalWeightLbs(goalWeightLbs, minLbs, maxLbs),
                }))
              }
            />
            {!goalWeightValid ? (
              <Text className="mt-2.5 text-sm" style={{ color: "#f87171" }}>
                Pick a goal weight at least 3 lb from your current weight
              </Text>
            ) : null}
          </View>
        )}
      </OnboardingShell>
    );
  }

  if (stepIndex === ONBOARDING_STEP_PACE) {
    return (
      <OnboardingShell
        step={stepIndex}
        title="How fast do you want to get there?"
        subtitle="Honest answer. We'll set the plan in the real world."
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

  if (stepIndex === ONBOARDING_STEP_FUTURE_YOU_PHOTO) {
    return (
      <OnboardingShell
        step={stepIndex}
        title={
          <Text className="text-[28px] font-bold leading-tight" style={{ color: colors.textPrimary }}>
            See your <Text style={{ color: colors.accent }}>Future You</Text>
          </Text>
        }
        subtitle="Upload a photo to see what you could look like and get a personalized plan to help you get there."
        onBack={goBack}
        onContinue={goNext}
        hideContinue
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

  if (stepIndex === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION) {
    const gender = profile.gender ?? "other";

    return (
      <OnboardingShell
        step={stepIndex}
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

  if (stepIndex === ONBOARDING_STEP_ACTIVITY) {
    const showBackToPhoto = canRevisitFutureYouPhoto(futureYou);

    return (
      <OnboardingShell
        step={stepIndex}
        title="How active are you outside the gym?"
        subtitle="Helps us size your daily fuel targets."
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

  if (stepIndex === 12) {
    return (
      <OnboardingShell
        step={stepIndex}
        title="What's your training experience?"
        subtitle="Rep ranges and starting weights in your templates."
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

  if (stepIndex === 13) {
    return (
      <OnboardingShell
        step={stepIndex}
        title="What equipment do you have?"
        subtitle="Exercises will match what you can perform."
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

  if (stepIndex === 14) {
    return (
      <OnboardingShell
        step={stepIndex}
        title="How long do you want to train?"
        subtitle="We'll size your workouts to fit your session."
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

  if (stepIndex === 15) {
    return (
      <OnboardingShell
        step={stepIndex}
        title="Which days can you train?"
        subtitle="Pick the days that work for your week."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!isTrainingScheduleValid(profile)}
        generationPill={generationPill}
        testID="onboarding-step-15"
      >
        <View
          className="rounded-2xl border p-4"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <WorkoutWeekCalendarPicker
            profile={profile}
            onChange={(next) => setProfile((p) => ({ ...p, ...next }))}
          />
        </View>
      </OnboardingShell>
    );
  }

  if (stepIndex === 16) {
    const templates = draftTemplates ?? [];

    return (
      <OnboardingShell
        step={stepIndex}
        title="Here's your training plan"
        subtitle="NewYou built this from your schedule and experience. Looks good?"
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={templates.length === 0}
        continueLabel="Let's go"
        footerGhostAction={{ label: "Edit", onPress: () => goToStep(17) }}
        generationPill={generationPill}
        testID="onboarding-step-16"
      >
        <OnboardingSplitReveal templates={templates} />
      </OnboardingShell>
    );
  }

  if (stepIndex === 17) {
    const templates = draftTemplates ?? [];

    return (
      <OnboardingShell
        step={stepIndex}
        title="Review your workouts"
        subtitle="Swap exercises or adjust sets before you continue."
        onBack={() => goToStep(16)}
        onContinue={() => goToStep(18)}
        continueDisabled={templates.length === 0}
        generationPill={generationPill}
        testID="onboarding-step-17"
      >
        <OnboardingTemplateReview templates={templates} onChange={setDraftTemplates} />
      </OnboardingShell>
    );
  }

  if (stepIndex === 18) {
    const restrictionOptions = DIETARY_RESTRICTIONS.map((id) => ({
      id,
      label: dietaryRestrictionLabel(id),
      emoji: dietaryRestrictionEmoji(id),
    }));

    return (
      <OnboardingShell
        step={stepIndex}
        title="Any foods you avoid?"
        subtitle="We'll keep your nutrition suggestions on track"
        contentCentered
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

  if (stepIndex === 20) {
    return (
      <OnboardingPlanBuilding
        onComplete={() => {
          setMacros(computedMacros);
          goToStep(21, { macros: computedMacros });
        }}
      />
    );
  }

  if (stepIndex === 21) {
    const pollStatus = futureYou?.generationStatus ?? "idle";

    return (
      <>
        <OnboardingShell
          step={stepIndex}
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

  if (stepIndex === 22) {
    return (
      <OnboardingShell
        step={stepIndex}
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
              <Text style={{ color: colors.accent }}>Protein</Text> is your{" "}
              <Text style={{ color: colors.accent }}>#1</Text> priority
            </Text>
          }
          subtext={`Hit ${activeMacros.p}g daily. Consistent protein protects muscle.`}
        />
      </OnboardingShell>
    );
  }

  if (stepIndex === 23) {
    const templates = draftTemplates ?? [];

    return (
      <OnboardingShell
        step={stepIndex}
        title="Here's your training plan"
        subtitle="NewYou built this from your schedule and experience. Looks good?"
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

  if (stepIndex === 24) {
    return (
      <OnboardingShell
        step={stepIndex}
        title=""
        hideTitle
        contentCentered
        onBack={goBack}
        onContinue={() => goToStep(25)}
        hideFooter
        testID="onboarding-step-24"
      >
        <OnboardingNotificationPrompt onChoice={() => goToStep(25)} />
      </OnboardingShell>
    );
  }

  if (stepIndex === 25) {
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
        step={stepIndex}
        title="Stay on track"
        subtitle="NewYou works best when it knows your schedule. Totally optional, change anytime"
        onBack={goBack}
        onContinue={remindersEnabled ? continueFromReminders : skipReminders}
        continueLabel={remindersEnabled ? "Set up notifications" : "Skip for now"}
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

  if (stepIndex === 26) {
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
      volumeUnit: unitPreferences.volumeUnit,
    });

    return (
      <OnboardingShell
        step={stepIndex}
        title={`${name}, your plan is ready`}
        subtitle="Everything is set. Your coach is ready when you are."
        onBack={goBack}
        onContinue={() => goToStep(ONBOARDING_STEP_PAYWALL)}
        continueLabel={onboardingPlanReadyContinueLabel(futureYou, futureYouBlocked)}
        testID="onboarding-step-26"
      >
        {showFutureYouReadyBanner ? <FutureYouReadyBanner /> : null}
        <OnboardingPlanReady planSnapshot={planSnapshot} />
      </OnboardingShell>
    );
  }

  if (stepIndex === ONBOARDING_STEP_PAYWALL) {
    const name = displayName.trim() || "Friend";
    const templates = draftTemplates ?? [];
    const pollStatus = futureYou?.generationStatus ?? "idle";
    const futureYouBlocked = isFutureYouPhotoBlocked(dobAge);
    const planSnapshot = buildOnboardingPlanSnapshot({
      displayName: name,
      macros: activeMacros,
      profile,
      templates,
      volumeUnit: unitPreferences.volumeUnit,
    });

    return (
      <OnboardingPaywall
        planSnapshot={planSnapshot}
        futureYou={futureYou}
        generationStatus={pollStatus}
        photoBlocked={futureYouBlocked}
        onBack={goBack}
        onSelectTier={() => goToStep(ONBOARDING_STEP_FUTURE_YOU_SUCCESS, { subscriptionTier: "pro" })}
      />
    );
  }

  if (stepIndex === ONBOARDING_STEP_FUTURE_YOU_SUCCESS && subscriptionTier === "pro") {
    const name = displayName.trim() || "Friend";
    const templates = draftTemplates ?? [];
    const pollStatus = futureYou?.generationStatus ?? "idle";
    const futureYouBlocked = isFutureYouPhotoBlocked(dobAge);
    const planSnapshot = buildOnboardingPlanSnapshot({
      displayName: name,
      macros: activeMacros,
      profile,
      templates,
      volumeUnit: unitPreferences.volumeUnit,
    });
    const activeTheme = draftTheme ?? theme;

    async function handleFinishOnboarding() {
      if (
        !experienceLevel ||
        !equipmentSetup ||
        !sessionLength ||
        !draftTemplates?.length
      ) {
        return;
      }
      setFinishingOnboarding(true);
      try {
        await finishOnboarding({
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
        await setOnboardingComplete(true);
        stopOnboardingPreview();
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
        onContinue={() => void handleFinishOnboarding()}
        continuing={finishingOnboarding}
      />
    );
  }

  if (stepIndex === 19) {
    const styleOptions = TRAINING_STYLES.map((id) => ({
      id,
      label: trainingStyleLabel(id),
      emoji: trainingStyleEmoji(id),
    }));

    return (
      <OnboardingShell
        step={stepIndex}
        title="How do you train best?"
        subtitle="Your coach will match your style from day one"
        contentCentered
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
      step={stepIndex}
      title="Onboarding"
      onBack={stepIndex > 0 ? goBack : undefined}
      onContinue={goNext}
      generationPill={generationPill}
    >
      <OnboardingStepPlaceholder step={stepIndex} goal={profile.goal} />
    </OnboardingShell>
  );
}
