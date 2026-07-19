#!/usr/bin/env node
/**
 * Delete all Supabase auth users except a whitelist (by email and/or user id).
 *
 * Usage:
 *   node scripts/purgeUsersExcept.mjs --keep=you@example.com,dad@example.com
 *   node scripts/purgeUsersExcept.mjs --keep=you@example.com --confirm
 *   node scripts/purgeUsersExcept.mjs --all --confirm
 *
 * Options:
 *   --keep=email1,email2   Comma-separated emails to preserve
 *   --keep-id=uuid,uuid     Comma-separated user ids to preserve (optional)
 *   --all                   Delete every user (no whitelist)
 *   --confirm               Actually delete (default is dry-run only)
 *
 * Requires: linked Supabase project, `.env` with VITE_SUPABASE_URL, Supabase CLI logged in.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const FUTURE_YOU_BUCKET = "future-you";

function parseArgs(argv) {
  let keepEmails = [];
  let keepIds = [];
  let confirm = false;
  let deleteAll = false;

  for (const arg of argv) {
    if (arg === "--confirm") {
      confirm = true;
      continue;
    }
    if (arg === "--all") {
      deleteAll = true;
      continue;
    }
    if (arg.startsWith("--keep=")) {
      keepEmails = arg
        .slice("--keep=".length)
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      continue;
    }
    if (arg.startsWith("--keep-id=")) {
      keepIds = arg
        .slice("--keep-id=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { keepEmails, keepIds, confirm, deleteAll };
}

function loadEnv() {
  const envPath = path.join(root, ".env");
  const out = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    out[trimmed.slice(0, i)] = trimmed.slice(i + 1);
  }
  return out;
}

function getServiceRoleKey(projectRef) {
  const raw = execSync(`supabase projects api-keys --project-ref ${projectRef} -o json`, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const keys = JSON.parse(raw);
  const row = keys.find((k) => k.name === "service_role");
  if (!row?.api_key) throw new Error("Could not find service_role key from supabase CLI");
  return row.api_key;
}

function adminHeaders(serviceRole) {
  return {
    apikey: serviceRole,
    Authorization: `Bearer ${serviceRole}`,
    "Content-Type": "application/json",
  };
}

async function listAllUsers(supabaseUrl, serviceRole) {
  const users = [];
  const perPage = 1000;
  let page = 1;

  while (true) {
    const res = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?per_page=${perPage}&page=${page}`,
      { headers: adminHeaders(serviceRole) },
    );
    if (!res.ok) {
      throw new Error(`List users failed (${res.status}): ${await res.text()}`);
    }
    const body = await res.json();
    const batch = body.users ?? [];
    users.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  return users;
}

async function listObjectsUnderPrefix(supabaseUrl, serviceRole, prefix) {
  const paths = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/list/${FUTURE_YOU_BUCKET}`, {
      method: "POST",
      headers: adminHeaders(serviceRole),
      body: JSON.stringify({ prefix, limit, offset }),
    });
    if (!res.ok) {
      throw new Error(`Storage list failed (${res.status}): ${await res.text()}`);
    }
    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) break;
    for (const item of items) {
      if (item?.name) paths.push(`${prefix}${item.name}`);
    }
    if (items.length < limit) break;
    offset += limit;
  }

  return paths;
}

async function collectFutureYouStoragePaths(supabaseUrl, serviceRole, userId) {
  const paths = new Set();
  const prefix = `users/${userId}/`;

  for (const subfolder of ["source", "result", "preview"]) {
    const listed = await listObjectsUnderPrefix(supabaseUrl, serviceRole, `${prefix}${subfolder}/`);
    for (const p of listed) paths.add(p);
  }

  const jobsRes = await fetch(
    `${supabaseUrl}/rest/v1/future_you_jobs?user_id=eq.${userId}&select=source_photo_path,result_photo_path`,
    { headers: { ...adminHeaders(serviceRole), Prefer: "return=minimal" } },
  );
  if (!jobsRes.ok) {
    throw new Error(`Job lookup failed (${jobsRes.status}): ${await jobsRes.text()}`);
  }
  const jobs = await jobsRes.json();
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

async function removeStoragePaths(supabaseUrl, serviceRole, paths) {
  if (paths.length === 0) return 0;

  const batchSize = 50;
  let removed = 0;
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    const res = await fetch(`${supabaseUrl}/storage/v1/object/${FUTURE_YOU_BUCKET}`, {
      method: "DELETE",
      headers: adminHeaders(serviceRole),
      body: JSON.stringify({ prefixes: batch }),
    });
    if (!res.ok) {
      throw new Error(`Storage remove failed (${res.status}): ${await res.text()}`);
    }
    removed += batch.length;
  }
  return removed;
}

async function purgeFutureYou(supabaseUrl, serviceRole, userId) {
  const paths = await collectFutureYouStoragePaths(supabaseUrl, serviceRole, userId);
  const removedObjects = await removeStoragePaths(supabaseUrl, serviceRole, paths);

  for (const table of ["future_you_jobs", "future_you_reports"]) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?user_id=eq.${userId}`, {
      method: "DELETE",
      headers: { ...adminHeaders(serviceRole), Prefer: "return=minimal" },
    });
    if (!res.ok) {
      throw new Error(`${table} delete failed (${res.status}): ${await res.text()}`);
    }
  }

  return { removedObjects };
}

async function deleteFitnessData(supabaseUrl, serviceRole, userId) {
  const communityRes = await fetch(
    `${supabaseUrl}/rest/v1/community_foods?submitted_by=eq.${userId}`,
    {
      method: "PATCH",
      headers: { ...adminHeaders(serviceRole), Prefer: "return=minimal" },
      body: JSON.stringify({ submitted_by: null }),
    },
  );
  if (!communityRes.ok) {
    throw new Error(
      `community_foods unlink failed (${communityRes.status}): ${await communityRes.text()}`,
    );
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/fitness_user_data?user_id=eq.${userId}`, {
    method: "DELETE",
    headers: { ...adminHeaders(serviceRole), Prefer: "return=minimal" },
  });
  if (!res.ok) {
    throw new Error(`fitness_user_data delete failed (${res.status}): ${await res.text()}`);
  }
}

async function deleteAuthUser(supabaseUrl, serviceRole, userId) {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: adminHeaders(serviceRole),
  });
  if (!res.ok) {
    throw new Error(`auth delete failed (${res.status}): ${await res.text()}`);
  }
}

function shouldKeep(user, keepEmails, keepIds) {
  const email = (user.email ?? "").trim().toLowerCase();
  if (email && keepEmails.includes(email)) return true;
  if (keepIds.includes(user.id)) return true;
  return false;
}

async function main() {
  const { keepEmails, keepIds, confirm, deleteAll } = parseArgs(process.argv.slice(2));
  if (!deleteAll && keepEmails.length === 0 && keepIds.length === 0) {
    throw new Error(
      "Pass --all to delete everyone, or --keep=you@example.com,dad@example.com to preserve accounts",
    );
  }

  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
  if (!supabaseUrl) throw new Error("Missing VITE_SUPABASE_URL in .env");

  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  const serviceRole = getServiceRoleKey(projectRef);

  const users = await listAllUsers(supabaseUrl, serviceRole);
  const kept = deleteAll ? [] : users.filter((u) => shouldKeep(u, keepEmails, keepIds));
  const toDelete = deleteAll ? users : users.filter((u) => !shouldKeep(u, keepEmails, keepIds));

  console.log(`Found ${users.length} users.`);
  console.log(`Keeping ${kept.length}:`);
  for (const user of kept) {
    console.log(`  ✓ ${user.email ?? "(no email)"}  ${user.id}`);
  }
  console.log(`\nWould delete ${toDelete.length}:`);
  for (const user of toDelete) {
    const created = user.created_at ? new Date(user.created_at).toISOString().slice(0, 10) : "?";
    console.log(`  ✗ ${user.email ?? "(no email)"}  ${user.id}  created ${created}`);
  }

  if (!confirm) {
    console.log("\nDry run only. Re-run with --confirm to delete the users listed above.");
    return;
  }

  if (toDelete.length === 0) {
    console.log("\nNothing to delete.");
    return;
  }

  console.log("\nDeleting…");
  const failures = [];

  for (const user of toDelete) {
    const label = `${user.email ?? user.id}`;
    try {
      const purged = await purgeFutureYou(supabaseUrl, serviceRole, user.id);
      await deleteFitnessData(supabaseUrl, serviceRole, user.id);
      await deleteAuthUser(supabaseUrl, serviceRole, user.id);
      console.log(`  deleted ${label} (Future You objects: ${purged.removedObjects})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ label, message });
      console.error(`  FAILED ${label}: ${message}`);
    }
  }

  console.log(`\nDone. Deleted ${toDelete.length - failures.length}/${toDelete.length}.`);
  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
