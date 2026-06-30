#!/usr/bin/env node
/**
 * Future You — 10-persona harness (one source photo per persona).
 *
 * Default: parallel — one auth user per persona (avoids one-active-job-per-user limit).
 *
 * Usage:
 *   node scripts/futureYouPersonas.mjs
 *   node scripts/futureYouPersonas.mjs --personas m2,f1
 *   node scripts/futureYouPersonas.mjs --skip-ready
 *   node scripts/futureYouPersonas.mjs --sequential
 *   FY_PERSONA_OUT=personas-v2 node scripts/futureYouPersonas.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const photosDir = path.join(__dirname, "persona-photos");
const manifestPath = path.join(photosDir, "personas.json");
const outputDir = path.join(root, "_bmad-output", process.env.FY_PERSONA_OUT ?? "personas");

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
  let personaFilter = null;
  let dryRun = false;
  let sequential = false;
  let skipReady = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--personas" && args[i + 1]) personaFilter = new Set(args[++i].split(","));
    if (args[i] === "--dry-run") dryRun = true;
    if (args[i] === "--sequential") sequential = true;
    if (args[i] === "--skip-ready") skipReady = true;
  }
  return { personaFilter, dryRun, sequential, skipReady };
}

function mimeForFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function log(id, message) {
  console.log(`[${id}] ${message}`);
}

async function createUserJwt(supabaseUrl, anonKey, serviceRole, personaId) {
  const email = `fy-persona-${personaId}-${Date.now()}@example.com`;
  const password = `Persona_${Date.now()}_${personaId}!Aa1`;
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

  const signInRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!signInRes.ok) throw new Error(`Sign in failed: ${await signInRes.text()}`);
  const { access_token: jwt } = await signInRes.json();
  return jwt;
}

async function pollUntilReady(supabaseUrl, anonKey, jwt, jobId, personaId, maxPolls = 48) {
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
    log(personaId, `poll ${i + 1}: ${status}`);
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

async function uploadPhoto(supabaseUrl, anonKey, jwt, photoPath) {
  const bytes = fs.readFileSync(photoPath);
  const mime = mimeForFile(photoPath);
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mime }), path.basename(photoPath));
  const uploadRes = await fetch(`${supabaseUrl}/functions/v1/future-you-upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, apikey: anonKey },
    body: form,
  });
  const uploadBody = await uploadRes.json();
  if (!uploadRes.ok) throw new Error(`Upload failed: ${JSON.stringify(uploadBody)}`);
  return uploadBody.path;
}

async function runPersona(persona, ctx) {
  const { supabaseUrl, anonKey, serviceRole } = ctx;
  const photoPath = path.join(photosDir, persona.photo);
  const ext = path.extname(photoPath).slice(1) || "jpg";
  const beforeOut = `${persona.id}-before.${ext}`;
  const afterOut = `${persona.id}-after.png`;
  const afterPath = path.join(outputDir, afterOut);

  if (ctx.skipReady && fs.existsSync(afterPath)) {
    log(persona.id, `skip — ${afterOut} already exists`);
    return {
      ...persona,
      status: "ready",
      beforeOut,
      afterOut,
      skipped: true,
    };
  }

  log(persona.id, `${persona.description} (${persona.profile.goal} / ${persona.motivationId})`);
  fs.copyFileSync(photoPath, path.join(outputDir, beforeOut));

  try {
    log(persona.id, "creating user…");
    const jwt = ctx.sequential ? ctx.sharedJwt : await createUserJwt(supabaseUrl, anonKey, serviceRole, persona.id);

    log(persona.id, "uploading source…");
    const sourcePath = await uploadPhoto(supabaseUrl, anonKey, jwt, photoPath);

    const generateRes = await fetch(`${supabaseUrl}/functions/v1/future-you-generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourcePath,
        motivationId: persona.motivationId,
        profile: persona.profile,
        timeline: persona.timeline,
      }),
    });
    const generateBody = await generateRes.json();
    if (!generateRes.ok && generateRes.status !== 202) {
      throw new Error(`generate: ${JSON.stringify(generateBody)}`);
    }

    const jobId = generateBody.jobId;
    const pollBody = await pollUntilReady(supabaseUrl, anonKey, jwt, jobId, persona.id);
    if (pollBody.status !== "ready") {
      throw new Error(pollBody.error ?? pollBody.status ?? "generation failed");
    }

    const q = execSync(
      `supabase db query --linked -o json "select result_photo_path from public.future_you_jobs where id = '${jobId}' limit 1;"`,
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    const resultPath = JSON.parse(q).rows?.[0]?.result_photo_path;
    if (!resultPath) throw new Error("missing result_photo_path");

    const resultBytes = await downloadResult(supabaseUrl, serviceRole, resultPath);
    fs.writeFileSync(afterPath, resultBytes);
    log(persona.id, `✅ ${afterOut} (${resultBytes.length} bytes)`);
    return { ...persona, status: "ready", jobId, beforeOut, afterOut, bytes: resultBytes.length };
  } catch (e) {
    log(persona.id, `❌ ${e.message ?? e}`);
    return { ...persona, status: "failed", error: String(e.message ?? e), beforeOut };
  }
}

function writeReport(results) {
  const readyCount = results.filter((r) => r.status === "ready").length;
  const report = [
    "# Future You — Persona harness results",
    "",
    `**Date:** ${new Date().toISOString()}`,
    `**Cases:** ${results.length} · **Ready:** ${readyCount}`,
    "",
    "| ID | Goal | Motivation | Status | Before | After | Notes |",
    "|----|------|------------|--------|--------|-------|-------|",
    ...results.map((r) =>
      `| ${r.id} | ${r.profile.goal} | ${r.motivationId} | ${r.status} | ${r.beforeOut ?? "—"} | ${r.afterOut ?? "—"} | ${r.description ?? ""} |`,
    ),
    "",
    "## Watermark notes",
    "",
    "- m1: Dreamstime watermark on source",
    "- m5: Unsplash+ watermark on source",
    "",
    "## Failures",
    "",
    ...(results.some((r) => r.status !== "ready")
      ? results.filter((r) => r.status !== "ready").map((r) => `- **${r.id}**: ${r.error ?? r.status}`)
      : ["_None_"]),
    "",
  ].join("\n");
  fs.writeFileSync(path.join(outputDir, "personas-report.md"), report);
  return readyCount;
}

async function main() {
  const { personaFilter, dryRun, sequential, skipReady } = parseArgs();
  const personas = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  let selected = personaFilter ? personas.filter((p) => personaFilter.has(p.id)) : personas;
  if (!selected.length) throw new Error("No personas selected");

  for (const p of selected) {
    const photoPath = path.join(photosDir, p.photo);
    if (!fs.existsSync(photoPath)) throw new Error(`Missing photo for ${p.id}: ${photoPath}`);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  if (dryRun) {
    console.log(`Dry run — ${sequential ? "sequential" : "parallel"} mode:\n`);
    for (const p of selected) {
      const skip = skipReady && fs.existsSync(path.join(outputDir, `${p.id}-after.png`));
      console.log(`  ${p.id}: ${p.photo} → ${p.profile.goal}${skip ? " (skip-ready)" : ""}`);
    }
    return;
  }

  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
  const anonKey = (env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY)?.trim();
  if (!supabaseUrl || !anonKey) throw new Error("Missing VITE_SUPABASE_URL or anon key in .env");

  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  const serviceRole = getServiceRoleKey(projectRef);

  const mode = sequential ? "sequential (1 user)" : "parallel (1 user per persona)";
  console.log(`Future You personas — ${selected.length} cases · ${mode}`);
  console.log(`Output: ${outputDir}\n`);

  const ctx = { supabaseUrl, anonKey, serviceRole, skipReady, sequential };

  if (sequential) {
    console.log("Creating shared test user…");
    ctx.sharedJwt = await createUserJwt(supabaseUrl, anonKey, serviceRole, "shared");
    const results = [];
    for (let i = 0; i < selected.length; i++) {
      console.log(`\n--- ${i + 1}/${selected.length} ---`);
      results.push(await runPersona(selected[i], ctx));
    }
    const readyCount = writeReport(results);
    console.log(`\n✅ Done — ${readyCount}/${results.length} ready`);
    if (readyCount < results.length) process.exit(1);
    return;
  }

  console.log("Launching all personas in parallel…\n");
  const results = await Promise.all(selected.map((p) => runPersona(p, ctx)));
  const readyCount = writeReport(results);
  console.log(`\n✅ Done — ${readyCount}/${results.length} ready`);
  if (readyCount < results.length) process.exit(1);
}

main().catch((e) => {
  console.error("\n❌ Persona harness failed:", e.message ?? e);
  process.exit(1);
});
