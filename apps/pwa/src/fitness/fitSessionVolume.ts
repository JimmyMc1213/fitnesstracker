import {
  estimateSessionSecondsFromCounts,
} from "./estimateSessionDuration";
import {
  SESSION_BOUNDS_SECONDS,
  SESSION_TARGET_SECONDS,
  restSecondsForSessionLength,
} from "./sessionLengthConfig";
import {
  PREFERRED_PROGRAMMED_SETS,
  PROGRAMMED_MAX_SETS,
} from "@newyouai/core";
import type { SessionLength } from "./types";

export type SessionVolumeFit = {
  exerciseCount: number;
  setCount: number;
  estimatedSeconds: number;
};

const MIN_SETS = 2;

type VolumeCandidate = SessionVolumeFit & { diff: number; setDiff: number };

function isBetterVolumeCandidate(candidate: VolumeCandidate, best: VolumeCandidate): boolean {
  if (candidate.diff < best.diff) return true;
  if (candidate.diff > best.diff) return false;
  if (candidate.setDiff < best.setDiff) return true;
  if (candidate.setDiff > best.setDiff) return false;
  return candidate.setCount < best.setCount;
}

export function fitSessionVolume(
  maxExercises: number,
  sessionLength: SessionLength,
  preferredSets: number = PREFERRED_PROGRAMMED_SETS,
): SessionVolumeFit {
  const targetSeconds = SESSION_TARGET_SECONDS[sessionLength];
  const { minSeconds, maxSeconds } = SESSION_BOUNDS_SECONDS[sessionLength];
  const restSeconds = restSecondsForSessionLength(sessionLength);
  const cappedMax = Math.max(1, maxExercises);

  let bestInBucket: VolumeCandidate | null = null;
  let bestOverall: VolumeCandidate | null = null;

  for (let exerciseCount = 1; exerciseCount <= cappedMax; exerciseCount++) {
    for (let setCount = MIN_SETS; setCount <= PROGRAMMED_MAX_SETS; setCount++) {
      const estimatedSeconds = estimateSessionSecondsFromCounts(exerciseCount, setCount, restSeconds);
      const diff = Math.abs(estimatedSeconds - targetSeconds);
      const setDiff = Math.abs(setCount - preferredSets);
      const candidate: VolumeCandidate = { exerciseCount, setCount, estimatedSeconds, diff, setDiff };

      if (estimatedSeconds >= minSeconds && estimatedSeconds <= maxSeconds) {
        if (!bestInBucket || isBetterVolumeCandidate(candidate, bestInBucket)) {
          bestInBucket = candidate;
        }
      }

      if (!bestOverall || isBetterVolumeCandidate(candidate, bestOverall)) {
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
