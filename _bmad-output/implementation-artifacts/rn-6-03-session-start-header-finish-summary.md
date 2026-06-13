---
name: RN-6-03 Session start header finish summary
epic: RN-6
story: 03
status: done
swarm_order: 3
swarm_branch: epic-rn-6/workout-domain
---

# Story 6.03: Session start + header + finish + summary

Status: done

## Story

**As a** user  
**I want** to start a workout, see session progress in the header, finish, and view a summary  
**So that** the core session lifecycle matches the PWA loop

## Acceptance Criteria

1. **Given** idle dashboard, **When** I confirm start on a routine, **Then** `sessionPhase` becomes `"lifting"`, exercises clone from template, timestamps set
2. **Given** active session, **When** header renders, **Then** title, elapsed clock, and Finish button match PWA `WorkoutSessionHeader`
3. **Given** at least one completed set, **When** I tap Finish, **Then** `finishWorkout()` persists history, clears session, returns to idle
4. **Given** successful finish, **When** summary opens, **Then** `WorkoutSummarySheet` shows "Workout complete" + session title + duration
5. **Given** zero completed sets, **When** Finish tapped, **Then** empty-finish confirm path is stubbed (full sheet RN-6-09)
6. **Given** finish, **When** session ends, **Then** `sessionCoachNotesByExerciseId` is cleared

## Tasks / Subtasks

- [x] Start session handler (AC: 1)
  - [x] Clone template exercises via `cloneExercisesForNewSession` pattern from PWA `data.ts`
  - [x] Set `splitId`, `sessionTitle`, `sessionDayKey`, `sessionStartedAtMs`, `sessionBaselineExerciseOrder`
  - [x] Autofill sets via `@newyouai/core` `buildSetsForExercise` / `autofillExerciseSets`
- [x] Port `WorkoutSessionHeader` + sticky variant (AC: 2)
  - [x] Elapsed timer from `sessionStartedAtMs`
  - [x] `testID="workout-finish"`
- [x] Finish flow (AC: 3–4, 6)
  - [x] Call `finishWorkout` from core; apply `setFitnessState` with returned state
  - [x] `WorkoutSummarySheet` modal/bottom sheet with dismiss → idle
- [x] Begin Maestro seed helper in `apps/mobile/lib/e2e/` (AC: 3)
  - [x] Port `workoutSessionPersistSeed` shape from PWA `e2e/helpers/seed.ts`
- [x] `testID`s: `workout-summary`, `workout-session-header`

## Dev Notes

### Previous story intelligence (RN-6-02)

- Start CTA lives on idle dashboard routine cards
- Tab bar should hide once lifting phase active (RN-6-01)

### PWA parity reference

```5:22:apps/pwa/e2e/workout-session-smoke.spec.ts
test("Workout tab: start session → log set → finish → summary", async ({ page }) => {
  ...
  await page.getByRole("button", { name: "Start workout" }).click();
  await page.getByRole("button", { name: "Finish workout" }).click();
  await expect(page.getByText("Workout complete")).toBeVisible();
```

PWA: `WorkoutSessionHeader.tsx`, `WorkoutSessionStickyHeader.tsx`, global `WorkoutSummarySheet`, `finishWorkout.ts`.

### Anti-patterns

- **Do not** require set logging for finish in this story — Maestro can tap Done on placeholder set row until RN-6-05
- **Do not** implement full empty-finish sheet yet (RN-6-09) — block finish with alert OK for zero sets
- **Do not** show template order update prompt UI yet (RN-6-09)

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run typecheck --workspace=@newyouai/mobile
```

Manual: start → finish with one set marked done → summary visible.

### References

- [sprint-rn-6-workout-plan.md](sprint-rn-6-workout-plan.md) RN-6-03
- PWA: `ScreenWorkout.tsx` start/finish handlers, `finishWorkout.ts`
