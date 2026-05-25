import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "framer-motion";
import { useEffect, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

export const MOTION_DURATIONS = {
  tab: 150,
  onboarding: 250,
  push: 250,
  sheetExit: 200,
  sheetEnter: 300,
  backdrop: 220,
  /** @deprecated Use `tab`, `onboarding`, or `push` — kept for callers using legacy keys */
  fast: 180,
  panel: 250,
  stack: 250,
  sheet: 300,
} as const;

export type NavDirection = "forward" | "back";

const TAB_PAGE_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const TAB_PAGE_TRANSITION: Transition = { duration: 0.15, ease: "easeInOut" };

const ONBOARDING_TRANSITION: Transition = { duration: 0.25, ease: "easeInOut" };

const onboardingStackVariants: Variants = {
  initial: (direction: NavDirection) => ({
    x: direction === "forward" ? 60 : -60,
    opacity: 0,
  }),
  animate: { x: 0, opacity: 1 },
  exit: (direction: NavDirection) => ({
    x: direction === "forward" ? -60 : 60,
    opacity: 0,
  }),
};

const pushVariants = (reduceMotion: boolean): Variants =>
  reduceMotion
    ? REDUCED_VARIANTS
    : {
        initial: { x: "100%" },
        animate: { x: 0, transition: PUSH_ENTER_TRANSITION },
        exit: { x: "-30%", transition: PUSH_EXIT_TRANSITION },
      };

const PUSH_ENTER_TRANSITION: Transition = { duration: 0.25, ease: [0, 0, 0.2, 1] };
const PUSH_EXIT_TRANSITION: Transition = { duration: 0.25, ease: [0.4, 0, 1, 1] };

const sheetPanelVariants = (reduceMotion: boolean): Variants =>
  reduceMotion
    ? REDUCED_VARIANTS
    : {
        initial: { y: "100%" },
        animate: { y: 0, transition: SHEET_PANEL_ENTER_TRANSITION },
        exit: { y: "100%", transition: SHEET_PANEL_EXIT_TRANSITION },
      };

const SHEET_PANEL_ENTER_TRANSITION: Transition = {
  type: "spring",
  damping: 30,
  stiffness: 300,
};

const SHEET_PANEL_EXIT_TRANSITION: Transition = { duration: 0.2, ease: [0.4, 0, 1, 1] };

const BACKDROP_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const BACKDROP_TRANSITION: Transition = { duration: 0.22, ease: "easeOut" };

const DIALOG_VARIANTS: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.98 },
};

const DIALOG_TRANSITION: Transition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] };

const REDUCED_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const REDUCED_TRANSITION: Transition = { duration: 0.01 };

function stackEnterClass(direction: NavDirection): string {
  return direction === "forward" ? "motion-stack-enter-forward" : "motion-stack-enter-back";
}

/** Theme-aware panel chrome for bottom sheets (replaces hardcoded dark-only #121212). */
export const bottomSheetPanelTheme: CSSProperties = {
  background: "var(--card)",
  border: "0.5px solid var(--sheet-panel-border)",
  boxShadow: "var(--card-shadow)",
};

export function closeAfterMotion(clear: () => void, durationMs: number = MOTION_DURATIONS.sheetExit) {
  window.setTimeout(clear, durationMs);
}

/** Tracks iOS/Android keyboard overlap via Visual Viewport API. */
export function useKeyboardViewport() {
  const [state, setState] = useState(() => ({
    keyboardBottom: 0,
    visibleHeight: typeof window !== "undefined" ? window.innerHeight : 800,
  }));

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const sync = () => {
      setState({
        keyboardBottom: Math.max(0, window.innerHeight - vv.height - vv.offsetTop),
        visibleHeight: vv.height,
      });
    };

    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    sync();
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, []);

  return state;
}

const KEYBOARD_OPEN_THRESHOLD = 48;
/** Top + bottom padding on the bottom-sheet backdrop (px). */
const SHEET_BACKDROP_CHROME = 36;

/** Size a bottom sheet to fill the space above the on-screen keyboard. */
export function useKeyboardAwareSheetSizing() {
  const { keyboardBottom, visibleHeight } = useKeyboardViewport();
  const keyboardOpen = keyboardBottom >= KEYBOARD_OPEN_THRESHOLD;
  const sheetHeight = keyboardOpen
    ? Math.max(240, visibleHeight - SHEET_BACKDROP_CHROME)
    : Math.min(640, Math.round(visibleHeight * 0.85));

  return {
    keyboardOpen,
    sheetHeight,
    panelStyle: {
      maxHeight: sheetHeight,
      ...(keyboardOpen ? { height: sheetHeight } : {}),
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    } satisfies CSSProperties,
  };
}

type BottomSheetProps = {
  open: boolean;
  onClose?: () => void;
  zIndex?: number;
  ariaLabelledBy?: string;
  ariaLabel?: string;
  panelClassName?: string;
  panelStyle?: CSSProperties;
  backdropStyle?: CSSProperties;
  children: ReactNode;
};

export function BottomSheet({
  open,
  onClose,
  zIndex = 1000,
  ariaLabelledBy,
  ariaLabel,
  panelClassName = "",
  panelStyle,
  backdropStyle,
  children,
}: BottomSheetProps) {
  const reduceMotion = useReducedMotion();
  const { keyboardBottom } = useKeyboardViewport();

  function onBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose?.();
  }

  const panelVariants = sheetPanelVariants(!!reduceMotion);
  const backdropVariants = reduceMotion ? REDUCED_VARIANTS : BACKDROP_VARIANTS;
  const backdropTransition = reduceMotion ? REDUCED_TRANSITION : BACKDROP_TRANSITION;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="bottom-sheet"
          role="presentation"
          onMouseDown={onBackdropMouseDown}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={backdropVariants}
          transition={backdropTransition}
          style={{
            position: "fixed",
            inset: 0,
            zIndex,
            background: "var(--sheet-backdrop)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: `12px 12px calc(16px + env(safe-area-inset-bottom, 0px) + ${keyboardBottom}px)`,
            ...backdropStyle,
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            aria-label={ariaLabel}
            className={`card ${panelClassName}`.trim()}
            style={panelStyle}
            onMouseDown={(e) => e.stopPropagation()}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={panelVariants}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type FullScreenOverlayProps = {
  open: boolean;
  zIndex?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function FullScreenOverlay({ open, zIndex = 200, className = "", style, children }: FullScreenOverlayProps) {
  const reduceMotion = useReducedMotion();
  const variants = pushVariants(!!reduceMotion);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="fullscreen-overlay"
          className={`motion-panel ${className}`.trim()}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          style={{
            position: "fixed",
            inset: 0,
            zIndex,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--bg, #060608)",
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
            boxSizing: "border-box",
            ...style,
          }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type CenterDialogProps = {
  open: boolean;
  onClose?: () => void;
  zIndex?: number;
  ariaLabelledBy?: string;
  ariaLabel?: string;
  panelStyle?: CSSProperties;
  children: ReactNode;
};

export function CenterDialog({
  open,
  onClose,
  zIndex = 280,
  ariaLabelledBy,
  ariaLabel,
  panelStyle,
  children,
}: CenterDialogProps) {
  const reduceMotion = useReducedMotion();
  const variants = reduceMotion ? REDUCED_VARIANTS : DIALOG_VARIANTS;
  const transition = reduceMotion ? REDUCED_TRANSITION : DIALOG_TRANSITION;
  const backdropVariants = reduceMotion ? REDUCED_VARIANTS : BACKDROP_VARIANTS;
  const backdropTransition = reduceMotion ? REDUCED_TRANSITION : BACKDROP_TRANSITION;

  function onBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose?.();
  }

  const overlay = (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="center-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
          aria-label={ariaLabel}
          onMouseDown={onBackdropMouseDown}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={backdropVariants}
          transition={backdropTransition}
          style={{
            position: "fixed",
            inset: 0,
            zIndex,
            background: "var(--sheet-backdrop)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <motion.div
            className="card"
            style={panelStyle}
            onMouseDown={(e) => e.stopPropagation()}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={transition}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return overlay;
  return createPortal(overlay, document.body);
}

type ScreenTransitionProps = {
  activeKey: string;
  /** `fade` for tabs; `stack` for onboarding step push/pop. */
  variant?: "fade" | "stack";
  direction?: NavDirection;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** Animate tab / route content when `activeKey` changes. */
export function ScreenTransition({
  activeKey,
  variant = "fade",
  direction = "forward",
  className = "",
  style,
  children,
}: ScreenTransitionProps) {
  const reduceMotion = useReducedMotion();

  const baseStyle: CSSProperties = {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    ...style,
  };

  if (variant === "fade") {
    const variants = reduceMotion ? REDUCED_VARIANTS : TAB_PAGE_VARIANTS;
    const transition = reduceMotion ? REDUCED_TRANSITION : TAB_PAGE_TRANSITION;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeKey}
          className={className || undefined}
          style={baseStyle}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={transition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  const variants = reduceMotion ? REDUCED_VARIANTS : onboardingStackVariants;
  const transition = reduceMotion ? REDUCED_TRANSITION : ONBOARDING_TRANSITION;

  return (
    <div className={`motion-stack ${className}`.trim()} style={{ ...baseStyle, position: "relative", overflow: "hidden" }}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeKey}
          custom={direction}
          className={`motion-stack-layer ${stackEnterClass(direction)}`}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--bg, #060608)",
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={transition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
