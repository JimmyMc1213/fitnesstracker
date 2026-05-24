import { useEffect, useRef, useState, type ReactNode } from "react";
import type { NutritionGoal } from "./types";
import { coachingLoopReinforcementCopy } from "./onboardingReinforcementCopy";

const REVEAL_DURATION_MS = 500;

const REVEAL_DELAY_MS = {
  header: 0,
  card1: 450,
  arrow1: 750,
  card2: 1050,
  arrow2: 1350,
  card3: 1650,
  statement: 2050,
  cta: 2500,
} as const;

type RevealKey = keyof typeof REVEAL_DELAY_MS;

function CoachingLoopIcon({ name }: { name: "barbell" | "brain" | "trending-up" }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "barbell") {
    return (
      <svg {...common}>
        <path d="M2 12h1" />
        <path d="M6 8H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
        <path d="M6 7v10a1 1 0 0 0 1 1h1" />
        <path d="M9 7v10" />
        <path d="M15 7v10" />
        <path d="M18 7v10a1 1 0 0 0 1 1h1" />
        <path d="M20 8h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2" />
        <path d="M22 12h-1" />
      </svg>
    );
  }

  if (name === "brain") {
    return (
      <svg {...common}>
        <path d="M15.5 13a3.5 3.5 0 0 0-3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" />
        <path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1-7 0v-1.8" />
        <path d="M17.5 16a3.5 3.5 0 1 0-7 0v-1.5a3.5 3.5 0 1 0 7 0v1.5" />
        <path d="M6.5 16a3.5 3.5 0 1 1 7 0v-1.5a3.5 3.5 0 1 1-7 0v1.5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M6 13l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FadeUpReveal({
  show,
  className,
  children,
}: {
  show: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`onboarding-coaching-loop__reveal${show ? " onboarding-coaching-loop__reveal--visible" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}

function LoopStepCard({
  icon,
  label,
  subtext,
}: {
  icon: ReactNode;
  label: string;
  subtext: string;
}) {
  return (
    <article className="onboarding-coaching-loop__card">
      <div className="onboarding-coaching-loop__card-icon">{icon}</div>
      <div className="onboarding-coaching-loop__card-copy">
        <p className="onboarding-coaching-loop__card-label">{label}</p>
        <p className="onboarding-coaching-loop__card-subtext">{subtext}</p>
      </div>
    </article>
  );
}

export function OnboardingPotentialReinforcement({
  goal,
  onCtaReveal,
  onCtaReady,
}: {
  goal: NutritionGoal;
  onCtaReveal?: () => void;
  onCtaReady?: () => void;
}) {
  const copy = coachingLoopReinforcementCopy(goal);
  const [visible, setVisible] = useState<Partial<Record<RevealKey, boolean>>>({});
  const onCtaRevealRef = useRef(onCtaReveal);
  const onCtaReadyRef = useRef(onCtaReady);
  onCtaRevealRef.current = onCtaReveal;
  onCtaReadyRef.current = onCtaReady;

  useEffect(() => {
    const revealAll = () => {
      setVisible(
        Object.fromEntries((Object.keys(REVEAL_DELAY_MS) as RevealKey[]).map((key) => [key, true])) as Partial<
          Record<RevealKey, boolean>
        >,
      );
      onCtaRevealRef.current?.();
      onCtaReadyRef.current?.();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealAll();
      return;
    }

    const timers = (Object.entries(REVEAL_DELAY_MS) as [RevealKey, number][]).map(([key, delay]) =>
      window.setTimeout(() => {
        setVisible((current) => ({ ...current, [key]: true }));
        if (key === "cta") {
          onCtaRevealRef.current?.();
          window.setTimeout(() => onCtaReadyRef.current?.(), REVEAL_DURATION_MS);
        }
      }, delay),
    );

    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <div className="onboarding-coaching-loop">
      <FadeUpReveal show={!!visible.header}>
        <h2 className="onboarding-headline onboarding-coaching-loop__headline">{copy.title}</h2>
        <p className="onboarding-helper onboarding-coaching-loop__helper">{copy.subtitle}</p>
      </FadeUpReveal>

      <div className="onboarding-coaching-loop__steps">
        <FadeUpReveal show={!!visible.card1}>
          <LoopStepCard
            icon={<CoachingLoopIcon name={copy.steps[0].icon} />}
            label={copy.steps[0].label}
            subtext={copy.steps[0].subtext}
          />
        </FadeUpReveal>

        <FadeUpReveal show={!!visible.arrow1} className="onboarding-coaching-loop__arrow">
          <ArrowDownIcon />
        </FadeUpReveal>

        <FadeUpReveal show={!!visible.card2}>
          <LoopStepCard
            icon={<CoachingLoopIcon name={copy.steps[1].icon} />}
            label={copy.steps[1].label}
            subtext={copy.steps[1].subtext}
          />
        </FadeUpReveal>

        <FadeUpReveal show={!!visible.arrow2} className="onboarding-coaching-loop__arrow">
          <ArrowDownIcon />
        </FadeUpReveal>

        <FadeUpReveal show={!!visible.card3}>
          <LoopStepCard
            icon={<CoachingLoopIcon name={copy.steps[2].icon} />}
            label={copy.steps[2].label}
            subtext={copy.steps[2].subtext}
          />
        </FadeUpReveal>
      </div>

      <FadeUpReveal show={!!visible.statement}>
        <p className="onboarding-coaching-loop__statement">{copy.bottomStatement}</p>
      </FadeUpReveal>
    </div>
  );
}
