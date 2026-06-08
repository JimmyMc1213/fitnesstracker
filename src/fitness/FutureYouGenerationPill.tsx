import { useEffect, useMemo, useRef, useState } from "react";

import { fireFutureYouReadyConfetti, shouldCelebrateFutureYouReady } from "./confetti";
import {
  buildFutureYouGenerationPillPhrases,
  futureYouGenerationPillCopy,
  FUTURE_YOU_GENERATION_PILL_ROTATE_MS,
} from "./futureYouGenerationPillModel";
import { FutureYouGenerationUnlockSheet } from "./FutureYouGenerationUnlockSheet";
import type { FutureYouJobStatus } from "./futureYouJobs";
import type { NutritionGoal, UserGender } from "./types";

type Props = {
  status: FutureYouJobStatus | "idle";
  motivationId?: string;
  goal: NutritionGoal;
  gender: UserGender;
};

function PillSpinner() {
  return <span className="future-you-generation-pill__spinner" aria-hidden />;
}

export function FutureYouGenerationPill({ status, motivationId, goal, gender }: Props) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const previousStatusRef = useRef(status);

  const phrases = useMemo(
    () => buildFutureYouGenerationPillPhrases(motivationId, goal, gender),
    [motivationId, goal, gender],
  );

  const copy = futureYouGenerationPillCopy(status, phraseIndex, phrases);
  const isReady = copy.ready;

  useEffect(() => {
    if (isReady) return;
    const id = window.setInterval(() => {
      setPhraseIndex((index) => (index + 1) % phrases.length);
    }, FUTURE_YOU_GENERATION_PILL_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [isReady, phrases.length]);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = status;
    if (!shouldCelebrateFutureYouReady(previousStatus, status)) return;

    const node = wrapRef.current;
    if (!node) return;

    const frameId = window.requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect();
      fireFutureYouReadyConfetti({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height * 0.35,
        width: rect.width,
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [status]);

  return (
    <>
      <div ref={wrapRef} className="future-you-generation-pill-wrap">
        <button
          type="button"
          className={`future-you-generation-pill tap${isReady ? " future-you-generation-pill--ready" : ""}`}
          onClick={() => setSheetOpen(true)}
          aria-live="polite"
          aria-busy={!isReady}
        >
          {!isReady ? <PillSpinner /> : null}
          <span className="future-you-generation-pill__text">
            <span className="future-you-generation-pill__headline">{copy.headline}</span>
            {copy.subline ? (
              <span key={copy.subline} className="future-you-generation-pill__subline">
                {copy.subline}
              </span>
            ) : null}
          </span>
        </button>
      </div>
      <FutureYouGenerationUnlockSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
