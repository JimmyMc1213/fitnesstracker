import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

import { FUTURE_YOU_BUCKET, futureYouUserPrefix } from "./paths.ts";

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
      console.error("purgeUserFutureYou: storage list failed", { folderPath, error });
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

  for (const subfolder of ["source", "result", "preview"]) {
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
    console.error("purgeUserFutureYou: job path lookup failed", error);
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
      console.error("purgeUserFutureYou: storage remove failed", { batch, error });
      throw new Error("Could not delete Future You photos.");
    }
  }
}

/** Removes Future You storage objects, job rows, and report rows for a user. */
export async function purgeUserFutureYou(
  adminClient: SupabaseClient,
  userId: string,
): Promise<{ removedObjects: number }> {
  const storagePaths = await collectFutureYouStoragePaths(adminClient, userId);
  await removeStoragePaths(adminClient, storagePaths);

  const { error: jobsError } = await adminClient.from("future_you_jobs").delete().eq("user_id", userId);
  if (jobsError) {
    console.error("purgeUserFutureYou: jobs delete failed", jobsError);
    throw new Error("Could not delete Future You jobs.");
  }

  const { error: reportsError } = await adminClient
    .from("future_you_reports")
    .delete()
    .eq("user_id", userId);
  if (reportsError) {
    console.error("purgeUserFutureYou: reports delete failed", reportsError);
    throw new Error("Could not delete Future You reports.");
  }

  return { removedObjects: storagePaths.length };
}
