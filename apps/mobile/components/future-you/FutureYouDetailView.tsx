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
  FUTURE_YOU_SUCCESS_AI_LABEL,
  futureYouRedoAnchorIso,
  type FutureYouGalleryItem,
} from "@newyouai/core";
import type { FutureYouDraft, UserGender } from "@newyouai/types";
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
  const placeholderSource = futureYouRevealPlaceholderSource(gender);
  const canFullscreen = Boolean(item.imageSrc && !item.loading);

  return (
    <View testID="future-you-detail" className="flex-1 pt-[18px]">
      <View className="flex-row items-center justify-between">
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

      <View className="flex-1 justify-center pt-6">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canFullscreen }}
          disabled={!canFullscreen}
          onPress={() => {
            if (canFullscreen) onOpenFullscreen();
          }}
        >
          <OnboardingFutureYouSuccessHero
            imageHeight={340}
            accentColor={FUTURE_YOU_GOLD}
            timeline={timeline}
            imageUri={item.imageSrc}
            placeholderSource={placeholderSource}
            loading={item.loading}
          />
        </Pressable>
      </View>

      <View className="gap-2 pb-1">
        <Text className="text-center text-xs" style={{ color: colors.textTertiary }}>
          {FUTURE_YOU_SUCCESS_AI_LABEL}
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled
          className="items-center rounded-full px-6 py-3.5 opacity-60"
          style={{ backgroundColor: FUTURE_YOU_GOLD, minHeight: 52 }}
        >
          <Text className="text-base font-semibold" style={{ color: FUTURE_YOU_CALLOUT_BG }}>
            {FUTURE_YOU_GALLERY_SAVE_LABEL} (coming soon)
          </Text>
        </Pressable>
        <FutureYouReportButton jobId={jobId} context="home" />
        <FutureYouLegalFooter className="mt-2" accentColor={FUTURE_YOU_GOLD} />
      </View>
    </View>
  );
}
