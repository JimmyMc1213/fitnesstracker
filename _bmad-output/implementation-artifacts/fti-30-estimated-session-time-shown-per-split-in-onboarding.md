# Story 2.2: Estimated session time in onboarding (FTI-30)

Status: done

## Story

As a new user reviewing my split during onboarding,
I want to see estimated session duration per workout day,
so that I know what I'm committing to before confirming my program.

## Acceptance Criteria

1. **Per-day estimate on review screen:** Given the user is on onboarding step 8 ("Review your program"), when each workout-day card is shown (collapsed or expanded), then a duration estimate is visible for that day (e.g. `Push — ~55 min` or equivalent secondary copy tied to that routine).

2. **Formula inputs:** Given a `WorkoutRoutineTemplate` with `exercises[]` and each exercise's `sets.length`, when the estimate is computed, then it incorporates exercise count, total/average sets, and a default average rest duration (use `DEFAULT_REST_TIMER_SECONDS` from `restTimerPreferences.ts` — user rest prefs are not set yet during onboarding).

3. **Subtle presentation:** Given the routine card header (`dayLabel · name` + `focus` subline), when the estimate renders, then it uses muted secondary styling (`fontSize: 12`, `rgba(255,255,255,0.45)` or existing `--muted` patterns) — not bold or primary emphasis.

4. **Live updates on edit:** Given the user changes exercises (swap, remove, reorder) or set counts on the review step, when `draftTemplates` updates via `OnboardingTemplateReview` `onChange`, then the displayed estimate for that routine recalculates immediately without navigation or refresh.

5. **No persistence change:** Given onboarding completes, when templates are saved to `workoutTemplates`, then no new `AppState` fields are required — estimates are derived at display time only.

6. **Build gate:** `npm run build` passes with strict TypeScript.

## Tasks / Subtasks

- [x] **Task 1: Session duration estimation module** (AC: 2, 4, 5)
  - [x] 1.1 Create `src/fitness/estimateSessionDuration.ts` with exported constants: `AVG_WORK_SECONDS_PER_SET` (default 45), `EXERCISE_TRANSITION_SECONDS` (default 60), `SESSION_WARMUP_BUFFER_SECONDS` (default 300 / 5 min) — document rationale in file comment only if non-obvious
  - [x] 1.2 Implement `estimateRoutineSessionSeconds(routine: WorkoutRoutineTemplate, restSeconds?: number): number` — sum per exercise: `sets × workSec + max(0, sets−1) × restSec`, plus transitions between exercises and warmup buffer; use `DEFAULT_REST_TIMER_SECONDS` when `restSeconds` omitted
  - [x] 1.3 Implement `formatEstimatedSessionMinutes(totalSec: number): string` returning rounded human copy like `~55 min` (round total minutes to nearest 5 before formatting; minimum display `~15 min` for non-empty routines)
  - [x] 1.4 Implement `estimatedSessionLabel(routine: WorkoutRoutineTemplate): string` composing `{routine.name} — ~{N} min` for header use (matches Linear example)

- [x] **Task 2: Wire estimate into onboarding template review UI** (AC: 1, 3, 4)
  - [x] 2.1 In `OnboardingTemplateReview.tsx`, import helpers and compute `estimatedSessionLabel(routine)` inside the `templates.map` loop (recomputes automatically on prop change)
  - [x] 2.2 Render estimate as muted secondary text on each routine card — preferred placement: third line under `focus`, or append to focus line as `{focus} · ~55 min`; do not replace the primary `dayLabel · name` title
  - [x] 2.3 When `routine.exercises.length === 0`, omit estimate (edge case; step continue is already disabled via `templatesValid` in `OnboardingFlow.tsx`)

- [x] **Task 3: Onboarding shell copy alignment (optional polish)** (AC: 1)
  - [x] 3.1 Consider updating step 7 subtitle in `OnboardingFlow.tsx` from "Reorder exercises…" to mention session time estimates (one line only; no layout change to `OnboardingShell`)
  - [x] 3.2 Skip if subtitle already clear enough after UI shows per-day estimates

- [x] **Task 4: Verification** (AC: 4, 6)
  - [x] 4.1 Run `npm run build` — must pass `tsc -b` and Vite build
  - [x] 4.2 Manual smoke: code-path verified (label in `templates.map`, all edit handlers call `onChange`); live UI blocked by AuthGate when Supabase configured without session

- [x] **Review Follow-ups (AI)**
  - [x] F2: Guard empty routines in `formatEstimatedSessionMinutes` / `estimatedSessionLabel` (return "" when totalSec <= 0 or no exercises)
  - [x] F4: Include `estimateSessionDuration.ts` in git commit
  - [x] F5: Include `sprint-status.yaml` in File List

## Senior Developer Review (AI)

**Reviewer:** BMAD Swarm code reviewer | **Date:** 2026-05-21 | **Recommendation:** APPROVED after fixes

| ID | Severity | Finding | Resolution |
| --- | --- | --- | --- |
| F1 | CRITICAL | Task 4.2 marked done without live UI walkthrough | Documented AuthGate blocker; code-path verification + build gate accepted |
| F2 | MEDIUM | 15 min floor applied when totalSec === 0 | Fixed: empty routines return "" from formatters |
| F3 | LOW | No automated tests for pure helpers | Deferred per project build-only gate |
| F4 | LOW | New file untracked | Staged in commit |
| F5 | LOW | sprint-status.yaml missing from File List | Added |

**AC validation:** All 6 ACs implemented. Build PASS.

## Change Log

- 2026-05-21: Initial implementation (estimateSessionDuration + OnboardingTemplateReview wiring)
- 2026-05-21: Review fixes — empty-routine guard in formatters

### Scope & placement

- **Target screen:** Onboarding step 7 (0-indexed step 7, label "Templates") — `OnboardingFlow.tsx` renders `<OnboardingTemplateReview templates={draftTemplates} onChange={setDraftTemplates} />`.
- **Do not** add estimates to post-onboarding workout tab, home screen, or template editor — FTI-30 is onboarding review only.
- **Do not** implement FTI-28 (notifications), FTI-31 (macro rings), or FTI-32 (water) in this story.

### Estimation formula (recommended — reconcile with Linear heuristic)

Linear describes: *exercises × average sets × average rest time*. That omits work time per set and transitions. **Use the fuller formula below** so estimates are plausible (~45–75 min for typical templates):

```
warmupBuffer
+ Σ exercises ( sets × WORK_SEC + max(0, sets−1) × restSec )
+ (exerciseCount − 1) × TRANSITION_SEC
```

- `restSec` = `DEFAULT_REST_TIMER_SECONDS` (60) during onboarding
- Round displayed minutes to nearest 5 (`~55 min`, not `~57 min`)
- Pure function over `WorkoutRoutineTemplate` — no reads from `AppState`

### Existing code to reuse

| Area | File | Notes |
| --- | --- | --- |
| Review UI | `OnboardingTemplateReview.tsx` | Card header at lines 48–50; all edit paths call `onChange` → live recalc |
| Template shape | `types.ts` `WorkoutRoutineTemplate`, `WorkoutExercise` | `sets: WorkoutSet[]` — count via `sets.length` |
| Rest default | `restTimerPreferences.ts` `DEFAULT_REST_TIMER_SECONDS` | Same default used in active workouts pre-preference |
| Template builder | `workoutSplitByDays.ts` `buildWorkoutTemplatesForDays` | Seeds `draftTemplates` when user picks schedule (step 6→7) |
| Duration formatting | `workoutSummary.ts` `formatWorkoutDuration` | Elapsed-time formatter (mm:ss) — **not** suitable for estimates; use new `formatEstimatedSessionMinutes` |
| Prior sprint pattern | `homeGreeting.ts` (FTI-29) | Small pure helper module + minimal screen wiring — follow same pattern |

### Persistence & architecture (from project-context.md)

- **No new `AppState` fields** — estimates are computed at render time from in-memory `draftTemplates` during onboarding; persisted templates unchanged.
- **Do not** write to localStorage directly; onboarding finish already sets `workoutTemplates: draftTemplates` in `OnboardingFlow.finish()`.
- **No Tailwind, no test runner** — verification is `npm run build` only + manual `?previewOnboarding=1` smoke.
- **Styling:** match existing onboarding cards — inline styles + `.card`; muted secondary `rgba(255,255,255,0.45)`.
- **Strict TS:** new module must satisfy `noUnusedLocals` / `noUnusedParameters`.

### UX presentation

- Linear example: `Push — ~55 min`
- Keep `dayLabel · name` as primary title; show estimate as secondary detail (not competing with exercise list when expanded)
- Tilde prefix signals approximation — always use `~` in display string

### Prior story learnings (FTI-29)

- FTI-29 established helper-module + thin UI wiring pattern (`homeGreeting.ts` → `ScreenHome.tsx`).
- FTI-29 explicitly scoped out FTI-30+ — this story owns session-time estimates only.
- Onboarding step indices: schedule = step 6, template review = step 7, nutrition = step 8.

### Linear issue (primary product input)

- **linear:** FTI-30
- **linear_url:** https://linear.app/ftiness-tracker/issue/FTI-30/estimated-session-time-shown-per-split-in-onboarding
- **Title:** Estimated session time shown per split in onboarding
- **Status (Linear):** Todo | **Priority:** Low
- **Linear-only detail:** Description specifies estimate on "split selection/review screen" and formula as exercises × avg sets × avg rest — epics.md matches AC list; use recommended fuller formula above for realistic durations.

### Concerns / ambiguities for dev

1. **Formula ambiguity:** Linear's multiplicative heuristic vs. sum-of-sets model — story recommends sum-of-sets + transitions; if product wants strict Linear formula, estimates will skew low.
2. **Warmup buffer:** Templates may include `warmupItems` — not required to parse for v1; fixed buffer constant is acceptable.
3. **Experience/equipment variants:** Different templates from `buildWorkoutTemplatesForDays` change exercise count — estimates should vary accordingly (automatic if formula reads live `draftTemplates`).
4. **Empty routine:** Should not occur when Continue enabled; omit label if `exercises.length === 0`.

### Parallel implementation groups

| Group | Tasks | Can run in parallel with |
| --- | --- | --- |
| A — Pure logic | Task 1 (all subtasks) | — (start here) |
| B — UI wiring | Task 2 | After Task 1 exports exist |
| C — Copy polish | Task 3 | After Task 2 (or parallel if dev reads estimate labels) |
| D — Verification | Task 4 | After Tasks 1–2 complete |

### Project Structure Notes

```
src/fitness/
  estimateSessionDuration.ts   ← NEW (pure helpers)
  OnboardingTemplateReview.tsx ← MODIFY (display estimate)
  OnboardingFlow.tsx           ← OPTIONAL subtitle tweak
  restTimerPreferences.ts      ← READ ONLY (DEFAULT_REST_TIMER_SECONDS)
  types.ts                     ← READ ONLY (WorkoutRoutineTemplate)
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2]
- [Source: _bmad-output/project-context.md#Persistence pipeline]
- [Source: _bmad-output/project-context.md#Framework-Specific Rules]
- [Source: src/fitness/OnboardingTemplateReview.tsx]
- [Source: src/fitness/OnboardingFlow.tsx#step 7]
- [Source: src/fitness/restTimerPreferences.ts#DEFAULT_REST_TIMER_SECONDS]
- [Source: _bmad-output/implementation-artifacts/fti-29-personalized-home-screen-greeting-post-onboarding.md]
- Linear: https://linear.app/ftiness-tracker/issue/FTI-30/estimated-session-time-shown-per-split-in-onboarding

## Dev Agent Record

### Agent Model Used

Composer (swarm story-dev)

### Debug Log References

(none)

### Completion Notes List

- Added `estimateSessionDuration.ts` pure helpers: warmup buffer + per-set work/rest + exercise transitions; display rounds to nearest 5 min with `~` prefix and 15 min floor.
- `OnboardingTemplateReview`: third muted line per card (`Push — ~55 min` pattern); omitted when `exercises.length === 0`; recalculates on every `onChange` via props.
- `OnboardingFlow` step 7 subtitle mentions per-day session time estimates.
- `npm run build` PASS (tsc -b + Vite).
- Review fix: empty-routine guard prevents misleading `~15 min` for zero-exercise routines.
- `npm run build` PASS after review fixes.

### File List

- src/fitness/estimateSessionDuration.ts (new)
- src/fitness/OnboardingTemplateReview.tsx (modified)
- src/fitness/OnboardingFlow.tsx (modified)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)
