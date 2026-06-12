import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/useAppTheme";
import { ONBOARDING_TOTAL_STEPS, onboardingProgressStep, phaseForStep } from "@/lib/onboardingSteps";

type OnboardingShellProps = {
  step: number;
  totalSteps?: number;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
  onBack?: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
  hideProgress?: boolean;
  hideFooter?: boolean;
  hideContinue?: boolean;
  footerGhostAction?: { label: string; onPress: () => void };
  generationPill?: ReactNode;
  hideTitle?: boolean;
  contentCentered?: boolean;
  testID?: string;
};

export function OnboardingShell({
  step,
  totalSteps = ONBOARDING_TOTAL_STEPS,
  title,
  subtitle,
  children,
  onBack,
  onContinue,
  continueDisabled = false,
  continueLabel = "Continue",
  hideProgress = false,
  hideFooter = false,
  hideContinue = false,
  footerGhostAction,
  generationPill,
  hideTitle = false,
  contentCentered = false,
  testID = "onboarding-wizard",
}: OnboardingShellProps) {
  const { colors } = useAppTheme();
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
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 23,
      }}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          testID="onboarding-back"
          className="mb-4 h-10 w-10 items-center justify-center"
        >
          <Text className="text-2xl" style={{ color: colors.textPrimary }}>
            ‹
          </Text>
        </Pressable>
      ) : (
        <View className="mb-4 h-10" />
      )}

      {!hideProgress ? (
        <View className="mb-5">
          {phaseLabel ? (
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
              {phaseLabel}
            </Text>
          ) : null}
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 1, max: totalSteps, now: progressStep + 1 }}
            className="h-1.5 overflow-hidden rounded-full"
            style={{ backgroundColor: colors.border }}
          >
            <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors.accent }} />
          </View>
        </View>
      ) : null}

      {!hideTitle ? (
        typeof title === "string" ? (
          <Text className="text-[28px] font-bold leading-tight" style={{ color: colors.textPrimary }}>
            {title}
          </Text>
        ) : (
          <View className="text-[28px] font-bold leading-tight">{title}</View>
        )
      ) : null}
      {subtitle ? (
        <Text className="mt-2 text-base" style={{ color: colors.textSecondary }}>
          {subtitle}
        </Text>
      ) : null}

      <View
        className={`min-h-0 flex-1 ${contentCentered ? "mt-0 justify-center" : "mt-6"}`}
      >
        {children}
      </View>

      {generationPill}

      {!hideFooter ? (
        <View className="mt-4 gap-2">
          {!hideContinue ? (
            <Pressable
              onPress={onContinue}
              disabled={continueDisabled}
              testID="onboarding-continue"
              className="items-center rounded-full py-4"
              style={{
                backgroundColor: continueDisabled ? colors.border : colors.accent,
                opacity: continueDisabled ? 0.6 : 1,
              }}
            >
              <Text className="text-base font-semibold" style={{ color: colors.accentText }}>
                {continueLabel}
              </Text>
            </Pressable>
          ) : null}
          {footerGhostAction ? (
            <Pressable
              onPress={footerGhostAction.onPress}
              testID="onboarding-skip"
              className="items-center py-2"
            >
              <Text className="text-base font-medium" style={{ color: colors.textSecondary }}>
                {footerGhostAction.label}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
