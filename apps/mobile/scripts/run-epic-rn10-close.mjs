#!/usr/bin/env node
/**
 * RN-10 epic-close — unit gates + Maestro smoke (settings + regressions).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { maestroEnv, mobileRoot, startMetro } from "./maestro-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(mobileRoot, "../..");

function run(label, cmd, args, opts = {}) {
  console.log(`\n========== ${label} ==========`);
  const result = spawnSync(cmd, args, {
    cwd: opts.cwd ?? mobileRoot,
    stdio: "inherit",
    env: maestroEnv(opts.env),
  });
  const ok = result.status === 0;
  console.log(`========== ${label}: ${ok ? "PASS" : "FAIL"} ==========\n`);
  return ok;
}

const results = [];

results.push(
  run("typecheck", "npm", ["run", "typecheck", "--workspace=@newyouai/mobile"], { cwd: repoRoot }),
);
results.push(run("core tests", "npm", ["run", "test", "--workspace=@newyouai/core"], { cwd: repoRoot }));
results.push(run("mobile unit tests", "npm", ["run", "test", "--workspace=@newyouai/mobile"], { cwd: repoRoot }));

startMetro({
  EXPO_PUBLIC_E2E_FITNESS_SEED: "coach-nutrition",
  EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true",
});
results.push(run("e2e settings", "npm", ["run", "test:e2e:settings"]));

startMetro({ EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true" });
results.push(run("e2e tab-nav", "npm", ["run", "test:e2e:tab-nav"]));

startMetro({
  EXPO_PUBLIC_E2E_FITNESS_SEED: "coach-nutrition",
  EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true",
});
results.push(run("e2e auth-sign-out", "npm", ["run", "test:e2e:auth-sign-out"], {
  env: { EXPO_PUBLIC_E2E_FITNESS_SEED: "coach-nutrition", EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true" },
}));

const failed = results.filter((ok) => !ok);
if (failed.length > 0) {
  console.error(`\nRN-10 epic close: ${failed.length} gate(s) failed.`);
  process.exit(1);
}

console.log("\nRN-10 epic close: all gates passed.");
