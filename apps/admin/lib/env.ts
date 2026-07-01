import fs from "node:fs";
import path from "node:path";

const fileEnv: Record<string, string> = {};
let loaded = false;

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    fileEnv[key] = value;
  }
}

function ensureServerEnv(): void {
  if (loaded) return;
  loaded = true;
  const adminDir = process.cwd();
  const repoRoot = path.join(adminDir, "../..");
  loadEnvFile(path.join(repoRoot, ".env"));
  loadEnvFile(path.join(adminDir, ".env.local"));
}

function env(key: string): string | undefined {
  ensureServerEnv();
  return process.env[key] ?? fileEnv[key];
}

/** Whether the admin app has the Supabase service-role credentials needed to read real data. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    (env("NEXT_PUBLIC_SUPABASE_URL") ?? env("VITE_SUPABASE_URL")) &&
      env("SUPABASE_SERVICE_ROLE_KEY"),
  );
}

export function isAuthConfigured(): boolean {
  return Boolean(
    (env("NEXT_PUBLIC_SUPABASE_URL") ?? env("VITE_SUPABASE_URL")) &&
      (env("NEXT_PUBLIC_SUPABASE_ANON_KEY") ??
        env("VITE_SUPABASE_ANON_KEY") ??
        env("VITE_SUPABASE_PUBLISHABLE_KEY")),
  );
}

export function getSupabaseUrl(): string {
  const url = env("NEXT_PUBLIC_SUPABASE_URL") ?? env("VITE_SUPABASE_URL");
  if (!url) throw new Error("Missing Supabase URL (NEXT_PUBLIC_SUPABASE_URL or VITE_SUPABASE_URL)");
  return url;
}

export function getAnonKey(): string {
  const key =
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY") ??
    env("VITE_SUPABASE_ANON_KEY") ??
    env("VITE_SUPABASE_PUBLISHABLE_KEY");
  if (!key) throw new Error("Missing Supabase anon key");
  return key;
}

export function getServiceRoleKey(): string {
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return key;
}

export function getAdminAllowlist(): string[] {
  return (env("ADMIN_ALLOWED_EMAILS") ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Local dev without ADMIN_ALLOWED_EMAILS — skip auth gate (not for production). */
export function isDevAuthBypass(): boolean {
  return getAdminAllowlist().length === 0 && env("VERCEL_ENV") !== "production";
}
