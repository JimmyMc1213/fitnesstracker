# Story 4.1: UI bug sweep — dev copy, unicode, token fix (FTI-41)

Status: done

## Story

As a user,
I want Settings and Habits copy to show polished product text with no developer debug strings or parse errors,
so the app feels production-ready on every screen.

## Acceptance Criteria

1. **Steps habit subtitle (user-facing):** Given the Daily steps habit on Habits tab (until FTI-44 moves it), when the habit is incomplete and uses the run icon default subtitle, then copy reads `{stepsTarget formatted} steps · Week {planWeekIndex}` (e.g. `10,000 steps · Week 1`) — **no** `program week`, `anchor`, or ISO date strings.

2. **Daily plan dev copy scrubbed:** Given `generateDailyTasksForDate` nutrition task titles in `dailyPlan.ts`, when tasks render anywhere user-visible, then titles do **not** include `(program week X/12, started YYYY-MM-DD)` — use user-facing week shorthand only or move debug detail out of title strings.

3. **CSS lime token fix:** Given `src/index.css` defines `--lime`, when the token is read, then `--lime` equals `#4ade80` (same family as `--pos`), **not** `#ffffff`.

4. **Settings text sanitization:** Given user edits `displayName` or habit template names in Settings, when values save to state/persist, then literal `\uXXXX` escape sequences and other invalid unicode escapes are stripped or rejected before persist — no raw escape sequences shown in UI.

5. **Persist parse safety:** Given corrupted or invalid JSON in local fitness persist keys, when `JSON.parse` runs in `persistFitnessSlice.ts` / related loaders, then failures are caught, logged once to console with `[Fitcoach]` prefix, and the app falls back to defaults — **no** uncaught "Unicode escape sequence" or SyntaxError surfaced to users in Settings.

6. **Scope guard:** No Nutrition tab rebuild, no button color sweep (FTI-42), no Home layout changes (FTI-43+).

7. **Build gate:** `npm run build` and `npm test` pass.

## Tasks / Subtasks

- [x] **Task 1: Habits + dailyPlan copy** (AC: 1, 2)
  - [x] 1.1 Update `ScreenHabits.tsx` run-icon fallback subtitle to `Target ${stepsGoal.toLocaleString()} steps · Week ${progWeek}`.
  - [x] 1.2 Scrub `dailyPlan.ts` nutrition task title — remove anchor ISO and `(program week …)` from user-facing strings; keep week number if needed for coach voice in shorter form.
  - [x] 1.3 Grep repo for `program week`, `anchor ${`, `planStartIso` in user-visible strings — fix any remaining leaks.

- [x] **Task 2: `--lime` token** (AC: 3)
  - [x] 2.1 Change `:root { --lime: #4ade80; }` in `index.css`.
  - [x] 2.2 Verify `.lime` class still reads correctly (color via token or explicit).

- [x] **Task 3: Text sanitization helper** (AC: 4)
  - [x] 3.1 Add `sanitizeUserText(input: string): string` in a small pure module (e.g. `userText.ts`) — strip `\u[0-9a-fA-F]{0,3}(?![0-9a-fA-F])` partial escapes and normalize trim.
  - [x] 3.2 Apply on `displayName` commit in `SettingsSheet.tsx` and habit name `onChange` / blur.
  - [x] 3.3 Colocated unit test for sanitize helper.

- [x] **Task 4: Persist parse safety** (AC: 5)
  - [x] 4.1 Wrap `JSON.parse` in `persistFitnessSlice.ts` (and `dailyPlan.ts` load if applicable) with try/catch returning `{}` or null on failure.
  - [x] 4.2 Ensure Settings sync error display never shows raw JSON.parse exception strings — map to friendly copy.

- [x] **Task 5: Verification** (AC: 7)
  - [x] 5.1 `npm run build` + `npm test`.

## Dev Notes

### Why FTI-41 runs first

Screenshot audit flagged dev copy and Settings unicode issues as **fix today** items. Token fix unblocks FTI-42 button sweep.

**Execution order:** FTI-41 → FTI-42 → FTI-43 → FTI-44 → FTI-45 → FTI-46.

### Key files

- `src/fitness/screens/ScreenHabits.tsx` — line ~86 dev subtitle
- `src/fitness/dailyPlan.ts` — nutrition task title ~191
- `src/index.css` — `--lime: #ffffff` bug
- `src/fitness/persistFitnessSlice.ts` — JSON.parse
- `src/fitness/SettingsSheet.tsx` — displayName + habit names

### References

- Sprint 4 party-mode decisions (2026-05-23)
- [Source: _bmad-output/implementation-artifacts/sprint-status.yaml]

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Replaced dev subtitle on Habits steps row with user-facing week copy.
- Nutrition daily-plan task title uses `Week N` shorthand; no anchor ISO in user strings.
- Fixed `--lime` CSS token to match `--pos` green.
- Added `sanitizeUserText` for display name and habit names; added `safeJsonParse` with one-time `[Fitcoach]` console warnings.
- Sync errors map JSON/unicode parse failures to friendly Settings copy.
- 72 tests pass; build succeeds.

### File List

- `src/fitness/screens/ScreenHabits.tsx`
- `src/fitness/dailyPlan.ts`
- `src/fitness/dailyPlan.test.ts`
- `src/index.css`
- `src/fitness/userText.ts`
- `src/fitness/userText.test.ts`
- `src/fitness/safeJsonParse.ts`
- `src/fitness/persistFitnessSlice.ts`
- `src/fitness/SettingsSheet.tsx`
- `src/fitness/fitnessCloudSync.ts`

## Senior Developer Review (AI)

- No blocking findings after implementation review.
- `.lime` class intentionally uses `--text` for typography; `--lime` token corrected for downstream FTI-42 button work.

## Change Log

- 2026-05-23: FTI-41 UI bug sweep — dev copy scrub, lime token, text sanitization, persist parse safety.
