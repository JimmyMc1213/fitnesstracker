import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const TOAST_DURATION_MS = 5000;

export function useFoodAddedToast(durationMs = TOAST_DURATION_MS) {
  const [visible, setVisible] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const hide = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setVisible(false);
    setItemId(null);
  }, []);

  const show = useCallback(
    (loggedItemId: string) => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      setItemId(loggedItemId);
      setVisible(true);
      timerRef.current = window.setTimeout(hide, durationMs);
    },
    [durationMs, hide],
  );

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  return { visible, itemId, show, hide };
}

type Props = {
  visible: boolean;
  onView?: () => void;
  onUndo?: () => void;
};

export function FoodAddedToast({ visible, onView, onUndo }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="food-added-toast-slot"
          role="status"
          aria-live="polite"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="food-added-toast">
            <span className="food-added-toast__label">Food added</span>
            <div className="food-added-toast__actions">
              <button type="button" className="food-added-toast__view tap" onClick={onView}>
                View
              </button>
              <button type="button" className="food-added-toast__undo tap" onClick={onUndo}>
                Undo
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
