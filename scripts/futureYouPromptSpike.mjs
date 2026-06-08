#!/usr/bin/env node
/**
 * Step 10 — Prompt quality spike.
 * Runs cut/bulk/maintain × 2–3 motivations through the live generate pipeline,
 * saves results locally for visual review, and writes a markdown report.
 *
 * Usage:
 *   node scripts/futureYouPromptSpike.mjs
 *   node scripts/futureYouPromptSpike.mjs --selfie /path/to/selfie.jpg
 *   node scripts/futureYouPromptSpike.mjs --cases cut-male-veins,maintain-tone-up
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "_bmad-output/prompt-spike");

/** cut/bulk/maintain × 2–3 motivations each */
const SPIKE_MATRIX = [
  {
    id: "cut-male-generic",
    motivationId: "cut_generic_best",
    profile: { goal: "cut", gender: "male", weightLbs: 190, goalWeightLbs: 175 },
    timeline: "3 months",
  },
  {
    id: "cut-male-veins",
    motivationId: "cut_m_veins",
    profile: { goal: "cut", gender: "male", weightLbs: 190, goalWeightLbs: 175 },
    timeline: "3 months",
  },
  {
    id: "cut-male-abs",
    motivationId: "cut_m_abs",
    profile: { goal: "cut", gender: "male", weightLbs: 190, goalWeightLbs: 175 },
    timeline: "3 months",
  },
  {
    id: "cut-female-wedding",
    motivationId: "cut_f_wedding_dress",
    profile: { goal: "cut", gender: "female", weightLbs: 150, goalWeightLbs: 135 },
    timeline: "6 months",
  },
  {
    id: "cut-female-3mo",
    motivationId: "cut_generic_best",
    profile: { goal: "cut", gender: "female", weightLbs: 155, goalWeightLbs: 140 },
    timeline: "3 months",
  },
  {
    id: "bulk-male-generic",
    motivationId: "bulk_generic_strong",
    profile: { goal: "bulk", gender: "male", weightLbs: 160, goalWeightLbs: 175 },
    timeline: "6 months",
  },
  {
    id: "bulk-male-arms",
    motivationId: "bulk_m_arms",
    profile: { goal: "bulk", gender: "male", weightLbs: 160, goalWeightLbs: 175 },
    timeline: "6 months",
  },
  {
    id: "maintain-male-glow",
    motivationId: "maintain_generic_glow",
    profile: { goal: "maintain", gender: "male", weightLbs: 180 },
    timeline: "3 months",
  },
  {
    id: "maintain-male-tone-up",
    motivationId: "maintain_tone_up",
    profile: { goal: "maintain", gender: "male", weightLbs: 180 },
    timeline: "3 months",
  },
  {
    id: "maintain-female-posture",
    motivationId: "maintain_posture",
    profile: { goal: "maintain", gender: "female", weightLbs: 140 },
    timeline: "3 months",
  },
  {
    id: "cut-mirror-3mo",
    motivationId: "cut_generic_best",
    profile: { goal: "cut", gender: "male", weightLbs: 175, goalWeightLbs: 165 },
    timeline: "3 months",
  },
  {
    id: "cut-heavy-6mo",
    motivationId: "cut_generic_best",
    profile: { goal: "cut", gender: "male", weightLbs: 220, goalWeightLbs: 195 },
    timeline: "6 months",
  },
  {
    id: "cut-250-200-love-handles-v1",
    motivationId: "cut_generic_lean",
    profile: { goal: "cut", gender: "male", weightLbs: 250, goalWeightLbs: 200 },
    timeline: "6 months",
  },
  {
    id: "bulk-170-185-v2",
    motivationId: "bulk_generic_strong",
    profile: { goal: "bulk", gender: "male", weightLbs: 170, goalWeightLbs: 185 },
    timeline: "6 months",
  },
];

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

function parseArgs() {
  const args = process.argv.slice(2);
  let selfiePath = "/tmp/future-you-smoke-selfie.jpg";
  let caseFilter = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--selfie" && args[i + 1]) selfiePath = args[++i];
    if (args[i] === "--cases" && args[i + 1]) caseFilter = new Set(args[++i].split(","));
  }
  return { selfiePath, caseFilter };
}

async function pollUntilReady(supabaseUrl, anonKey, jwt, jobId, maxPolls = 40) {
  for (let i = 0; i < maxPolls; i++) {
    await sleep(5000);
    const statusRes = await fetch(
      `${supabaseUrl}/functions/v1/future-you-status?jobId=${encodeURIComponent(jobId)}`,
      { headers: { Authorization: `Bearer ${jwt}`, apikey: anonKey } },
    );
    const body = await statusRes.json();
    if (!statusRes.ok) {
      throw new Error(`Status poll failed (${statusRes.status}): ${JSON.stringify(body)}`);
    }
    const status = body?.status ?? "unknown";
    process.stdout.write(`      poll ${i + 1}: ${status}\n`);
    if (status === "ready" || status === "failed") return body;
  }
  throw new Error(`Job ${jobId} timed out`);
}

async function downloadResult(supabaseUrl, serviceRole, resultPath) {
  const res = await fetch(
    `${supabaseUrl}/storage/v1/object/${encodeURIComponent("future-you")}/${resultPath}`,
    { headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}` } },
  );
  if (!res.ok) throw new Error(`Download failed (${res.status}) for ${resultPath}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const { selfiePath, caseFilter } = parseArgs();
  if (!fs.existsSync(selfiePath)) {
    throw new Error(`Missing selfie at ${selfiePath}`);
  }

  const cases = caseFilter
    ? SPIKE_MATRIX.filter((c) => caseFilter.has(c.id))
    : SPIKE_MATRIX;
  if (!cases.length) throw new Error("No spike cases selected");

  fs.mkdirSync(outputDir, { recursive: true });
  fs.copyFileSync(selfiePath, path.join(outputDir, "source-selfie.jpg"));

  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
  const anonKey = (env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY)?.trim();
  if (!supabaseUrl || !anonKey) throw new Error("Missing VITE_SUPABASE_URL or anon key in .env");

  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  const serviceRole = getServiceRoleKey(projectRef);

  const email = `future-you-spike-${Date.now()}@example.com`;
  const password = `SpikeTest_${Date.now()}!Aa1`;

  console.log(`Prompt spike — ${cases.length} cases`);
  console.log(`Selfie: ${selfiePath}`);
  console.log(`Output: ${outputDir}\n`);

  console.log("Creating spike user…");
  const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!createRes.ok) throw new Error(`Create user failed: ${await createRes.text()}`);
  const { id: userId } = await createRes.json();

  const signInRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!signInRes.ok) throw new Error(`Sign in failed: ${await signInRes.text()}`);
  const { access_token: jwt } = await signInRes.json();

  console.log("Uploading source selfie…");
  const bytes = fs.readFileSync(selfiePath);
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: "image/jpeg" }), "selfie.jpg");
  const uploadRes = await fetch(`${supabaseUrl}/functions/v1/future-you-upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, apikey: anonKey },
    body: form,
  });
  const uploadBody = await uploadRes.json();
  if (!uploadRes.ok) throw new Error(`Upload failed: ${JSON.stringify(uploadBody)}`);
  const sourcePath = uploadBody.path;

  const results = [];

  for (let i = 0; i < cases.length; i++) {
    const testCase = cases[i];
    console.log(`\n[${i + 1}/${cases.length}] ${testCase.id} (${testCase.motivationId})`);

    const generateRes = await fetch(`${supabaseUrl}/functions/v1/future-you-generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourcePath,
        motivationId: testCase.motivationId,
        profile: testCase.profile,
        timeline: testCase.timeline,
      }),
    });
    const generateBody = await generateRes.json();
    if (!generateRes.ok && generateRes.status !== 202) {
      results.push({ ...testCase, status: "error", error: JSON.stringify(generateBody) });
      console.log(`   ❌ generate failed: ${JSON.stringify(generateBody)}`);
      continue;
    }

    const jobId = generateBody.jobId;
    const pollBody = await pollUntilReady(supabaseUrl, anonKey, jwt, jobId);
    if (pollBody.status !== "ready") {
      results.push({ ...testCase, status: "failed", jobId, error: pollBody.error ?? pollBody.status });
      console.log(`   ❌ job failed: ${JSON.stringify(pollBody)}`);
      continue;
    }

    const q = execSync(
      `supabase db query --linked -o json "select result_photo_path from public.future_you_jobs where id = '${jobId}' limit 1;"`,
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    const resultPath = JSON.parse(q).rows?.[0]?.result_photo_path;
    if (!resultPath) {
      results.push({ ...testCase, status: "failed", jobId, error: "missing result_photo_path" });
      continue;
    }

    const resultBytes = await downloadResult(supabaseUrl, serviceRole, resultPath);
    const outFile = `${testCase.id}.png`;
    fs.writeFileSync(path.join(outputDir, outFile), resultBytes);

    results.push({
      ...testCase,
      status: "ready",
      jobId,
      resultPath,
      bytes: resultBytes.length,
      outputFile: outFile,
    });
    console.log(`   ✅ ${outFile} (${resultBytes.length} bytes)`);
  }

  const readyCount = results.filter((r) => r.status === "ready").length;
  const report = [
    "# Future You — Prompt quality spike",
    "",
    `**Date:** ${new Date().toISOString()}`,
    `**Source selfie:** \`source-selfie.jpg\` (from \`${selfiePath}\`)`,
    `**Cases run:** ${results.length} · **Ready:** ${readyCount}`,
    "",
    "## Review checklist",
    "",
    "- [ ] Still looks like the person (identity)",
    "- [ ] Maintain = subtle, not drastic",
    "- [ ] Cut + veins / wedding dress visibly different emphasis vs generic",
    "- [ ] Happy enough to ship v1",
    "",
    "## Results",
    "",
    "| Case | Goal | Motivation | Status | Output |",
    "|------|------|------------|--------|--------|",
    ...results.map((r) =>
      `| ${r.id} | ${r.profile.goal} | ${r.motivationId} | ${r.status} | ${r.outputFile ?? "—"} |`,
    ),
    "",
    "## Notes",
    "",
    "_Add visual review notes here after inspecting outputs side-by-side with source._",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(outputDir, "spike-report.md"), report);
  console.log(`\n✅ Spike complete — ${readyCount}/${results.length} ready`);
  console.log(`   Report: ${path.join(outputDir, "spike-report.md")}`);

  if (readyCount < results.length) process.exit(1);
}

main().catch((e) => {
  console.error("\n❌ Prompt spike failed:", e.message ?? e);
  process.exit(1);
});
