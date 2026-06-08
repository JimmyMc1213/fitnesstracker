import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

import {
  FUTURE_YOU_BUCKET,
  futureYouUserPrefix,
} from "../_shared/future-you/paths.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AuthContext = {
  userId: string;
  adminClient: SupabaseClient;
};

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function resolveAuthenticatedContext(req: Request): Promise<AuthContext | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("future-you-delete: missing Supabase env");
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

async function listObjectsUnderFolder(
  adminClient: SupabaseClient,
  folderPath: string,
): Promise<string[]> {
  const paths: string[] = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const { data, error } = await adminClient.storage.from(FUTURE_YOU_BUCKET).list(folderPath, {
      limit,
      offset,
    });

    if (error) {
      console.error("future-you-delete: storage list failed", { folderPath, error });
      throw new Error("Could not list Future You files.");
    }

    if (!data?.length) break;

    for (const item of data) {
      if (item.name) {
        paths.push(`${folderPath}/${item.name}`);
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return paths;
}

async function collectFutureYouStoragePaths(
  adminClient: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const paths = new Set<string>();
  const prefix = futureYouUserPrefix(userId);

  for (const subfolder of ["source", "result"]) {
    const folderPath = `${prefix}${subfolder}`;
    const listed = await listObjectsUnderFolder(adminClient, folderPath);
    for (const path of listed) {
      paths.add(path);
    }
  }

  const { data: jobs, error } = await adminClient
    .from("future_you_jobs")
    .select("source_photo_path, result_photo_path")
    .eq("user_id", userId);

  if (error) {
    console.error("future-you-delete: job path lookup failed", error);
    throw new Error("Could not load Future You jobs.");
  }

  for (const job of jobs ?? []) {
    if (typeof job.source_photo_path === "string" && job.source_photo_path.trim()) {
      paths.add(job.source_photo_path.trim());
    }
    if (typeof job.result_photo_path === "string" && job.result_photo_path.trim()) {
      paths.add(job.result_photo_path.trim());
    }
  }

  return [...paths];
}

async function removeStoragePaths(adminClient: SupabaseClient, paths: string[]) {
  if (paths.length === 0) return;

  const batchSize = 50;
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    const { error } = await adminClient.storage.from(FUTURE_YOU_BUCKET).remove(batch);
    if (error) {
      console.error("future-you-delete: storage remove failed", { batch, error });
      throw new Error("Could not delete Future You photos.");
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonError("Method not allowed", 405);
  }

  try {
    const auth = await resolveAuthenticatedContext(req);
    if (!auth) {
      return jsonError("Unauthorized", 401);
    }

    const storagePaths = await collectFutureYouStoragePaths(auth.adminClient, auth.userId);
    await removeStoragePaths(auth.adminClient, storagePaths);

    const { error: jobsError } = await auth.adminClient
      .from("future_you_jobs")
      .delete()
      .eq("user_id", auth.userId);

    if (jobsError) {
      console.error("future-you-delete: jobs delete failed", jobsError);
      return jsonError("Could not delete Future You. Try again.", 500);
    }

    const { error: reportsError } = await auth.adminClient
      .from("future_you_reports")
      .delete()
      .eq("user_id", auth.userId);

    if (reportsError) {
      console.error("future-you-delete: reports delete failed", reportsError);
      return jsonError("Could not delete Future You. Try again.", 500);
    }

    console.info("future-you-delete: completed", {
      userId: auth.userId,
      removedObjects: storagePaths.length,
    });

    return new Response(JSON.stringify({ ok: true, removedObjects: storagePaths.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("future-you-delete error", e);
    return jsonError("Could not delete Future You. Try again.", 500);
  }
});
