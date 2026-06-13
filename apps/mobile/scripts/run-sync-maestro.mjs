#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { maestroEnv, mobileRoot, startMetro } from "./maestro-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

startMetro({ EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "true" });

const result = spawnSync("maestro", ["test", ".maestro/rn-sync-signin.yaml"], {
  cwd: mobileRoot,
  stdio: "inherit",
  env: maestroEnv(),
});

process.exit(result.status ?? 1);
