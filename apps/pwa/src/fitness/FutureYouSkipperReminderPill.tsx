import { IconX } from "./icons";
import {
  FUTURE_YOU_SKIPPER_PILL_DISMISS_ARIA,
  FUTURE_YOU_SKIPPER_PILL_HEADLINE,
  FUTURE_YOU_SKIPPER_PILL_SUBLINE,
} from "./futureYouHomeEntryModel";

type Props = {
  onOpen: () => void;
  onDismiss: () => void;
};

export function FutureYouSkipperReminderPill({ onOpen, onDismiss }: Props) {
  return (
    <div className="future-you-skipper-pill-slot" role="region" aria-label="NewYou reminder">
      <div className="future-you-skipper-pill-wrap">
        <button type="button" className="future-you-skipper-pill tap" onClick={onOpen}>
          <span className="future-you-skipper-pill__text">
            <span className="future-you-skipper-pill__headline">{FUTURE_YOU_SKIPPER_PILL_HEADLINE}</span>
            <span className="future-you-skipper-pill__subline">{FUTURE_YOU_SKIPPER_PILL_SUBLINE}</span>
          </span>
        </button>
        <button
          type="button"
          className="future-you-skipper-pill__dismiss tap"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          aria-label={FUTURE_YOU_SKIPPER_PILL_DISMISS_ARIA}
        >
          <IconX size={14} stroke={2.25} />
        </button>
      </div>
    </div>
  );
}
