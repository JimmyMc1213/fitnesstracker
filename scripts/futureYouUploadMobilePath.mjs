#!/usr/bin/env node
/**
 * Smoke test for the mobile upload path: JPEG file → base64 data URL → future-you-upload invoke.
 * Run from project root: node scripts/futureYouUploadMobilePath.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv() {
  const out = {};
  for (const file of [path.join(root, ".env"), path.join(root, "apps/mobile/.env")]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const i = trimmed.indexOf("=");
      if (i === -1) continue;
      out[trimmed.slice(0, i)] = trimmed.slice(i + 1).replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

function getServiceRoleKey(projectRef) {
  const raw = execSync(`supabase projects api-keys --project-ref ${projectRef} -o json`, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const row = JSON.parse(raw).find((k) => k.name === "service_role");
  if (!row?.api_key) throw new Error("Could not find service_role key");
  return row.api_key;
}

async function main() {
  const env = loadEnv();
  const supabaseUrl = (
    env.EXPO_PUBLIC_SUPABASE_URL ??
    env.VITE_SUPABASE_URL ??
    ""
  ).trim();
  const anonKey = (
    env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    env.VITE_SUPABASE_ANON_KEY ??
    ""
  ).trim();
  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase URL or anon key in .env / apps/mobile/.env");
  }

  const selfiePath = "/tmp/future-you-smoke-selfie.jpg";
  if (!fs.existsSync(selfiePath)) {
    throw new Error(`Missing test image at ${selfiePath}`);
  }

  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  const serviceRole = getServiceRoleKey(projectRef);
  const cliKeys = JSON.parse(
    execSync(`supabase projects api-keys --project-ref ${projectRef} -o json`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }),
  );
  const apiKey =
    cliKeys.find((k) => k.name === "anon")?.api_key?.trim() ||
    anonKey;

  const email = `fy-mobile-path-${Date.now()}@example.com`;
  const password = `SmokeTest_${Date.now()}!Aa1`;

  const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!createRes.ok) {
    throw new Error(`Create user failed (${createRes.status}): ${await createRes.text()}`);
  }

  const signInRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!signInRes.ok) {
    throw new Error(`Sign in failed (${signInRes.status}): ${await signInRes.text()}`);
  }
  const { access_token: jwt } = await signInRes.json();
  if (!jwt) throw new Error("No access_token from sign-in");

  const bytes = fs.readFileSync(selfiePath);
  const imageDataUrl = `data:image/jpeg;base64,${bytes.toString("base64")}`;

  const uploadRes = await fetch(`${supabaseUrl}/functions/v1/future-you-upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      apikey: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageDataUrl }),
  });
  const uploadBody = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(`Upload failed (${uploadRes.status}): ${JSON.stringify(uploadBody)}`);
  }
  if (!uploadBody.path?.includes("/source/")) {
    throw new Error(`Upload response missing path: ${JSON.stringify(uploadBody)}`);
  }

  console.log("✅ Mobile upload path smoke passed");
  console.log(`   path: ${uploadBody.path}`);
}

main().catch((error) => {
  console.error("❌ Mobile upload path smoke failed:", error.message ?? error);
  process.exit(1);
});
