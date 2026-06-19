import type { OnboardingPlanSnapshot } from "@/lib/onboardingPlanSnapshot";
import {
  FUTURE_YOU_SUCCESS_CTA_LABEL,
  FUTURE_YOU_SUCCESS_TAGLINE,
  FUTURE_YOU_SUCCESS_WELCOME_BRAND,
  FUTURE_YOU_SUCCESS_WELCOME_PREFIX,
  formatFutureYouSuccessHeadline,
  isFutureYouSuccessHeroVisible,
} from "@/lib/futureYouSuccessModel";
import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OnboardingPaywallPlanSummary } from "@/components/onboarding/OnboardingPaywallPlanSummary";
import { GradientCard } from "@/components/ui/GradientCard";
import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { useFutureYouRevealImage } from "@/hooks/useFutureYouRevealImage";
import type { FutureYouDraft, FutureYouJobStatus, SubscriptionTier } from "@newyouai/types";

type Props = {
  planSnapshot: OnboardingPlanSnapshot;
  futureYou: FutureYouDraft | undefined;
  generationStatus: FutureYouJobStatus | "idle";
  photoBlocked: boolean;
  subscriptionTier: SubscriptionTier;
  displayName: string;
  onContinue: () => void;
  continuing?: boolean;
};

export function OnboardingFutureYouSuccess({
  planSnapshot,
  futureYou,
  generationStatus,
  photoBlocked,
  subscriptionTier,
  displayName,
  onContinue,
  continuing = false,
}: Props) {
  const { colors, ob } = useOnboardingTheme();
  const insets = useSafeAreaInsets();
  const heroVisible = isFutureYouSuccessHeroVisible(futureYou, photoBlocked);
  const { imageUri, loading } = useFutureYouRevealImage({
    jobId: futureYou?.generationJobId,
    status: generationStatus,
    subscriptionTier,
  });
  const preparing = heroVisible && (generationStatus !== "ready" || loading);

  return (
    <View
      testID="onboarding-future-you-success"
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 23,
      }}
    >
      <View className="flex-1 justify-center gap-5">
        {heroVisible ? (
          <>
            <Text className="text-center text-lg font-semibold" style={{ color: colors.textPrimary }}>
              {FUTURE_YOU_SUCCESS_WELCOME_PREFIX}
              <Text style={{ color: colors.accent }}>{FUTURE_YOU_SUCCESS_WELCOME_BRAND}</Text>
            </Text>
            <GradientCard padding={0} style={{ height: 224, width: "100%" }}>
              <View style={{ height: 224, width: "100%", alignItems: "center", justifyContent: "center" }}>
                {preparing ? (
                  <Text className="text-center text-sm" style={{ color: colors.textSecondary }}>
                    Loading your Future You…
                  </Text>
                ) : imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <Text className="text-center text-sm" style={{ color: colors.textSecondary }}>
                    Your Future You
                  </Text>
                )}
              </View>
            </GradientCard>
            <Text className="text-center text-xs" style={{ color: colors.textTertiary }}>
              AI generated · Illustrative preview
            </Text>
          </>
        ) : (
          <>
            <View
              className="mx-auto h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(201, 168, 118, 0.12)", borderWidth: 1.5, borderColor: ob.gold }}
            >
              <Text className="text-3xl font-bold" style={{ color: ob.gold }}>
                ✓
              </Text>
            </View>
            <Text className="text-center text-[28px] font-bold" style={{ color: colors.textPrimary }}>
              {formatFutureYouSuccessHeadline(displayName)}
            </Text>
            <Text className="text-center text-base" style={{ color: colors.textSecondary }}>
              {FUTURE_YOU_SUCCESS_TAGLINE}
            </Text>
            <OnboardingPaywallPlanSummary planSnapshot={planSnapshot} />
            <Text className="text-center text-sm font-medium" style={{ color: ob.gold }}>
              Welcome to NewYouAI
            </Text>
          </>
        )}
      </View>

      <PressableScale
        onPress={onContinue}
        disabled={continuing || preparing}
        testID="onboarding-future-you-success-continue"
        style={{
          alignItems: "center",
          borderRadius: 9999,
          paddingVertical: 16,
          backgroundColor: continuing || preparing ? colors.border : ob.gold,
          opacity: continuing || preparing ? 0.6 : 1,
        }}
      >
        <Text className="text-base font-semibold" style={{ color: continuing || preparing ? colors.textSecondary : ob.goldOn }}>
          {continuing ? "Starting…" : FUTURE_YOU_SUCCESS_CTA_LABEL}
        </Text>
      </PressableScale>
    </View>
  );
}
