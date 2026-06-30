import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getAdminAllowlist, getAnonKey, getSupabaseUrl, isAuthConfigured, isDevAuthBypass } from "./env";

/** Email shown for the signed-in admin in dev when auth is not configured. */
export const DEV_ADMIN = { email: "owner@newyouai.app", name: "Owner (dev)", role: "owner · dev mode" };

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(getSupabaseUrl(), getAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component — middleware refreshes session cookies.
        }
      },
    },
  });
}

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allow = getAdminAllowlist();
  if (allow.length === 0) return isDevAuthBypass();
  return allow.includes(email.toLowerCase());
}

export async function getAdminSessionEmail(): Promise<string | null> {
  if (!isAuthConfigured()) return DEV_ADMIN.email;
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.email ?? null;
  } catch {
    return null;
  }
}

export type AdminSession = { email: string; name: string; role: string };

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isAuthConfigured()) {
    return { email: DEV_ADMIN.email, name: DEV_ADMIN.name, role: DEV_ADMIN.role };
  }
  const email = await getAdminSessionEmail();
  if (email && isAllowedEmail(email)) {
    return { email, name: email.split("@")[0], role: "owner · allowlisted" };
  }
  if (isDevAuthBypass()) {
    return { email: DEV_ADMIN.email, name: DEV_ADMIN.name, role: DEV_ADMIN.role };
  }
  return null;
}
