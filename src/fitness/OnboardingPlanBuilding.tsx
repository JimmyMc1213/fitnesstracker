import { useEffect, useRef, useState } from "react";

const BUILD_DURATION_MS = 12500;

const STATUS_MESSAGES = [
  "Analyzing your profile…",
  "Calculating your nutrition targets…",
  "Building your workout split…",
  "Selecting exercises for your equipment…",
  "Balancing rest and recovery days…",
  "Finalizing your coaching plan…",
];

type PlanItem = {
  id: string;
  label: string;
  completeAt: number;
};

const PLAN_ITEMS: PlanItem[] = [
  { id: "calories", label: "Calories", completeAt: 18 },
  { id: "protein", label: "Protein", completeAt: 28 },
  { id: "carbs", label: "Carbs", completeAt: 38 },
  { id: "fats", label: "Fats", completeAt: 48 },
  { id: "split", label: "Workout split", completeAt: 62 },
  { id: "exercises", label: "Exercise selection", completeAt: 74 },
  { id: "rest", label: "Rest days", completeAt: 86 },
  { id: "volume", label: "Weekly volume", completeAt: 96 },
];

/** Survives StrictMode remount so the animation does not restart from 0. */
let sessionStartAt: number | null = null;

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function progressFromElapsed(elapsedMs: number): number {
  const raw = Math.min(1, elapsedMs / BUILD_DURATION_MS);
  return Math.round(easeOutCubic(raw) * 100);
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3 7.2l2.4 2.4L11 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OnboardingPlanBuilding({ onComplete }: { onComplete: () => void }) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [progress, setProgress] = useState(() =>
    sessionStartAt != null ? progressFromElapsed(performance.now() - sessionStartAt) : 0,
  );

  useEffect(() => {
    if (sessionStartAt == null) {
      sessionStartAt = performance.now();
    }
    const start = sessionStartAt;
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      setProgress(progressFromElapsed(elapsed));
      if (elapsed < BUILD_DURATION_MS) {
        frame = requestAnimationFrame(tick);
      }
    };

    setProgress(progressFromElapsed(performance.now() - start));
    frame = requestAnimationFrame(tick);

    const remaining = Math.max(350, BUILD_DURATION_MS - (performance.now() - start) + 350);
    const doneId = window.setTimeout(() => {
      sessionStartAt = null;
      onCompleteRef.current();
    }, remaining);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(doneId);
    };
  }, []);

  const statusIndex = Math.min(
    STATUS_MESSAGES.length - 1,
    Math.floor((progress / 100) * STATUS_MESSAGES.length),
  );

  return (
    <div className="onboarding-shell onboarding-plan-building-shell">
      <div className="onboarding-plan-building" role="status" aria-live="polite" aria-busy={progress < 100}>
        <p className="onboarding-plan-building__pct">{progress}%</p>
        <h2 className="onboarding-plan-building__headline">We&apos;re setting everything up for you</h2>

        <div className="onboarding-plan-building__bar-wrap">
          <div className="onboarding-plan-building__bar-track">
            <div className="onboarding-plan-building__bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="onboarding-plan-building__status">{STATUS_MESSAGES[statusIndex]}</p>
        </div>

        <div className="onboarding-plan-building__card">
          <p className="onboarding-plan-building__card-title">Your personalized program</p>
          <ul className="onboarding-plan-building__list">
            {PLAN_ITEMS.map((item) => {
              const done = progress >= item.completeAt;
              return (
                <li key={item.id} className="onboarding-plan-building__item">
                  <span className={done ? "onboarding-plan-building__label onboarding-plan-building__label--done" : "onboarding-plan-building__label"}>
                    {item.label}
                  </span>
                  {done ? (
                    <span className="onboarding-plan-building__check" aria-label={`${item.label} ready`}>
                      <CheckIcon />
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
