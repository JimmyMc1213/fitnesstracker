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
    onPreviewOpenChange(false);
    setSessionOpen(true);
  }

  function closeSession() {
    setSessionOpen(false);
  }

  function onLayerExitComplete() {
    if (!sessionOpen) onSessionOpenChange?.(false);
  }

  return (
    <div style={{ ...layerStyle, position: "relative" }}>
      <AnimatePresence mode="wait" initial={false} onExitComplete={onLayerExitComplete}>
        {sessionOpen ? (
          <motion.div
            key="mobility-session"
            style={layerStyle}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={transition}
          >
            <MobilityActiveSession state={state} setState={setState} onClose={closeSession} />
          </motion.div>
        ) : (
          <motion.div
            key="mobility-home"
            style={layerStyle}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={transition}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {!sessionOpen && previewOpen ? (
        <MobilityPreviewSheet
          doneCount={doneCount}
          onClose={() => onPreviewOpenChange(false)}
          onStart={startSession}
        />
      ) : null}
    </div>
  );
}
