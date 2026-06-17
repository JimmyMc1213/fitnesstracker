#!/usr/bin/env node
/**
 * Launch infra probe — run before Phase 1 Jimmy session.
 *   node scripts/check-launch-infra.mjs
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const SOCIAL = [
  { name: "Instagram", url: "https://www.instagram.com/newyouai/" },
  { name: "TikTok", url: "https://www.tiktok.com/@newyouai" },
  { name: "X", url: "https://x.com/newyouai" },
];

const LIVE_PAGES = [
  { name: "Marketing home", url: "https://newyouai.app/" },
  { name: "Privacy", url: "https://newyouai.app/privacy" },
  { name: "Pricing", url: "https://newyouai.app/pricing" },
];

async function dig(name, domain) {
  try {
    const { stdout } = await execFileAsync("dig", ["+short", name, domain], { timeout: 8000 });
    const lines = stdout.trim().split("\n").filter(Boolean);
    return lines.length ? lines : ["(none)"];
  } catch {
    return ["(dig failed — check DNS manually)"];
  }
}

async function headStatus(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.status;
  } catch (error) {
    return `error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

console.log("New You AI — launch infra probe\n");

console.log("DNS newyouai.app");
console.log("  MX:", (await dig("MX", "newyouai.app")).join(", "));
console.log("  TXT:", (await dig("TXT", "newyouai.app")).slice(0, 3).join(", "));
console.log("\nSupport email support@newyouai.app: configure MX or email routing if MX is empty.\n");

console.log("Social handles (HTTP status — verify logged-in that profile is yours):");
for (const s of SOCIAL) {
  const status = await headStatus(s.url);
  console.log(`  ${s.name.padEnd(10)} ${status}  ${s.url}`);
}

console.log("\nLive marketing pages:");
for (const p of LIVE_PAGES) {
  const status = await headStatus(p.url);
  console.log(`  ${p.name.padEnd(16)} ${status}  ${p.url}`);
}

console.log("\nNext: docs/launch-infra-checklist.md + docs/revenuecat-app-store-setup.md");
