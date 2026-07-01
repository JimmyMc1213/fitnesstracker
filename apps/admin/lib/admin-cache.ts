import "server-only";

import { unstable_cache } from "next/cache";

import { createAdminClient } from "./supabase-admin";

export const ADMIN_CACHE_TAG = "admin-data";
const REVALIDATE_SECONDS = 60;

export type CachedAuthUser = { id: string; email: string | null; created_at: string | null };

async function fetchAuthUsers(): Promise<CachedAuthUser[]> {
  const supabase = createAdminClient();
  const users: CachedAuthUser[] = [];
  let page = 1;
  const perPage = 200;
  while (users.length < 1000) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) break;
    users.push(
      ...data.users.map((u) => ({
        id: u.id,
        email: u.email ?? null,
        created_at: u.created_at ?? null,
      })),
    );
    if (data.users.length < perPage) break;
    page += 1;
  }
  return users;
}

/** Auth user list — expensive; cached 60s and shared across dashboard, users, nav. */
export const getCachedAuthUsers = unstable_cache(fetchAuthUsers, ["admin-auth-users"], {
  revalidate: REVALIDATE_SECONDS,
  tags: [ADMIN_CACHE_TAG],
});

async function fetchEmailEntries(): Promise<[string, string][]> {
  const users = await getCachedAuthUsers();
  return users.map((u) => [u.id, u.email ?? u.id] as [string, string]);
}

export const getCachedEmailMap = unstable_cache(fetchEmailEntries, ["admin-email-map"], {
  revalidate: REVALIDATE_SECONDS,
  tags: [ADMIN_CACHE_TAG],
});

export async function emailMapFromCache(): Promise<Map<string, string>> {
  const entries = await getCachedEmailMap();
  return new Map(entries);
}

/** Head count when available; falls back to cached list length. */
async function fetchAuthUserCount(): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (!error && data && "total" in data && typeof data.total === "number") {
      return data.total;
    }
  } catch {
    // fall through
  }
  return (await getCachedAuthUsers()).length;
}

/** Cached 60s — called on every navigation (nav badges) and on the dashboard. */
export const getAuthUserCount = unstable_cache(fetchAuthUserCount, ["admin-auth-count"], {
  revalidate: REVALIDATE_SECONDS,
  tags: [ADMIN_CACHE_TAG],
});
