import { useEffect, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";

export const MOTION_DURATIONS = {
  fast: 180,
  panel: 240,
  sheet: 280,
  backdrop: 220,
} as const;

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
        padding: "12px 12px calc(16px + env(safe-area-inset-bottom, 0px))",
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

type ScreenTransitionProps = {
  activeKey: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** Animate tab / route content when `activeKey` changes. */
export function ScreenTransition({ activeKey, className = "", style, children }: ScreenTransitionProps) {
  return (
    <div
      key={activeKey}
      className={`motion-screen ${className}`.trim()}
      style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", ...style }}
    >
      {children}
    </div>
  );
}
