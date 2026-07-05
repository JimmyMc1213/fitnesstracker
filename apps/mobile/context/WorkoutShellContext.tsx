import { useSegments } from "expo-router";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useFitnessState } from "@/context/FitnessContext";

const TAB_ROUTE_NAMES = new Set(["home", "nutrition", "workout", "progress", "settings", "future-you"]);

function activeTabRoute(segments: string[]): string | null {
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const segment = segments[i]?.replace(/[()]/g, "");
    if (segment && TAB_ROUTE_NAMES.has(segment)) return segment;
  }
  return null;
}

type WorkoutShellContextValue = {
  routineEditorOpen: boolean;
  setRoutineEditorOpen: (open: boolean) => void;
  futureYouFlowOpen: boolean;
  setFutureYouFlowOpen: (open: boolean) => void;
  mobilitySessionOpen: boolean;
  setMobilitySessionOpen: (open: boolean) => void;
  /** When false, an in-progress lifting session shows the idle dashboard instead. */
  workoutSessionExpanded: boolean;
  setWorkoutSessionExpanded: (expanded: boolean) => void;
  hideTabBar: boolean;
};

const WorkoutShellContext = createContext<WorkoutShellContextValue | null>(null);

export function WorkoutShellProvider({ children }: { children: ReactNode }) {
  const { state } = useFitnessState();
  const [routineEditorOpen, setRoutineEditorOpen] = useState(false);
  const [futureYouFlowOpen, setFutureYouFlowOpen] = useState(false);
  const [mobilitySessionOpen, setMobilitySessionOpen] = useState(false);
  const [workoutSessionExpanded, setWorkoutSessionExpanded] = useState(true);
  const sessionPhaseRef = useRef(state?.workout.sessionPhase);
  const segments = useSegments();
  const onWorkoutTab = activeTabRoute(segments) === "workout";
  const onHomeTab = activeTabRoute(segments) === "home";
  const sessionPhase = state?.workout.sessionPhase ?? "idle";

  useEffect(() => {
    const prevPhase = sessionPhaseRef.current;
    if (prevPhase === "idle" && sessionPhase === "lifting") {
      setWorkoutSessionExpanded(true);
    }
    if (sessionPhase === "idle") {
      setWorkoutSessionExpanded(true);
    }
    sessionPhaseRef.current = sessionPhase;
  }, [sessionPhase]);

  const hideTabBar =
    futureYouFlowOpen ||
    (onHomeTab && mobilitySessionOpen) ||
    (onWorkoutTab && sessionPhase === "lifting" && workoutSessionExpanded) ||
    (onWorkoutTab && routineEditorOpen);

  const value = useMemo(
    () => ({
      routineEditorOpen,
      setRoutineEditorOpen,
      futureYouFlowOpen,
      setFutureYouFlowOpen,
      mobilitySessionOpen,
      setMobilitySessionOpen,
      workoutSessionExpanded,
      setWorkoutSessionExpanded,
      hideTabBar,
    }),
    [routineEditorOpen, futureYouFlowOpen, mobilitySessionOpen, workoutSessionExpanded, hideTabBar],
  );

  return <WorkoutShellContext.Provider value={value}>{children}</WorkoutShellContext.Provider>;
}

export function useWorkoutShell(): WorkoutShellContextValue {
  const ctx = useContext(WorkoutShellContext);
  if (!ctx) {
    throw new Error("useWorkoutShell must be used within WorkoutShellProvider");
  }
  return ctx;
}
