#!/usr/bin/env node
/**
 * Verify server-side age/region gates on future-you-upload and future-you-generate.
 * Uses service role to seed fitness_user_data, then calls edge functions with user JWTs.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = resolve(import.meta.dirname, "..");
const envText = readFileSync(resolve(root, ".env"), "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);

const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL, anon/publishable key, or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1x1 red PNG
const TINY_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const imageDataUrl = `data:image/png;base64,${TINY_PNG_B64}`;

const GENERATE_BODY = {
  sourcePath: "users/placeholder/source/test.png",
  motivationId: "maintain_generic_healthier",
  profile: { goal: "maintain", gender: "male", weightLbs: 180 },
};

function basePayload(overrides = {}) {
  return {
    onboardingComplete: true,
    onboardingProfile: {
      goal: "maintain",
      heightIn: 70,
      weightLbs: 180,
      gender: "male",
      activityLevel: "moderate",
      workoutDaysPerWeek: 5,
      residencyCountry: "US",
      residencyRegion: "NY",
      ...overrides,
    },
  };
}

async function createTestUser(label) {
  const email = `gate-verify-${label}-${Date.now()}@newyouai-gate-test.invalid`;
  const password = `GateTest!${Math.random().toString(36).slice(2, 10)}`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`createUser(${label}): ${error.message}`);
  return { userId: data.user.id, email, password };
}

async function upsertFitnessPayload(userId, profileOverrides, extra = {}) {
  const payload = { ...basePayload(profileOverrides), ...extra };
  const { error } = await admin.from("fitness_user_data").upsert(
    { user_id: userId, payload, updated_at_ms: Date.now() },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(`upsert fitness_user_data: ${error.message}`);
  return payload;
}

async function signIn(email, password) {
  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`signIn: ${error.message}`);
  return data.session.access_token;
}

async function callEdge(fn, token, body) {
  const res = await fetch(`${url}/functions/v1/${fn}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  let json;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

const results = [];

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  const icon = pass ? "PASS" : "FAIL";
  console.log(`\n[${icon}] ${name}`);
  console.log(`       ${detail}`);
}

async function run() {
  console.log("Verifying Future You server gates against", url);

  // 1. Under-18 → future-you-upload → 403 age_restricted
  {
    const { userId, email, password } = await createTestUser("under18");
    await upsertFitnessPayload(userId, {
      dateOfBirth: "2009-07-02", // 17 on 2026-07-02
      age: undefined,
    });
    const token = await signIn(email, password);
    const { status, json } = await callEdge("future-you-upload", token, { imageDataUrl });
    const pass = status === 403 && json?.error === "age_restricted";
    record(
      "Under-18 blocked at server (future-you-upload)",
      pass,
      `HTTP ${status}, body=${JSON.stringify(json)}`,
    );
    await admin.auth.admin.deleteUser(userId);
  }

  // 2. Missing DOB (and no age) → 403 age_restricted
  {
    const { userId, email, password } = await createTestUser("nodob");
    await upsertFitnessPayload(userId, {
      dateOfBirth: undefined,
      age: undefined,
    });
    const token = await signIn(email, password);
    const { status, json } = await callEdge("future-you-upload", token, { imageDataUrl });
    const pass = status === 403 && json?.error === "age_restricted";
    record(
      "Missing DOB/age blocked (fail-closed, future-you-upload)",
      pass,
      `HTTP ${status}, body=${JSON.stringify(json)}`,
    );
    await admin.auth.admin.deleteUser(userId);
  }

  // 2b. No DOB but stored age=25 — must NOT bypass gate
  {
    const { userId, email, password } = await createTestUser("ageonly");
    await upsertFitnessPayload(userId, {
      dateOfBirth: undefined,
      age: 25,
    });
    const token = await signIn(email, password);
    const upload = await callEdge("future-you-upload", token, { imageDataUrl });
    const uploadPass = upload.status === 403 && upload.json?.error === "age_restricted";
    record(
      "Stored age=25 without DOB blocked (future-you-upload)",
      uploadPass,
      `HTTP ${upload.status}, body=${JSON.stringify(upload.json)}`,
    );
    const gen = await callEdge("future-you-generate", token, GENERATE_BODY);
    const genPass = gen.status === 403 && gen.json?.error === "age_restricted";
    record(
      "Stored age=25 without DOB blocked (future-you-generate)",
      genPass,
      `HTTP ${gen.status}, body=${JSON.stringify(gen.json)}`,
    );
    await admin.auth.admin.deleteUser(userId);
  }

  // 3. Quebec → future-you-generate → 403 region_restricted
  {
    const { userId, email, password } = await createTestUser("quebec");
    await upsertFitnessPayload(userId, {
      dateOfBirth: "1990-01-15",
      residencyCountry: "CA",
      residencyRegion: "QC",
    });
    const token = await signIn(email, password);
    const { status, json } = await callEdge("future-you-generate", token, GENERATE_BODY);
    const pass = status === 403 && json?.error === "region_restricted";
    record(
      "Quebec blocked at server (future-you-generate)",
      pass,
      `HTTP ${status}, body=${JSON.stringify(json)}`,
    );
    await admin.auth.admin.deleteUser(userId);
  }

  // 4. Valid US 18+ → upload succeeds, generate accepts (202)
  {
    const { userId, email, password } = await createTestUser("valid-us");
    await upsertFitnessPayload(userId, {
      dateOfBirth: "1990-01-15",
      residencyCountry: "US",
      residencyRegion: "NY",
    });
    const token = await signIn(email, password);

    const upload = await callEdge("future-you-upload", token, { imageDataUrl });
    const uploadPass = upload.status === 200 && typeof upload.json?.path === "string";
    record(
      "Valid US 18+ upload succeeds (future-you-upload)",
      uploadPass,
      `HTTP ${upload.status}, body=${JSON.stringify(upload.json)}`,
    );

    if (uploadPass) {
      const genBody = {
        ...GENERATE_BODY,
        sourcePath: upload.json.path,
      };
      const gen = await callEdge("future-you-generate", token, genBody);
      const genPass = gen.status === 202 && typeof gen.json?.jobId === "string";
      record(
        "Valid US 18+ generate queued (future-you-generate)",
        genPass,
        `HTTP ${gen.status}, body=${JSON.stringify(gen.json)}`,
      );
      if (gen.json?.jobId) {
        await admin.from("future_you_jobs").delete().eq("id", gen.json.jobId);
      }
    } else {
      record("Valid US 18+ generate queued (future-you-generate)", false, "Skipped — upload failed");
    }

    await admin.storage.from("future-you").remove([`users/${userId}/source`]).catch(() => undefined);
    await admin.auth.admin.deleteUser(userId);
  }

  console.log("\n--- Summary ---");
  const required = results;
  const failed = required.filter((r) => !r.pass);
  if (failed.length === 0) {
    console.log("All required checks passed.");
    process.exit(0);
  } else {
    console.log(`${failed.length} required check(s) failed:`);
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
