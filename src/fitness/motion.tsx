import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";

export const MOTION_DURATIONS = {
  fast: 180,
  panel: 240,
  stack: 320,
  sheet: 280,
  backdrop: 220,
} as const;

export type NavDirection = "forward" | "back";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Theme-aware panel chrome for bottom sheets (replaces hardcoded dark-only #121212). */
export const bottomSheetPanelTheme: CSSProperties = {
  background: "var(--card)",
  border: "0.5px solid var(--sheet-panel-border)",
  boxShadow: "var(--card-shadow)",
};

export function useAnimatedPresence(active: boolean, durationMs: number = MOTION_DURATIONS.backdrop) {
  const [mounted, setMounted] = useState(active);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (active) {
      setMounted(true);
      setExiting(false);
      return;
    }
    if (!mounted) return;
    setExiting(true);
    const id = window.setTimeout(() => {
      setMounted(false);
      setExiting(false);
    }, durationMs);
    return () => window.clearTimeout(id);
  }, [active, durationMs, mounted]);

  return { mounted, exiting };
}

export function closeAfterMotion(clear: () => void, durationMs: number = MOTION_DURATIONS.sheet) {
  window.setTimeout(clear, durationMs);
}

function motionClass(enter: string, exit: string, exiting: boolean) {
  return exiting ? exit : enter;
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
  const { mounted, exiting } = useAnimatedPresence(open, MOTION_DURATIONS.sheet);
  const { keyboardBottom } = useKeyboardViewport();

  if (!mounted) return null;

  function onBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose?.();
  }

  return (
    <div
      role="presentation"
      onMouseDown={onBackdropMouseDown}
      className={motionClass("motion-backdrop-enter", "motion-backdrop-exit", exiting)}
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
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabel}
        className={`card ${motionClass("motion-sheet-enter", "motion-sheet-exit", exiting)} ${panelClassName}`.trim()}
        style={panelStyle}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
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
  const { mounted, exiting } = useAnimatedPresence(open, MOTION_DURATIONS.panel);

  if (!mounted) return null;

  return (
    <div
      className={`motion-panel ${motionClass("motion-panel-enter", "motion-panel-exit", exiting)} ${className}`.trim()}
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
    </div>
  );
}

type CenterDialogProps = {
  open: boolean;
  onClose?: () => void;
  zIndex?: number;
  ariaLabelledBy?: string;
  panelStyle?: CSSProperties;
  children: ReactNode;
};

export function CenterDialog({
  open,
  onClose,
  zIndex = 280,
  ariaLabelledBy,
  panelStyle,
  children,
}: CenterDialogProps) {
  const { mounted, exiting } = useAnimatedPresence(open, MOTION_DURATIONS.backdrop);

  if (!mounted) return null;

  function onBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose?.();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      onMouseDown={onBackdropMouseDown}
      className={motionClass("motion-backdrop-enter", "motion-backdrop-exit", exiting)}
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
      <div
        className={`card ${motionClass("motion-dialog-enter", "motion-dialog-exit", exiting)}`}
        style={panelStyle}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

type ExitLayer = {
  key: string;
  node: ReactNode;
};

type ScreenTransitionProps = {
  activeKey: string;
  /** `fade` for tabs; `stack` for wizard-style push/pop screens. */
  variant?: "fade" | "stack";
  direction?: NavDirection;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

function stackMotionClass(phase: "enter" | "exit", direction: NavDirection): string {
  if (phase === "enter") {
    return direction === "forward" ? "motion-stack-enter-forward" : "motion-stack-enter-back";
  }
  return direction === "forward" ? "motion-stack-exit-forward" : "motion-stack-exit-back";
}

/** Animate tab / route content when `activeKey` changes. */
export function ScreenTransition({
  activeKey,
  variant = "fade",
  direction = "forward",
  className = "",
  style,
  children,
}: ScreenTransitionProps) {
  const snapshotRef = useRef({ key: activeKey, node: children });
  const [exitLayer, setExitLayer] = useState<ExitLayer | null>(null);
  const [animDirection, setAnimDirection] = useState<NavDirection>(direction);

  useLayoutEffect(() => {
    if (variant !== "stack") {
      snapshotRef.current = { key: activeKey, node: children };
      return;
    }

    if (activeKey !== snapshotRef.current.key) {
      setAnimDirection(direction);
      if (prefersReducedMotion()) {
        snapshotRef.current = { key: activeKey, node: children };
        setExitLayer(null);
        return;
      }

      setExitLayer({ key: snapshotRef.current.key, node: snapshotRef.current.node });
      snapshotRef.current = { key: activeKey, node: children };

      const id = window.setTimeout(() => setExitLayer(null), MOTION_DURATIONS.stack);
      return () => window.clearTimeout(id);
    }

    snapshotRef.current.node = children;
  }, [activeKey, children, direction, variant]);

  const baseStyle: CSSProperties = {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    ...style,
  };

  if (variant === "fade") {
    return (
      <div key={activeKey} className={`motion-screen ${className}`.trim()} style={baseStyle}>
        {children}
      </div>
    );
  }

  return (
    <div className={`motion-stack ${className}`.trim()} style={baseStyle}>
      {exitLayer ? (
        <div
          key={`${exitLayer.key}-exit`}
          className={`motion-stack-layer ${stackMotionClass("exit", animDirection)}`}
          aria-hidden
        >
          {exitLayer.node}
        </div>
      ) : null}
      <div key={activeKey} className={`motion-stack-layer ${stackMotionClass("enter", animDirection)}`}>
        {children}
      </div>
    </div>
  );
}
