import { useEffect, useMemo, useState } from "react";

import {
  buildSundayCheckInData,
  shouldShowSundayCheckIn,
  type SundayCheckInData,
} from "@/lib/sundayCheckInHome";
import type { AppState } from "@newyouai/types";

export function useSundayCheckInHome(state: AppState | null) {
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const available = Boolean(state?.onboardingComplete && state && shouldShowSundayCheckIn(state, clock));

  const data = useMemo((): SundayCheckInData | null => {
    if (!available || !state) return null;
    return buildSundayCheckInData(state, clock);
  }, [state, clock, available]);

  const completed = data != null && state?.sundayReviewCompletedKey === data.sundayKey;

  return {
    available: available && data != null,
    data,
    completed,
  };
}
