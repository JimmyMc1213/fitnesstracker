import { PAYWALL_PLANS, PAYWALL_YEARLY_BADGE, type PaywallBillingPeriod } from "@/lib/paywallPlans";
import { PAYWALL_NO_FONT_SCALE, PAYWALL_TYPOGRAPHY } from "@/lib/paywallTypography";
import { Text, View } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";

type Props = {
  value: PaywallBillingPeriod;
  onChange: (period: PaywallBillingPeriod) => void;
};

function PlanCard({
  period,
  selected,
  onSelect,
  stacked = false,
}: {
  period: PaywallBillingPeriod;
  selected: boolean;
  onSelect: () => void;
  stacked?: boolean;
}) {
  const { colors, ob } = useOnboardingTheme();
  const plan = PAYWALL_PLANS[period];
  const isYearly = period === "yearly";

  const accessibilityLabel = [
    plan.label,
    plan.billedAmount,
    plan.calculatedPrice,
    plan.trialNote,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <PressableScale
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      testID={`paywall-plan-${period}`}
      activeScale={0.97}
      style={{
        position: "relative",
        flex: stacked ? undefined : 1,
        width: stacked ? "100%" : undefined,
        borderRadius: 16,
        padding: 16,
        paddingRight: 36,
        borderWidth: 2,
        borderColor: selected ? ob.gold : colors.border,
        backgroundColor: "rgba(255, 255, 255, 0.04)",
      }}
    >
      {isYearly ? (
        <View
          className="absolute rounded-full px-2.5 py-0.5"
          style={{ top: -10, left: 8, backgroundColor: ob.gold }}
        >
          <Text
            {...PAYWALL_NO_FONT_SCALE}
            style={{ ...PAYWALL_TYPOGRAPHY.planBadge, color: ob.goldOn, textTransform: "uppercase" }}
          >
            {PAYWALL_YEARLY_BADGE}
          </Text>
        </View>
      ) : null}
      <View
        className="absolute right-2 top-2 h-5 w-5 items-center justify-center rounded-full"
        style={{
          borderWidth: 2,
          borderColor: selected ? ob.gold : "rgba(255, 255, 255, 0.28)",
          backgroundColor: selected ? ob.gold : "transparent",
        }}
      >
        {selected ? (
          <Text {...PAYWALL_NO_FONT_SCALE} style={{ ...PAYWALL_TYPOGRAPHY.planCheck, color: ob.goldOn }}>
            ✓
          </Text>
        ) : null}
      </View>
      <Text
        {...PAYWALL_NO_FONT_SCALE}
        style={{ ...PAYWALL_TYPOGRAPHY.planLabel, color: colors.textPrimary }}
      >
        {plan.label}
      </Text>
      {/* Billed amount is primary (Apple 3.1.2c) */}
      <Text
        {...PAYWALL_NO_FONT_SCALE}
        testID={`paywall-plan-${period}-billed`}
        style={{ ...PAYWALL_TYPOGRAPHY.planPrice, marginTop: 4, color: colors.textPrimary }}
      >
        {plan.billedAmount}
      </Text>
      {plan.calculatedPrice ? (
        <Text
          {...PAYWALL_NO_FONT_SCALE}
          testID={`paywall-plan-${period}-calculated`}
          style={{ ...PAYWALL_TYPOGRAPHY.planBilling, marginTop: 2, color: colors.textTertiary }}
        >
          {plan.calculatedPrice}
        </Text>
      ) : null}
      <Text
        {...PAYWALL_NO_FONT_SCALE}
        style={{ ...PAYWALL_TYPOGRAPHY.planTrial, marginTop: 6, color: colors.textSecondary }}
        numberOfLines={2}
      >
        {plan.trialNote}
      </Text>
    </PressableScale>
  );
}

/** Yearly "61% OFF" badge sits at top: -10 — reserve that overhang so it can't cover goal weight. */
const PLAN_BADGE_OVERHANG_PX = 12;

export function OnboardingPaywallPlanPicker({ value, onChange }: Props) {
  return (
    <View
      testID="onboarding-paywall-plan-picker"
      className="flex-row gap-3"
      accessibilityRole="radiogroup"
      accessibilityLabel="Subscription plan"
      style={{ paddingTop: PLAN_BADGE_OVERHANG_PX }}
    >
      <PlanCard
        period="yearly"
        selected={value === "yearly"}
        onSelect={() => onChange("yearly")}
      />
      <PlanCard
        period="monthly"
        selected={value === "monthly"}
        onSelect={() => onChange("monthly")}
      />
    </View>
  );
}
