import { FUTURE_YOU_PAGE_NEW_CHIP_ARIA_LABEL, FUTURE_YOU_PAGE_NEW_CHIP_LABEL } from "./futureYouPageModel";

type Props = {
  canRedo: boolean;
  onClick: () => void;
};

export function FutureYouNewChip({ canRedo, onClick }: Props) {
  return (
    <button
      type="button"
      className={`tap future-you-gallery__new-chip${canRedo ? "" : " future-you-gallery__new-chip--ineligible"}`}
      disabled={!canRedo}
      aria-disabled={!canRedo}
      aria-label={FUTURE_YOU_PAGE_NEW_CHIP_ARIA_LABEL}
      onClick={onClick}
    >
      {FUTURE_YOU_PAGE_NEW_CHIP_LABEL}
    </button>
  );
}
