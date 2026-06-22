import { FutureYouDeleteButton } from "@/components/future-you/FutureYouDeleteButton";
import { FutureYouLegalFooter } from "@/components/future-you/FutureYouLegalFooter";
import { FutureYouReportButton } from "@/components/future-you/FutureYouReportButton";
import { OnboardingFutureYouSuccessHero } from "@/components/onboarding/OnboardingFutureYouSuccessHero";
import { useAppTheme } from "@/hooks/useAppTheme";
import { futureYouRevealPlaceholderSource } from "@/lib/futureYouRevealPlaceholder";
import { FUTURE_YOU_CALLOUT_BG, FUTURE_YOU_GOLD } from "@/lib/futureYouTokens";
import {
  FUTURE_YOU_DETAIL_BACK_LABEL,
  FUTURE_YOU_GALLERY_SAVE_LABEL,
  FUTURE_YOU_GALLERY_SAVE_SUCCESS,
  FUTURE_YOU_GALLERY_SAVING_LABEL,
  FUTURE_YOU_SUCCESS_AI_LABEL,
  futureYouRedoAnchorIso,
  type FutureYouGalleryItem,
} from "@newyouai/core";
import type { FutureYouDraft, UserGender } from "@newyouai/types";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  item: FutureYouGalleryItem;
  timeline: string;
  gender: UserGender | undefined;
  futureYou: FutureYouDraft | undefined;
  jobId?: string;
  onBack: () => void;
  onOpenFullscreen: () => void;
  onFutureYouDeleted: () => void;
};

export function FutureYouDetailView({
  item,
  timeline,
  gender,
  futureYou,
  jobId,
  onBack,
  onOpenFullscreen,
  onFutureYouDeleted,
}: Props) {
  const { colors } = useAppTheme();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const placeholderSource = futureYouRevealPlaceholderSource(gender);
  const canSave = Boolean(item.imageSrc && !item.loading);
  const canFullscreen = canSave;

  async function onSave() {
    if (!item.imageSrc) return;
    setSaveState("saving");
    setSaveError(null);
    const { saveImageToDevice } = await import("@/lib/saveImageToDevice");
    const result = await saveImageToDevice(item.imageSrc, `newyou-${item.id.slice(0, 8)}.png`);
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
          redoAnchorIso={futureYouRedoAnchorIso(futureYou)}
          onDeleted={onFutureYouDeleted}
        />
      </View>

      <View className="min-h-0 flex-1 pt-3">
        <Pressable
          className="flex-1"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canFullscreen }}
          disabled={!canFullscreen}
          onPress={() => {
            if (canFullscreen) onOpenFullscreen();
          }}
        >
          <OnboardingFutureYouSuccessHero
            fill
            accentColor={FUTURE_YOU_GOLD}
            timeline={timeline}
            imageUri={item.imageSrc}
            placeholderSource={placeholderSource}
            loading={item.loading}
          />
        </Pressable>
      </View>

      <View className="shrink-0 gap-2.5 pt-4 pb-1">
        <Text className="text-center text-xs" style={{ color: colors.textTertiary }}>
          {FUTURE_YOU_SUCCESS_AI_LABEL}
        </Text>
        <Pressable
          testID="future-you-detail-save"
          accessibilityRole="button"
          disabled={!canSave || saveState === "saving"}
          onPress={() => void onSave()}
          className="w-full max-w-[20rem] self-center items-center rounded-full px-6 py-3.5"
          style={{
            backgroundColor: FUTURE_YOU_GOLD,
            minHeight: 52,
            opacity: !canSave || saveState === "saving" ? 0.6 : 1,
          }}
        >
          <Text className="text-base font-semibold" style={{ color: FUTURE_YOU_CALLOUT_BG }}>
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
        <View className="items-center gap-1 pt-0.5">
          <FutureYouReportButton jobId={jobId} context="home" />
          <FutureYouLegalFooter compact accentColor={FUTURE_YOU_GOLD} />
        </View>
      </View>
    </View>
  );
}
