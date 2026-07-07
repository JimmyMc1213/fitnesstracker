---
name: generate-carousel
description: >-
  Generate TikTok/Instagram-style carousel slides by overlaying bold white
  captioned text on user images. Uses Playwright + HTML/CSS rendering at
  1080x1920 with TikTok-style font, stroke, and layout. Use when the user
  wants a carousel, slideshow, slide deck, TikTok photo post, text on
  images, or says "generate carousel", "throw text on", or provides images
  with copy for multiple slides.
---

# Generate Carousel

Produce vertical carousel slides (1080×1920) with TikTok-style text overlays. **Do not change the text style** unless the user explicitly asks — the look is intentional and tested.

## Text style (locked)

| Property | Value |
|----------|-------|
| Font | `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif` |
| Weight | `700` |
| Color | `#fff` |
| Stroke | 4-direction black outline + soft shadow (see `scripts/render.mjs`) |
| Headline size | `58px` |
| Subline size | `50px` |
| Badge size | `46px` |
| Copy width | `88%`, centered |

### Layout defaults

| Slide type | `top` | Notes |
|------------|-------|-------|
| Title (no number) | `24%` | One headline only |
| Numbered + subline | `44%` | Headline + subline stacked |
| Badge / callout slide | `20%` headline + badge at `right: 7%; bottom: 16%` | e.g. app name near phone |

### Numbering

- Title slides have **no** number.
- Numbered slides start at `1.` on the first content slide (not the title).
- Use `headline` + optional `subline` for two-line slides.

## Workflow

```
Task Progress:
- [ ] 1. Collect images + copy per slide (confirm order)
- [ ] 2. Repeat back slide plan table if anything is ambiguous
- [ ] 3. Scaffold campaign folder
- [ ] 4. Write slides.json + copy assets
- [ ] 5. Render
- [ ] 6. Open outputs for review
```

### Step 1 — Gather spec

From the user, collect:
- Image files (chat attachments, workspace paths, or URLs to download)
- Slide order
- Per-slide copy: `headline`, optional `subline`, optional `badge`
- Whether a slide is a title (no number) or numbered

### Step 2 — Confirm plan

Before rendering, show a table:

| # | Image | Line 1 | Line 2 / badge |
|---|-------|--------|----------------|
| 1 | … | … | … |

Skip only when the user already gave an explicit, complete spec and said to proceed.

### Step 3 — Scaffold folder

Create a campaign under `marketing/carousel/<slug>/`:

```
marketing/carousel/<slug>/
├── assets/       # source images
├── build/        # generated HTML (gitignore ok)
├── out/          # final PNGs
├── slides.json   # slide config
└── render.mjs    # copy from skill script
```

Copy the renderer:

```bash
cp .agents/skills/generate-carousel/scripts/render.mjs marketing/carousel/<slug>/render.mjs
```

Reference example: `marketing/tiktok/` (first NewYou carousel).

### Step 4 — Write `slides.json`

Schema:

```json
{
  "id": "campaign-slug",
  "slides": [
    {
      "id": "01-title",
      "image": "field.png",
      "headline": "How to become the best version of yourself.",
      "top": "24%"
    },
    {
      "id": "02-gym",
      "image": "gym.png",
      "headline": "1. Lift Heavy",
      "subline": "at least three times a week",
      "top": "44%",
      "imagePosition": "center top"
    },
    {
      "id": "04-phone",
      "image": "phone.png",
      "headline": "3. See your potential",
      "badge": "\u201cNewYou AI\u201d app",
      "top": "20%"
    }
  ]
}
```

**Per-slide fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Sortable id, e.g. `01-field` |
| `image` | yes | Filename in `assets/` |
| `headline` | yes | Main text (include `1.` prefix when numbered) |
| `subline` | no | Second line, smaller, centered under headline |
| `badge` | no | Corner callout (HTML allowed for smart quotes) |
| `top` | no | Vertical position of copy block (default `42%`) |
| `imagePosition` | no | CSS `object-position` (default `center center`) |
| `headlineSize` / `sublineSize` / `badgeSize` | no | Override sizes only if user asks |
| `badgeRight` / `badgeBottom` | no | Override badge position |

Copy images into `assets/` with short names (`field.png`, `gym.png`, …).

### Step 5 — Render

Requires `playwright` (already used in this repo) and macOS `sips` for resize.

```bash
node marketing/carousel/<slug>/render.mjs marketing/carousel/<slug>/slides.json
```

Outputs: `out/<slide-id>-1080x1920.png` (one per slide).

Re-run after any `slides.json` or placement tweak.

### Step 6 — Review

- Open all `out/*.png` for the user (`open_resource` or Finder).
- If text overlaps the subject or safe zones, adjust `top`, `imagePosition`, or sizes — **not** the font/style.
- Iterate until approved.

## Placement tips

- **Square or odd aspect images**: set `imagePosition` (e.g. `center top`) so `object-fit: cover` keeps the subject visible.
- **Title on busy backgrounds**: `top: 24%` keeps copy in open sky/negative space.
- **Phone / product slides**: lower headline (`top: 20%`), badge bottom-right.
- **Long headlines**: they wrap naturally at 88% width; shorten copy before shrinking font.

## Do not

- Switch fonts, colors, or stroke style without explicit user request.
- Use Canva, ImageMagick text, or PIL unless Playwright is unavailable — then match this spec exactly.
- Commit large binary outputs unless the user asks.

## Reference

- Full example config: [references/slides.example.json](references/slides.example.json)
- Renderer source: [scripts/render.mjs](scripts/render.mjs)
- Live example output: `marketing/tiktok/out/`
