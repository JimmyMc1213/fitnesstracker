#!/usr/bin/env node
/**
 * Dev helper: mark stuck Future You jobs as failed so users can retry.
 * Run from project root: node scripts/futureYouClearStuckJobs.mjs
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const STALE_MINUTES = 5;

const sql =
  "update public.future_you_jobs set status = 'failed', error = 'Generation timed out. Try again.', updated_at = now() where status in ('queued', 'generating');";

console.log(`Marking Future You jobs stuck > ${STALE_MINUTES}m as failed…`);

const output = execSync(`supabase db query --linked ${JSON.stringify(sql)}`, {
  cwd: root,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

console.log(output.trim() || "Done.");
console.log("\nYou can retry generation in the app now.");
