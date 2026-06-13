import {
  applyGoalSettingsDraft,
  isGoalSettingsDirty,
  isGoalWeightValid,
  latestWeightLbs,
  normalizeGoalProfilePatch,
  progressGoalFromOnboarding,
} from "@newyouai/core";
import type { OnboardingProfile } from "@newyouai/types";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { BackHandler, Text } from "react-native";

import {
  DiscardGoalChangesConfirmSheet,
  SaveGoalConfirmSheet,
} from "@/components/settings/GoalSettingsConfirmSheets";
import { GoalSettingsPicker } from "@/components/settings/GoalSettingsPicker";
import { SettingsDetailCard, SettingsHelper } from "@/components/settings/SettingsLayout";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatWeightFromLbs } from "@/lib/unitConversions";
import { weightUnitLabel } from "@/lib/unitLabels";

export type GoalPanelHandle = {
  handleBack: (onProceed: () => void) => void;
  openSaveConfirm: () => void;
};

type GoalConfirm = "save" | "discard" | null;

type GoalPanelProps = {
  onSavableChange?: (savable: boolean) => void;
  onDismiss?: () => void;
};

export const GoalPanel = forwardRef<GoalPanelHandle, GoalPanelProps>(function GoalPanel(
  { onSavableChange, onDismiss },
  ref,
) {
  const { colors } = useAppTheme();
  const { state, setFitnessState } = useFitnessState();
  const savedProfile = state?.onboardingProfile;
  const [goalDraft, setGoalDraft] = useState<OnboardingProfile | null>(null);
  const [goalConfirm, setGoalConfirm] = useState<GoalConfirm>(null);
  const [pendingExit, setPendingExit] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (savedProfile) {
      setGoalDraft({ ...savedProfile });
      setGoalConfirm(null);
    }
  }, [savedProfile]);

  const profile = goalDraft ?? savedProfile;
  const currentWeightLbs = state ? latestWeightLbs(state) : 180;
  const wUnit = state?.unitPreferences.weightUnit ?? "lbs";

  const goalDraftDirty =
    savedProfile && goalDraft ? isGoalSettingsDirty(savedProfile, goalDraft) : false;
  const goalDraftSavable =
    goalDraft != null && isGoalWeightValid(goalDraft, currentWeightLbs) && goalDraftDirty;

  useEffect(() => {
    onSavableChange?.(goalDraftSavable);
  }, [goalDraftSavable, onSavableChange]);

  const updateGoalDraft = useCallback(
    (patch: Partial<Pick<OnboardingProfile, "goal" | "goalWeightLbs" | "pace">>) => {
      setGoalDraft((draft) => {
        if (!draft) return draft;
        return normalizeGoalProfilePatch(draft, patch, currentWeightLbs);
      });
    },
    [currentWeightLbs],
  );

  const handleBack = useCallback(
    (onProceed: () => void) => {
      if (savedProfile && goalDraft && isGoalSettingsDirty(savedProfile, goalDraft)) {
        setPendingExit(() => onProceed);
        setGoalConfirm("discard");
        return;
      }
      onProceed();
    },
    [savedProfile, goalDraft],
  );

  useImperativeHandle(
    ref,
    () => ({
      handleBack,
      openSaveConfirm: () => {
        if (goalDraftSavable) setGoalConfirm("save");
      },
    }),
    [goalDraftSavable, handleBack],
  );

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (savedProfile && goalDraft && isGoalSettingsDirty(savedProfile, goalDraft)) {
        setPendingExit(() => onDismiss ?? (() => {}));
        setGoalConfirm("discard");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [savedProfile, goalDraft, onDismiss]);

  if (!state || !profile) return null;

  const previewGoal = progressGoalFromOnboarding(profile, {
    anchorWeightLbs: currentWeightLbs,
    progressStartWeightLbs: state.progressGoal?.progressStartWeightLbs,
  });

  return (
    <>
      <SettingsHelper>
        Your goal drives calorie targets, coaching, and the weight range on Progress. Tap Save when you are ready to
        apply changes.
      </SettingsHelper>
      <SettingsDetailCard>
        <Text className="text-[13px] leading-[1.5]" style={{ color: colors.textSecondary }}>
          Goal range: {formatWeightFromLbs(previewGoal.goalWeightLowLbs, wUnit)}–
          {formatWeightFromLbs(previewGoal.goalWeightHighLbs, wUnit)} {weightUnitLabel(wUnit)}
          {goalDraftDirty ? " · unsaved" : null}
        </Text>
      </SettingsDetailCard>
      <GoalSettingsPicker
        profile={profile}
        currentWeightLbs={currentWeightLbs}
        weightUnit={wUnit}
        onChange={updateGoalDraft}
      />

      {goalConfirm === "save" ? (
        <SaveGoalConfirmSheet
          onCancel={() => setGoalConfirm(null)}
          onConfirm={() => {
            if (!goalDraft) return;
            setFitnessState((prev) => applyGoalSettingsDraft(prev, goalDraft));
            setGoalConfirm(null);
            onDismiss?.();
          }}
        />
      ) : null}
      {goalConfirm === "discard" ? (
        <DiscardGoalChangesConfirmSheet
          onCancel={() => {
            setGoalConfirm(null);
            setPendingExit(null);
          }}
          onConfirm={() => {
            if (savedProfile) setGoalDraft({ ...savedProfile });
            setGoalConfirm(null);
            const exit = pendingExit;
            setPendingExit(null);
            exit?.();
          }}
        />
      ) : null}
    </>
  );
});
