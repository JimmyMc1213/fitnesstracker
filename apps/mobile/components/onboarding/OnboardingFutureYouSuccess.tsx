import { FUTURE_YOU_HERO_LOADING_LABEL } from "@newyouai/core";
import type { OnboardingPlanSnapshot } from "@/lib/onboardingPlanSnapshot";
import {
  FUTURE_YOU_SUCCESS_AI_LABEL,
  FUTURE_YOU_SUCCESS_CTA_LABEL,
  FUTURE_YOU_SUCCESS_TAGLINE,
  FUTURE_YOU_SUCCESS_WELCOME_BRAND,
  FUTURE_YOU_SUCCESS_WELCOME_PREFIX,
  formatFutureYouSuccessHeadline,
  isFutureYouSuccessHeroVisible,
} from "@/lib/futureYouSuccessModel";
import { ActivityIndicator, Image, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FutureYouReportButton } from "@/components/future-you/FutureYouReportButton";
import { OnboardingPaywallPlanSummary } from "@/components/onboarding/OnboardingPaywallPlanSummary";
import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { useFutureYouRevealImage } from "@/hooks/useFutureYouRevealImage";
import { futureYouSilhouettesForGender } from "@/lib/futureYouSilhouettes";
import { splitFutureYouTimelineForPaywall } from "@/lib/futureYouTimeline";
import type { FutureYouDraft, FutureYouJobStatus, SubscriptionTier } from "@newyouai/types";

type Props = {
  planSnapshot: OnboardingPlanSnapshot;
  futureYou: FutureYouDraft | undefined;
  generationStatus: FutureYouJobStatus | "idle";
  photoBlocked: boolean;
  subscriptionTier: SubscriptionTier;
  displayName: string;
  onContinue: () => void;
  onBack?: () => void;
  continuing?: boolean;
  previewMode?: boolean;
};

/** Gold ring color = `--ob-gold` (#c9a876) at 0.75, matching PWA `__image-wrap`. */
const GOLD_RING = "rgba(201, 168, 118, 0.75)";

export function OnboardingFutureYouSuccess({
  planSnapshot,
  futureYou,
  generationStatus,
  photoBlocked,
  subscriptionTier,
  displayName,
  onContinue,
  onBack,
  continuing = false,
  previewMode = false,
}: Props) {
  const { colors, ob } = useOnboardingTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const heroVisible = isFutureYouSuccessHeroVisible(futureYou, photoBlocked);
  const { imageUri, loading } = useFutureYouRevealImage({
    jobId: futureYou?.generationJobId,
    status: generationStatus,
    subscriptionTier,
    previewMode,
  });
  const preparing = heroVisible && (generationStatus !== "ready" || loading);

  const { value: timelineValue, unit: timelineUnit } = splitFutureYouTimelineForPaywall(
    planSnapshot.timeline,
  );
  const silhouetteSource = futureYouSilhouettesForGender(planSnapshot.profile.gender)?.after ?? null;
  const heroSource = imageUri ? { uri: imageUri } : silhouetteSource;

  const boxWidth = Math.min(265, screenWidth * 0.68);
  const boxHeight = (boxWidth * 4) / 3;

  const ctaDisabled = continuing || preparing;

  return (
    <View
      testID="onboarding-future-you-success"
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 23,
      }}
    >
      {onBack ? (
        <PressableScale
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          testID="onboarding-back"
          style={{ marginBottom: 16, height: 40, width: 40, alignItems: "center", justifyContent: "center" }}
        >
          <Text className="text-3xl" style={{ color: colors.textPrimary }}>
            ‹
          </Text>
        </PressableScale>
      ) : null}

      <View className="flex-1 justify-center" style={{ gap: heroVisible ? 16 : 20 }}>
        {heroVisible ? (
          <>
            <Text
              className="text-center text-[28px] font-bold"
              style={{ color: colors.textPrimary, letterSpacing: -0.5 }}
            >
              Meet your <Text style={{ color: ob.gold }}>Future You</Text>
            </Text>

            <View className="items-center" style={{ paddingVertical: 8 }}>
              <View
                accessibilityState={{ busy: preparing }}
                style={{
                  width: boxWidth,
                  height: boxHeight,
                  borderRadius: 22,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: GOLD_RING,
                  backgroundColor: colors.border,
                  shadowColor: ob.gold,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.7,
                  shadowRadius: 32,
                  elevation: 12,
                }}
              >
                {heroSource ? (
                  <Image
                    source={heroSource}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <View className="h-full w-full" style={{ backgroundColor: colors.border }} />
                )}
                {preparing ? (
                  <View
                    className="absolute inset-0 items-center justify-center gap-3 px-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
                  >
                    <ActivityIndicator color={ob.gold} />
                    <Text className="text-center text-sm font-semibold text-white">
                      {FUTURE_YOU_HERO_LOADING_LABEL}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Text
              className="text-center text-xl font-bold"
              style={{ color: colors.textPrimary }}
              accessibilityLabel={`You in ${planSnapshot.timeline}`}
            >
              You in {timelineValue}
              {timelineUnit}
            </Text>

            <View style={{ gap: 2 }}>
              <Text className="text-center text-xs" style={{ color: colors.textTertiary }}>
                {FUTURE_YOU_SUCCESS_AI_LABEL}
              </Text>
              <FutureYouReportButton
                jobId={futureYou?.generationJobId}
                context="onboarding_success"
                previewMode={previewMode}
              />
            </View>
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
              {FUTURE_YOU_SUCCESS_WELCOME_PREFIX}
              {FUTURE_YOU_SUCCESS_WELCOME_BRAND}
            </Text>
          </>
        )}
      </View>

      <View style={{ gap: 14 }}>
        {heroVisible ? (
          <Text className="text-center text-base" style={{ color: colors.textSecondary }}>
            {FUTURE_YOU_SUCCESS_WELCOME_PREFIX}
            <Text className="font-semibold" style={{ color: ob.gold }}>
              {FUTURE_YOU_SUCCESS_WELCOME_BRAND}
            </Text>
          </Text>
        ) : null}

        <PressableScale
          onPress={onContinue}
          disabled={ctaDisabled}
          testID="onboarding-future-you-success-continue"
          style={{
            alignItems: "center",
            borderRadius: 9999,
            paddingVertical: 16,
            backgroundColor: ctaDisabled ? colors.border : ob.gold,
            opacity: ctaDisabled ? 0.6 : 1,
          }}
        >
          <Text
            className="text-[17px] font-bold tracking-tight"
            style={{ color: ctaDisabled ? colors.textSecondary : ob.goldOn }}
          >
            {continuing ? "Starting…" : FUTURE_YOU_SUCCESS_CTA_LABEL}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}
