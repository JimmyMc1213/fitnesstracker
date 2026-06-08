import {
  onboardingPlanSnapshotWeekRows,
  type OnboardingPlanSnapshot,
} from "./onboardingPlanSnapshot";
import { formatWaterVolume } from "./waterIntake";

type Props = {
  planSnapshot: OnboardingPlanSnapshot;
};

function MacroStat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone?: "protein" | "carbs" | "fat";
}) {
  return (
    <div className="onboarding-paywall-plan-summary__macro">
      <span
        className={`onboarding-paywall-plan-summary__macro-value${
          tone ? ` onboarding-paywall-plan-summary__macro-value--${tone}` : ""
        }`}
      >
        {value.toLocaleString()}
      </span>
      <span className="onboarding-paywall-plan-summary__macro-label">{label}</span>
    </div>
  );
}

/** Compact plan recap for skip / under-18 paywall (no Future You hero). */
export function OnboardingPaywallPlanSummary({ planSnapshot }: Props) {
  const { macros, profile, templates, timeline, waterDailyTargetOz, stepsTarget, volumeUnit } = planSnapshot;
  const weekRows = onboardingPlanSnapshotWeekRows(planSnapshot);
  const templateByDay = new Map(templates.map((t) => [t.dayLabel, t]));
  const trainingDays = profile.workoutDaysPerWeek ?? weekRows.length;

  return (
    <div className="onboarding-paywall-plan-summary">
      <section className="onboarding-paywall-plan-summary__section" aria-label="Daily fuel targets">
        <h2 className="onboarding-paywall-plan-summary__label">Daily fuel</h2>
        <div className="onboarding-paywall-plan-summary__macros">
          <MacroStat value={macros.cal} label="cal" />
          <MacroStat value={macros.p} label="g protein" tone="protein" />
          <MacroStat value={macros.c} label="g carbs" tone="carbs" />
          <MacroStat value={macros.f} label="g fat" tone="fat" />
        </div>
        <p className="onboarding-paywall-plan-summary__timeline">Goal timeline · {timeline}</p>
      </section>

      <section
        className="onboarding-paywall-plan-summary__section onboarding-paywall-plan-summary__section--week"
        aria-label="Training week"
      >
        <div className="onboarding-paywall-plan-summary__week-layout">
          <div className="onboarding-paywall-plan-summary__week-main">
            <div className="onboarding-paywall-plan-summary__section-head">
              <h2 className="onboarding-paywall-plan-summary__label">Your week</h2>
              <p className="onboarding-paywall-plan-summary__meta">{trainingDays} training days</p>
            </div>
            <ul className="onboarding-paywall-plan-summary__week">
              {weekRows.map(({ dayLabel, name }) => {
                const template = templateByDay.get(dayLabel);
                const focus = template?.focus?.trim();
                return (
                  <li key={`${dayLabel}-${name}`} className="onboarding-paywall-plan-summary__week-row">
                    <span className="onboarding-paywall-plan-summary__week-day">{dayLabel}</span>
                    <div className="onboarding-paywall-plan-summary__week-copy">
                      <span className="onboarding-paywall-plan-summary__week-name">{name}</span>
                      {focus ? (
                        <span className="onboarding-paywall-plan-summary__week-focus">{focus}</span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="onboarding-paywall-plan-summary__habits">
            <div className="onboarding-paywall-plan-summary__habit">
              <span className="onboarding-paywall-plan-summary__label">Hydration</span>
              <span className="onboarding-paywall-plan-summary__habit-value onboarding-paywall-plan-summary__habit-value--hydration">
                {formatWaterVolume(waterDailyTargetOz, volumeUnit)}
              </span>
            </div>
            <div className="onboarding-paywall-plan-summary__habit">
              <span className="onboarding-paywall-plan-summary__label">Steps</span>
              <span className="onboarding-paywall-plan-summary__habit-value onboarding-paywall-plan-summary__habit-value--steps">
                {stepsTarget.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
