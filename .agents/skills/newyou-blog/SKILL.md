---
name: newyou-blog
description: >-
  End-to-end workflow for NewYou AI website blog posts at newyouai.app/blog.
  Runs SEO brief, draft, humanizer, AEO/GEO polish, and ships TSX into
  apps/web. Enforces no em dashes. Use when the user asks to write a blog
  post, create blog content, run the blog pipeline, SEO a post, or says
  "newyou blog", "blog skill", or "publish to /blog".
---

# NewYou Blog Pipeline

Single workflow for consistent blog posts on **`website`** branch · **`apps/web`**.

**Output:** static post at `https://newyouai.app/blog/{slug}` with SEO metadata, AEO-friendly structure, humanized prose, and **zero em dashes**.

## Before starting

1. Confirm branch: `website` (blog lives in `apps/web`, not `content`).
2. Read this skill fully.
3. Load upstream skills **in order** during the pipeline (global path `~/.claude/skills/`):
   - `seo-content-brief` — research + outline
   - `seo-content` — E-E-A-T + quality gates
   - `seo-geo` — AEO / AI citation structure
   - Humanizer — `~/.claude/skills/seo/scripts/content_humanize.py`
4. Do not commit unless the user asks.

## Hard style rules (non-negotiable)

### No em dashes

**Never use em dashes (`—`) or en dashes used as em dashes (`–`) in blog copy.**

| Instead of | Use |
|------------|-----|
| `X — Y` (parenthetical) | comma, colon, or parentheses: `X (Y)` or `X: Y` |
| `X — Y` (break in thought) | period or semicolon; split into two sentences |
| Title with em dash | colon or rewrite: `Cut vs bulk: which goal is right?` |

Run validation before shipping (Step 8). If validation fails, rewrite offending lines.

### Voice

- Plain language, confident, not bro-science.
- Short paragraphs (2–4 sentences).
- Second person (`you`) where natural.
- NewYou product name: **NewYou AI** (first mention), then **NewYou** ok.
- YMYL fitness topic: no medical guarantees; Future You is illustrative, not a promise.

---

## Pipeline (strict order)

Copy and update each session:

```
NewYou Blog progress:
- [ ] 1. Intake
- [ ] 2. SEO brief
- [ ] 3. Draft (markdown)
- [ ] 4. Humanize
- [ ] 5. Em-dash + AI-pattern cleanup
- [ ] 6. SEO + AEO polish
- [ ] 7. Ship to apps/web
- [ ] 8. Validate + typecheck
Topic: ___
Slug: ___
```

### Step 1 — Intake

Collect (ask if missing):

| Field | Example |
|-------|---------|
| **Topic / keyword** | `how to pick cut or bulk` |
| **Search intent** | informational |
| **Target slug** | `cut-vs-bulk-vs-maintain` (kebab-case, unique) |
| **Primary CTA** | link to app, Future You post, privacy, or support |
| **Internal links** | 1–3 existing `/blog/*` or `/privacy`, `/support` |

Check slug is unused: `ls apps/web/content/blog/`.

### Step 2 — SEO brief

Follow **`seo-content-brief`** in **new page mode**:

- Target site: `https://newyouai.app`
- Business context: AI fitness app · Future You preview · workouts · nutrition · habits · iOS
- Apply **Website Relevance Rule**: only topics NewYou can credibly cover
- Blog post floor: **1,500+ words** topical coverage (not fluff)
- Deliverable: H2 outline, target meta title (50–60 chars), meta description (150–160 chars), FAQ candidates, internal link plan

Show the brief table to the user before drafting unless they said "just write it."

### Step 3 — Draft (markdown first)

Write **`apps/web/content/blog/.drafts/{slug}.md`** (gitignored) before TSX.

Structure every post:

```markdown
# {Title without em dashes}

{Direct answer in first 40–60 words — AEO front-load}

## {H2 section}
...

## Frequently asked questions (optional, 2–4 Qs)
...
```

Draft checklist:

- [ ] One clear H1 concept (title becomes page H1)
- [ ] H2s answer sub-questions; no skipped hierarchy
- [ ] Primary keyword in title, first paragraph, one H2 naturally
- [ ] 2+ internal links to other NewYou pages
- [ ] FAQ or summary block with quotable 134–167 word passage (AEO citability)
- [ ] Who/How/Why: who wrote it (NewYou team), how (product experience + policy refs), why (help user decide/use product)

### Step 4 — Humanize

Extract plain text from draft and run:

```bash
python3 ~/.claude/skills/seo/scripts/content_humanize.py \
  apps/web/content/blog/.drafts/{slug}.md \
  -o apps/web/content/blog/.drafts/{slug}.humanized.md
```

Review stderr change log. Manually fix anything the script missed (see Step 5).

### Step 5 — Em-dash + AI-pattern cleanup

1. Search draft for `—` and `–` → rewrite every occurrence.
2. Remove remaining AI tells: "delve", "landscape", "it's important to note", "game-changer", "leverage", "unlock the potential", "in today's fast-paced world".
3. Read aloud test: would a human coach say this?

### Step 6 — SEO + AEO polish

Apply **`seo-content`** checklist:

- E-E-A-T: link to `/privacy`, `/terms`, `/support` where relevant
- Readability: Flesch ~60–70; define jargon once
- Thin sections: merge or expand

Apply **`seo-geo`** checklist:

- First 30% of page contains the best standalone answer
- At least one **134–167 word** self-contained block (definition, summary, or FAQ answer)
- Quotable facts: specific product behavior, not vague marketing
- Do not add `llms.txt` changes unless user asks (site-wide concern)

Meta fields for `meta` export:

| Field | Rule |
|-------|------|
| `title` | 50–60 chars, no em dash, includes keyword |
| `description` | 150–160 chars, compelling, no em dash |
| `publishedAt` | ISO date `YYYY-MM-DD` |
| `readingTimeMinutes` | `ceil(wordCount / 220)` |

### Step 7 — Ship to apps/web

1. Create **`apps/web/content/blog/{slug}.tsx`** using [references/post-template.tsx](references/post-template.tsx).
2. Convert humanized markdown → JSX in `Content()`:
   - `<p>`, `<h2>`, `<ul>/<ol>`, `<strong>`
   - Internal links: `<Link href="/blog/...">` or `<Link href="/privacy">`
   - External: `<a href="..." rel="noopener noreferrer" target="_blank">`
3. Register in **`apps/web/lib/blog/index.tsx`** (import + add to `posts` array, newest first).
4. Delete or leave `.drafts/{slug}.*` (drafts are gitignored).

Optional: add BlogPosting JSON-LD in `apps/web/app/blog/[slug]/page.tsx` when user wants schema (follow **`seo-schema`**, type `BlogPosting`).

### Step 8 — Validate + typecheck

```bash
node .agents/skills/newyou-blog/scripts/validate-blog-post.mjs apps/web/content/blog/{slug}.tsx
cd apps/web && npm run typecheck && npm run build
```

Fix all errors before reporting done.

Show user:

- Post URL path: `/blog/{slug}`
- Meta title + description used
- Internal links added
- Validation summary (word count, em dash check, humanize count if re-run)

---

## Repo map

| Path | Purpose |
|------|---------|
| `apps/web/content/blog/{slug}.tsx` | Post source (`meta` + `Content`) |
| `apps/web/lib/blog/index.tsx` | Registry |
| `apps/web/app/blog/page.tsx` | Index |
| `apps/web/app/blog/[slug]/page.tsx` | Post layout + metadata |
| `apps/web/components/blog/BlogProse.tsx` | Typography |
| `apps/web/content/blog/.drafts/` | Markdown drafts (gitignored) |

## Existing posts (internal link targets)

| Slug | Topic |
|------|-------|
| `what-is-future-you` | Future You explainer |
| `how-we-handle-your-photos` | Privacy / photos |
| `cut-vs-bulk-vs-maintain` | Goal picking |

## Topic backlog (ready to brief)

See **`content-queue.json`** for the live queue. Pick the lowest `priority` item with `"status": "queued"`.

## Repeat / batch mode

Run the pipeline on repeat using one of these patterns.

### Option A — Manual "next post" (simplest)

Each session, say:

> **Use newyou-blog — publish next from queue**

The agent will:

1. Open `content-queue.json`
2. Pick the lowest-priority `queued` item
3. Run Steps 1–8
4. Set that item's `status` to `"published"` and add `"publishedAt": "YYYY-MM-DD"`

### Option B — Batch in one session

> **Use newyou-blog — publish the next 3 from queue**

Run the full pipeline sequentially. **Max 2 posts per session** unless the user explicitly asks for more (quality drops).

### Option C — Cursor Automation (hands-off weekly)

Create a **scheduled Cursor Automation** on the `website` branch:

| Field | Value |
|-------|-------|
| **Trigger** | Weekly (e.g. Monday 9am) |
| **Repo** | `fitnesstracker` · branch `website` |
| **Prompt** | Read `.agents/skills/newyou-blog/SKILL.md`. Publish the next queued post from `content-queue.json`. Commit only if user enabled auto-commit in automation settings. |

Requires the skill + queue to be **committed and pushed** on `website`.

### Option D — Loop for draft-only bursts

Use `/loop` to draft without shipping:

```
/loop 1d Use newyou-blog Step 3 only — draft next queued topic to .drafts/, do not ship
```

Good for building a backlog of humanized markdown, then shipping 1/week manually.

### Queue maintenance

Add new rows to `content-queue.json` with `status: "queued"`. Statuses: `queued` → `draft` → `published` (or `skipped`).

## Recommended posting volume

For **newyouai.app** today (new domain, YMYL fitness, small team):

| Cadence | Verdict |
|---------|---------|
| **1 post / week** | **Best default.** Enough signal for Google, sustainable quality, time to interlink. |
| **2 posts / month** | Minimum if weekly is too much. Still "active" if consistent. |
| **2 posts / week** | Only if drafts are pre-built and someone reviews each post. |
| **Daily** | Don't. Thin content hurts E-E-A-T; fitness is YMYL. |
| **10-post burst then silence** | Worse than steady 1/week. |

**Phase plan:**

1. **Month 1–2:** 1/week · cover core product (Future You, goals, privacy, subscription)
2. **Month 3–4:** 1/week · seasonal + comparison posts · refresh oldest post if product changed
3. **Month 5+:** stay at 1/week or drop to 2/month once ~20 solid posts exist; shift effort to carousels/Reels

**Quality gate:** never ship below 1,500 words topical coverage or with em-dash validation failures.

## Upstream skill paths

| Skill | Path |
|-------|------|
| Content brief | `~/.claude/skills/seo-content-brief/SKILL.md` |
| Content quality | `~/.claude/skills/seo-content/SKILL.md` |
| AEO / GEO | `~/.claude/skills/seo-geo/SKILL.md` |
| On-page SEO | `~/.claude/skills/seo-page/SKILL.md` |
| Schema | `~/.claude/skills/seo-schema/SKILL.md` |
| Humanizer script | `~/.claude/skills/seo/scripts/content_humanize.py` |

If Atlas portable pack is installed at `.agents/skills/` from `docs/portable/newyou-blog-skills/`, prefer those repo-local copies when present.

---

## Start command

When invoked, respond with:

1. Confirmation of topic + slug (or propose both)
2. Whether `.drafts/` and humanizer script are available
3. Brief outline preview (3–5 H2s)
4. Begin Step 2 unless blocked on topic
