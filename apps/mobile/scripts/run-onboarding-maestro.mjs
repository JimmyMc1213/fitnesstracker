#!/usr/bin/env node
/**
 * RN-4 onboarding Maestro sweep — requires dev client built with
 * EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING=false so new sign-ins land on the wizard.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(__dirname, "..");

const flows = [
  ".maestro/rn-onboarding-v2.yaml",
  ".maestro/rn-onboarding-resume.yaml",
  ".maestro/rn-onboarding-calendar.yaml",
];

let failed = false;
for (const flow of flows) {
  const result = spawnSync("maestro", ["test", flow], {
    cwd: mobileRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      MAESTRO_TEST_EMAIL: process.env.MAESTRO_TEST_EMAIL ?? "",
      MAESTRO_TEST_PASSWORD: process.env.MAESTRO_TEST_PASSWORD ?? "",
    },
  });
  if (result.status !== 0) failed = true;
}

process.exit(failed ? 1 : 0);
