import { useState } from "react";

type Props = {
  /** Faux Allow / Don't Allow taps. Caller should show the real OS permission dialog, then advance. */
  onChoice: () => void | Promise<void>;
};

/** Cal-style pre-prompt; taps surface the real system notification permission dialog on top. */
export function OnboardingNotificationPrompt({ onChoice }: Props) {
  const [pending, setPending] = useState(false);

  async function handleTap() {
    if (pending) return;
    setPending(true);
    try {
      await onChoice();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="onboarding-notification-prompt">
      <h2 className="onboarding-notification-prompt__headline">Reach your goals with notifications</h2>

      <div className="onboarding-notification-prompt__stage" aria-hidden="true">
        <div className={`onboarding-notification-prompt__dialog${pending ? " onboarding-notification-prompt__dialog--pending" : ""}`}>
          <p className="onboarding-notification-prompt__message">Gymmy would like to send you Notifications</p>
          <div className="onboarding-notification-prompt__actions">
            <div
              role="presentation"
              className="onboarding-notification-prompt__decline tap"
              onClick={() => void handleTap()}
            >
              Don&apos;t Allow
            </div>
            <div className="onboarding-notification-prompt__allow-col">
              <div
                role="presentation"
                className="onboarding-notification-prompt__allow tap"
                onClick={() => void handleTap()}
              >
                Allow
              </div>
              <span className="onboarding-notification-prompt__hint">👆</span>
            </div>
          </div>
        </div>
      </div>

      <p className="sr-only">
        Tap Allow or Don&apos;t Allow to open your device notification permission prompt. Your choice on that
        prompt continues setup.
      </p>
    </div>
  );
}
