# Future You — Persona harness results

**Date:** 2026-06-29  
**Cases:** 10 · **Ready:** 9 · **Failed:** 1 (m2)

| ID | Goal | Motivation | Status | Before | After | Notes |
|----|------|------------|--------|--------|-------|-------|
| m1 | cut | cut_generic_lean | ready | m1-before.png | m1-after.png | Heavier shirtless flex (user) — Dreamstime watermark on source |
| m2 | bulk | bulk_m_arms | **failed** | m2-before.png | — | OpenAI rejected 3× — likely model/underwear photo |
| m3 | bulk | bulk_generic_strong | ready | m3-before.png | m3-after.png | Lean shirtless (user) |
| m4 | cut | cut_m_abs | ready | m4-before.png | m4-after.png | Heavier compression tank (user) |
| m5 | maintain | maintain_m_definition | ready | m5-before.png | m5-after.png | Fit beach (user) — Unsplash+ watermark on source |
| f1 | cut | cut_f_beach_ready | ready | f1-cut.png → f1-before.png | f1-after.png | Mirror selfie (user) |
| f2 | cut | cut_f_toned_arms | ready | f2-before.png | f2-after.png | Outdoor plus-size (user) |
| f3 | cut | cut_generic_best | ready | f3-before.jpg | f3-after.png | Stock filler (user did not supply) |
| f4 | bulk | bulk_f_glutes | ready | f4-before.jpg | f4-after.png | Stock — previously approved |
| f5 | maintain | maintain_f_definition | ready | f5-before.jpg | f5-after.png | Stock — previously approved |

## Failures

- **m2**: `OpenAI image generation call failed.` (failed on sequential run + 3 retries). Other 9 personas succeeded with the same pipeline — likely this specific source image (studio model in white boxers).

## Run mode

Harness now defaults to **parallel** (one Supabase user per persona). Use `--sequential` for the old one-at-a-time behavior. Use `--skip-ready` to resume without redoing completed personas.

```bash
node scripts/futureYouPersonas.mjs              # parallel, all 10
node scripts/futureYouPersonas.mjs --skip-ready # resume
node scripts/futureYouPersonas.mjs --personas m2 # retry one
```
