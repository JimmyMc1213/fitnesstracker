import { FutureYouComparePanels } from "@/components/future-you/FutureYouComparePanels";
import { FutureYouDeleteButton } from "@/components/future-you/FutureYouDeleteButton";
import { FutureYouGenerationLoadingView } from "@/components/future-you/FutureYouGenerationLoadingView";
import { FutureYouLegalFooter } from "@/components/future-you/FutureYouLegalFooter";
import { FutureYouReportButton } from "@/components/future-you/FutureYouReportButton";
import { OnboardingFutureYouSuccessHero } from "@/components/onboarding/OnboardingFutureYouSuccessHero";
import { useFutureYouSourceImage } from "@/hooks/useFutureYouSourceImage";
import { useAppTheme } from "@/hooks/useAppTheme";
import { captureFutureYouCompareImage } from "@/lib/captureFutureYouCompareImage";
import { futureYouRevealPlaceholderSource } from "@/lib/futureYouRevealPlaceholder";
import { FUTURE_YOU_CALLOUT_BG, FUTURE_YOU_GOLD } from "@/lib/futureYouTokens";
import {
  FUTURE_YOU_DETAIL_BACK_LABEL,
  FUTURE_YOU_DETAIL_COMPARE_LABEL,
  FUTURE_YOU_DETAIL_SINGLE_LABEL,
  FUTURE_YOU_GALLERY_SAVE_LABEL,
  FUTURE_YOU_GALLERY_SAVE_SUCCESS,
  FUTURE_YOU_GALLERY_SAVING_LABEL,
  FUTURE_YOU_SUCCESS_AI_LABEL,
  futureYouCompareAfterWeightLabel,
  futureYouCompareBeforeWeightLabel,
  futureYouRedoAnchorIso,
  type FutureYouGalleryItem,
} from "@newyouai/core";
import type { FutureYouDraft, FutureYouJobStatus, NutritionGoal, UserGender, WeightUnit } from "@newyouai/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  item: FutureYouGalleryItem;
  goal: NutritionGoal;
  gender: UserGender | undefined;
  motivationId: string | undefined;
  generationStatus: FutureYouJobStatus | "idle";
  futureYou: FutureYouDraft | undefined;
  jobId?: string;
  /** Persisted storage path for the upload used to create this preview. */
  sourcePhotoPath?: string;
  weightLbs?: number;
  goalWeightLbs?: number;
  weightUnit?: WeightUnit;
  onBack: () => void;
  onFutureYouDeleted: (jobId: string) => void;
  onReported?: (jobId: string) => void;
};

export function FutureYouDetailView({
  item,
  goal,
  gender,
  motivationId,
  generationStatus,
  futureYou,
  jobId,
  sourcePhotoPath,
  weightLbs,
  goalWeightLbs,
  weightUnit = "lbs",
  onBack,
  onFutureYouDeleted,
  onReported,
}: Props) {
  const { colors } = useAppTheme();
  const compareCaptureRef = useRef<View>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const placeholderSource = futureYouRevealPlaceholderSource(gender);
  const canSave = Boolean(item.imageSrc && !item.loading);
  const beforeSubtitle = useMemo(
    () => futureYouCompareBeforeWeightLabel(weightLbs, weightUnit),
    [weightLbs, weightUnit],
  );
  const afterSubtitle = useMemo(
    () => futureYouCompareAfterWeightLabel(goalWeightLbs, weightUnit, goal),
    [goalWeightLbs, weightUnit, goal],
  );
  const { sourceUri, loading: sourceLoading } = useFutureYouSourceImage(
    sourcePhotoPath,
    item.id,
    canSave,
  );
  const canCompare = Boolean(canSave && sourceUri);
  const showCompareToggle = canSave;

  useEffect(() => {
    setCompareOpen(false);
  }, [item.id]);

  useEffect(() => {
    if (!canCompare) setCompareOpen(false);
  }, [canCompare]);

  async function onSave() {
    if (!item.imageSrc) return;
    setSaveState("saving");
    setSaveError(null);
    const { saveImageToDevice } = await import("@/lib/saveImageToDevice");
    const filename = `newyou-${item.id.slice(0, 8)}.png`;

    if (compareOpen && canCompare && sourceUri) {
      const capturedUri = await captureFutureYouCompareImage(compareCaptureRef);
      if (capturedUri) {
        const result = await saveImageToDevice(capturedUri, filename);
        if (result.ok) {
          setSaveState("success");
          return;
        }
        setSaveState("error");
        setSaveError(result.error);
        return;
      }
    }

    const result = await saveImageToDevice(item.imageSrc, filename);
    if (result.ok) {
      setSaveState("success");
      return;
    }
    setSaveState("error");
    setSaveError(result.error);
  }

  return (
    <View testID="future-you-detail" className="min-h-0 flex-1 pt-[18px]">
      <View className="shrink-0 flex-row items-center justify-between">
        <Pressable
          testID="future-you-detail-back"
          accessibilityRole="button"
          onPress={onBack}
          className="py-1"
        >
          <Text className="text-base font-semibold" style={{ color: FUTURE_YOU_GOLD }}>
            ← {FUTURE_YOU_DETAIL_BACK_LABEL}
          </Text>
        </Pressable>
        <FutureYouDeleteButton
          jobId={item.id}
          redoAnchorIso={futureYouRedoAnchorIso(futureYou)}
          onDeleted={() => onFutureYouDeleted(item.id)}
        />
      </View>

      {showCompareToggle ?
        <View className="shrink-0 items-center pt-2">
          <Pressable
            testID="future-you-detail-compare-toggle"
            accessibilityRole="button"
            disabled={!canCompare}
            onPress={() => setCompareOpen((open) => !open)}
            className="rounded-full px-4 py-2"
            style={{
              borderWidth: 1,
              borderColor: canCompare ? FUTURE_YOU_GOLD : colors.border,
              opacity: canCompare ? 1 : sourceLoading ? 0.65 : 0.45,
            }}
          >
            <Text className="text-sm font-semibold" style={{ color: FUTURE_YOU_GOLD }}>
              {compareOpen ? FUTURE_YOU_DETAIL_SINGLE_LABEL : FUTURE_YOU_DETAIL_COMPARE_LABEL}
            </Text>
          </Pressable>
        </View>
      : null}

      <View className="min-h-0 flex-1 pt-3">
        {item.loading ?
          <FutureYouGenerationLoadingView
            fill
            goal={goal}
            gender={gender}
            motivationId={motivationId}
            generationStatus={generationStatus}
            imageUri={item.imageSrc}
            placeholderSource={placeholderSource}
          />
        : compareOpen && canCompare && item.imageSrc && sourceUri ?
          <FutureYouComparePanels
            captureRef={compareCaptureRef}
            beforeUri={sourceUri}
            afterUri={item.imageSrc}
            beforeSubtitle={beforeSubtitle}
            afterSubtitle={afterSubtitle}
          />
        : <View className="flex-1">
            <OnboardingFutureYouSuccessHero
              fill
              imageUri={item.imageSrc}
              placeholderSource={placeholderSource}
              loading={false}
            />
          </View>
        }
      </View>

      <View className="shrink-0 gap-2.5 pt-4">
        <Text className="text-center text-xs" style={{ color: colors.textTertiary }}>
          {FUTURE_YOU_SUCCESS_AI_LABEL}
        </Text>
        <Pressable
          testID="future-you-detail-save"
          accessibilityRole="button"
          disabled={!canSave || saveState === "saving"}
          onPress={() => void onSave()}
          className="w-full max-w-[20rem] self-center items-center justify-center rounded-full px-6 py-3.5"
          style={{
            backgroundColor: FUTURE_YOU_GOLD,
            minHeight: 52,
            opacity: !canSave || saveState === "saving" ? 0.6 : 1,
          }}
        >
          <Text
            className="text-center text-base font-semibold"
            style={{ color: FUTURE_YOU_CALLOUT_BG }}
          >
            {saveState === "saving" ? FUTURE_YOU_GALLERY_SAVING_LABEL : FUTURE_YOU_GALLERY_SAVE_LABEL}
          </Text>
        </Pressable>
        {saveState === "success" ? (
          <Text
            className="text-center text-[13px]"
            style={{ color: colors.textSecondary }}
            accessibilityRole="text"
          >
            {FUTURE_YOU_GALLERY_SAVE_SUCCESS}
          </Text>
        ) : null}
        {saveState === "error" && saveError ? (
          <Text
            className="text-center text-[13px]"
            style={{ color: "#dc2626" }}
            accessibilityRole="alert"
          >
            {saveError}
          </Text>
        ) : null}
      </View>

      <View className="shrink-0 items-center gap-1 pt-3 pb-1">
        <FutureYouReportButton jobId={jobId} context="home" onReported={onReported} />
        <FutureYouLegalFooter compact accentColor={FUTURE_YOU_GOLD} />
      </View>
    </View>
  );
}
