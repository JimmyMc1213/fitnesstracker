import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Load monorepo root .env (VITE_*) then apps/admin/.env.local overrides.
const repoRoot = path.join(__dirname, "../..");
loadEnvConfig(repoRoot);
loadEnvConfig(__dirname);

/** Map PWA/mobile Supabase vars to Next.js admin names when dedicated vars are unset. */
function syncAdminEnv(): Record<string, string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    "";
  if (url) process.env.NEXT_PUBLIC_SUPABASE_URL = url;
  if (anon) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anon;
  return {
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
  };
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  transpilePackages: ["@newyouai/config"],
  env: syncAdminEnv(),
};

export default nextConfig;
