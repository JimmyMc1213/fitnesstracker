import { FUTURE_YOU_HERO_LOADING_LABEL } from "@newyouai/core";
import type { FutureYouJobStatus, OnboardingProfile, UserGender, WeightUnit } from "@newyouai/types";
import { ActivityIndicator, Image, Text, useWindowDimensions, View } from "react-native";
import Svg, { Defs, FeGaussianBlur, Filter, Text as SvgText } from "react-native-svg";

import { IconLock } from "@/components/icons/FitnessIcons";
import { OnboardingContentReveal } from "@/components/motion";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { useFutureYouPaywallImage } from "@/hooks/useFutureYouPaywallImage";
import {
  futureYouGoalLabel,
  futureYouWeightDeltaLabel,
} from "@/lib/futureYouGoalSummary";
import { futureYouSilhouettesForGender } from "@/lib/futureYouSilhouettes";
import { splitFutureYouTimelineForPaywall } from "@/lib/futureYouTimeline";
import {
  paywallHeroImageBoxSize,
  type PaywallHeroLayoutTier,
} from "@/lib/paywallHeroLayout";
import { paywallRevealDelayMs } from "@/lib/onboardingPaywallReveal";
import { useLargeTextEnabled, useFontScale } from "@/lib/fontScale";

type Props = {
  timeline: string;
  profile: OnboardingProfile;
  weightUnit: WeightUnit;
  jobId: string | undefined;
  status: FutureYouJobStatus | "idle";
  gender: UserGender | undefined;
  layoutTier?: PaywallHeroLayoutTier;
  availableHeight?: number;
};

/** Gold ring color = `--ob-gold` (#c9a876) at 0.75, matching PWA `__image-wrap`. */
const GOLD_RING = "rgba(201, 168, 118, 0.75)";

function BlurredTimelineValue({
  value,
  color,
  fontSize,
}: {
  value: string;
  color: string;
  fontSize: number;
}) {
  const width = Math.max(fontSize, value.length * fontSize * 0.7) + 40;
  const height = fontSize * 2.4;
  return (
    <Svg width={width} height={height} accessibilityElementsHidden>
      <Defs>
        <Filter id="paywall-fy-timeline-blur" x="-150%" y="-150%" width="400%" height="400%">
          <FeGaussianBlur stdDeviation="7" />
        </Filter>
      </Defs>
      <SvgText
        x={width / 2}
        y={height / 2 + fontSize * 0.34}
        fontSize={fontSize}
        fontWeight="600"
        fill={color}
        textAnchor="middle"
        filter="url(#paywall-fy-timeline-blur)"
      >
        {value}
      </SvgText>
    </Svg>
  );
}

/** Blurred Future You hero teaser on paywall. */
export function OnboardingPaywallFutureYouHero({
  timeline,
  profile,
  weightUnit,
  jobId,
  status,
  gender,
  layoutTier = "regular",
  availableHeight,
}: Props) {
  const { colors } = useAppTheme();
  const { ob } = useOnboardingTheme();
  const largeText = useLargeTextEnabled();
  const fontScale = useFontScale();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { imageUri, loading } = useFutureYouPaywallImage({ jobId, status });
  const preparing = status !== "ready" || loading;

  const goalLabel = futureYouGoalLabel(profile.goal);
  const weightDeltaLabel = futureYouWeightDeltaLabel(profile, weightUnit);
  const { value: timelineValue, unit: timelineUnit } = splitFutureYouTimelineForPaywall(timeline);
  const timelineFontSize = largeText ? 18 : 20;

  // Blurred gendered silhouette stands in until the real Future You photo lands.
  const silhouetteSource = futureYouSilhouettesForGender(gender)?.after ?? null;
  const teaserSource = imageUri ? { uri: imageUri } : silhouetteSource;

  const tier = layoutTier;
  const heroAvailableHeight = availableHeight ?? screenHeight * 0.52;
  const { width: boxWidth, height: boxHeight } = paywallHeroImageBoxSize(
    tier,
    screenWidth,
    heroAvailableHeight,
    fontScale,
  );
  const isCompact = tier !== "regular";
  const isTight = tier === "tight";
  const titleSize = isTight ? 28 : isCompact ? 30 : 34;
  const sectionGap = isTight ? 6 : isCompact ? 8 : 12;

  return (
    <View testID="onboarding-paywall-future-you-hero" className="items-center" style={{ gap: sectionGap }}>
      <OnboardingContentReveal delay={paywallRevealDelayMs(1)} style={{ alignItems: "center", gap: 4 }}>
        <Text
          className="text-center font-bold"
          style={{ color: ob.gold, letterSpacing: -0.5, fontSize: titleSize, lineHeight: titleSize + 2 }}
        >
          Future You
        </Text>
        <View
          className="flex-row flex-wrap items-center justify-center"
          accessibilityLabel={`You in ${timeline}`}
        >
          <Text className="text-xl font-medium" style={{ color: colors.textSecondary }}>
            You in{" "}
          </Text>
          <BlurredTimelineValue
            value={timelineValue}
            color={colors.textSecondary}
            fontSize={timelineFontSize}
          />
          <Text className="text-xl font-medium" style={{ color: colors.textSecondary }}>
            {timelineUnit}
          </Text>
        </View>
      </OnboardingContentReveal>

      <OnboardingContentReveal
        delay={paywallRevealDelayMs(2)}
        style={{ alignItems: "center", justifyContent: "center", paddingVertical: isTight ? 0 : isCompact ? 2 : 4 }}
      >
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
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          {teaserSource ? (
            <Image
              source={teaserSource}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
              blurRadius={imageUri ? 18 : 12}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View className="h-full w-full" style={{ backgroundColor: colors.border }} />
          )}

          <View
            pointerEvents="none"
            className="absolute z-[2] flex-row items-center gap-1 rounded-full px-2 py-1.5"
            style={{ top: 16, left: 16, backgroundColor: "rgba(0,0,0,0.55)" }}
          >
            <IconLock size={11} stroke={2} color="#ffffff" />
            <Text className="text-[11px] font-semibold text-white" style={{ letterSpacing: 0.2 }}>
              Locked
            </Text>
          </View>

          <Text
            pointerEvents="none"
            className="absolute z-[2] px-3 text-center text-[10px] font-medium"
            style={{
              bottom: 10,
              left: 0,
              right: 0,
              color: ob.paywallRevealHintFg,
              letterSpacing: 0.1,
              textShadowColor: ob.paywallRevealHintShadow,
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 4,
            }}
            numberOfLines={largeText ? undefined : 2}
          >
            Subscribe to reveal your transformation
          </Text>

          {preparing ? (
            <View
              className="absolute inset-0 z-[3] items-center justify-center gap-3 px-4"
              style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            >
              <ActivityIndicator color={ob.gold} />
              <Text className="text-center text-sm font-semibold text-white">
                {FUTURE_YOU_HERO_LOADING_LABEL}
              </Text>
            </View>
          ) : null}
        </View>
      </OnboardingContentReveal>

      <OnboardingContentReveal
        delay={paywallRevealDelayMs(3)}
        style={{
          alignItems: "center",
          gap: 2,
          paddingBottom: isTight ? 10 : isCompact ? 12 : 14,
          width: "100%",
        }}
      >
        <Text
          className="text-center font-semibold"
          style={{
            color: ob.gold,
            fontSize: isTight ? 17 : isCompact ? 18 : 20,
            lineHeight: isTight ? 21 : isCompact ? 22 : 24,
          }}
        >
          Goal - {goalLabel}
        </Text>
        {weightDeltaLabel ? (
          <Text
            testID="onboarding-paywall-weight-delta"
            className="text-center font-semibold"
            style={{
              color: colors.textPrimary,
              fontSize: isTight ? 15 : isCompact ? 16 : 18,
              lineHeight: isTight ? 20 : isCompact ? 22 : 24,
              paddingBottom: 4,
            }}
          >
            {weightDeltaLabel}
          </Text>
        ) : null}
      </OnboardingContentReveal>
    </View>
  );
}
