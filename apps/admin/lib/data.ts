import "server-only";

import { unstable_cache } from "next/cache";

import { createAdminClient } from "./supabase-admin";
import { isSupabaseConfigured } from "./env";
import { EMPTY_DASHBOARD } from "./empty";
import { getAuditLog } from "./audit";
import {
  ADMIN_CACHE_TAG,
  getAuthUserCount,
  getCachedAuthUsers,
  emailMapFromCache,
} from "./admin-cache";
import {
  computeConversionStats,
  planLabelFromProduct,
  subscriptionStatus,
} from "./subscriptions";
import type {
  AdminUserDetail,
  AdminUserRow,
  CommunityFood,
  DashboardData,
  Demoable,
  FutureYouJob,
  FutureYouReport,
  IssueReport,
} from "./types";

type SubRow = {
  user_id: string;
  is_active: boolean;
  product_id: string | null;
  period_type?: string | null;
  raw?: unknown;
};

/** One round-trip: counts several job statuses at once instead of one query per status. */
async function countJobStatuses(statuses: string[]): Promise<Record<string, number>> {
  const supabase = createAdminClient();
  const tally: Record<string, number> = Object.fromEntries(statuses.map((s) => [s, 0]));
  const { data } = await supabase
    .from("future_you_jobs")
    .select("status")
    .in("status", statuses);
  for (const row of data ?? []) {
    const s = (row as { status: string }).status;
    if (s in tally) tally[s] += 1;
  }
  return tally;
}

async function fetchUsers(): Promise<Demoable<AdminUserRow[]>> {
  if (!isSupabaseConfigured()) return { data: [], demo: true };
  try {
    const supabase = createAdminClient();
    const users = await getCachedAuthUsers();
    // Select only the nested profile fields we render — not the full (potentially huge) payload JSONB.
    const [{ data: fitness }, { data: subs }] = await Promise.all([
      supabase
        .from("fitness_user_data")
        .select("user_id, updated_at_ms, goal:payload->onboardingProfile->>goal, country:payload->onboardingProfile->>country"),
      supabase.from("subscriptions").select("user_id, is_active, product_id, period_type:raw->event->>period_type"),
    ]);
    const fitnessById = new Map((fitness ?? []).map((f) => [f.user_id, f]));
    const subById = new Map((subs ?? []).map((s) => [s.user_id, s as SubRow]));

    const rows: AdminUserRow[] = users.map((u) => {
      const f = fitnessById.get(u.id);
      const sub = subById.get(u.id);
      const status = subscriptionStatus(sub ?? null);
      return {
        id: u.id,
        email: u.email ?? u.id,
        createdAt: u.created_at ?? null,
        goal: (f?.goal as string | null) ?? null,
        plan: planLabelFromProduct(sub?.product_id ?? null, Boolean(sub?.is_active)),
        status,
        lastSyncMs: f?.updated_at_ms ?? null,
        country: (f?.country as string | null) ?? null,
      };
    });
    return { data: rows, demo: false };
  } catch {
    return { data: [], demo: true };
  }
}

/** Cached 60s — the Users list always fetches all rows (search is client-side), so it's safe to share. */
export const getUsers = unstable_cache(fetchUsers, ["admin-users-list"], {
  revalidate: 60,
  tags: [ADMIN_CACHE_TAG],
});

export async function getUserDetail(id: string): Promise<Demoable<AdminUserDetail | null>> {
  if (!isSupabaseConfigured()) return { data: null, demo: true };
  try {
    const supabase = createAdminClient();
    const [{ data: authUser }, { data: fitness }, { data: sub }] = await Promise.all([
      supabase.auth.admin.getUserById(id),
      supabase.from("fitness_user_data").select("payload, updated_at_ms").eq("user_id", id).maybeSingle(),
      supabase
        .from("subscriptions")
        .select("entitlement, is_active, product_id, store, expires_at, raw")
        .eq("user_id", id)
        .maybeSingle(),
    ]);
    if (!authUser?.user) return { data: null, demo: false };

    const payload = (fitness?.payload as Record<string, unknown>) ?? {};
    const profile = (payload.onboardingProfile as Record<string, unknown>) ?? {};
    const status = subscriptionStatus(sub ?? null);

    return {
      data: {
        id,
        email: authUser.user.email ?? id,
        createdAt: authUser.user.created_at ?? null,
        goal: (profile.goal as string) ?? null,
        plan: planLabelFromProduct(sub?.product_id ?? null, Boolean(sub?.is_active)),
        status,
        lastSyncMs: fitness?.updated_at_ms ?? null,
        country: (profile.country as string) ?? null,
        payload,
        updatedAtMs: fitness?.updated_at_ms ?? 0,
        subscription: sub
          ? {
              entitlement: sub.entitlement ?? null,
              isActive: Boolean(sub.is_active),
              productId: sub.product_id ?? null,
              store: sub.store ?? null,
              expiresAt: sub.expires_at ?? null,
            }
          : null,
      },
      demo: false,
    };
  } catch {
    return { data: null, demo: true };
  }
}

async function fetchDashboard(): Promise<Demoable<DashboardData>> {
  const audit = await getAuditLog(5);
  if (!isSupabaseConfigured()) {
    return { data: { ...EMPTY_DASHBOARD, recentAudit: audit.data.slice(0, 4) }, demo: true };
  }
  try {
    const supabase = createAdminClient();
    const weekAgo = Date.now() - 7 * 86400000;

    const [
      users,
      totalUsers,
      { data: subs },
      { count: activeSubscriptions },
      jobCounts,
      { count: openFyReports },
      { count: openIssues },
    ] = await Promise.all([
      getCachedAuthUsers(),
      getAuthUserCount(),
      supabase.from("subscriptions").select("is_active, product_id, period_type:raw->event->>period_type"),
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      countJobStatuses(["ready", "queued", "generating", "failed"]),
      supabase
        .from("future_you_reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
      supabase.from("issue_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    ]);

    const newSignups7d = users.filter(
      (u) => u.created_at && new Date(u.created_at).getTime() > weekAgo,
    ).length;

    const signups = Array.from({ length: 12 }, () => 0);
    for (const u of users) {
      if (!u.created_at) continue;
      const weeksAgo = Math.floor((Date.now() - new Date(u.created_at).getTime()) / (7 * 86400000));
      if (weeksAgo >= 0 && weeksAgo < 12) signups[11 - weeksAgo] += 1;
    }

    return {
      data: {
        kpis: {
          totalUsers,
          activeSubscriptions: activeSubscriptions ?? 0,
          newSignups7d,
          openReports: (openFyReports ?? 0) + (openIssues ?? 0),
        },
        signups,
        jobBars: [
          { label: "Ready", count: jobCounts.ready ?? 0, color: "#3C7A4E" },
          { label: "Queued", count: jobCounts.queued ?? 0, color: "#CAA668" },
          { label: "Generating", count: jobCounts.generating ?? 0, color: "#3F6193" },
          { label: "Failed", count: jobCounts.failed ?? 0, color: "#A8493C" },
        ],
        conversion: computeConversionStats((subs ?? []) as SubRow[]),
        recentAudit: audit.data.slice(0, 4),
      },
      demo: false,
    };
  } catch {
    return { data: { ...EMPTY_DASHBOARD, recentAudit: audit.data.slice(0, 4) }, demo: true };
  }
}

/** Cached 60s — the whole dashboard aggregate, so warm loads skip Supabase entirely. */
export const getDashboard = unstable_cache(fetchDashboard, ["admin-dashboard"], {
  revalidate: 60,
  tags: [ADMIN_CACHE_TAG],
});

const FY_DURATION = (created: string | null, updated: string | null, status: string): string => {
  if (status !== "ready" || !created || !updated) return "—";
  const ms = new Date(updated).getTime() - new Date(created).getTime();
  if (ms <= 0) return "—";
  return `${Math.round(ms / 1000)}s`;
};

async function fetchFutureYou(): Promise<Demoable<{ jobs: FutureYouJob[]; reports: FutureYouReport[] }>> {
  if (!isSupabaseConfigured()) return { data: { jobs: [], reports: [] }, demo: true };
  try {
    const supabase = createAdminClient();
    const [emails, { data: jobsRaw }, { data: reportsRaw }] = await Promise.all([
      emailMapFromCache(),
      supabase
        .from("future_you_jobs")
        .select(
          "id, user_id, status, motivation_id, source_photo_path, result_photo_path, error, revised_prompt, created_at, updated_at",
        )
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("future_you_reports")
        .select("id, user_id, job_id, category, context, message, created_at, linear_issue_url, status")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    const jobs: FutureYouJob[] = (jobsRaw ?? []).map((j) => ({
      id: j.id,
      userId: j.user_id,
      userEmail: emails.get(j.user_id) ?? j.user_id,
      motivationId: j.motivation_id,
      status: j.status,
      durationLabel: FY_DURATION(j.created_at, j.updated_at, j.status),
      createdAt: j.created_at,
      error: j.error,
      sourcePhotoPath: j.source_photo_path,
      resultPhotoPath: j.result_photo_path,
      revisedPrompt: j.revised_prompt,
    }));

    const reportJobIds = Array.from(new Set((reportsRaw ?? []).map((r) => r.job_id).filter(Boolean))) as string[];
    const jobPaths = new Map<string, { source: string | null; result: string | null }>();
    if (reportJobIds.length) {
      const { data: relJobs } = await supabase
        .from("future_you_jobs")
        .select("id, source_photo_path, result_photo_path")
        .in("id", reportJobIds);
      for (const j of relJobs ?? []) jobPaths.set(j.id, { source: j.source_photo_path, result: j.result_photo_path });
    }

    const signedByPath = await signFutureYouPaths(
      Array.from(
        new Set(
          (reportsRaw ?? [])
            .flatMap((r) => {
              const paths = r.job_id ? jobPaths.get(r.job_id) : undefined;
              return [paths?.source, paths?.result].filter(Boolean) as string[];
            }),
        ),
      ),
    );

    const reports: FutureYouReport[] = (reportsRaw ?? []).map((r) => {
      const paths = r.job_id ? jobPaths.get(r.job_id) : undefined;
      return {
        id: r.id,
        userId: r.user_id,
        userEmail: emails.get(r.user_id) ?? r.user_id,
        jobId: r.job_id,
        category: r.category,
        context: r.context,
        message: r.message,
        status: r.status ?? "open",
        createdAt: r.created_at,
        sourceUrl: paths?.source ? (signedByPath.get(paths.source) ?? null) : null,
        resultUrl: paths?.result ? (signedByPath.get(paths.result) ?? null) : null,
        linearUrl: r.linear_issue_url,
      };
    });

    return { data: { jobs, reports }, demo: false };
  } catch {
    return { data: { jobs: [], reports: [] }, demo: true };
  }
}

/** Cached 60s — the Future You jobs + reports read path (incl. signed URLs) runs once per window. */
export const getFutureYou = unstable_cache(fetchFutureYou, ["admin-future-you"], {
  revalidate: 60,
  tags: [ADMIN_CACHE_TAG],
});

export async function signFutureYouPath(path: string | null, expiresIn = 3600): Promise<string | null> {
  if (!path || !isSupabaseConfigured()) return null;
  const map = await signFutureYouPaths([path], expiresIn);
  return map.get(path) ?? null;
}

async function signFutureYouPaths(paths: string[], expiresIn = 3600): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (!paths.length || !isSupabaseConfigured()) return out;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage.from("future-you").createSignedUrls(paths, expiresIn);
    if (error || !data) return out;
    for (const item of data) {
      if (item.path && item.signedUrl) out.set(item.path, item.signedUrl);
    }
  } catch {
    // ignore — thumbnails stay empty
  }
  return out;
}

export async function getUserLatestFutureYou(
  userId: string,
): Promise<{
  motivationId: string;
  status: string;
  revisedPrompt: string | null;
  sourceUrl: string | null;
  resultUrl: string | null;
  jobId: string;
} | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("future_you_jobs")
      .select("id, motivation_id, status, revised_prompt, source_photo_path, result_photo_path")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    const [sourceUrl, resultUrl] = await Promise.all([
      signFutureYouPath(data.source_photo_path),
      signFutureYouPath(data.result_photo_path),
    ]);
    return {
      jobId: data.id,
      motivationId: data.motivation_id,
      status: data.status,
      revisedPrompt: data.revised_prompt,
      sourceUrl,
      resultUrl,
    };
  } catch {
    return null;
  }
}

export async function getFoods(): Promise<Demoable<CommunityFood[]>> {
  if (!isSupabaseConfigured()) return { data: [], demo: true };
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("community_foods")
      .select("barcode, name, brand, serving_label, cal, protein, carbs, fat, submitted_by, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return {
      data: (data ?? []).map((f) => ({
        barcode: f.barcode,
        name: f.name,
        brand: f.brand,
        servingLabel: f.serving_label,
        cal: f.cal,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        submittedBy: f.submitted_by,
        createdAt: f.created_at,
      })),
      demo: false,
    };
  } catch {
    return { data: [], demo: true };
  }
}

export async function getIssues(): Promise<Demoable<IssueReport[]>> {
  if (!isSupabaseConfigured()) return { data: [], demo: true };
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("issue_reports")
      .select(
        "id, user_id, category, message, platform, app_version, device_model, linear_issue_id, linear_issue_url, created_at, status",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return {
      data: (data ?? []).map((i) => ({
        id: i.id,
        userId: i.user_id,
        category: i.category,
        message: i.message,
        platform: i.platform,
        appVersion: i.app_version,
        deviceModel: i.device_model,
        status: i.status ?? (i.linear_issue_id ? "triaged" : "open"),
        linearId: i.linear_issue_id,
        linearUrl: i.linear_issue_url,
        createdAt: i.created_at,
      })),
      demo: false,
    };
  } catch {
    return { data: [], demo: true };
  }
}

/** Active subscription rows for integration pages (plan mix, etc.). */
export async function getSubscriptionRows(): Promise<SubRow[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("subscriptions").select("user_id, is_active, product_id");
    return (data ?? []) as SubRow[];
  } catch {
    return [];
  }
}

async function fetchNavBadges(): Promise<{ users: string; futureYou: string; issues: string }> {
  if (!isSupabaseConfigured()) return { users: "0", futureYou: "0", issues: "0" };
  try {
    const supabase = createAdminClient();
    const [{ count: activeJobs }, { count: openIssues }, totalUsers] = await Promise.all([
      supabase
        .from("future_you_jobs")
        .select("id", { count: "exact", head: true })
        .in("status", ["queued", "generating"]),
      supabase.from("issue_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
      getAuthUserCount(),
    ]);
    const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
    return { users: fmt(totalUsers), futureYou: String(activeJobs ?? 0), issues: String(openIssues ?? 0) };
  } catch {
    return { users: "—", futureYou: "—", issues: "—" };
  }
}

/** Cached 60s — rendered in the layout on every page navigation. */
export const getNavBadges = unstable_cache(fetchNavBadges, ["admin-nav-badges"], {
  revalidate: 60,
  tags: [ADMIN_CACHE_TAG],
});
