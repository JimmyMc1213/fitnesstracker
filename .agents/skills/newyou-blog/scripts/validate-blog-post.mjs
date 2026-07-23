#!/usr/bin/env node
/**
 * Validate a NewYou blog post TSX file before ship.
 * Usage: node .agents/skills/newyou-blog/scripts/validate-blog-post.mjs apps/web/content/blog/{slug}.tsx
 */

import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: validate-blog-post.mjs <path-to-post.tsx>");
  process.exit(1);
}

const src = readFileSync(file, "utf8");
const errors = [];
const warnings = [];

// Em dash U+2014, en dash U+2013
const EM_DASH = /\u2014/g;
const EN_DASH = /\u2013/g;

function lineNumbers(text, re) {
  const lines = text.split("\n");
  const hits = [];
  lines.forEach((line, i) => {
    if (re.test(line)) hits.push(i + 1);
    re.lastIndex = 0;
  });
  return hits;
}

const emLines = lineNumbers(src, EM_DASH);
const enLines = lineNumbers(src, EN_DASH);

if (emLines.length) {
  errors.push(`Em dash (—) found on lines: ${emLines.join(", ")}`);
}
if (enLines.length) {
  warnings.push(`En dash (–) found on lines: ${enLines.join(", ")} (rewrite unless numeric range)`);
}

// Required exports
if (!/export const meta/.test(src)) errors.push("Missing export const meta");
if (!/export function Content/.test(src)) errors.push("Missing export function Content");

const slugMatch = src.match(/slug:\s*"([^"]+)"/);
const titleMatch = src.match(/title:\s*"([^"]+)"/);
const descMatch = src.match(/description:\s*\n?\s*"([^"]+)"/s) || src.match(/description:\s*"([^"]+)"/);

if (titleMatch) {
  const title = titleMatch[1];
  if (title.length > 65) warnings.push(`Title length ${title.length} (target 50-60)`);
  if (EM_DASH.test(title) || EN_DASH.test(title)) errors.push("Title contains dash character");
}

if (descMatch) {
  const desc = descMatch[1];
  if (desc.length < 120 || desc.length > 170) {
    warnings.push(`Description length ${desc.length} (target 150-160)`);
  }
}

// Rough word count from string literals in JSX
const strings = [...src.matchAll(/>([^<{]+)</g), ...src.matchAll(/"([^"\\]{20,})"/g)].map((m) => m[1]);
const wordCount = strings
  .join(" ")
  .replace(/\s+/g, " ")
  .trim()
  .split(" ")
  .filter(Boolean).length;

if (wordCount < 800) {
  warnings.push(`Approx word count ${wordCount} (SEO brief target 1500+ for new posts)`);
}

// AI pattern sniff (sample)
const aiPatterns = [
  /\bdelve\b/i,
  /\bleverage\b/i,
  /\bgame-?changer\b/i,
  /\bever-evolving\b/i,
  /\bin today's fast-paced\b/i,
];
for (const re of aiPatterns) {
  if (re.test(src)) warnings.push(`Possible AI pattern: ${re.source}`);
}

console.log(`\nValidate: ${file}`);
console.log(`Approx words: ${wordCount}`);
if (slugMatch) console.log(`Slug: ${slugMatch[1]}`);

if (warnings.length) {
  console.log("\nWarnings:");
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}

if (errors.length) {
  console.log("\nErrors:");
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  process.exit(1);
}

console.log("\n✓ Passed (no blocking errors)");
process.exit(0);
