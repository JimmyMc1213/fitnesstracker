import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

import {
  badReportResponse,
  parseFutureYouReportRequest,
  unauthorizedResponse,
} from "./guards.ts";
import { createLinearIssueForFutureYouReport } from "./linear.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AuthContext = {
  userId: string;
  userClient: SupabaseClient;
  adminClient: SupabaseClient;
};

async function resolveAuthenticatedContext(req: Request): Promise<AuthContext | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("future-you-report: missing Supabase env");
    return null;
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();
  if (error || !user) return null;

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return { userId: user.id, userClient, adminClient };
}

async function jobBelongsToUser(
  userClient: SupabaseClient,
  userId: string,
  jobId: string,
): Promise<boolean> {
  const { data, error } = await userClient
    .from("future_you_jobs")
    .select("id")
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("future-you-report: job lookup failed", error);
    throw new Error("Could not verify generation job.");
  }

  return Boolean(data);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = await resolveAuthenticatedContext(req);
    if (!auth) {
      return unauthorizedResponse(corsHeaders);
    }

    const body = await req.json().catch(() => null);
    const parsed = parseFutureYouReportRequest(body);
    if (!parsed.ok) {
      return badReportResponse(parsed.error, corsHeaders);
    }

    const { request } = parsed;

    if (request.jobId) {
      const owned = await jobBelongsToUser(auth.userClient, auth.userId, request.jobId);
      if (!owned) {
        return badReportResponse("Generation job not found.", corsHeaders, 404);
      }
    }

    const { data, error } = await auth.adminClient
      .from("future_you_reports")
      .insert({
        user_id: auth.userId,
        job_id: request.jobId ?? null,
        context: request.context,
        category: request.category,
        message: request.message ?? null,
      })
      .select("id")
      .single();

    if (error || !data?.id) {
      console.error("future-you-report: insert failed", error);
      return badReportResponse("Could not send report. Try again.", corsHeaders, 500);
    }

    const reportId = data.id as string;
    let linearIssueId: string | null = null;
    let linearIssueUrl: string | null = null;

    const linearApiKey = Deno.env.get("LINEAR_API_KEY")?.trim();
    const linearTeamId = Deno.env.get("LINEAR_TEAM_ID")?.trim();

    if (linearApiKey && linearTeamId) {
      try {
        const linearIssue = await createLinearIssueForFutureYouReport({
          apiKey: linearApiKey,
          teamId: linearTeamId,
          category: request.category,
          context: request.context,
          message: request.message,
          reportId,
          userId: auth.userId,
          jobId: request.jobId,
        });

        linearIssueId = linearIssue.issueId;
        linearIssueUrl = linearIssue.issueUrl;

        const { error: updateError } = await auth.adminClient
          .from("future_you_reports")
          .update({
            linear_issue_id: linearIssueId,
            linear_issue_url: linearIssueUrl,
          })
          .eq("id", reportId);

        if (updateError) {
          console.error("future-you-report: linear link update failed", updateError);
        }
      } catch (linearError) {
        console.error("future-you-report: linear create failed (report saved)", linearError);
      }
    } else {
      console.warn("future-you-report: LINEAR_API_KEY or LINEAR_TEAM_ID not set; skipping Linear issue");
    }

    console.info("future-you-report: received", {
      reportId,
      userId: auth.userId,
      jobId: request.jobId ?? null,
      context: request.context,
      category: request.category,
      linearIssueId,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        reportId,
        linearIssueUrl: linearIssueUrl ?? undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("future-you-report error", e);
    return badReportResponse("Could not send report. Try again.", corsHeaders, 500);
  }
});
