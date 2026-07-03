import { useState } from "react";
import { Linking, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { DevSettings } from "react-native";
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
import { useFontScale, useLargeTextEnabled } from "@/lib/fontScale";
import { usePaywallOfferings } from "@/hooks/usePaywallOfferings";
import { purchaseProSubscription, restorePurchases } from "@/lib/revenueCat";
import {
  isOnboardingDevResetEnabled,
  seedPaywallFailedFutureYouState,
} from "@/lib/onboardingDevTools";

type Props = {
  onPurchaseStart: () => void;
  onPurchaseSuccess: (tier: "pro") => void;
  onPurchaseError: (error: string) => void;
  onBack: () => void;
  planSnapshot: OnboardingPlanSnapshot;
  futureYou: FutureYouDraft | undefined;
  generationStatus: FutureYouJobStatus | "idle";
  photoBlocked: boolean;
  weightUnit: WeightUnit;
  onReuploadFutureYou?: () => void;
};

export function OnboardingPaywall({
  onPurchaseStart,
  onPurchaseSuccess,
  onPurchaseError,
  onBack,
  planSnapshot,
  futureYou,
  generationStatus,
  photoBlocked,
  weightUnit,
  onReuploadFutureYou,
}: Props) {
  const { colors, ob } = useOnboardingTheme();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const fontScale = useFontScale();
  const largeText = useLargeTextEnabled();
  const paywallOfferings = usePaywallOfferings();
  const [billingPeriod, setBillingPeriod] = useState<PaywallBillingPeriod>("yearly");
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heroVisible = isFutureYouPaywallHeroVisible(futureYou, photoBlocked);
  const failedVisible = isFutureYouPaywallFailedVisible(futureYou, photoBlocked);
  const heroLayout = heroVisible
    ? paywallHeroLayoutTier(screenHeight, insets.top, insets.bottom, fontScale)
    : null;
  const compactHeroLayout = heroLayout != null && heroLayout.tier !== "regular";
  const storeReady = paywallOfferings.stub || paywallOfferings.ready;
  const storeError = !paywallOfferings.loading && !storeReady ? paywallOfferings.error : null;
  const ctaEnabled =
    isFutureYouPaywallCtaEnabled(futureYou, generationStatus, photoBlocked) &&
    !purchasing &&
    !paywallOfferings.loading &&
    storeReady;
  const ctaLabel = futureYouPaywallCtaLabel(futureYou, generationStatus, photoBlocked, billingPeriod);
  const footerStartStep = paywallFooterStartStep(heroVisible || failedVisible);
  const showDevReset = isOnboardingDevResetEnabled();

  async function handleDevResetFailedPaywall() {
    await seedPaywallFailedFutureYouState();
    DevSettings.reload();
  }

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

  const heroScrollContent = (
    <>
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
              <Text className="text-center text-base" style={{ color: colors.textSecondary }}>
                Let's get a photo that works.
              </Text>
            </View>
            <FutureYouFailureRecovery
              generationError={futureYou?.generationError}
              onReupload={onReuploadFutureYou}
              tone="onboarding"
              testID="onboarding-paywall-future-you-failure"
            />
            {showDevReset ? (
              <PressableScale
                onPress={() => void handleDevResetFailedPaywall()}
                testID="onboarding-paywall-dev-reset-failed"
                style={{ paddingVertical: 8, paddingHorizontal: 12 }}
              >
                <Text className="text-center text-xs underline" style={{ color: colors.textTertiary }}>
                  Reset to failed paywall (dev)
                </Text>
              </PressableScale>
            ) : null}
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
    </>
  );

  const checkoutFooter = (
    <>
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
              minHeight: 52,
              paddingVertical: 16,
              paddingHorizontal: 20,
              backgroundColor: ctaEnabled ? ob.gold : colors.border,
              opacity: ctaEnabled ? 1 : 0.6,
            }}
          >
            <Text
              className="text-center text-[17px] font-bold leading-5 tracking-tight"
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
          className="flex-row flex-wrap justify-center gap-x-4 gap-y-2"
          style={{ paddingTop: 12, paddingBottom: largeText ? 16 : Math.max(insets.bottom, 8) }}
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
    </>
  );

  const scrollGap = heroVisible || failedVisible ? (compactHeroLayout ? 8 : 12) : 20;

  return (
    <View
      testID="onboarding-paywall"
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {/* Dev-only back affordance. Tucked into the corner at low opacity so it stays
          tappable for development without affecting the paywall composition. */}
      <PressableScale
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back"
        testID="onboarding-back"
        hitSlop={12}
        style={{
          position: "absolute",
          top: insets.top - 2,
          left: 4,
          height: 30,
          width: 30,
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.18,
          zIndex: 20,
        }}
      >
        <Text className="text-2xl" style={{ color: colors.textPrimary }}>
          ‹
        </Text>
      </PressableScale>

      <View style={{ flex: 1, paddingTop: insets.top + (heroVisible || failedVisible ? 16 : 40), paddingHorizontal: 23 }}>
        {largeText ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              gap: scrollGap,
              paddingBottom: Math.max(insets.bottom, 16),
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {heroScrollContent}
            <View style={{ paddingTop: heroVisible || failedVisible ? 8 : 0, gap: 0 }}>
              {checkoutFooter}
            </View>
          </ScrollView>
        ) : (
          <>
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                gap: scrollGap,
                paddingBottom: heroVisible || failedVisible ? (compactHeroLayout ? 20 : 16) : 24,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {heroScrollContent}
            </ScrollView>

            <View
              style={{
                marginTop: heroVisible || failedVisible ? 8 : "auto",
                flexShrink: 0,
                width: "100%",
                paddingTop: heroVisible || failedVisible ? 4 : 0,
              }}
            >
              {checkoutFooter}
            </View>
          </>
        )}
      </View>
    </View>
  );
}
