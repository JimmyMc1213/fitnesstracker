import { FUTURE_YOU_HOME_HEADER_ARIA, FUTURE_YOU_HOME_HEADER_LABEL } from "./futureYouHomeEntryModel";

type Props = {
  onClick: () => void;
};

export function HomeNewYouHeaderButton({ onClick }: Props) {
  return (
    <button
      type="button"
      className="tap home-newyou-header-btn"
      onClick={onClick}
      aria-label={FUTURE_YOU_HOME_HEADER_ARIA}
    >
      {FUTURE_YOU_HOME_HEADER_LABEL}
    </button>
  );
}
