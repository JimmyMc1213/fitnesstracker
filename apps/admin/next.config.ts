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
    NEXT_PUBLIC_ADMIN_SITE_URL:
      process.env.NEXT_PUBLIC_ADMIN_SITE_URL?.trim() || "https://admin.newyouai.app",
  };
}

if (process.env.VERCEL_ENV === "production" && !process.env.ADMIN_ALLOWED_EMAILS?.trim()) {
  throw new Error(
    "ADMIN_ALLOWED_EMAILS must be set for production admin deploys (admin.newyouai.app).",
  );
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  transpilePackages: ["@newyouai/config"],
  env: syncAdminEnv(),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
