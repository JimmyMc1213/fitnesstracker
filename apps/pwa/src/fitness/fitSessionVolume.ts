import {
  estimateSessionSecondsFromCounts,
} from "./estimateSessionDuration";
import {
  SESSION_BOUNDS_SECONDS,
  SESSION_TARGET_SECONDS,
  restSecondsForSessionLength,
} from "./sessionLengthConfig";
import type { SessionLength } from "./types";

export type SessionVolumeFit = {
  exerciseCount: number;
  setCount: number;
  estimatedSeconds: number;
};

const MIN_SETS = 2;
const MAX_SETS = 4;

export function fitSessionVolume(
  maxExercises: number,
  sessionLength: SessionLength,
  preferredSets: number,
): SessionVolumeFit {
  const targetSeconds = SESSION_TARGET_SECONDS[sessionLength];
  const { minSeconds, maxSeconds } = SESSION_BOUNDS_SECONDS[sessionLength];
  const restSeconds = restSecondsForSessionLength(sessionLength);
  const cappedMax = Math.max(1, maxExercises);

  let bestInBucket: (SessionVolumeFit & { diff: number; setDiff: number }) | null = null;
  let bestOverall: (SessionVolumeFit & { diff: number; setDiff: number }) | null = null;

  for (let exerciseCount = 1; exerciseCount <= cappedMax; exerciseCount++) {
    for (let setCount = MIN_SETS; setCount <= MAX_SETS; setCount++) {
      const estimatedSeconds = estimateSessionSecondsFromCounts(exerciseCount, setCount, restSeconds);
      const diff = Math.abs(estimatedSeconds - targetSeconds);
      const setDiff = Math.abs(setCount - preferredSets);
      const candidate = { exerciseCount, setCount, estimatedSeconds, diff, setDiff };

      if (estimatedSeconds >= minSeconds && estimatedSeconds <= maxSeconds) {
        if (
          !bestInBucket ||
          candidate.diff < bestInBucket.diff ||
          (candidate.diff === bestInBucket.diff && candidate.setDiff < bestInBucket.setDiff)
        ) {
          bestInBucket = candidate;
        }
      }

      if (
        !bestOverall ||
        candidate.diff < bestOverall.diff ||
        (candidate.diff === bestOverall.diff && candidate.setDiff < bestOverall.setDiff)
      ) {
        bestOverall = candidate;
      }
    }
  }

  const chosen = bestInBucket ?? bestOverall!;
  return {
    exerciseCount: chosen.exerciseCount,
    setCount: chosen.setCount,
    estimatedSeconds: chosen.estimatedSeconds,
  };
}
