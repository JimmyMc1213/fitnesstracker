import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

export const MOTION_DURATIONS = {
  tab: 150,
  onboarding: 250,
  push: 250,
  sheetExit: 200,
  sheetEnter: 300,
  backdrop: 220,
  dismiss: 320,
  /** @deprecated Use `tab`, `onboarding`, or `push` — kept for callers using legacy keys */
  fast: 180,
  panel: 250,
  stack: 250,
  sheet: 300,
} as const;

export type NavDirection = "forward" | "back";

const TAB_PAGE_VARIANTS: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

const TAB_PAGE_TRANSITION: Transition = { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] };

/** Matches `.page-transition` / `fadeSlideIn` for in-screen phase swaps (workout, mobility). */
export const PAGE_LAYER_VARIANTS: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
};

export const PAGE_LAYER_TRANSITION: Transition = { duration: 0.24, ease: [0.22, 1, 0.36, 1] };

const ONBOARDING_TRANSITION: Transition = { duration: 0.25, ease: "easeInOut" };

const onboardingStackVariants: Variants = {
  initial: (direction: NavDirection) => ({
    x: direction === "forward" ? "100%" : "-28%",
    zIndex: direction === "forward" ? 2 : 1,
    opacity: 1,
  }),
  animate: (direction: NavDirection) => ({
    x: 0,
    zIndex: direction === "forward" ? 2 : 1,
    opacity: 1,
  }),
  exit: (direction: NavDirection) => ({
    x: direction === "forward" ? "-28%" : "100%",
    zIndex: direction === "forward" ? 1 : 2,
    opacity: 1,
    pointerEvents: "none",
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

const DISMISS_ENTER_TRANSITION: Transition = { duration: 0.32, ease: [0.22, 1, 0.36, 1] };
const DISMISS_EXIT_TRANSITION: Transition = { duration: 0.32, ease: [0.4, 0, 0.2, 1] };

const dismissVariants = (reduceMotion: boolean): Variants =>
  reduceMotion
    ? REDUCED_VARIANTS
    : {
        initial: { x: "100%", opacity: 1 },
        animate: { x: 0, opacity: 1, transition: DISMISS_ENTER_TRANSITION },
        exit: { x: "100%", opacity: 0.98, transition: DISMISS_EXIT_TRANSITION },
      };

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

export const REDUCED_TRANSITION: Transition = { duration: 0.01 };

function stackEnterClass(direction: NavDirection): string {
  return direction === "forward" ? "motion-stack-enter-forward" : "motion-stack-enter-back";
}

/** Keeps panel content tied to the layer instance that mounted it (including exit). */
function FrozenPanel({
  layerKey,
  children,
}: {
  layerKey: string;
  children: ReactNode | ((layerKey: string) => ReactNode);
}) {
  const layerKeyRef = useRef(layerKey);

  if (typeof children !== "function") {
    return <>{children}</>;
  }

  return <>{children(layerKeyRef.current)}</>;
}

function StackLayerPresence({
  layerKey,
  children,
}: {
  layerKey: string;
  children: ReactNode | ((layerKey: string) => ReactNode);
}) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <FrozenPanel layerKey={layerKey}>{children}</FrozenPanel>
    </div>
  );
}

/** Theme-aware panel chrome for bottom sheets (replaces hardcoded dark-only #121212). */
export const bottomSheetPanelTheme: CSSProperties = {
  background: "var(--card)",
  border: "0.5px solid var(--sheet-panel-border)",
  boxShadow: "var(--card-shadow)",
};

export const CONFIRM_MODAL_BORDER = "0.5px solid rgba(255, 255, 255, 0.08)";

export const CONFIRM_DESTRUCTIVE_COLOR = "#FF6961";

/** Centered confirmation dialog chrome (callers can override width via `panelStyle`). */
export const confirmCenterDialogPanelStyle: CSSProperties = {
  ...bottomSheetPanelTheme,
  width: "100%",
  maxWidth: 280,
  padding: 28,
  border: CONFIRM_MODAL_BORDER,
};

/** Bottom-sheet confirmation chrome (legacy name — panels are centered). */
export const confirmBottomSheetPanelStyle: CSSProperties = {
  ...bottomSheetPanelTheme,
  width: "100%",
  maxWidth: 440,
  padding: 24,
  borderRadius: 20,
  border: CONFIRM_MODAL_BORDER,
};

export const confirmSheetTitleStyle: CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: "var(--text-primary)",
};

export const confirmSheetMessageStyle: CSSProperties = {
  margin: "10px 0 0",
  fontSize: 14,
  fontWeight: 400,
  lineHeight: 1.5,
  color: "var(--text-muted-soft)",
};

const confirmActionButtonBase: CSSProperties = {
  flex: 1,
  padding: "14px 12px",
  border: "none",
  background: "transparent",
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: "-0.01em",
};

export function ConfirmSheetActions({
  cancelLabel,
  confirmLabel,
  confirmBusy = false,
  confirmBusyLabel,
  confirmTone = "destructive",
  contentPadding = 28,
  onCancel,
  onConfirm,
}: {
  cancelLabel: string;
  confirmLabel: string;
  confirmBusy?: boolean;
  confirmBusyLabel?: string;
  /** Primary = accent text on the right; destructive = red. */
  confirmTone?: "destructive" | "primary";
  contentPadding?: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const confirmColor = confirmTone === "primary" ? "var(--text-primary)" : CONFIRM_DESTRUCTIVE_COLOR;

  return (
    <div
      style={{
        display: "flex",
        marginTop: 20,
        marginLeft: -contentPadding,
        marginRight: -contentPadding,
        marginBottom: -contentPadding,
        borderTop: CONFIRM_MODAL_BORDER,
      }}
    >
      <button
        type="button"
        className="tap"
        disabled={confirmBusy}
        onClick={onCancel}
        style={{
          ...confirmActionButtonBase,
          color: "var(--text-primary)",
          opacity: confirmBusy ? 0.45 : 1,
        }}
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        className="tap"
        disabled={confirmBusy}
        onClick={onConfirm}
        style={{
          ...confirmActionButtonBase,
          color: confirmColor,
          opacity: confirmBusy ? 0.45 : 1,
        }}
      >
        {confirmBusy ? (confirmBusyLabel ?? "Deleting…") : confirmLabel}
      </button>
    </div>
  );
}

export function closeAfterMotion(clear: () => void, durationMs: number = MOTION_DURATIONS.sheetExit) {
  window.setTimeout(clear, durationMs);
}

/** Tracks iOS/Android keyboard overlap via Visual Viewport API. */
export function useKeyboardViewport() {
  const [state, setState] = useState(() => ({
    keyboardBottom: 0,
    visibleHeight: typeof window !== "undefined" ? window.innerHeight : 800,
    offsetTop: 0,
  }));

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const sync = () => {
      setState({
        keyboardBottom: Math.max(0, window.innerHeight - vv.height - vv.offsetTop),
        visibleHeight: vv.height,
        offsetTop: vv.offsetTop,
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

export const KEYBOARD_OPEN_THRESHOLD = 48;

/** Block iOS visual-viewport pan so the keyboard overlays a stable layout shell. */
export function useLockVisualViewportScroll() {
  useEffect(() => {
    const vv = window.visualViewport;

    const lock = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.matches("input, textarea, select, [contenteditable='true']")) return;
      lock();
      requestAnimationFrame(lock);
    };

    vv?.addEventListener("scroll", lock);
    window.addEventListener("scroll", lock, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    lock();

    return () => {
      vv?.removeEventListener("scroll", lock);
      window.removeEventListener("scroll", lock);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);
}
/** Top + bottom padding on the bottom-sheet backdrop (px). */
const SHEET_BACKDROP_CHROME = 36;

/** Fixed height for exercise search dialogs — stays constant while filtering. */
export const exerciseSearchDialogPanelStyle: CSSProperties = {
  height: "min(560px, 82vh)",
  maxHeight: "min(560px, 82vh)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

/** Backdrop top + bottom padding when a keyboard-aware center dialog is shrunk. */
const EXERCISE_SEARCH_DIALOG_BACKDROP_CHROME = 40;

/** Stable height while filtering; shrinks to the visual viewport when the keyboard is open. */
export function useExerciseSearchDialogPanelStyle(): CSSProperties {
  const { keyboardBottom, visibleHeight } = useKeyboardViewport();
  const keyboardOpen = keyboardBottom >= KEYBOARD_OPEN_THRESHOLD;

  if (!keyboardOpen) {
    return exerciseSearchDialogPanelStyle;
  }

  const height = Math.max(240, visibleHeight - EXERCISE_SEARCH_DIALOG_BACKDROP_CHROME);
  return {
    height,
    maxHeight: height,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };
}

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
  /** Centered modal by default; use `bottom` for the pre-workout routine preview. */
  placement?: "center" | "bottom";
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
  placement = "center",
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

  if (placement === "bottom") {
    function onBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
      if (e.target === e.currentTarget) onClose?.();
    }

    const panelVariants = sheetPanelVariants(!!reduceMotion);
    const backdropVariants = reduceMotion ? REDUCED_VARIANTS : BACKDROP_VARIANTS;
    const backdropTransition = reduceMotion ? REDUCED_TRANSITION : BACKDROP_TRANSITION;

    const overlay = (
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
              style={{
                ...bottomSheetPanelTheme,
                width: "100%",
                borderRadius: "20px 20px 0 0",
                ...panelStyle,
              }}
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

    if (typeof document === "undefined") return overlay;
    return createPortal(overlay, document.body);
  }

  const content = panelClassName ? <div className={panelClassName}>{children}</div> : children;

  return (
    <CenterDialog
      open={open}
      onClose={onClose}
      zIndex={zIndex}
      ariaLabelledBy={ariaLabelledBy}
      ariaLabel={ariaLabel}
      keyboardAware
      backdropStyle={backdropStyle}
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        maxHeight: "min(85vh, 640px)",
        borderRadius: 20,
        ...panelStyle,
      }}
    >
      {content}
    </CenterDialog>
  );
}

const fadeOverlayVariants = (reduceMotion: boolean): Variants =>
  reduceMotion
    ? REDUCED_VARIANTS
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: PAGE_LAYER_TRANSITION },
        exit: { opacity: 0, transition: PAGE_LAYER_TRANSITION },
      };

const pageOverlayVariants = (reduceMotion: boolean): Variants =>
  reduceMotion
    ? REDUCED_VARIANTS
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0, transition: PAGE_LAYER_TRANSITION },
        exit: { opacity: 0, y: 4, transition: PAGE_LAYER_TRANSITION },
      };

type FullScreenOverlayProps = {
  open: boolean;
  zIndex?: number;
  className?: string;
  style?: CSSProperties;
  /** `fade` for full-screen pages; `page` adds a subtle slide; `push` slides in from the right; `dismiss` slides back out to the right. */
  motionVariant?: "fade" | "page" | "push" | "dismiss";
  /** Edge-to-edge page: no outer padding; safe-area insets live on scroll content inside. */
  edgeToEdge?: boolean;
  children: ReactNode;
};

export function FullScreenOverlay({
  open,
  zIndex = 200,
  className = "",
  style,
  motionVariant = "fade",
  edgeToEdge = false,
  children,
}: FullScreenOverlayProps) {
  const reduceMotion = useReducedMotion();
  const variants =
    motionVariant === "dismiss"
      ? dismissVariants(!!reduceMotion)
      : motionVariant === "push"
        ? pushVariants(!!reduceMotion)
        : motionVariant === "page"
          ? pageOverlayVariants(!!reduceMotion)
          : fadeOverlayVariants(!!reduceMotion);

  const overlay = (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="fullscreen-overlay"
          className={`motion-panel${edgeToEdge ? " fullscreen-page" : ""} ${className}`.trim()}
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
            background: "var(--bg-deep)",
            paddingTop: edgeToEdge ? 0 : "max(12px, env(safe-area-inset-top, 0px))",
            paddingBottom: edgeToEdge ? 0 : "env(safe-area-inset-bottom, 0px)",
            boxSizing: "border-box",
            willChange: "transform, opacity",
            ...style,
          }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return overlay;
  return createPortal(overlay, document.body);
}

type CenterDialogProps = {
  open: boolean;
  onClose?: () => void;
  zIndex?: number;
  ariaLabelledBy?: string;
  ariaLabel?: string;
  panelStyle?: CSSProperties;
  backdropStyle?: CSSProperties;
  /** Shift the dialog up when the on-screen keyboard is open. */
  keyboardAware?: boolean;
  children: ReactNode;
};

export function CenterDialog({
  open,
  onClose,
  zIndex = 280,
  ariaLabelledBy,
  ariaLabel,
  panelStyle,
  backdropStyle,
  keyboardAware = false,
  children,
}: CenterDialogProps) {
  const reduceMotion = useReducedMotion();
  const { keyboardBottom, offsetTop } = useKeyboardViewport();
  const keyboardOpen = keyboardAware && keyboardBottom >= KEYBOARD_OPEN_THRESHOLD;
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
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: keyboardOpen ? "flex-start" : "center",
            justifyContent: "center",
            padding: keyboardAware
              ? keyboardOpen
                ? `max(12px, calc(env(safe-area-inset-top, 0px) + ${offsetTop}px)) 20px max(12px, env(safe-area-inset-bottom, 0px))`
                : "20px 20px calc(20px + env(safe-area-inset-bottom, 0px))"
              : 20,
            ...backdropStyle,
          }}
        >
          <motion.div
            className="card"
            style={{
              ...confirmCenterDialogPanelStyle,
              ...panelStyle,
            }}
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
  /** Stack layers default to `--bg-deep`; use `transparent` when sitting on the app shell gradient. */
  layerBackground?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode | ((layerKey: string) => ReactNode);
};

/** Animate tab / route content when `activeKey` changes. */
export function ScreenTransition({
  activeKey,
  variant = "fade",
  direction = "forward",
  layerBackground = "var(--bg-deep)",
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
      <AnimatePresence mode="wait" initial={false}>
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
          <FrozenPanel layerKey={activeKey}>{children}</FrozenPanel>
        </motion.div>
      </AnimatePresence>
    );
  }

  const variants = reduceMotion ? REDUCED_VARIANTS : onboardingStackVariants;
  const transition = reduceMotion ? REDUCED_TRANSITION : ONBOARDING_TRANSITION;

  return (
    <div
      className={`motion-stack ${className}`.trim()}
      style={{ ...baseStyle, position: "relative", overflow: "hidden", background: layerBackground }}
    >
      <AnimatePresence mode="sync" custom={direction} initial={false}>
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
            background: layerBackground,
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={transition}
        >
          <StackLayerPresence layerKey={activeKey}>{children}</StackLayerPresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
