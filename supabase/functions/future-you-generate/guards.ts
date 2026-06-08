/** Keep in sync with src/fitness/futureYouGenerateGuards.ts */

import { getFutureYouMotivationById } from "../_shared/future-you/futureYouMotivations.ts";
import { isFutureYouSourcePathForUser } from "../_shared/future-you/paths.ts";
import type { NutritionGoal, UserGender } from "../_shared/future-you/types.ts";

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
  const timeline = typeof raw.timeline === "string" ? raw.timeline.trim() : undefined;

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

function jsonResponse(body: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

export function unauthorizedResponse(corsHeaders: Record<string, string>): Response {
  return jsonResponse({ error: "Sign in to generate your Future You." }, 401, corsHeaders);
}

export function badGenerateResponse(
  error: string,
  status: 400 | 409,
  corsHeaders: Record<string, string>,
): Response {
  return jsonResponse({ error }, status, corsHeaders);
}

export function conflictActiveJobResponse(
  jobId: string,
  status: string,
  corsHeaders: Record<string, string>,
): Response {
  return jsonResponse(
    {
      error: "A Future You generation is already in progress.",
      jobId,
      status,
    },
    409,
    corsHeaders,
  );
}
