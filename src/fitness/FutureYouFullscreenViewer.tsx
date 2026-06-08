import { FullScreenOverlay } from "./motion";
import { FUTURE_YOU_FULLSCREEN_DONE_LABEL } from "./futureYouGalleryModel";

type Props = {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
};

export function FutureYouFullscreenViewer({ open, imageSrc, onClose }: Props) {
  return (
    <FullScreenOverlay open={open && Boolean(imageSrc)} zIndex={140} motionVariant="fade" edgeToEdge>
      {imageSrc ?
        <div className="future-you-fullscreen">
          <header className="future-you-fullscreen__header">
            <button type="button" className="tap future-you-fullscreen__done" onClick={onClose}>
              {FUTURE_YOU_FULLSCREEN_DONE_LABEL}
            </button>
          </header>
          <div className="future-you-fullscreen__stage">
            <img src={imageSrc} alt="" className="future-you-fullscreen__image" />
          </div>
        </div>
      : null}
    </FullScreenOverlay>
  );
}
