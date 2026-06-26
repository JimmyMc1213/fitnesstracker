import { arizonaCalendarDateKey } from "@newyouai/core";
import type { AppState } from "@newyouai/types";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { View } from "react-native";

import { MobilityPreviewSheet } from "@/components/home/MobilityPreviewSheet";
import { MobilityActiveSession } from "@/components/stretch/MobilityActiveSession";
import { useWorkoutShell } from "@/context/WorkoutShellContext";
import { STRETCH_BLOCKS } from "@/lib/stretchRoutine";

type Props = {
  state: AppState;
  setState: (updater: AppState | ((prev: AppState) => AppState)) => void;
  previewOpen: boolean;
  onPreviewOpenChange: (open: boolean) => void;
  paddingTop: number;
  paddingBottom: number;
  children: ReactNode;
};

export function MobilityRoutineFlow({
  state,
  setState,
  previewOpen,
  onPreviewOpenChange,
  paddingTop,
  paddingBottom,
  children,
}: Props) {
  const { setMobilitySessionOpen } = useWorkoutShell();
  const [sessionOpen, setSessionOpen] = useState(false);

  const arizonaTodayKey = arizonaCalendarDateKey(new Date());
  const completedIds = state.nightlyStretchBlockIdsByArizonaDay[arizonaTodayKey] ?? [];
  const doneCount = useMemo(
    () => completedIds.filter((id) => STRETCH_BLOCKS.some((b) => b.id === id)).length,
    [completedIds],
  );

  useEffect(() => {
    setMobilitySessionOpen(sessionOpen);
    return () => setMobilitySessionOpen(false);
  }, [sessionOpen, setMobilitySessionOpen]);

  function startSession() {
    setSessionOpen(true);
    onPreviewOpenChange(false);
  }

  function closeSession() {
    setSessionOpen(false);
  }

  return (
    <View className="relative flex-1">
      {!sessionOpen ? children : null}

      {sessionOpen ? (
        <MobilityActiveSession
          state={state}
          setState={setState}
          onClose={closeSession}
          paddingTop={paddingTop}
          paddingBottom={paddingBottom}
        />
      ) : null}

      <MobilityPreviewSheet
        open={previewOpen}
        doneCount={doneCount}
        onClose={() => onPreviewOpenChange(false)}
        onStart={startSession}
      />
    </View>
  );
}
