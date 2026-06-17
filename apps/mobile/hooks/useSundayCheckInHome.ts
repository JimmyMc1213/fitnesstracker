import { useEffect, useMemo, useState } from "react";

import {
  buildSundayCheckInData,
  shouldShowSundayCheckIn,
  shouldShowSundayCheckInCard,
  sundayNoonForCurrentWeek,
  type SundayCheckInData,
} from "@newyouai/core";
import type { AppState } from "@newyouai/types";

import { isDevPreviewSundayEnabled } from "@/lib/devPreviewSunday";

export function useSundayCheckInHome(state: AppState | null) {
  const [clock, setClock] = useState(() => new Date());
  const previewSunday = isDevPreviewSundayEnabled();

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const reviewClock = previewSunday ? sundayNoonForCurrentWeek(clock) : clock;

  const available = Boolean(
    state?.onboardingComplete &&
      state &&
      (previewSunday || shouldShowSundayCheckIn(state, clock, previewSunday)),
  );

  const data = useMemo((): SundayCheckInData | null => {
    if (!available || !state) return null;
    return buildSundayCheckInData(state, reviewClock);
  }, [state, reviewClock, available]);

  const completed = data != null && state?.sundayReviewCompletedKey === data.sundayKey;
  const showCard =
    data != null && state != null && shouldShowSundayCheckInCard(state, data, clock, previewSunday);

  return {
    available: available && data != null,
    showCard,
    data,
    completed,
    previewSunday,
    reviewClock,
  };
}
