import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

import {
  badReportResponse,
  parseIssueReportRequest,
  unauthorizedResponse,
} from "./guards.ts";
import { createLinearIssueForReport } from "./linear.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AuthContext = {
  userId: string;
  adminClient: SupabaseClient;
};

async function resolveAuthenticatedContext(req: Request): Promise<AuthContext | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("issue-report: missing Supabase env");
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

  return { userId: user.id, adminClient };
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
    const parsed = parseIssueReportRequest(body);
    if (!parsed.ok) {
      return badReportResponse(parsed.error, corsHeaders);
    }

    const { request } = parsed;

    const { data, error } = await auth.adminClient
      .from("issue_reports")
      .insert({
        user_id: auth.userId,
        category: request.category,
        message: request.message ?? null,
        app_version: request.appVersion ?? null,
        platform: request.platform ?? null,
        device_model: request.deviceModel ?? null,
      })
      .select("id")
      .single();

    if (error || !data?.id) {
      console.error("issue-report: insert failed", error);
      return badReportResponse("Could not send report. Try again.", corsHeaders, 500);
    }

    const reportId = data.id;
    let linearIssueId: string | null = null;
    let linearIssueUrl: string | null = null;

    const linearApiKey = Deno.env.get("LINEAR_API_KEY")?.trim();
    const linearTeamId = Deno.env.get("LINEAR_TEAM_ID")?.trim();

    if (linearApiKey && linearTeamId) {
      try {
        const linearIssue = await createLinearIssueForReport({
          apiKey: linearApiKey,
          teamId: linearTeamId,
          category: request.category,
          message: request.message,
          reportId,
          userId: auth.userId,
          appVersion: request.appVersion,
          platform: request.platform,
          deviceModel: request.deviceModel,
        });

        linearIssueId = linearIssue.issueId;
        linearIssueUrl = linearIssue.issueUrl;

        const { error: updateError } = await auth.adminClient
          .from("issue_reports")
          .update({
            linear_issue_id: linearIssueId,
            linear_issue_url: linearIssueUrl,
          })
          .eq("id", reportId);

        if (updateError) {
          console.error("issue-report: linear link update failed", updateError);
        }
      } catch (linearError) {
        console.error("issue-report: linear create failed (report saved)", linearError);
      }
    } else {
      console.warn("issue-report: LINEAR_API_KEY or LINEAR_TEAM_ID not set; skipping Linear issue");
    }

    console.info("issue-report: received", {
      reportId,
      userId: auth.userId,
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
    console.error("issue-report error", e);
    return badReportResponse("Could not send report. Try again.", corsHeaders, 500);
  }
});
