#!/usr/bin/env node
/**
 * Epic RN-2 auth Maestro sweep — provisions a disposable Supabase user, then runs all auth flows.
 * Requires: Metro on :8082, iOS simulator + dev client, JAVA_HOME (openjdk@17), maestro CLI.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(__dirname, "..");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    out[trimmed.slice(0, idx)] = trimmed.slice(idx + 1).replace(/^["']|["']$/g, "");
  }
  return out;
}

function loadSupabaseEnv() {
  const rootEnv = parseEnvFile(path.resolve(mobileRoot, "../../.env"));
  const mobileEnv = parseEnvFile(path.join(mobileRoot, ".env"));
  const url = mobileEnv.EXPO_PUBLIC_SUPABASE_URL ?? rootEnv.VITE_SUPABASE_URL ?? "";
  const key =
    mobileEnv.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    mobileEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    rootEnv.VITE_SUPABASE_PUBLISHABLE_KEY ??
    rootEnv.VITE_SUPABASE_ANON_KEY ??
    "";
  return { url, key };
}

async function provisionTestUser(sb) {
  const stamp = Date.now();
  const email = `maestro.rn2.${stamp}@newyouai.test`;
  const password = `MaestroRn2${String(stamp).slice(-8)}`;
  const name = "Maestro RN2";

  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) {
    throw new Error(`Supabase signUp failed: ${error.message}`);
  }

  if (!data.session) {
    const { error: signInError } = await sb.auth.signInWithPassword({ email, password });
    if (signInError) {
      throw new Error(
        `Sign-up succeeded without session and sign-in failed: ${signInError.message}`,
      );
    }
  }

  return { email, password, name };
}

function runMaestro(scriptName, extraEnv = {}) {
  const env = {
    ...process.env,
    ...extraEnv,
  };
  const result = spawnSync("maestro", ["test", path.join(".maestro", scriptName)], {
    cwd: mobileRoot,
    env,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const { url, key } = loadSupabaseEnv();
if (!url || !key) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_* (apps/mobile/.env) or VITE_SUPABASE_* (root .env)");
  process.exit(1);
}

const sb = createClient(url, key);
const creds = await provisionTestUser(sb);
const signUpOnly = {
  email: `maestro.rn2.signup.${Date.now()}@newyouai.test`,
  password: `MaestroRn2Up${String(Date.now()).slice(-8)}`,
  name: "Maestro RN2 SignUp",
};

console.log(`Maestro auth sweep — sign-in user ${creds.email}, sign-up user ${signUpOnly.email}`);

const metroProbe = spawnSync("curl", ["-sf", "-o", "/dev/null", "http://127.0.0.1:8082"], {
  stdio: "ignore",
});
if (metroProbe.status !== 0) {
  console.error(
    "Metro is not reachable on http://127.0.0.1:8082 — start it first:\n" +
      "  cd apps/mobile && npx expo start --dev-client --port 8082",
  );
  process.exit(1);
}

const common = {
  MAESTRO_TEST_EMAIL: creds.email,
  MAESTRO_TEST_PASSWORD: creds.password,
  MAESTRO_TEST_SIGNUP_NAME: signUpOnly.name,
  MAESTRO_TEST_SIGNUP_EMAIL: signUpOnly.email,
  MAESTRO_TEST_SIGNUP_PASSWORD: signUpOnly.password,
};

const flows = [
  "rn-auth-gate.yaml",
  "rn-auth-sign-up.yaml",
  "rn-auth-gate-sign-in.yaml",
  "rn-auth-sign-out.yaml",
];

for (const flow of flows) {
  console.log(`\n==> ${flow}`);
  runMaestro(flow, common);
}

console.log("\nAuth Maestro sweep passed.");
