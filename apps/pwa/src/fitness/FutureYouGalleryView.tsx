import {
  formatFutureYouGalleryCount,
  FUTURE_YOU_GALLERY_EMPTY_TITLE,
  FUTURE_YOU_GALLERY_TAP_HINT,
  FUTURE_YOU_GALLERY_TRY_CTA_LABEL,
  type FutureYouGalleryItem,
} from "./futureYouGalleryModel";
import { futureYouRevealPlaceholderImage } from "./futureYouRevealPlaceholder";
import type { UserGender } from "./types";

type Props = {
  items: FutureYouGalleryItem[];
  gender: UserGender | undefined;
  pageLede: string;
  pageRedoLede: string | null;
  showEmptyTryCta: boolean;
  onOpenItem: (item: FutureYouGalleryItem) => void;
  onTryNewYou: () => void;
};

export function FutureYouGalleryView({
  items,
  gender,
  pageLede,
  pageRedoLede,
  showEmptyTryCta,
  onOpenItem,
  onTryNewYou,
}: Props) {
  const placeholder = futureYouRevealPlaceholderImage(gender);

  return (
    <div className="future-you-gallery">
      {items.length > 0 ?
        <div className="future-you-gallery__lede-block">
          <p className="future-you-gallery__lede">{pageLede}</p>
          {pageRedoLede ? <p className="future-you-gallery__lede">{pageRedoLede}</p> : null}
        </div>
      : null}

      {items.length > 0 ?
        <>
          <p className="future-you-gallery__meta">{formatFutureYouGalleryCount(items.length)}</p>
          <div className="future-you-gallery__grid">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="tap future-you-gallery__tile"
                onClick={() => onOpenItem(item)}
                aria-busy={item.loading}
              >
                {item.imageSrc || placeholder ?
                  <img
                    src={item.imageSrc ?? placeholder ?? undefined}
                    alt=""
                    className="future-you-gallery__tile-image"
                  />
                : null}
                {item.loading ?
                  <span className="future-you-gallery__tile-loading" aria-hidden>
                    <span className="onboarding-paywall-future-you__spinner" />
                  </span>
                : null}
                <span className="future-you-gallery__tile-foot">
                  <span className="future-you-gallery__tile-date">{item.dateLabel}</span>
                  <span className="future-you-gallery__tile-caption">{item.caption}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="future-you-gallery__hint">{FUTURE_YOU_GALLERY_TAP_HINT}</p>
        </>
      : <div className="future-you-gallery__empty card">
          {placeholder ?
            <img src={placeholder} alt="" aria-hidden className="future-you-gallery__empty-art" />
          : null}
          <p className="future-you-gallery__empty-title">{FUTURE_YOU_GALLERY_EMPTY_TITLE}</p>
          {showEmptyTryCta ?
            <button
              type="button"
              className="tap onboarding-paywall__cta onboarding-paywall__cta--gold future-you-gallery__try-cta"
              onClick={onTryNewYou}
            >
              {FUTURE_YOU_GALLERY_TRY_CTA_LABEL}
            </button>
          : null}
        </div>
      }
    </div>
  );
}
