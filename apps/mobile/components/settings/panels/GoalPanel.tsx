import {
  applyGoalSettingsDraft,
  isGoalSettingsDirty,
  isGoalWeightValid,
  latestWeightLbs,
  normalizeGoalProfilePatch,
  nutritionGoalSettingsLabel,
  progressGoalFromOnboarding,
} from "@newyouai/core";
import type { GoalPace, OnboardingProfile } from "@newyouai/types";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { BackHandler, Text, View } from "react-native";

import {
  DiscardGoalChangesConfirmSheet,
  SaveGoalConfirmSheet,
} from "@/components/settings/GoalSettingsConfirmSheets";
import { GoalSettingsPicker } from "@/components/settings/GoalSettingsPicker";
import { SettingsHelper } from "@/components/settings/SettingsLayout";
import { GradientCard } from "@/components/ui/GradientCard";
import { PressableScale } from "@/components/ui/PressableScale";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatWeightFromLbs } from "@/lib/unitConversions";
import { weightUnitLabel } from "@/lib/unitLabels";

const PACE_SHORT_LABEL: Record<GoalPace, string> = {
  slow: "Slow and steady",
  balanced: "Balanced",
  aggressive: "Aggressive",
};

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
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (savedProfile) {
      setGoalDraft({ ...savedProfile });
      setGoalConfirm(null);
      setEditing(false);
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

  const goal = profile.goal ?? "maintain";
  const weightValid = isGoalWeightValid(profile, currentWeightLbs);
  // Keep the editor open while the draft is incomplete so it can't be hidden in a broken state.
  const editorOpen = editing || !weightValid;

  const goalRangeText = `${formatWeightFromLbs(previewGoal.goalWeightLowLbs, wUnit)}–${formatWeightFromLbs(
    previewGoal.goalWeightHighLbs,
    wUnit,
  )} ${weightUnitLabel(wUnit)}`;

  const summaryRows: { label: string; value: string }[] = [];
  if (goal !== "maintain") {
    if (profile.goalWeightLbs != null) {
      summaryRows.push({
        label: "Target weight",
        value: `${formatWeightFromLbs(profile.goalWeightLbs, wUnit)} ${weightUnitLabel(wUnit)}`,
      });
    }
    if (profile.pace) {
      summaryRows.push({ label: "Pace", value: PACE_SHORT_LABEL[profile.pace] });
    }
  }
  summaryRows.push({ label: "Goal range", value: goalRangeText });

  return (
    <View style={{ gap: 16 }}>
      <SettingsHelper>
        Your goal drives calorie targets, coaching, and the weight range on Progress. Tap Save when you are ready to
        apply changes.
      </SettingsHelper>

      <GradientCard spacious testID="settings-goal-summary">
        <View className="flex-row items-start justify-between" style={{ gap: 12 }}>
          <View className="min-w-0 flex-1">
            <Text
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: colors.textTertiary }}
            >
              Current goal
            </Text>
            <Text className="mt-1.5 text-[22px] font-bold" style={{ color: colors.textPrimary }}>
              {nutritionGoalSettingsLabel(goal)}
            </Text>
          </View>
          {goalDraftDirty ? (
            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: colors.backgroundTertiary }}
            >
              <Text
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: colors.textSecondary }}
              >
                Unsaved
              </Text>
            </View>
          ) : null}
        </View>

        <View
          className="mt-4 pt-4"
          style={{ gap: 12, borderTopWidth: 1, borderTopColor: colors.border }}
        >
          {summaryRows.map((row) => (
            <View key={row.label} className="flex-row items-center justify-between" style={{ gap: 12 }}>
              <Text className="text-[13px]" style={{ color: colors.textTertiary }}>
                {row.label}
              </Text>
              <Text
                className="text-[14px] font-semibold tabular-nums"
                style={{ color: colors.textSecondary }}
                numberOfLines={1}
              >
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        <PressableScale
          testID="settings-goal-change"
          onPress={() => setEditing((v) => !v)}
          accessibilityRole="button"
          style={{
            marginTop: 18,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
            backgroundColor: colors.backgroundSecondary,
          }}
        >
          <Text className="text-[14px] font-semibold" style={{ color: colors.textPrimary }}>
            {editorOpen ? "Done" : "Change goal"}
          </Text>
        </PressableScale>
      </GradientCard>

      {editorOpen ? (
        <GoalSettingsPicker
          profile={profile}
          currentWeightLbs={currentWeightLbs}
          weightUnit={wUnit}
          onChange={updateGoalDraft}
        />
      ) : null}

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
    </View>
  );
});
