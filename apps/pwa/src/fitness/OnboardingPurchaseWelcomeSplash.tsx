import { useCallback, useEffect, useRef, useState } from "react";

import { NewYouUnlockSplash } from "./NewYouUnlockSplash";
import { PURCHASE_WELCOME_HEADLINE } from "./futureYouSuccessModel";
import { PURCHASE_WELCOME_SPLASH_FADE_OUT_MS } from "./splashTiming";

const UNLOCK_ANIMATION_MS = 2700 + 160;

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

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setMounted(false);
    onCompleteRef.current();
  }, []);

  const handleAnimationFinish = useCallback(() => {
    const el = divRef.current;
    if (!el) return;
    el.style.transition = `opacity ${PURCHASE_WELCOME_SPLASH_FADE_OUT_MS}ms ease-out`;
    el.style.opacity = "0";
    setExiting(true);
  }, []);

  useEffect(() => {
    if (!exiting) return;

    const id = window.setTimeout(finish, PURCHASE_WELCOME_SPLASH_FADE_OUT_MS);
    return () => window.clearTimeout(id);
  }, [exiting, finish]);

  useEffect(() => {
    const fallback = window.setTimeout(
      finish,
      UNLOCK_ANIMATION_MS + PURCHASE_WELCOME_SPLASH_FADE_OUT_MS + 250,
    );
    return () => window.clearTimeout(fallback);
  }, [finish]);

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "opacity" || !exiting || finishedRef.current) return;
    finish();
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
      <NewYouUnlockSplash onFinish={handleAnimationFinish} />
    </div>
  );
}
