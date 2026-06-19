import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  OnboardingContinueButton,
  OnboardingGhostFooterAction,
} from "@/components/onboarding/OnboardingContinueButton";
import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import {
  ONBOARDING_PADDING_X,
  type OnboardingContinueTone,
} from "@/lib/onboardingTheme";
import { ONBOARDING_TOTAL_STEPS, onboardingProgressStep, phaseForStep } from "@/lib/onboardingSteps";

type OnboardingShellProps = {
  step: number;
  totalSteps?: number;
  title: ReactNode;
  /** Override the default headline className (e.g. smaller plan-ready headline). */
  headlineClassName?: string;
  subtitle?: string;
  /** Override the default subtitle className (e.g. larger regular plan-ready helper). */
  subtitleClassName?: string;
  children: ReactNode;
  onBack?: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
  continueTone?: OnboardingContinueTone;
  hideProgress?: boolean;
  hideFooter?: boolean;
  hideContinue?: boolean;
  /** Tighter footer spacing when only a ghost action is shown (e.g. Future You photo skip). */
  compactFooter?: boolean;
  footerGhostAction?: { label: string; onPress: () => void };
  generationPill?: ReactNode;
  hideTitle?: boolean;
  contentCentered?: boolean;
  /** Fill remaining height without scrolling (e.g. Future You photo step). */
  contentFill?: boolean;
  testID?: string;
};

export function OnboardingShell({
  step,
  totalSteps = ONBOARDING_TOTAL_STEPS,
  title,
  headlineClassName,
  subtitle,
  subtitleClassName,
  children,
  onBack,
  onContinue,
  continueDisabled = false,
  continueLabel = "Continue",
  continueTone = "default",
  hideProgress = false,
  hideFooter = false,
  hideContinue = false,
  compactFooter = false,
  footerGhostAction,
  generationPill,
  hideTitle = false,
  contentCentered = false,
  contentFill = false,
  testID = "onboarding-wizard",
}: OnboardingShellProps) {
  const { colors, ob } = useOnboardingTheme();
  const insets = useSafeAreaInsets();
  const { phaseLabel } = phaseForStep(step);
  const progressStep = onboardingProgressStep(step);
  const pct = Math.round(((progressStep + 1) / totalSteps) * 100);

  return (
    <View
      testID={testID}
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + 8,
        paddingHorizontal: ONBOARDING_PADDING_X,
      }}
    >
      {onBack ? (
        <PressableScale
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          testID="onboarding-back"
          style={{ marginBottom: 4, height: 40, width: 40, alignItems: "center", justifyContent: "center" }}
        >
          <Text className="text-2xl" style={{ color: colors.textPrimary }}>
            ‹
          </Text>
        </PressableScale>
      ) : (
        <View className="mb-1 h-10" />
      )}

      {!hideProgress ? (
        <View className="mb-5">
          {phaseLabel ? (
            <Text
              className="mb-2.5 text-right text-[11px] font-semibold"
              style={{ color: ob.stepMeta }}
            >
              {phaseLabel}
            </Text>
          ) : null}
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 1, max: totalSteps, now: progressStep + 1 }}
            className="h-1.5 overflow-hidden rounded-full"
            style={{ backgroundColor: ob.progressTrack }}
          >
            <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: ob.progressFill }} />
          </View>
        </View>
      ) : null}

      {generationPill}

      {!hideTitle ? (
        typeof title === "string" ? (
          <Text
            className={headlineClassName ?? "text-[28px] font-bold leading-tight tracking-tight"}
            style={{ color: ob.headline }}
          >
            {title}
          </Text>
        ) : (
          <View>{title}</View>
        )
      ) : null}
      {subtitle ? (
        <Text
          className={subtitleClassName ?? "mt-3 text-[11px] font-bold leading-normal tracking-wide"}
          style={{ color: ob.helper }}
        >
          {subtitle}
        </Text>
      ) : null}

      {contentFill ? (
        <View
          style={{
            flex: 1,
            marginTop: compactFooter ? 12 : 24,
            minHeight: 0,
          }}
        >
          {children}
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1, marginTop: contentCentered ? 0 : compactFooter ? 12 : 24 }}
          contentContainerStyle={[
            { flexGrow: 1, paddingBottom: compactFooter ? 4 : 12 },
            contentCentered ? { justifyContent: "center" } : null,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      )}

      {!hideFooter ? (
        <View
          style={{
            flexShrink: 0,
            marginHorizontal: -ONBOARDING_PADDING_X,
            paddingHorizontal: ONBOARDING_PADDING_X,
            paddingTop: compactFooter ? 6 : 16,
            paddingBottom: compactFooter ? Math.max(insets.bottom, 8) : Math.max(insets.bottom + 8, 20),
            borderTopWidth: compactFooter ? 0 : StyleSheet.hairlineWidth,
            borderTopColor: ob.progressTrack,
            backgroundColor: colors.background,
            gap: compactFooter ? 4 : 8,
          }}
        >
          {!hideContinue ? (
            <OnboardingContinueButton
              label={continueLabel}
              onPress={onContinue}
              disabled={continueDisabled}
              tone={continueTone}
            />
          ) : null}
          {footerGhostAction ? (
            <OnboardingGhostFooterAction
              label={footerGhostAction.label}
              onPress={footerGhostAction.onPress}
              compact={compactFooter}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
