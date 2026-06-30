import "server-only";

import { createAdminClient } from "./supabase-admin";
import { isSupabaseConfigured } from "./env";
import { getAdminSessionEmail } from "./auth";
import type { AuditEntry } from "./types";

export type AuditAction = "edit" | "override" | "resolve" | "delete" | "impersonate" | "config";

export type AuditInput = {
  action: AuditAction;
  targetType: string;
  targetId: string;
  detail?: string;
  before?: unknown;
  after?: unknown;
};

export async function logAudit(input: AuditInput): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = createAdminClient();
    const adminEmail = (await getAdminSessionEmail()) ?? "unknown";
    await supabase.from("admin_audit_log").insert({
      admin_email: adminEmail,
      action: input.action,
      target_type: input.targetType,
      target_id: input.targetId,
      detail: input.detail ?? null,
      before: input.before ?? null,
      after: input.after ?? null,
    });
  } catch {
    // audit logging must not break the underlying action
  }
}

const ACTION_ICON: Record<string, string> = {
  edit: "ph ph-pencil-simple",
  override: "ph ph-crown-simple",
  resolve: "ph ph-flag-checkered",
  delete: "ph ph-trash",
  impersonate: "ph ph-user-circle-gear",
  config: "ph ph-plugs-connected",
};

export function auditIcon(action: string): string {
  return ACTION_ICON[action] ?? "ph ph-dot";
}

export async function getAuditLog(limit = 100): Promise<{ data: AuditEntry[]; demo: boolean }> {
  if (!isSupabaseConfigured()) return { data: [], demo: true };
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("admin_audit_log")
      .select("id, admin_email, action, target_type, target_id, detail, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return {
      data: (data ?? []).map((r) => ({
        id: String(r.id),
        action: r.action,
        adminEmail: r.admin_email,
        targetType: r.target_type,
        targetId: r.target_id,
        detail: r.detail,
        createdAt: r.created_at,
      })),
      demo: false,
    };
  } catch {
    return { data: [], demo: true };
  }
}
