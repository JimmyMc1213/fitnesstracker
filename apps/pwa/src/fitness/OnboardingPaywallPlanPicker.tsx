import { PAYWALL_PLANS, PAYWALL_YEARLY_BADGE, type PaywallBillingPeriod } from "./paywallPlans";

type Props = {
  value: PaywallBillingPeriod;
  onChange: (period: PaywallBillingPeriod) => void;
};

function PlanCheck({ selected }: { selected: boolean }) {
  if (selected) {
    return (
      <span className="onboarding-paywall__plan-check onboarding-paywall__plan-check--selected" aria-hidden>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path
            d="M3.5 7.25L5.75 9.5L10.5 4.75"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  return <span className="onboarding-paywall__plan-check" aria-hidden />;
}

function PlanCard({
  period,
  selected,
  onSelect,
}: {
  period: PaywallBillingPeriod;
  selected: boolean;
  onSelect: () => void;
}) {
  const plan = PAYWALL_PLANS[period];
  const isYearly = period === "yearly";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`tap onboarding-paywall__plan${selected ? " onboarding-paywall__plan--selected" : ""}`}
      onClick={onSelect}
    >
      {isYearly ? (
        <span className="onboarding-paywall__plan-badge">{PAYWALL_YEARLY_BADGE}</span>
      ) : null}
      <PlanCheck selected={selected} />
      <span className="onboarding-paywall__plan-label">{plan.label}</span>
      <span className="onboarding-paywall__plan-price">{plan.billedAmount}</span>
      {plan.calculatedPrice ? (
        <span className="onboarding-paywall__plan-billing">{plan.calculatedPrice}</span>
      ) : null}
      <span className="onboarding-paywall__plan-trial">{plan.trialNote}</span>
    </button>
  );
}

export function OnboardingPaywallPlanPicker({ value, onChange }: Props) {
  return (
    <div className="onboarding-paywall__plans" role="radiogroup" aria-label="Subscription plan">
      <PlanCard period="yearly" selected={value === "yearly"} onSelect={() => onChange("yearly")} />
      <PlanCard period="monthly" selected={value === "monthly"} onSelect={() => onChange("monthly")} />
    </div>
  );
}
