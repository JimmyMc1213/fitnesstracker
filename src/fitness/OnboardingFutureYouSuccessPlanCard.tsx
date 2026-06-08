import { onboardingPlanSnapshotWeekRows, type OnboardingPlanSnapshot } from "./onboardingPlanSnapshot";
import { formatWaterVolume } from "./waterIntake";

type Props = {
  planSnapshot: OnboardingPlanSnapshot;
};

function PlanSectionLabel({ children }: { children: string }) {
  return <p className="onboarding-fy-success-plan__label">{children}</p>;
}

function PlanDivider() {
  return <div className="onboarding-fy-success-plan__divider" aria-hidden />;
}

function TimelineMetric({ timeline }: { timeline: string }) {
  const match = timeline.match(/^([\d,]+)\s*(.+)$/);
  if (!match) {
    return <span className="onboarding-fy-success-plan__value">{timeline}</span>;
  }
  return (
    <>
      <span className="onboarding-fy-success-plan__value">{match[1]}</span>
      <span className="onboarding-fy-success-plan__unit">{` ${match[2]}`}</span>
    </>
  );
}

/** Expanded plan recap for skip / under-18 post-pay success. */
export function OnboardingFutureYouSuccessPlanCard({ planSnapshot }: Props) {
  const { macros, timeline, waterDailyTargetOz, stepsTarget, volumeUnit } = planSnapshot;
  const weekRows = onboardingPlanSnapshotWeekRows(planSnapshot);

  return (
    <section className="onboarding-fy-success-plan" aria-label="Your plan">
      <div className="onboarding-fy-success-plan__section">
        <PlanSectionLabel>Your plan</PlanSectionLabel>
        <p className="onboarding-fy-success-plan__inline-metrics">
          <span className="onboarding-fy-success-plan__metric">
            <span className="onboarding-fy-success-plan__value">{macros.cal.toLocaleString()}</span>
            <span className="onboarding-fy-success-plan__unit"> cal</span>
          </span>
          <span className="onboarding-fy-success-plan__sep" aria-hidden>
            {" · "}
          </span>
          <span className="onboarding-fy-success-plan__metric">
            <span className="onboarding-fy-success-plan__value">{macros.p.toLocaleString()}</span>
            <span className="onboarding-fy-success-plan__unit">g protein</span>
          </span>
          <span className="onboarding-fy-success-plan__sep" aria-hidden>
            {" · "}
          </span>
          <span className="onboarding-fy-success-plan__metric">
            <TimelineMetric timeline={timeline} />
          </span>
        </p>
      </div>

      <PlanDivider />

      <div className="onboarding-fy-success-plan__section">
        <PlanSectionLabel>Your week</PlanSectionLabel>
        <ul className="onboarding-fy-success-plan__week">
          {weekRows.map(({ dayLabel, name }) => (
            <li key={`${dayLabel}-${name}`} className="onboarding-fy-success-plan__week-row">
              {dayLabel} · {name}
            </li>
          ))}
        </ul>
      </div>

      <PlanDivider />

      <div className="onboarding-fy-success-plan__section">
        <PlanSectionLabel>Your targets</PlanSectionLabel>
        <p className="onboarding-fy-success-plan__inline-metrics onboarding-fy-success-plan__inline-metrics--targets">
          <span className="onboarding-fy-success-plan__metric">
            <span className="onboarding-fy-success-plan__unit">Hydration: </span>
            <span className="onboarding-fy-success-plan__value">
              {formatWaterVolume(waterDailyTargetOz, volumeUnit)}
            </span>
          </span>
          <span className="onboarding-fy-success-plan__sep" aria-hidden>
            {" · "}
          </span>
          <span className="onboarding-fy-success-plan__metric">
            <span className="onboarding-fy-success-plan__unit">Steps: </span>
            <span className="onboarding-fy-success-plan__value">{stepsTarget.toLocaleString()}</span>
          </span>
        </p>
      </div>
    </section>
  );
}
