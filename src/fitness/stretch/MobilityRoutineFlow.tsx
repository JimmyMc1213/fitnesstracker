import { AnimatePresence, motion, useReducedMotion, type Transition } from "framer-motion";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";

import { arizonaCalendarDateKey } from "../dailyPlan";
import { PAGE_LAYER_TRANSITION, PAGE_LAYER_VARIANTS, REDUCED_TRANSITION } from "../motion";
import { STRETCH_BLOCKS } from "../stretchRoutine";
import type { AppState } from "../types";
import { MobilityActiveSession } from "./MobilityActiveSession";
import { MobilityPreviewSheet } from "./MobilityPreviewSheet";

const REDUCED_PAGE_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const layerStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
};

const sessionLayerStyle: CSSProperties = {
  ...layerStyle,
  position: "absolute",
  inset: 0,
  zIndex: 1,
};

type MobilityRoutineFlowProps = {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  previewOpen: boolean;
  onPreviewOpenChange: (open: boolean) => void;
  onSessionOpenChange?: (open: boolean) => void;
  dismissRequest?: number;
  children: ReactNode;
};

export function MobilityRoutineFlow({
  state,
  setState,
  previewOpen,
  onPreviewOpenChange,
  onSessionOpenChange,
  dismissRequest,
  children,
}: MobilityRoutineFlowProps) {
  const reduceMotion = useReducedMotion();
  const variants = reduceMotion ? REDUCED_PAGE_VARIANTS : PAGE_LAYER_VARIANTS;
  const transition: Transition = reduceMotion ? REDUCED_TRANSITION : PAGE_LAYER_TRANSITION;

  const [sessionOpen, setSessionOpen] = useState(false);
  const [animateHomeEnter, setAnimateHomeEnter] = useState(false);
  const arizonaTodayKey = arizonaCalendarDateKey(new Date());
  const completedIds = state.nightlyStretchBlockIdsByArizonaDay[arizonaTodayKey] ?? [];
  const doneCount = useMemo(
    () => completedIds.filter((id) => STRETCH_BLOCKS.some((b) => b.id === id)).length,
    [completedIds],
  );

  useEffect(() => {
    if (sessionOpen) onSessionOpenChange?.(true);
  }, [sessionOpen, onSessionOpenChange]);

  useEffect(() => {
    if (!dismissRequest) return;
    setSessionOpen(false);
    onPreviewOpenChange(false);
  }, [dismissRequest, onPreviewOpenChange]);

  function startSession() {
    setSessionOpen(true);
    onPreviewOpenChange(false);
  }

  function closeSession() {
    setSessionOpen(false);
    setAnimateHomeEnter(true);
  }

  function onSessionExitComplete() {
    if (!sessionOpen) onSessionOpenChange?.(false);
  }

  return (
    <div style={{ ...layerStyle, position: "relative" }}>
      {!sessionOpen ? (
        <motion.div
          key="mobility-home"
          style={layerStyle}
          initial={animateHomeEnter ? "initial" : false}
          animate="animate"
          variants={variants}
          transition={transition}
          onAnimationComplete={() => setAnimateHomeEnter(false)}
        >
          {children}
        </motion.div>
      ) : null}

      <AnimatePresence initial={false} onExitComplete={onSessionExitComplete}>
        {sessionOpen ? (
          <motion.div
            key="mobility-session"
            style={sessionLayerStyle}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={transition}
          >
            <MobilityActiveSession state={state} setState={setState} onClose={closeSession} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {previewOpen ? (
        <MobilityPreviewSheet
          doneCount={doneCount}
          onClose={() => onPreviewOpenChange(false)}
          onStart={startSession}
        />
      ) : null}
    </div>
  );
}
