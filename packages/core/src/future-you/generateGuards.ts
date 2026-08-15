/** Keep in sync with supabase/functions/future-you-generate/guards.ts */

import type { NutritionGoal, UserGender } from "@newyouai/types";

import { getFutureYouMotivationById } from "./motivations";
import { isFutureYouSourcePathForUser } from "./paths";

/** Server backstop: 3 generate attempts per rolling 24h (retries + one redo). */
export const FUTURE_YOU_GENERATE_RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
export const FUTURE_YOU_GENERATE_RATE_LIMIT_MAX = 3;

/** Prompt timeline is interpolated into the OpenAI prompt — keep it short and shaped. */
export const FUTURE_YOU_TIMELINE_MAX_LEN = 32;
const FUTURE_YOU_TIMELINE_RE = /^\d+\s+(months?|years?)$/i;

export type FutureYouGenerateRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

export class FutureYouGenerateRateLimiter {
  private buckets = new Map<string, { count: number; windowStartMs: number }>();

  constructor(
    private readonly windowMs = FUTURE_YOU_GENERATE_RATE_LIMIT_WINDOW_MS,
    private readonly maxRequests = FUTURE_YOU_GENERATE_RATE_LIMIT_MAX,
    private readonly nowMs: () => number = () => Date.now(),
  ) {}

  check(key: string): FutureYouGenerateRateLimitResult {
    const now = this.nowMs();
    const bucket = this.buckets.get(key);

    if (!bucket || now - bucket.windowStartMs >= this.windowMs) {
      this.buckets.set(key, { count: 1, windowStartMs: now });
      return { allowed: true };
    }

    if (bucket.count >= this.maxRequests) {
      const retryAfterMs = this.windowMs - (now - bucket.windowStartMs);
      return { allowed: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
    }

    bucket.count += 1;
    return { allowed: true };
  }

  reset(key?: string): void {
    if (key === undefined) {
      this.buckets.clear();
      return;
    }
    this.buckets.delete(key);
  }
}

export function sanitizeFutureYouTimeline(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > FUTURE_YOU_TIMELINE_MAX_LEN) return undefined;
  if (!FUTURE_YOU_TIMELINE_RE.test(trimmed)) return undefined;
  return trimmed;
}

export type FutureYouGenerateProfile = {
  goal: NutritionGoal;
  gender: UserGender;
  weightLbs: number;
  goalWeightLbs?: number;
};

export type FutureYouGenerateRequest = {
  sourcePath: string;
  motivationId: string;
  profile: FutureYouGenerateProfile;
  timeline?: string;
};

export type FutureYouGenerateValidationError = {
  ok: false;
  error: string;
  status: 400 | 409;
};

export type FutureYouGenerateValidationSuccess = {
  ok: true;
  request: FutureYouGenerateRequest;
};

export type FutureYouGenerateValidationResult =
  | FutureYouGenerateValidationSuccess
  | FutureYouGenerateValidationError;

const NUTRITION_GOALS: readonly NutritionGoal[] = ["cut", "bulk", "maintain"];
const USER_GENDERS: readonly UserGender[] = ["male", "female", "other"];

function isNutritionGoal(value: unknown): value is NutritionGoal {
  return typeof value === "string" && (NUTRITION_GOALS as readonly string[]).includes(value);
}

function isUserGender(value: unknown): value is UserGender {
  return typeof value === "string" && (USER_GENDERS as readonly string[]).includes(value);
}

function parseProfile(raw: unknown): FutureYouGenerateProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const profile = raw as Record<string, unknown>;
  if (!isNutritionGoal(profile.goal)) return null;
  if (!isUserGender(profile.gender)) return null;
  if (typeof profile.weightLbs !== "number" || !Number.isFinite(profile.weightLbs) || profile.weightLbs <= 0) {
    return null;
  }

  const parsed: FutureYouGenerateProfile = {
    goal: profile.goal,
    gender: profile.gender,
    weightLbs: profile.weightLbs,
  };

  if (profile.goalWeightLbs != null) {
    if (
      typeof profile.goalWeightLbs !== "number" ||
      !Number.isFinite(profile.goalWeightLbs) ||
      profile.goalWeightLbs <= 0
    ) {
      return null;
    }
    parsed.goalWeightLbs = profile.goalWeightLbs;
  }

  return parsed;
}

export function isMotivationValidForProfile(
  motivationId: string,
  goal: NutritionGoal,
  gender: UserGender,
): boolean {
  const motivation = getFutureYouMotivationById(motivationId);
  if (!motivation) return false;
  return motivation.goals.includes(goal) && motivation.genders.includes(gender);
}

export function validateFutureYouGenerateRequest(
  body: unknown,
  userId: string,
): FutureYouGenerateValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body.", status: 400 };
  }

  const raw = body as Record<string, unknown>;
  const sourcePath = typeof raw.sourcePath === "string" ? raw.sourcePath.trim() : "";
  const motivationId = typeof raw.motivationId === "string" ? raw.motivationId.trim() : "";
  const profile = parseProfile(raw.profile);
  const timeline = typeof raw.timeline === "string" ? sanitizeFutureYouTimeline(raw.timeline) : undefined;

  if (!sourcePath) {
    return { ok: false, error: "Missing source photo path.", status: 400 };
  }
  if (!isFutureYouSourcePathForUser(sourcePath, userId)) {
    return { ok: false, error: "Invalid source photo path.", status: 400 };
  }
  if (!motivationId) {
    return { ok: false, error: "Missing motivation.", status: 400 };
  }
  if (!getFutureYouMotivationById(motivationId)) {
    return { ok: false, error: "Unknown motivation.", status: 400 };
  }
  if (!profile) {
    return { ok: false, error: "Invalid profile for Future You generation.", status: 400 };
  }
  if (!isMotivationValidForProfile(motivationId, profile.goal, profile.gender)) {
    return { ok: false, error: "Motivation does not match your goal or gender.", status: 400 };
  }

  return {
    ok: true,
    request: {
      sourcePath,
      motivationId,
      profile,
      timeline: timeline || undefined,
    },
  };
}
