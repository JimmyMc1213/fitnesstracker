"use server";

import { redirect } from "next/navigation";

import { getAdminAllowlist } from "@/lib/supabase-admin";
import { createServerSupabase } from "@/lib/supabase-server";

export async function signInAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  // Reject non-staff before hitting auth so unlisted accounts can't sign in.
  const allowlist = getAdminAllowlist();
  if (allowlist.length > 0 && !allowlist.includes(email)) {
    redirect("/login?error=forbidden");
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/login?error=invalid");
  }

  redirect("/");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
