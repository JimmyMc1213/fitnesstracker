import { useEffect, useRef, useState } from "react";

import { firePlanOnlySuccessConfetti } from "./confetti";
import { GymmySplashMark } from "./GymmySplashMark";
import { PURCHASE_WELCOME_HEADLINE } from "./futureYouSuccessModel";
import {
  PURCHASE_WELCOME_SPLASH_FADE_OUT_MS,
  PURCHASE_WELCOME_SPLASH_MIN_VISIBLE_MS,
} from "./splashTiming";

type Props = {
  onComplete: () => void;
};

export function OnboardingPurchaseWelcomeSplash({ onComplete }: Props) {
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const divRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  const finishedRef = useRef(false);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let stopConfetti: (() => void) | undefined;
    const confettiTimer = window.setTimeout(() => {
      stopConfetti = firePlanOnlySuccessConfetti(PURCHASE_WELCOME_SPLASH_MIN_VISIBLE_MS + 1200);
    }, 120);

    const fadeTimer = window.setTimeout(() => {
      const el = divRef.current;
      if (!el) return;
      el.style.transition = `opacity ${PURCHASE_WELCOME_SPLASH_FADE_OUT_MS}ms ease-out`;
      el.style.opacity = "0";
      setExiting(true);
    }, PURCHASE_WELCOME_SPLASH_MIN_VISIBLE_MS);

    return () => {
      window.clearTimeout(confettiTimer);
      window.clearTimeout(fadeTimer);
      stopConfetti?.();
    };
  }, []);

  useEffect(() => {
    if (!exiting) return;

    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setMounted(false);
      onCompleteRef.current();
    };

    const id = window.setTimeout(finish, PURCHASE_WELCOME_SPLASH_FADE_OUT_MS);
    return () => window.clearTimeout(id);
  }, [exiting]);

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "opacity" || !exiting || finishedRef.current) return;
    finishedRef.current = true;
    setMounted(false);
    onCompleteRef.current();
  };

  if (!mounted) return null;

  return (
    <div
      ref={divRef}
      className={`purchase-welcome-splash${exiting ? " purchase-welcome-splash--out" : ""}`}
      role="status"
      aria-label={PURCHASE_WELCOME_HEADLINE}
      aria-hidden={exiting}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="purchase-welcome-splash__content">
        <GymmySplashMark className="purchase-welcome-splash__mark" />
        <p className="purchase-welcome-splash__headline">{PURCHASE_WELCOME_HEADLINE}</p>
      </div>
    </div>
  );
}
