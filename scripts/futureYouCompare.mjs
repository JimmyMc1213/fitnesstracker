#!/usr/bin/env node
/**
 * Future You model comparison harness.
 *
 * Runs a selfie through the live pipeline (upload -> generate -> poll) and saves
 * the resulting image to disk so you can eyeball quality per model. The model is
 * chosen server-side via the FUTURE_YOU_IMAGE_PROVIDER edge secret, so this script
 * does NOT pick the model — it tests whatever is currently deployed. Pass a label
 * to name the output file after the provider you just deployed.
 *
 * Usage (from project root):
 *   node scripts/futureYouCompare.mjs [selfiePath] [label]
 *
 * Examples:
 *   # after: supabase secrets set FUTURE_YOU_IMAGE_PROVIDER=openai && supabase functions deploy future-you-generate
 *   node scripts/futureYouCompare.mjs /tmp/selfie.jpg gpt-image-2
 *   # after switching the secret to grok and redeploying
 *   node scripts/futureYouCompare.mjs /tmp/selfie.jpg grok
 *
 * Output: /tmp/future-you-<label>.png
 *
 * Tune the transformation via env vars (defaults shown):
 *   FY_MOTIVATION=cut_m_veins FY_GOAL=cut FY_GENDER=male FY_WEIGHT=190 FY_GOAL_WEIGHT=175 FY_TIMELINE="3 months"
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const selfiePath = process.argv[2]?.trim() || "/tmp/future-you-smoke-selfie.jpg";
  const label = (process.argv[3]?.trim() || "result").replace(/[^a-zA-Z0-9._-]/g, "_");
  const outPath = `/tmp/future-you-${label}.png`;

  if (!fs.existsSync(selfiePath)) {
    throw new Error(`Missing source selfie at ${selfiePath} (pass a path as the first argument)`);
  }

  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
  const anonKey = (env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY)?.trim();
  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  }

  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  const serviceRole = getServiceRoleKey(projectRef);

  const motivationId = process.env.FY_MOTIVATION || "cut_m_veins";
  const profile = {
    goal: process.env.FY_GOAL || "cut",
    gender: process.env.FY_GENDER || "male",
    weightLbs: Number(process.env.FY_WEIGHT || 190),
    goalWeightLbs: Number(process.env.FY_GOAL_WEIGHT || 175),
  };
  const timeline = process.env.FY_TIMELINE || "3 months";

  const email = `future-you-compare-${Date.now()}@example.com`;
  const password = `Compare_${Date.now()}!Aa1`;

  console.log(`Comparison run -> ${outPath}`);
  console.log(`  source: ${selfiePath}`);
  console.log(`  motivation: ${motivationId} | ${JSON.stringify(profile)} | ${timeline}`);

  console.log("1/5 Creating test user…");
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
  const userId = (await createRes.json()).id;

  console.log("2/5 Signing in…");
  const signInRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!signInRes.ok) {
    throw new Error(`Sign in failed (${signInRes.status}): ${await signInRes.text()}`);
  }
  const { access_token: jwt } = await signInRes.json();
  if (!jwt) throw new Error("No access_token from sign-in");

  console.log("3/5 Uploading selfie…");
  const bytes = fs.readFileSync(selfiePath);
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: "image/jpeg" }), "selfie.jpg");
  const uploadRes = await fetch(`${supabaseUrl}/functions/v1/future-you-upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, apikey: anonKey },
    body: form,
  });
  const uploadBody = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(`Upload failed (${uploadRes.status}): ${JSON.stringify(uploadBody)}`);
  }
  const sourcePath = uploadBody.path;

  console.log("4/5 Starting generation…");
  const generateRes = await fetch(`${supabaseUrl}/functions/v1/future-you-generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sourcePath, motivationId, profile, timeline }),
  });
  const generateBody = await generateRes.json();
  if (!generateRes.ok && generateRes.status !== 202) {
    throw new Error(`Generate failed (${generateRes.status}): ${JSON.stringify(generateBody)}`);
  }
  const jobId = generateBody.jobId;
  if (!jobId) throw new Error(`No jobId: ${JSON.stringify(generateBody)}`);
  console.log(`   job ${jobId} status ${generateBody.status}`);

  console.log("5/5 Polling status (up to 4 min)…");
  let pollBody = null;
  const startedAt = Date.now();
  for (let i = 0; i < 48; i++) {
    await sleep(5000);
    const statusRes = await fetch(
      `${supabaseUrl}/functions/v1/future-you-status?jobId=${encodeURIComponent(jobId)}`,
      { headers: { Authorization: `Bearer ${jwt}`, apikey: anonKey } },
    );
    pollBody = await statusRes.json();
    if (!statusRes.ok) {
      throw new Error(`Status poll failed (${statusRes.status}): ${JSON.stringify(pollBody)}`);
    }
    const status = pollBody?.status ?? "unknown";
    process.stdout.write(`   poll ${i + 1}: ${status}\n`);
    if (status === "ready" || status === "failed") break;
  }

  if (!pollBody || pollBody.status !== "ready") {
    throw new Error(`Job did not succeed: ${JSON.stringify(pollBody)}`);
  }

  const q = execSync(
    `supabase db query --linked -o json "select result_photo_path from public.future_you_jobs where id = '${jobId}' limit 1;"`,
    { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  const resultPath = JSON.parse(q).rows?.[0]?.result_photo_path;
  if (!resultPath) throw new Error("Job ready but result_photo_path missing in DB");

  const downloadRes = await fetch(
    `${supabaseUrl}/storage/v1/object/${encodeURIComponent("future-you")}/${resultPath}`,
    { headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}` } },
  );
  if (!downloadRes.ok) {
    throw new Error(`Result not in storage (${downloadRes.status})`);
  }
  const resultBytes = Buffer.from(await downloadRes.arrayBuffer());
  fs.writeFileSync(outPath, resultBytes);

  const elapsed = Math.round((Date.now() - startedAt) / 1000);
  console.log(`\n✅ Saved ${outPath} (${resultBytes.length} bytes, ${elapsed}s generation)`);
  console.log(`   user ${userId} job ${jobId}`);
  console.log(`   open it: open "${outPath}"`);
}

main().catch((e) => {
  console.error("\n❌ Comparison run failed:", e.message ?? e);
  process.exit(1);
});
