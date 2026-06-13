#!/usr/bin/env node
/**
 * RN-OFFLINE epic-close — unit gates + Maestro sync + regression sweep.
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

startMetro({ EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true" });
results.push(run("e2e sync", "npm", ["run", "test:e2e:sync"]));

startMetro({ EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true" });
results.push(run("e2e auth-all", "npm", ["run", "test:e2e:auth-all"]));

startMetro({ EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true" });
results.push(run("e2e tab-nav", "npm", ["run", "test:e2e:tab-nav"]));

const failed = results.filter((ok) => !ok);
if (failed.length > 0) {
  console.error(`\nRN-OFFLINE epic close: ${failed.length} gate(s) failed.`);
  process.exit(1);
}

console.log("\nRN-OFFLINE epic close: core gates passed.");
