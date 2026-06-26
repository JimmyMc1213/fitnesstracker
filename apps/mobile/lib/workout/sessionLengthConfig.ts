import type { SessionLength, TrainingSessionDuration } from "@newyouai/types";

export function sessionLengthFromDuration(raw?: TrainingSessionDuration | SessionLength): SessionLength {
  switch (raw) {
    case "under_30":
    case "30_or_less":
      return "under_30";
    case "30_45":
    case "30_to_45":
      return "30_45";
    case "45_60":
    case "45_to_60":
      return "45_60";
    case "60_90":
    case "60_to_90":
      return "60_90";
    case "90_plus":
      return "90_plus";
    default:
      return "45_60";
  }
}

export function sessionDurationFromSessionLength(length: SessionLength): TrainingSessionDuration {
  switch (length) {
    case "under_30":
      return "30_or_less";
    case "30_45":
      return "30_to_45";
    case "45_60":
      return "45_to_60";
    case "60_90":
      return "60_to_90";
    case "90_plus":
      return "90_plus";
  }
}

/** Target session duration (seconds), midpoint of each onboarding bucket. */
export const SESSION_TARGET_SECONDS: Record<SessionLength, number> = {
  under_30: 25 * 60,
  "30_45": 37.5 * 60,
  "45_60": 52.5 * 60,
  "60_90": 75 * 60,
  "90_plus": 105 * 60,
};

/** Acceptable session duration bounds (seconds) for programmed workouts. */
export const SESSION_BOUNDS_SECONDS: Record<SessionLength, { minSeconds: number; maxSeconds: number }> = {
  under_30: { minSeconds: 15 * 60, maxSeconds: 29 * 60 },
  "30_45": { minSeconds: 30 * 60, maxSeconds: 45 * 60 },
  "45_60": { minSeconds: 45 * 60, maxSeconds: 60 * 60 },
  "60_90": { minSeconds: 60 * 60, maxSeconds: 90 * 60 },
  "90_plus": { minSeconds: 80 * 60, maxSeconds: 130 * 60 },
};

/** Default rest between sets, derived from preferred session length. */
export const REST_SECONDS_BY_SESSION_LENGTH: Record<SessionLength, number> = {
  under_30: 45,
  "30_45": 60,
  "45_60": 75,
  "60_90": 90,
  "90_plus": 120,
};

export function restSecondsForSessionLength(sessionLength: SessionLength): number {
  return REST_SECONDS_BY_SESSION_LENGTH[sessionLength];
}

export function restSecondsFromTrainingDuration(duration?: TrainingSessionDuration): number {
  return restSecondsForSessionLength(sessionLengthFromDuration(duration));
}

export function sessionWithinBounds(totalSeconds: number, sessionLength: SessionLength): boolean {
  const { minSeconds, maxSeconds } = SESSION_BOUNDS_SECONDS[sessionLength];
  return totalSeconds >= minSeconds && totalSeconds <= maxSeconds;
}

/** Round minutes for display/storage (nearest 5, minimum 15). */
export function roundEstimatedSessionMinutes(totalSeconds: number): number {
  if (totalSeconds <= 0) return 0;
  const minutes = totalSeconds / 60;
  const rounded = Math.round(minutes / 5) * 5;
  return Math.max(15, rounded);
}
