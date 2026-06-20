import { FUTURE_YOU_HERO_LOADING_LABEL } from "@newyouai/core";
import type { FutureYouJobStatus, UserGender } from "@newyouai/types";
import { ActivityIndicator, Image, Text, useWindowDimensions, View } from "react-native";
import Svg, { Defs, FeGaussianBlur, Filter, Text as SvgText } from "react-native-svg";

import { OnboardingContentReveal } from "@/components/motion";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { useFutureYouPaywallImage } from "@/hooks/useFutureYouPaywallImage";
import { futureYouSilhouettesForGender } from "@/lib/futureYouSilhouettes";
import { splitFutureYouTimelineForPaywall } from "@/lib/futureYouTimeline";
import { paywallRevealDelayMs } from "@/lib/onboardingPaywallReveal";

type Props = {
  timeline: string;
  jobId: string | undefined;
  status: FutureYouJobStatus | "idle";
  gender: UserGender | undefined;
};

/** Gold ring color = `--ob-gold` (#c9a876) at 0.75, matching PWA `__image-wrap`. */
const GOLD_RING = "rgba(201, 168, 118, 0.75)";

/**
 * Teaser timeline number, heavily blurred via an SVG Gaussian filter so the value
 * is illegible (the actual number is the paywall tease). A generous canvas + filter
 * region keeps the blur from being clipped at higher blur radii.
 */
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
        fontWeight="bold"
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
export function OnboardingPaywallFutureYouHero({ timeline, jobId, status, gender }: Props) {
  const { colors } = useAppTheme();
  const { ob } = useOnboardingTheme();
  const { width: screenWidth } = useWindowDimensions();
  const { imageUri, loading } = useFutureYouPaywallImage({ jobId, status });
  const preparing = status !== "ready" || loading;
  const { value: timelineValue, unit: timelineUnit } = splitFutureYouTimelineForPaywall(timeline);

  // Blurred gendered silhouette stands in until the real Future You photo lands.
  const silhouetteSource = futureYouSilhouettesForGender(gender)?.after ?? null;
  const teaserSource = imageUri ? { uri: imageUri } : silhouetteSource;

  const boxWidth = Math.min(228, screenWidth * 0.58);
  const boxHeight = (boxWidth * 4) / 3;
  const taglineFontSize = 22;

  return (
    <View testID="onboarding-paywall-future-you-hero" className="items-center gap-4">
      <OnboardingContentReveal delay={paywallRevealDelayMs(1)} style={{ alignItems: "center" }}>
        <Text className="text-center text-[22px] font-bold" style={{ color: colors.textPrimary }}>
          <Text style={{ color: ob.gold }}>Future You</Text> is ready
        </Text>
      </OnboardingContentReveal>

      <OnboardingContentReveal
        delay={paywallRevealDelayMs(2)}
        style={{ alignItems: "center", justifyContent: "center", paddingVertical: 12 }}
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
      </OnboardingContentReveal>

      <OnboardingContentReveal delay={paywallRevealDelayMs(3)} style={{ alignItems: "center" }}>
        <View
          className="flex-row items-center justify-center"
          accessibilityLabel={`You in ${timeline}`}
        >
          <Text className="text-[22px] font-bold" style={{ color: colors.textPrimary }}>
            You in{" "}
          </Text>
          <BlurredTimelineValue
            value={timelineValue}
            color={colors.textPrimary}
            fontSize={taglineFontSize}
          />
          <Text className="text-[22px] font-bold" style={{ color: colors.textPrimary }}>
            {timelineUnit}
          </Text>
        </View>
      </OnboardingContentReveal>
    </View>
  );
}
