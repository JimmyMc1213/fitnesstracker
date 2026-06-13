import { useEffect, useMemo, useState } from "react";

import {
  buildSundayCheckInData,
  shouldShowSundayCheckIn,
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

  return {
    available: available && data != null,
    data,
    completed,
    previewSunday,
    reviewClock,
  };
}
