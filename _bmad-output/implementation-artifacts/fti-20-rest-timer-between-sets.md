# Story 1.9: Rest timer between sets (FTI-20)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user between sets,
I want an automatic rest countdown,
so that I stay on pace without a separate timer app.

## Acceptance Criteria

1. **Auto-start:** Timer starts automatically when a set is marked complete (`done: false → true`). Un-marking a set cancels an active timer for that exercise.
2. **Visible countdown:** Active rest countdown is shown on the exercise card that triggered it (not a global-only overlay).
3. **Default duration:** Default rest period is **60 seconds** for exercises without a per-exercise override.
4. **Early dismiss:** User can dismiss/skip the timer before it completes.
5. **Completion alert:** On timer completion, provide **haptic feedback** (`navigator.vibrate` when available) **and** a clear visual completion state on the bar.
6. **Configurable duration:** Global default rest duration in Settings; per-exercise override on the active exercise card (persisted by exercise identity key).

## Tasks / Subtasks

- [x] **Task 1: Persisted rest timer preferences** (AC: 3, 6)
  - [x] Add `restTimerDefaultSeconds: number` and `restTimerSecondsByExerciseKey: Record<string, number>` to `AppState` in `types.ts`
  - [x] Create `restTimerPreferences.ts` with `DEFAULT_REST_TIMER_SECONDS = 60`, normalize + merge helpers, preset list `[30, 60, 90, 120]`
  - [x] Wire through `persistFitnessSlice.ts`, `buildAppStateFromPersisted()`, `mergePersistedFitnessSlices.ts`
  - [x] Use `exerciseNoteKey(name, label)` for per-exercise map keys (same as exercise notes)

- [x] **Task 2: Rest timer UI component** (AC: 2, 4, 5)
  - [x] Create `RestTimerBar.tsx` under `src/fitness/`: shows remaining time, progress track, Dismiss button
  - [x] Visual completion state (accent pulse / "Rest complete" copy) when countdown hits 0
  - [x] Call `navigator.vibrate?.([200, 100, 200])` once on completion

- [x] **Task 3: Session integration in ScreenWorkout** (AC: 1, 2, 4, 6)
  - [x] Session-local `ActiveRestTimer` state (`exerciseId`, `endsAtMs`, `completed`), not persisted
  - [x] On set marked done, resolve duration from per-exercise map or global default; start timer for that exercise card
  - [x] Reuse existing 1s `tick` interval for countdown updates
  - [x] Render `RestTimerBar` inside matching exercise card (below target line or above set grid)
  - [x] Per-exercise duration stepper on bar (cycles presets), updates `restTimerSecondsByExerciseKey` and resets active countdown
  - [x] Clear timer on session end (`endSessionToIdle`) and when dismissing

- [x] **Task 4: Settings global default** (AC: 3, 6)
  - [x] Add "Rest timer" section in `SettingsSheet.tsx` with preset chips (30 / 60 / 90 / 120 sec)
  - [x] Copy explains default applies to all exercises unless overridden mid-workout

- [x] **Task 5: Verification** (AC: all)
  - [x] Manual: mark set done → timer appears on card; dismiss works; completion vibrates + visual flash
  - [x] Run `npm run build` (project quality gate, no unit tests)

## Dev Notes

### Primary implementation targets

- **`src/fitness/screens/ScreenWorkout.tsx`**, set toggle at ~999 (`updateSet` / done button); lifting phase exercise cards ~857-1060
- **New:** `RestTimerBar.tsx`, `restTimerPreferences.ts`
- **Touch:** `types.ts`, `persistFitnessSlice.ts`, `buildAppState.ts`, `mergePersistedFitnessSlices.ts`, `SettingsSheet.tsx`

### Architecture & constraints

- **Session timer is ephemeral**, `useState` in `ScreenWorkout` only; do not add to `WorkoutState` / persisted slice.
- **Preferences are persisted**, follow full pipeline: `types.ts` → `persistFitnessSlice` → `buildAppStateFromPersisted` → `mergePersistedFitnessSlices`.
- **No React Router;** no new tabs. Settings entry remains Home → gear sheet.
- **Quality gate:** `npm run build` only. No Vitest/Playwright.
- **Scope discipline:** Do not implement FTI-21 (swap exercise) or FTI-22+ in this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.9]
- [Source: _bmad-output/project-context.md#Persistence pipeline]
- [Source: src/fitness/exerciseNotes.ts#exerciseNoteKey]
- Linear: https://linear.app/ftiness-tracker/issue/FTI-20/rest-timer-between-sets

## Senior Developer Review (AI)

- Build gate: `npm run build` PASS
- All ACs implemented; no CRITICAL/HIGH findings after self-review
- Per-exercise preset cycle persists via `restTimerSecondsByExerciseKey` and resets active countdown

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Rest timer auto-starts on set completion via `toggleSetDone`; un-done clears timer for that exercise
- Global default (60s) + per-exercise overrides persisted through standard fitness slice pipeline
- Settings preset chips: 30 / 60 / 90 / 120 seconds

### File List

- src/fitness/types.ts
- src/fitness/restTimerPreferences.ts
- src/fitness/RestTimerBar.tsx
- src/fitness/persistFitnessSlice.ts
- src/fitness/buildAppState.ts
- src/fitness/mergePersistedFitnessSlices.ts
- src/fitness/screens/ScreenWorkout.tsx
- src/fitness/SettingsSheet.tsx
- _bmad-output/implementation-artifacts/fti-20-rest-timer-between-sets.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log

- 2026-05-21: FTI-20 rest timer, auto-start on set complete, RestTimerBar on exercise card, Settings global default, per-exercise preset override
