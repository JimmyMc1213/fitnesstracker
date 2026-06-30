"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "../../lib/supabase-admin";
import { isSupabaseConfigured } from "../../lib/env";
import { logAudit } from "../../lib/audit";
import { isProviderConnected } from "../../lib/integrations/store";
import type { ProviderId } from "../../lib/integrations/types";

export type ActionResult = { ok: boolean; message: string; data?: Record<string, unknown> };

const PWA_URL = process.env.NEXT_PUBLIC_PWA_URL ?? "https://app.newyouai.app";

function notConfigured(): ActionResult {
  return {
    ok: false,
    message: "Supabase not configured — set SUPABASE_SERVICE_ROLE_KEY in root .env or apps/admin/.env.local.",
  };
}

/** Save a user's full JSONB payload, bumping updated_at_ms so the server wins on next device sync. */
export async function saveUserPayload(userId: string, payloadText: string): Promise<ActionResult> {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(payloadText);
  } catch {
    return { ok: false, message: "Invalid JSON — fix syntax and try again." };
  }
  if (!isSupabaseConfigured()) return notConfigured();
  try {
    const supabase = createAdminClient();
    const { data: before } = await supabase.from("fitness_user_data").select("payload").eq("user_id", userId).maybeSingle();
    const updatedAtMs = Date.now();
    const { error } = await supabase
      .from("fitness_user_data")
      .upsert({ user_id: userId, payload: parsed, updated_at_ms: updatedAtMs }, { onConflict: "user_id" });
    if (error) throw error;
    await logAudit({ action: "edit", targetType: "user", targetId: userId, detail: "raw JSON payload · updated_at_ms bumped", before: before?.payload, after: parsed });
    revalidatePath(`/users/${userId}`);
    return { ok: true, message: "Payload saved · updated_at_ms bumped" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Save failed." };
  }
}

export async function overrideSubscription(userId: string, plan: "free" | "monthly" | "annual"): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return notConfigured();
  try {
    const supabase = createAdminClient();
    const { data: before } = await supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();
    const isActive = plan !== "free";
    const productId = plan === "annual" ? "newyou_annual" : plan === "monthly" ? "newyou_monthly" : null;
    const { error } = await supabase
      .from("subscriptions")
      .upsert({ user_id: userId, entitlement: "pro", is_active: isActive, product_id: productId, store: "admin_override", updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) throw error;
    await logAudit({ action: "override", targetType: "user", targetId: userId, detail: `tier → ${plan} · server wins`, before, after: { plan, isActive } });
    revalidatePath(`/users/${userId}`);
    return { ok: true, message: `Subscription overridden → ${plan}` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Override failed." };
  }
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return notConfigured();
  try {
    const supabase = createAdminClient();
    await supabase.from("fitness_user_data").delete().eq("user_id", userId);
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
    await logAudit({ action: "delete", targetType: "user", targetId: userId, detail: "account + fitness_user_data deleted" });
    revalidatePath("/users");
    return { ok: true, message: "User deleted" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Delete failed." };
  }
}

export async function impersonateUser(userId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return notConfigured();
  try {
    const supabase = createAdminClient();
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const email = userData?.user?.email;
    if (!email) return { ok: false, message: "User has no email to generate a link for." };
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: PWA_URL },
    });
    if (error) throw error;
    await logAudit({ action: "impersonate", targetType: "user", targetId: userId, detail: `generateLink → ${PWA_URL}` });
    return { ok: true, message: "Login link generated", data: { url: data.properties?.action_link ?? PWA_URL } };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not generate link." };
  }
}

export async function moderateReport(reportId: string, resolution: "resolved" | "dismissed"): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return notConfigured();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("future_you_reports")
      .update({ status: resolution, resolved_at: new Date().toISOString() })
      .eq("id", reportId);
    if (error) throw error;
    await logAudit({ action: "resolve", targetType: "future_you_report", targetId: reportId, detail: `resolution: ${resolution}` });
    revalidatePath("/future-you");
    return { ok: true, message: `Report ${resolution}` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

export async function deleteReport(reportId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return notConfigured();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("future_you_reports").delete().eq("id", reportId);
    if (error) throw error;
    await logAudit({ action: "delete", targetType: "future_you_report", targetId: reportId, detail: "report deleted" });
    revalidatePath("/future-you");
    return { ok: true, message: "Report deleted" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Delete failed." };
  }
}

export async function updateFood(
  barcode: string,
  fields: { name: string; brand: string; cal: number; protein: number; carbs: number; fat: number },
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return notConfigured();
  try {
    const supabase = createAdminClient();
    const { data: before } = await supabase.from("community_foods").select("*").eq("barcode", barcode).maybeSingle();
    const { error } = await supabase
      .from("community_foods")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("barcode", barcode);
    if (error) throw error;
    await logAudit({ action: "edit", targetType: "community_food", targetId: barcode, detail: "food edited", before, after: fields });
    revalidatePath("/community-foods");
    return { ok: true, message: "Food updated" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Update failed." };
  }
}

export async function deleteFoods(barcodes: string[]): Promise<ActionResult> {
  if (barcodes.length === 0) return { ok: false, message: "Nothing selected." };
  if (!isSupabaseConfigured()) return notConfigured();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("community_foods").delete().in("barcode", barcodes);
    if (error) throw error;
    await logAudit({ action: "delete", targetType: "community_food", targetId: barcodes.join(","), detail: `deleted ${barcodes.length} food(s)` });
    revalidatePath("/community-foods");
    return { ok: true, message: `Deleted ${barcodes.length} food(s)` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Delete failed." };
  }
}

export async function resolveIssue(issueId: string, status: "resolved" | "open"): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return notConfigured();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("issue_reports")
      .update({ status, resolved_at: status === "resolved" ? new Date().toISOString() : null })
      .eq("id", issueId);
    if (error) throw error;
    await logAudit({ action: "resolve", targetType: "issue_report", targetId: issueId, detail: `status: ${status}` });
    revalidatePath("/issues");
    return { ok: true, message: `Issue ${status}` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

export async function saveIntegration(
  provider: ProviderId,
  credentials: Record<string, string>,
  enabled: boolean,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return notConfigured();
  try {
    const supabase = createAdminClient();
    // Merge: only overwrite credential fields that were provided (non-empty).
    const { data: existing } = await supabase.from("admin_integrations").select("credentials").eq("provider", provider).maybeSingle();
    const merged = { ...((existing?.credentials as Record<string, string>) ?? {}) };
    for (const [k, v] of Object.entries(credentials)) {
      if (v && v.trim()) merged[k] = v.trim();
    }
    const { error } = await supabase
      .from("admin_integrations")
      .upsert({ provider, credentials: merged, enabled, updated_at: new Date().toISOString() }, { onConflict: "provider" });
    if (error) throw error;
    await logAudit({ action: "config", targetType: "integration", targetId: provider, detail: enabled ? "credentials saved · enabled" : "credentials saved · disabled" });
    revalidatePath("/integrations");
    return { ok: true, message: "Integration saved" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Save failed." };
  }
}

export async function testIntegration(provider: ProviderId): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Configure Supabase to store + test credentials." };
  try {
    const connected = await isProviderConnected(provider);
    return connected
      ? { ok: true, message: `${provider} connection OK` }
      : { ok: false, message: "Not connected — add all credential fields and enable." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Test failed." };
  }
}

export async function toggleIntegration(provider: ProviderId, enabled: boolean): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return notConfigured();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("admin_integrations")
      .upsert({ provider, enabled, updated_at: new Date().toISOString() }, { onConflict: "provider" });
    if (error) throw error;
    await logAudit({ action: "config", targetType: "integration", targetId: provider, detail: enabled ? "enabled" : "disabled" });
    revalidatePath("/integrations");
    return { ok: true, message: enabled ? "Provider enabled" : "Provider disabled" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Toggle failed." };
  }
}
