#!/usr/bin/env node
/**
 * RN-9 epic-close, unit gates + Maestro smoke (future-you + RN-3..8 regressions).
 * Requires: JDK 17+, maestro CLI, iOS simulator + dev client, Supabase .env
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

  const child = spawn("npx", ["expo", "start", "--dev-client", "--port", "8082"], {
    cwd: mobileRoot,
    stdio: "ignore",
    detached: true,
    env: { ...process.env, ...extraEnv },
  });
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
results.push(run("api-client tests", "npm", ["run", "test", "--workspace=@newyouai/api-client"], { cwd: repoRoot }));
results.push(run("mobile unit tests", "npm", ["run", "test", "--workspace=@newyouai/mobile"], { cwd: repoRoot }));

startMetro({
  EXPO_PUBLIC_E2E_FITNESS_SEED: "future-you",
  EXPO_PUBLIC_E2E_MOCK_FUTURE_YOU: "true",
  EXPO_PUBLIC_E2E_MOCK_FUTURE_YOU_CAMERA: "true",
  EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true",
});
results.push(run("e2e future-you", "npm", ["run", "test:e2e:future-you"]));

startMetro({
  EXPO_PUBLIC_E2E_FITNESS_SEED: "progress",
  EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true",
});
results.push(run("e2e progress", "npm", ["run", "test:e2e:progress"]));

startMetro({
  EXPO_PUBLIC_E2E_FITNESS_SEED: "progress",
  EXPO_PUBLIC_E2E_DEV_PREVIEW_SUNDAY: "true",
  EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true",
});
results.push(run("e2e sunday-check-in", "npm", ["run", "test:e2e:sunday-check-in"]));

results.push(run("e2e auth-all", "npm", ["run", "test:e2e:auth-all"]));

startMetro({ EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true" });
results.push(run("e2e tab-nav", "npm", ["run", "test:e2e:tab-nav"]));

startMetro({
  EXPO_PUBLIC_E2E_FITNESS_SEED: "coach-nutrition",
  EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true",
});
results.push(run("e2e coach-nutrition", "npm", ["run", "test:e2e:coach-nutrition"]));

startMetro({ EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true" });
results.push(run("e2e onboarding", "npm", ["run", "test:e2e:onboarding"]));

startMetro({
  EXPO_PUBLIC_E2E_FITNESS_SEED: "workout-session",
  EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true",
});
results.push(run("e2e workout-session", "npm", ["run", "test:e2e:workout-session"]));

startMetro({
  EXPO_PUBLIC_E2E_FITNESS_SEED: "nutrition-log",
  EXPO_PUBLIC_E2E_MOCK_FOOD_SEARCH: "true",
  EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true",
});
results.push(run("e2e nutrition-log", "npm", ["run", "test:e2e:nutrition-log"]));

console.log("\n========== EPIC RN-9 CLOSE SUMMARY ==========");
const labels = [
  "typecheck",
  "core tests",
  "api-client tests",
  "mobile unit tests",
  "e2e future-you",
  "e2e progress",
  "e2e sunday-check-in",
  "e2e auth-all",
  "e2e tab-nav",
  "e2e coach-nutrition",
  "e2e onboarding",
  "e2e workout-session",
  "e2e nutrition-log",
];
labels.forEach((label, i) => {
  console.log(`${results[i] ? "✅" : "❌"} ${label}`);
});

process.exit(results.every(Boolean) ? 0 : 1);
