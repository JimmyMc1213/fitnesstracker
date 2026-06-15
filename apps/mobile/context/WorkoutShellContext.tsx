import { useSegments } from "expo-router";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

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
  hideTabBar: boolean;
};

const WorkoutShellContext = createContext<WorkoutShellContextValue | null>(null);

export function WorkoutShellProvider({ children }: { children: ReactNode }) {
  const { state } = useFitnessState();
  const [routineEditorOpen, setRoutineEditorOpen] = useState(false);
  const segments = useSegments();
  const onWorkoutTab = activeTabRoute(segments) === "workout";

  const hideTabBar =
    (onWorkoutTab && state?.workout.sessionPhase === "lifting") ||
    (onWorkoutTab && routineEditorOpen);

  const value = useMemo(
    () => ({
      routineEditorOpen,
      setRoutineEditorOpen,
      hideTabBar,
    }),
    [routineEditorOpen, hideTabBar, onWorkoutTab],
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
