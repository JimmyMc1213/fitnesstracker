import { useState } from "react";
import { Linking, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { FutureYouDraft, FutureYouJobStatus, WeightUnit } from "@newyouai/types";

import { OnboardingContentReveal } from "@/components/motion";
import { FutureYouFailureRecovery } from "@/components/future-you/FutureYouFailureRecovery";
import { OnboardingPaywallFutureYouHero } from "@/components/onboarding/OnboardingPaywallFutureYouHero";
import { OnboardingPaywallPlanPicker } from "@/components/onboarding/OnboardingPaywallPlanPicker";
import { OnboardingPaywallPlanSummary } from "@/components/onboarding/OnboardingPaywallPlanSummary";
import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { FUTURE_YOU_PRIVACY_POLICY_URL, PAYWALL_TERMS_URL } from "@/lib/futureYouLegal";
import {
  futureYouPaywallCtaLabel,
  isFutureYouPaywallCtaEnabled,
  isFutureYouPaywallFailedVisible,
  isFutureYouPaywallHeroVisible,
} from "@/lib/futureYouPaywallModel";
import {
  paywallFooterStartStep,
  paywallRevealDelayMs,
} from "@/lib/onboardingPaywallReveal";
import type { OnboardingPlanSnapshot } from "@/lib/onboardingPlanSnapshot";
import type { PaywallBillingPeriod } from "@/lib/paywallPlans";
import { paywallHeroLayoutTier } from "@/lib/paywallHeroLayout";
import { usePaywallOfferings } from "@/hooks/usePaywallOfferings";
import { purchaseProSubscription, restorePurchases } from "@/lib/revenueCat";

type Props = {
  onPurchaseStart: () => void;
  onPurchaseSuccess: (tier: "pro") => void;
  onPurchaseError: (error: string) => void;
  planSnapshot: OnboardingPlanSnapshot;
  futureYou: FutureYouDraft | undefined;
  generationStatus: FutureYouJobStatus | "idle";
  photoBlocked: boolean;
  regionBlocked?: boolean;
  weightUnit: WeightUnit;
  onReuploadFutureYou?: () => void;
};

export function OnboardingPaywall({
  onPurchaseStart,
  onPurchaseSuccess,
  onPurchaseError,
  planSnapshot,
  futureYou,
  generationStatus,
  photoBlocked,
  regionBlocked = false,
  weightUnit,
  onReuploadFutureYou,
}: Props) {
  const { colors, ob } = useOnboardingTheme();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const paywallOfferings = usePaywallOfferings();
  const [billingPeriod, setBillingPeriod] = useState<PaywallBillingPeriod>("yearly");
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heroVisible = isFutureYouPaywallHeroVisible(futureYou, photoBlocked, regionBlocked);
  const failedVisible = isFutureYouPaywallFailedVisible(futureYou, photoBlocked, regionBlocked);
  const heroLayout = heroVisible
    ? paywallHeroLayoutTier(screenHeight, insets.top, insets.bottom)
    : null;
  const compactHeroLayout = heroLayout != null && heroLayout.tier !== "regular";
  const storeReady = paywallOfferings.stub || paywallOfferings.ready;
  const storeError = !paywallOfferings.loading && !storeReady ? paywallOfferings.error : null;
  const ctaEnabled =
    isFutureYouPaywallCtaEnabled(futureYou, generationStatus, photoBlocked, regionBlocked) &&
    !purchasing &&
    !paywallOfferings.loading &&
    storeReady;
  const ctaLabel = futureYouPaywallCtaLabel(
    futureYou,
    generationStatus,
    photoBlocked,
    billingPeriod,
    regionBlocked,
  );
  const footerStartStep = paywallFooterStartStep(heroVisible || failedVisible);

  async function handlePurchase() {
    if (!ctaEnabled) return;
    setPurchasing(true);
    setError(null);
    onPurchaseStart();
    const result = await purchaseProSubscription(billingPeriod);
    setPurchasing(false);
    if (!result.ok) {
      setError(result.error);
      onPurchaseError(result.error);
      return;
    }
    onPurchaseSuccess("pro");
  }

  async function handleRestore() {
    if (purchasing) return;
    setPurchasing(true);
    setError(null);
    onPurchaseStart();
    const result = await restorePurchases();
    setPurchasing(false);
    if (!result.ok) {
      setError(result.error);
      onPurchaseError(result.error);
      return;
    }
    onPurchaseSuccess("pro");
  }

  return (
    <View
      testID="onboarding-paywall"
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <View style={{ flex: 1, paddingTop: insets.top + (heroVisible || failedVisible ? 16 : 40), paddingHorizontal: 23 }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          gap: heroVisible || failedVisible ? (compactHeroLayout ? 8 : 12) : 20,
          paddingBottom: heroVisible || failedVisible ? (compactHeroLayout ? 20 : 16) : 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!heroVisible && !failedVisible ? (
          <OnboardingContentReveal delay={paywallRevealDelayMs(0)}>
            <Text className="text-center text-[28px] font-bold leading-tight" style={{ color: colors.textPrimary }}>
              Unlock <Text style={{ color: ob.gold }}>NewYouAI</Text> to reach your goals faster.
            </Text>
          </OnboardingContentReveal>
        ) : null}

        {failedVisible && onReuploadFutureYou ? (
          <OnboardingContentReveal
            delay={paywallRevealDelayMs(1)}
            style={{ flex: 1, justifyContent: "center" }}
          >
            <View className="items-center gap-5">
              <View className="items-center gap-2">
                <Text
                  className="text-center text-[34px] font-bold"
                  style={{ color: ob.gold, letterSpacing: -0.5 }}
                >
                  Future You
                </Text>
                <Text
                  className="text-center text-base"
                  style={{ color: colors.textSecondary }}
                >
                  Let's get a photo that works.
                </Text>
              </View>
              <FutureYouFailureRecovery
                generationError={futureYou?.generationError}
                onReupload={onReuploadFutureYou}
                tone="onboarding"
                testID="onboarding-paywall-future-you-failure"
              />
            </View>
          </OnboardingContentReveal>
        ) : null}

        {heroVisible ? (
          <OnboardingPaywallFutureYouHero
            timeline={planSnapshot.timeline}
            profile={planSnapshot.profile}
            weightUnit={weightUnit}
            jobId={futureYou?.generationJobId}
            status={generationStatus}
            gender={planSnapshot.profile.gender}
            layoutTier={heroLayout?.tier}
            availableHeight={heroLayout?.availableHeight}
          />
        ) : !failedVisible ? (
          <OnboardingContentReveal delay={paywallRevealDelayMs(1)}>
            <OnboardingPaywallPlanSummary planSnapshot={planSnapshot} />
          </OnboardingContentReveal>
        ) : null}
      </ScrollView>

      <View
        style={{
          marginTop: heroVisible || failedVisible ? 8 : "auto",
          flexShrink: 0,
          width: "100%",
          paddingTop: heroVisible || failedVisible ? 4 : 0,
        }}
      >
        <View className="gap-3">
          <OnboardingContentReveal delay={paywallRevealDelayMs(footerStartStep)}>
            <OnboardingPaywallPlanPicker value={billingPeriod} onChange={setBillingPeriod} />
          </OnboardingContentReveal>
          <OnboardingContentReveal delay={paywallRevealDelayMs(footerStartStep + 1)}>
            <PressableScale
              onPress={() => void handlePurchase()}
              disabled={!ctaEnabled}
              testID="onboarding-paywall-cta"
              style={{
                alignItems: "center",
                borderRadius: 9999,
                paddingVertical: 16,
                backgroundColor: ctaEnabled ? ob.gold : colors.border,
                opacity: ctaEnabled ? 1 : 0.6,
              }}
            >
              <Text
                className="text-[17px] font-bold leading-5 tracking-tight"
                style={{ color: ctaEnabled ? ob.goldOn : colors.textSecondary }}
              >
                {purchasing ? "Processing…" : ctaLabel}
              </Text>
            </PressableScale>
          </OnboardingContentReveal>
          {storeError || error ? (
            <Text className="text-center text-sm leading-5" style={{ color: "#f87171" }}>
              {error ?? storeError}
            </Text>
          ) : null}
        </View>

        <OnboardingContentReveal delay={paywallRevealDelayMs(footerStartStep + 2)}>
          <View
            className="flex-row flex-wrap justify-center gap-x-4 gap-y-1"
            style={{ paddingTop: 12, paddingBottom: Math.max(insets.bottom, 8) }}
          >
            <PressableScale onPress={() => void handleRestore()} testID="onboarding-paywall-restore">
              <Text className="text-sm underline" style={{ color: colors.textSecondary }}>
                Restore Purchases
              </Text>
            </PressableScale>
            <PressableScale onPress={() => void Linking.openURL(PAYWALL_TERMS_URL)}>
              <Text className="text-sm underline" style={{ color: colors.textSecondary }}>
                Terms
              </Text>
            </PressableScale>
            <PressableScale onPress={() => void Linking.openURL(FUTURE_YOU_PRIVACY_POLICY_URL)}>
              <Text className="text-sm underline" style={{ color: colors.textSecondary }}>
                Privacy
              </Text>
            </PressableScale>
          </View>
        </OnboardingContentReveal>
      </View>
      </View>
    </View>
  );
}
