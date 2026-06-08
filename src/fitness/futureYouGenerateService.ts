import type { FutureYouGenerateProfile, FutureYouGenerateRequest } from "./futureYouGenerateGuards";
import type { FutureYouJobStatus } from "./futureYouJobs";
import { getSupabase, isSupabaseConfigured } from "./supabaseClient";

export type FutureYouGenerateResult = {
  jobId: string;
  status: FutureYouJobStatus;
};

export class FutureYouGenerateError extends Error {
  constructor(
    message: string,
    readonly code?: "auth_required" | "unavailable" | "invalid" | "conflict",
    readonly jobId?: string,
    readonly status?: FutureYouJobStatus,
  ) {
    super(message);
    this.name = "FutureYouGenerateError";
  }
}

function parseGenerateResponse(data: unknown): FutureYouGenerateResult {
  if (!data || typeof data !== "object") {
    throw new FutureYouGenerateError("Could not start generation. Try again.", "invalid");
  }

  const body = data as {
    error?: string;
    jobId?: string;
    status?: string;
  };

  if (typeof body.error === "string" && body.error.trim()) {
    if (typeof body.jobId === "string" && body.jobId.trim()) {
      throw new FutureYouGenerateError(body.error.trim(), "conflict", body.jobId.trim(), parseStatus(body.status));
    }
    throw new FutureYouGenerateError(body.error.trim(), "invalid");
  }

  if (typeof body.jobId !== "string" || !body.jobId.trim()) {
    throw new FutureYouGenerateError("Could not start generation. Try again.", "invalid");
  }

  return {
    jobId: body.jobId.trim(),
    status: parseStatus(body.status) ?? "generating",
  };
}

function parseStatus(value: string | undefined): FutureYouJobStatus | undefined {
  if (value === "queued" || value === "generating" || value === "ready" || value === "failed") {
    return value;
  }
  return undefined;
}

/** Queue Future You generation after step 10c. */
export async function startFutureYouGeneration(
  request: FutureYouGenerateRequest,
): Promise<FutureYouGenerateResult> {
  if (!isSupabaseConfigured()) {
    throw new FutureYouGenerateError("Sign in to create your Future You.", "unavailable");
  }

  const sb = getSupabase();
  if (!sb) {
    throw new FutureYouGenerateError("Sign in to create your Future You.", "unavailable");
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) {
    throw new FutureYouGenerateError("Sign in to create your Future You.", "auth_required");
  }

  const { data, error } = await sb.functions.invoke("future-you-generate", {
    body: request,
  });

  if (error) {
    throw new FutureYouGenerateError(error.message || "Could not start generation. Try again.", "unavailable");
  }

  try {
    return parseGenerateResponse(data);
  } catch (err) {
    if (err instanceof FutureYouGenerateError && err.code === "conflict" && err.jobId) {
      return {
        jobId: err.jobId,
        status: err.status ?? "generating",
      };
    }
    throw err;
  }
}

export function buildFutureYouGenerateProfile(
  profile: Pick<FutureYouGenerateProfile, "goal" | "gender" | "weightLbs" | "goalWeightLbs">,
): FutureYouGenerateProfile {
  return {
    goal: profile.goal,
    gender: profile.gender,
    weightLbs: profile.weightLbs,
    goalWeightLbs: profile.goalWeightLbs,
  };
}
