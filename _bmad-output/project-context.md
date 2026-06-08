# New You AI — Project Context

**Last updated:** 2026-06-08 (monorepo migration)

---

## Repository layout

| Path | Purpose |
|------|---------|
| `apps/pwa/` | Product PWA (`@newyouai/pwa`) — primary codebase |
| `apps/pwa/src/fitness/` | Core app logic (~430 files) |
| `apps/web/` | Marketing site (`newyouai.app`) |
| `apps/admin/` | Staff dashboard (`admin.newyouai.app`) |
| `packages/config/` | Shared Tailwind preset + tsconfig base |
| `packages/types/` | Shared types stub (PWA still uses `apps/pwa/src/fitness/types.ts`) |
| `supabase/` | Migrations + Edge Functions (repo root) |

**Production:** `app.newyouai.app` (PWA). Deploy docs: `docs/vercel.md`.

---

## Week boundary rules

New You AI uses **two intentional week definitions** — they are not bugs.

| Surface | Week starts | Week ends | Rationale |
| --- | --- | --- | --- |
| **Streak calendar** (Home header dots) | **Sunday** | Saturday | Visual habit chain aligned with US calendar columns (S M T W T F S) |
| **Weekly summary** (workouts, volume, nutrition days) | **Monday** | Sunday | Training-week accounting; copy says "resets Monday" |
| **Coach weigh-in trend** | Monday-aligned windows | — | `coachEngine` uses `startOfWeekMonday` for week-over-week weight deltas |

### Pure helpers (`apps/pwa/src/fitness/trainingCalendar.ts`)

- `startOfWeekSunday(dateKey)`: streak calendar anchor
- `startOfWeekMonday(dateKey)`: re-export from `weeklySummary.ts`
- `weekDateKeysSundayStart(anchor)` / `weekDateKeysMondayStart(anchor)`: 7-day key arrays

### Streak vs summary on Sundays

On Sunday, the streak dot row shows the **Sun–Sat** week containing today, while the weekly summary card may still reflect the **Mon–Sun** training week that ends today. Both are correct for their purpose; do not unify without a product decision.

---

## Quality gates

From repo root:

```bash
npx turbo run typecheck build test
npm run test:e2e --workspace=@newyouai/pwa
```

---

## Sprint tracking

See `_bmad-output/implementation-artifacts/sprint-status.yaml` and `planning-artifacts/epics.md`.
