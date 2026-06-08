#!/usr/bin/env node
/**
 * Smoke test: future-you-upload → future-you-generate → job ready + result in storage.
 * Run from project root: node scripts/futureYouSmoke.mjs
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
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
  const anonKey = (env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY)?.trim();
  if (!supabaseUrl || !anonKey) throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");

  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  const serviceRole = getServiceRoleKey(projectRef);

  const email = `future-you-smoke-${Date.now()}@example.com`;
  const password = `SmokeTest_${Date.now()}!Aa1`;
  const selfiePath = "/tmp/future-you-smoke-selfie.jpg";
  if (!fs.existsSync(selfiePath)) {
    throw new Error(`Missing test image at ${selfiePath}`);
  }

  console.log("1/5 Creating smoke-test user…");
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
  const created = await createRes.json();
  const userId = created.id;
  console.log(`   user ${userId}`);

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
  const { path: sourcePath } = uploadBody;
  console.log(`   path ${sourcePath}`);

  console.log("4/5 Starting generation…");
  const generateRes = await fetch(`${supabaseUrl}/functions/v1/future-you-generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sourcePath,
      motivationId: "cut_m_veins",
      profile: { goal: "cut", gender: "male", weightLbs: 190, goalWeightLbs: 175 },
      timeline: "3 months",
    }),
  });
  const generateBody = await generateRes.json();
  if (!generateRes.ok && generateRes.status !== 202) {
    throw new Error(`Generate failed (${generateRes.status}): ${JSON.stringify(generateBody)}`);
  }
  const jobId = generateBody.jobId;
  if (!jobId) throw new Error(`No jobId: ${JSON.stringify(generateBody)}`);
  console.log(`   job ${jobId} status ${generateBody.status}`);

  console.log("5/5 Polling status edge function (up to 3 min)…");
  let pollBody = null;
  for (let i = 0; i < 36; i++) {
    await sleep(5000);
    const statusRes = await fetch(
      `${supabaseUrl}/functions/v1/future-you-status?jobId=${encodeURIComponent(jobId)}`,
      {
        headers: { Authorization: `Bearer ${jwt}`, apikey: anonKey },
      },
    );
    pollBody = await statusRes.json();
    if (!statusRes.ok) {
      throw new Error(`Status poll failed (${statusRes.status}): ${JSON.stringify(pollBody)}`);
    }
    const status = pollBody?.status ?? "unknown";
    process.stdout.write(`   poll ${i + 1}: ${status}\n`);
    if (status === "ready" || status === "failed") break;
  }

  if (!pollBody) throw new Error("Could not read poll response");
  if (pollBody.status !== "ready") {
    throw new Error(`Job did not succeed: ${JSON.stringify(pollBody)}`);
  }
  if (pollBody.resultSignedUrl) {
    throw new Error("Pre-pay poll must not return resultSignedUrl");
  }
  if (!pollBody.teaser?.ready) {
    throw new Error(`Ready job missing teaser metadata: ${JSON.stringify(pollBody)}`);
  }

  const q = execSync(
    `supabase db query --linked -o json "select result_photo_path from public.future_you_jobs where id = '${jobId}' limit 1;"`,
    { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  const parsed = JSON.parse(q);
  const resultPath = parsed.rows?.[0]?.result_photo_path;
  if (!resultPath) throw new Error("Job ready but result_photo_path missing in DB");
  const downloadRes = await fetch(
    `${supabaseUrl}/storage/v1/object/${encodeURIComponent("future-you")}/${resultPath}`,
    {
      headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}` },
    },
  );
  if (!downloadRes.ok) {
    throw new Error(`Result not in storage (${downloadRes.status})`);
  }
  const resultBytes = Buffer.from(await downloadRes.arrayBuffer());
  if (resultBytes.length < 1000) {
    throw new Error(`Result image suspiciously small (${resultBytes.length} bytes)`);
  }

  console.log("\n✅ Smoke test passed");
  console.log(`   job: ${jobId}`);
  console.log(`   result: ${resultPath} (${resultBytes.length} bytes)`);
}

main().catch((e) => {
  console.error("\n❌ Smoke test failed:", e.message ?? e);
  process.exit(1);
});
