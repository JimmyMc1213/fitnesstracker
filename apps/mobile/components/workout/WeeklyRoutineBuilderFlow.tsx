import type {
  AppState,
  EquipmentSetup,
  ExperienceLevel,
  OnboardingProfile,
  SessionLength,
  WorkoutRoutineTemplate,
} from "@newyouai/types";
import { useMemo, useRef, useState } from "react";
import { View } from "react-native";

import { FullScreenOverlay } from "@/components/motion";

import { EquipmentSetupPicker } from "@/components/onboarding/EquipmentSetupPicker";
import { ExperienceLevelPicker } from "@/components/onboarding/ExperienceLevelPicker";
import { OnboardingPillStack, OnboardingSegment } from "@/components/onboarding/OnboardingSegment";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingSplitReveal } from "@/components/onboarding/OnboardingSplitReveal";
import {
  isTrainingScheduleValid,
  WorkoutWeekCalendarPicker,
} from "@/components/onboarding/WorkoutWeekCalendarPicker";
import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";
import { ManualWeeklyOverview } from "@/components/workout/ManualWeeklyOverview";
import { WorkoutRoutineEditor } from "@/components/workout/WorkoutRoutineEditor";
import {
  applyWeeklyRoutineToState,
  buildBlankWeeklyRoutineTemplates,
  buildWeeklyRoutineTemplates,
  profilePatchFromRoutineInputs,
  SESSION_LENGTH_OPTIONS,
  weeklyRoutineContentMatches,
} from "@/lib/workout/buildWeeklyRoutine";
import {
  defaultTrainingWeekdaysForProfile,
  MANUAL_TRAINING_DAY_LIMITS,
  profileWithTrainingWeekdays,
} from "@/lib/workout/workoutWeekCalendar";
import { sessionLengthFromDuration } from "@/lib/workout/workoutSplitByDays";

export type WeeklyRoutineBuilderMode = "generate" | "manual";

const GENERATE_TOTAL_STEPS = 5;

type WeeklyRoutineBuilderFlowProps = {
  open?: boolean;
  mode: WeeklyRoutineBuilderMode;
  state: AppState;
  onApply: (next: AppState) => void;
  onSaveCustomExercise: (name: string, label: string) => void;
  onClose: () => void;
};

function initialProfile(
  state: AppState,
  mode: WeeklyRoutineBuilderMode,
): Pick<OnboardingProfile, "workoutDaysPerWeek" | "trainingWeekdays"> {
  const base = state.onboardingProfile ?? { workoutDaysPerWeek: 4, trainingWeekdays: [] };

  if (mode === "manual") {
    return profileWithTrainingWeekdays({ workoutDaysPerWeek: 4, trainingWeekdays: [] }, []);
  }

  const weekdays =
    base.trainingWeekdays?.length ?
      base.trainingWeekdays
    : defaultTrainingWeekdaysForProfile(base.workoutDaysPerWeek ?? 4);
  return profileWithTrainingWeekdays(
    {
      workoutDaysPerWeek: base.workoutDaysPerWeek ?? (weekdays.length as OnboardingProfile["workoutDaysPerWeek"]),
      trainingWeekdays: weekdays,
    },
    weekdays,
  );
}

export function WeeklyRoutineBuilderFlow({
  open = true,
  mode,
  state,
  onApply,
  onSaveCustomExercise,
  onClose,
}: WeeklyRoutineBuilderFlowProps) {
  const [step, setStep] = useState(0);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(state.experienceLevel ?? "intermediate");
  const [equipmentSetup, setEquipmentSetup] = useState<EquipmentSetup>(state.equipmentSetup ?? "full_gym");
  const [sessionLength, setSessionLength] = useState<SessionLength>(() =>
    sessionLengthFromDuration(state.onboardingProfile?.sessionDuration),
  );
  const [profile, setProfile] = useState(() => initialProfile(state, mode));
  const [manualTemplates, setManualTemplates] = useState<WorkoutRoutineTemplate[]>([]);
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [pendingReplace, setPendingReplace] = useState(false);
  const pendingApplyTemplatesRef = useRef<WorkoutRoutineTemplate[] | null>(null);

  const totalSteps = mode === "generate" ? GENERATE_TOTAL_STEPS : 2;
  const hasExistingProgram = state.workoutTemplates.length > 0;
  const manualEditorTemplate = editingDayIndex != null ? (manualTemplates[editingDayIndex] ?? null) : null;

  const draftTemplates = useMemo(() => {
    if (mode === "manual") {
      const weekdays = profile.trainingWeekdays ?? [];
      return buildBlankWeeklyRoutineTemplates(weekdays);
    }
    return buildWeeklyRoutineTemplates(profile, experienceLevel, equipmentSetup, sessionLength);
  }, [mode, profile, experienceLevel, equipmentSetup, sessionLength]);

  function goBack() {
    if (step === 0) {
      onClose();
      return;
    }
    if (mode === "manual") {
      if (editingDayIndex !== null) {
        setEditingDayIndex(null);
        return;
      }
      if (step > 0) {
        setStep((s) => s - 1);
        return;
      }
      onClose();
      return;
    }
    setStep((s) => s - 1);
  }

  function resolveApplyTemplates(templatesOverride?: WorkoutRoutineTemplate[]): WorkoutRoutineTemplate[] {
    if (templatesOverride != null && templatesOverride.length > 0) {
      return templatesOverride;
    }
    if (mode === "manual" && manualTemplates.length > 0) {
      return manualTemplates;
    }
    return draftTemplates;
  }

  function dismissFlow() {
    pendingApplyTemplatesRef.current = null;
    setPendingReplace(false);
    onClose();
  }

  function requestApply(templates: WorkoutRoutineTemplate[]) {
    if (hasExistingProgram) {
      pendingApplyTemplatesRef.current = templates;
      if (mode === "manual") {
        setManualTemplates(templates);
      }
      setPendingReplace(true);
      return;
    }
    commitApply(templates);
  }

  function commitApply(templatesOverride?: WorkoutRoutineTemplate[]) {
    const templates = resolveApplyTemplates(templatesOverride);
    if (weeklyRoutineContentMatches(templates, state.workoutTemplates)) {
      dismissFlow();
      return;
    }

    const weekdays = profile.trainingWeekdays ?? [];
    const profilePatch = profilePatchFromRoutineInputs(
      weekdays,
      mode === "generate" ? sessionLength : undefined,
    );
    const next = applyWeeklyRoutineToState(state, templates, profilePatch, {
      ...(mode === "generate" ? { experienceLevel, equipmentSetup } : {}),
    });
    onApply(next);
    dismissFlow();
  }

  function handleManualEditorSave(saved: WorkoutRoutineTemplate) {
    if (editingDayIndex == null) return;
    const nextTemplates = [...manualTemplates];
    nextTemplates[editingDayIndex] = saved;
    setManualTemplates(nextTemplates);
    setEditingDayIndex(null);
  }

  function goNext() {
    if (mode === "generate") {
      if (step === 3) {
        setStep(4);
        return;
      }
      if (step === 4) {
        requestApply(draftTemplates);
        return;
      }
      setStep((s) => s + 1);
      return;
    }

    if (step === 0) {
      const templates = buildBlankWeeklyRoutineTemplates(profile.trainingWeekdays ?? []);
      setManualTemplates(templates);
      setStep(1);
    }
  }

  const shell = (
    <>
      {mode === "generate" && step === 0 ? (
        <OnboardingShell
          step={step}
          totalSteps={totalSteps}
          title="What's your training experience?"
          subtitle="Rep ranges and starting weights in your templates."
          onBack={goBack}
          onContinue={goNext}
          testID="workout-weekly-builder"
        >
          <ExperienceLevelPicker value={experienceLevel} onChange={setExperienceLevel} />
        </OnboardingShell>
      ) : null}

      {mode === "generate" && step === 1 ? (
        <OnboardingShell
          step={step}
          totalSteps={totalSteps}
          title="What equipment do you have?"
          subtitle="Exercises will match what you can perform."
          onBack={goBack}
          onContinue={goNext}
          testID="workout-weekly-builder"
        >
          <EquipmentSetupPicker value={equipmentSetup} onChange={setEquipmentSetup} />
        </OnboardingShell>
      ) : null}

      {mode === "generate" && step === 2 ? (
        <OnboardingShell
          step={step}
          totalSteps={totalSteps}
          title="How long do you want to train?"
          subtitle="We'll size your workouts to fit your session."
          onBack={goBack}
          onContinue={goNext}
          testID="workout-weekly-builder"
        >
          <OnboardingPillStack>
            {SESSION_LENGTH_OPTIONS.map(({ value, label }) => (
              <OnboardingSegment key={value} selected={sessionLength === value} onPress={() => setSessionLength(value)}>
                {label}
              </OnboardingSegment>
            ))}
          </OnboardingPillStack>
        </OnboardingShell>
      ) : null}

      {(mode === "generate" && step === 3) || (mode === "manual" && step === 0) ? (
        <OnboardingShell
          step={step}
          totalSteps={totalSteps}
          title="Which days can you train?"
          subtitle="Pick the days that work for your week."
          onBack={goBack}
          onContinue={goNext}
          hideProgress={mode === "manual"}
          continueDisabled={!isTrainingScheduleValid(profile, mode === "manual" ? MANUAL_TRAINING_DAY_LIMITS : undefined)}
          continueLabel={mode === "manual" ? "Next" : "Continue"}
          testID="workout-weekly-builder"
        >
          <WorkoutWeekCalendarPicker
            profile={profile}
            onChange={(next) => setProfile((p) => ({ ...p, ...next }))}
            showPickForMe={mode === "generate"}
            includeSplitInHint={mode === "generate"}
            selectionLimits={mode === "manual" ? MANUAL_TRAINING_DAY_LIMITS : undefined}
          />
        </OnboardingShell>
      ) : null}

      {mode === "manual" && step === 1 && editingDayIndex === null ? (
        <OnboardingShell
          step={step}
          totalSteps={totalSteps}
          title="Build your week"
          subtitle="Tap a day to add exercises."
          onBack={goBack}
          onContinue={() => requestApply(manualTemplates)}
          hideProgress
          continueLabel="Finish week"
          testID="workout-weekly-builder"
        >
          <ManualWeeklyOverview templates={manualTemplates} onEditDay={setEditingDayIndex} />
        </OnboardingShell>
      ) : null}

      {mode === "manual" && editingDayIndex !== null && manualEditorTemplate ? (
        <WorkoutRoutineEditor
          key={`${manualEditorTemplate.id}-${editingDayIndex}`}
          embedded
          template={manualEditorTemplate}
          customExercises={state.customExercises}
          equipmentSetup={state.equipmentSetup ?? "full_gym"}
          onSaveCustomExercise={onSaveCustomExercise}
          onSave={handleManualEditorSave}
          onDelete={null}
          onClose={goBack}
          title={manualEditorTemplate.name}
        />
      ) : null}

      {mode === "generate" && step === 4 && !pendingReplace ? (
        <OnboardingShell
          step={step}
          totalSteps={totalSteps}
          title="Here's your training plan"
          subtitle="Gymmy built this from your schedule and experience. Looks good?"
          onBack={goBack}
          onContinue={goNext}
          continueLabel="Use this routine"
          testID="workout-weekly-builder"
        >
          <OnboardingSplitReveal templates={draftTemplates} />
        </OnboardingShell>
      ) : null}

      {pendingReplace ? (
        <WorkoutConfirmSheet
          sheetTestID="replace-program-sheet"
          title="Replace current program?"
          message="Your existing workouts will be replaced with this new weekly routine."
          cancelLabel="Keep current workouts"
          confirmLabel="Replace program"
          confirmDestructive
          onCancel={() => {
            pendingApplyTemplatesRef.current = null;
            setPendingReplace(false);
          }}
          onConfirm={() => commitApply(pendingApplyTemplatesRef.current ?? undefined)}
        />
      ) : null}
    </>
  );

  return (
    <FullScreenOverlay open={open} motionVariant="fade" onRequestClose={onClose}>
      <View className="flex-1">{shell}</View>
    </FullScreenOverlay>
  );
}
