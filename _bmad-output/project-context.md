# Fitcoach, Project Context

**Last updated:** 2026-05-23 (FTI-51 week boundary rules)

---

## Week boundary rules

Fitcoach uses **two intentional week definitions**, they are not bugs.

| Surface | Week starts | Week ends | Rationale |
| --- | --- | --- | --- |
| **Streak calendar** (Home header dots) | **Sunday** | Saturday | Visual habit chain aligned with US calendar columns (S M T W T F S) |
| **Weekly summary** (workouts, volume, nutrition days) | **Monday** | Sunday | Training-week accounting; copy says "resets Monday" |
| **Coach weigh-in trend** | Monday-aligned windows |, | `coachEngine` uses `startOfWeekMonday` for week-over-week weight deltas |

### Pure helpers (`src/fitness/trainingCalendar.ts`)

- `startOfWeekSunday(dateKey)`: streak calendar anchor
- `startOfWeekMonday(dateKey)`: re-export from `weeklySummary.ts`
- `weekDateKeysSundayStart(anchor)` / `weekDateKeysMondayStart(anchor)`: 7-day key arrays

### Streak vs summary on Sundays

On Sunday, the streak dot row shows the **Sun–Sat** week containing today, while the weekly summary card may still reflect the **Mon–Sun** training week that ends today. Both are correct for their purpose; do not unify without a product decision.

---

## Quality gates

- `npm run build`
- `npm test` (Vitest, pure modules)
- `npm run test:e2e` (Playwright, coach navigation + fuel quick-log; builds without Supabase env)

---

## Sprint tracking

See `_bmad-output/implementation-artifacts/sprint-status.yaml` and `planning-artifacts/epics.md`.
