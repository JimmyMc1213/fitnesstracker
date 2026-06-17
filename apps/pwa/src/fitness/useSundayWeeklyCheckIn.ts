import { useCallback, useEffect, useMemo, useState } from "react";

import {
  buildSundayCheckInData,
  clearDevPreviewSundayUrl,
  commitSundayCheckIn,
  dismissSundayCheckIn,
  DEV_PREVIEW_SUNDAY_EVENT,
  isDevPreviewSundayUrl,
  shouldShowSundayCheckIn,
  shouldShowSundayCheckInCard,
  sundayNoonForCurrentWeek,
  type DevPreviewSundayEventDetail,
  type SundayCheckInData,
} from "./sundayCheckIn";
import type { WeekFocusCommitment } from "./types";
import type { AppState } from "./types";

export function useSundayWeeklyCheckIn(
  state: AppState,
  setState: React.Dispatch<React.SetStateAction<AppState>>,
): {
  available: boolean;
  data: SundayCheckInData | null;
  flowOpen: boolean;
  openFlow: () => void;
  closeFlow: () => void;
  complete: (commitments: WeekFocusCommitment[]) => void;
  dismiss: () => void;
  completed: boolean;
  showCard: boolean;
} {
  const [clock, setClock] = useState(() => new Date());
  const [devPreviewSunday, setDevPreviewSunday] = useState(
    () => import.meta.env.DEV && isDevPreviewSundayUrl(),
  );
  const [flowOpen, setFlowOpen] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const sync = (event: Event) => {
      const detail = (event as CustomEvent<DevPreviewSundayEventDetail>).detail;
      setDevPreviewSunday(detail?.active ?? isDevPreviewSundayUrl());
    };
    window.addEventListener(DEV_PREVIEW_SUNDAY_EVENT, sync);
    return () => window.removeEventListener(DEV_PREVIEW_SUNDAY_EVENT, sync);
  }, []);

  const previewSundayUi = import.meta.env.DEV && devPreviewSunday;
  const reviewClock = previewSundayUi ? sundayNoonForCurrentWeek(clock) : clock;

  const available =
    previewSundayUi ||
    (state.onboardingComplete && shouldShowSundayCheckIn(state, clock, previewSundayUi));

  const data = useMemo(() => {
    if (!available) return null;
    return buildSundayCheckInData(state, reviewClock);
  }, [state, reviewClock, available]);

  const completed = data != null && state.sundayReviewCompletedKey === data.sundayKey;
  const showCard = data != null && shouldShowSundayCheckInCard(state, data, clock, previewSundayUi);

  useEffect(() => {
    if (!available) setFlowOpen(false);
  }, [available]);

  const openFlow = useCallback(() => setFlowOpen(true), []);
  const closeFlow = useCallback(() => {
    if (previewSundayUi) clearDevPreviewSundayUrl();
    setFlowOpen(false);
  }, [previewSundayUi]);

  const complete = useCallback(
    (commitments: WeekFocusCommitment[]) => {
      if (!data) return;
      setState((s) => commitSundayCheckIn(s, data, commitments));
      setFlowOpen(false);
    },
    [data, setState],
  );

  const dismiss = useCallback(() => {
    setState((s) => dismissSundayCheckIn(s, clock, previewSundayUi));
  }, [clock, previewSundayUi, setState]);

  return { available, data, flowOpen, openFlow, closeFlow, complete, dismiss, completed, showCard };
}
