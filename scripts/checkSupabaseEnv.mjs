/**
 * Warn if Supabase env vars are missing on disk (Vite only reads saved .env).
 * Parses only the first "=" per line so JWT padding "=" in values is preserved.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");

function parseDotEnv(src) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const line of src.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

if (!fs.existsSync(envPath)) {
  console.warn("\n[Fitcoach] No .env file at project root - cloud sync env vars will be missing.\n");
  process.exit(0);
}

const raw = fs.readFileSync(envPath, "utf8");
const env = parseDotEnv(raw);
const url = env.VITE_SUPABASE_URL;
const publishable = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const anonJwt = env.VITE_SUPABASE_ANON_KEY;
const keyStrRaw =
  publishable !== undefined && String(publishable).trim() !== ""
    ? String(publishable).trim()
    : anonJwt !== undefined && String(anonJwt).trim() !== ""
      ? String(anonJwt).trim()
      : "";

const touched =
  Object.prototype.hasOwnProperty.call(env, "VITE_SUPABASE_URL") ||
  Object.prototype.hasOwnProperty.call(env, "VITE_SUPABASE_ANON_KEY") ||
  Object.prototype.hasOwnProperty.call(env, "VITE_SUPABASE_PUBLISHABLE_KEY");

if (!touched) {
  process.exit(0);
}

const problems = [];
const urlStr = url === undefined ? "" : String(url).trim();

if (!urlStr) problems.push("VITE_SUPABASE_URL is missing or empty in .env on disk");
else if (!/^https:\/\/.+/i.test(urlStr)) problems.push("VITE_SUPABASE_URL should start with https://");

if (!keyStrRaw) {
  problems.push(
    "No client Supabase key on disk - set VITE_SUPABASE_PUBLISHABLE_KEY (recommended) or VITE_SUPABASE_ANON_KEY (legacy JWT anon)",
  );
} else if (keyStrRaw.length < 12) {
  problems.push("Supabase client key looks truncated in .env on disk");
}

if (problems.length) {
  console.warn("\n[Fitcoach] Supabase .env problem (Vite reads the saved file, not unsaved editor tabs):\n");
  for (const p of problems) console.warn(`  · ${p}`);
  console.warn(`  · .env on disk is ${raw.length} bytes - with real URL + anon JWT it’s usually ~700 bytes or more.`);
  console.warn(
    "\n  Fix: Put values on the same line after `=` → Save `.env` (⌘S) → restart `npm run dev`. Confirm you’re editing `fitnesstracker/.env`, not a copy in the parent folder.\n",
  );
}
