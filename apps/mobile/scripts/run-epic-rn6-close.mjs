#!/usr/bin/env node
/**
 * RN-6 epic-close Maestro sweep, runs unit gates + E2E flows sequentially.
 * Requires: JAVA_HOME (openjdk@17), maestro CLI, iOS simulator + dev client, Supabase .env
 */
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(mobileRoot, "../..");

const JAVA_HOME =
  process.env.JAVA_HOME ??
  "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home";

function run(label, cmd, args, opts = {}) {
  console.log(`\n========== ${label} ==========`);
  const result = spawnSync(cmd, args, {
    cwd: opts.cwd ?? mobileRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      JAVA_HOME,
      PATH: `${JAVA_HOME}/bin:${process.env.PATH ?? ""}:${process.env.HOME}/.maestro/bin`,
    },
  });
  const ok = result.status === 0;
  console.log(`========== ${label}: ${ok ? "PASS" : "FAIL"} ==========\n`);
  return ok;
}

function sleepMs(ms) {
  spawnSync("sleep", [String(Math.max(1, Math.ceil(ms / 1000)))], { stdio: "ignore" });
}

function waitForMetro(maxMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const probe = spawnSync("curl", ["-sf", "-o", "/dev/null", "http://127.0.0.1:8082"], {
      stdio: "ignore",
    });
    if (probe.status === 0) return true;
    sleepMs(2000);
  }
  return false;
}

function startMetro(extraEnv) {
  spawnSync("lsof", ["-ti:8082"], { stdio: "pipe" })
    .stdout?.toString()
    .trim()
    .split("\n")
    .filter(Boolean)
    .forEach((pid) => {
      try {
        process.kill(Number(pid), "SIGKILL");
      } catch {
        /* ignore */
      }
    });

  const child = spawn(
    "npx",
    ["expo", "start", "--dev-client", "--port", "8082"],
    {
      cwd: mobileRoot,
      stdio: "ignore",
      detached: true,
      env: { ...process.env, ...extraEnv },
    },
  );
  child.unref();

  if (!waitForMetro()) {
    console.error("Metro failed to start on :8082");
    process.exit(1);
  }
  console.log("Metro ready on :8082", extraEnv.EXPO_PUBLIC_E2E_FITNESS_SEED ?? "(no seed)");
}

const results = [];

results.push(
  run("typecheck", "npm", ["run", "typecheck", "--workspace=@newyouai/mobile"], { cwd: repoRoot }),
);
results.push(run("core tests", "npm", ["run", "test", "--workspace=@newyouai/core"], { cwd: repoRoot }));
results.push(run("mobile unit tests", "npm", ["run", "test", "--workspace=@newyouai/mobile"], { cwd: repoRoot }));

startMetro({
  EXPO_PUBLIC_E2E_FITNESS_SEED: "workout-session",
  EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true",
});
results.push(run("e2e workout-session", "npm", ["run", "test:e2e:workout-session"]));

startMetro({ EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true" });
results.push(run("e2e auth-all", "npm", ["run", "test:e2e:auth-all"]));
results.push(run("e2e tab-nav", "npm", ["run", "test:e2e:tab-nav"]));

startMetro({
  EXPO_PUBLIC_E2E_FITNESS_SEED: "coach-nutrition",
  EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true",
});
results.push(run("e2e coach-nutrition", "npm", ["run", "test:e2e:coach-nutrition"]));

console.log("\n========== EPIC RN-6 CLOSE SUMMARY ==========");
const labels = [
  "typecheck",
  "core tests",
  "mobile unit tests",
  "e2e workout-session",
  "e2e auth-all",
  "e2e tab-nav",
  "e2e coach-nutrition",
];
labels.forEach((label, i) => {
  console.log(`${results[i] ? "✅" : "❌"} ${label}`);
});

process.exit(results.every(Boolean) ? 0 : 1);
