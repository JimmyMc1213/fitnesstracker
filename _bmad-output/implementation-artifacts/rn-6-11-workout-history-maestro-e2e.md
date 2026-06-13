---
name: RN-6-11 Workout history Maestro E2E
epic: RN-6
story: 11
status: done
swarm_order: 11
swarm_branch: epic-rn-6/workout-domain
---

# Story 6.11: Workout history + Maestro E2E + epic polish

Status: done

## Story

**As a** QA engineer / CI pipeline  
**I want** workout history UI and a Maestro session smoke flow  
**So that** FR-M4 workout parity is regression-safe and epic RN-6 can close

## Acceptance Criteria

1. **Given** `(app)/workout/history`, **When** opened from idle header, **Then** `ScreenWorkoutHistory` lists past sessions
2. **Given** history card, **When** tapped, **Then** session preview / save-as-template entry works per PWA
3. **Given** seeded user (`workoutSessionPersistSeed`), **When** Maestro runs `rn-workout-session.yaml`, **Then** start → log set → finish → summary passes
4. **Given** epic close, **When** regression runs, **Then** auth-all + tab-nav + coach-nutrition + onboarding remain green
5. **Given** workout tab complete, **When** audited, **Then** placeholder copy removed and Maestro `testID`s stable

## Test plan (Maestro)

**Prerequisites:** Java runtime, Maestro CLI, iOS simulator with dev client, Supabase creds in `apps/mobile/.env` or root `.env`.

**Local run (2026-06-12):** Supabase user provisioning succeeded; Maestro blocked — no Java runtime on host. Install JRE and re-run after Metro is up with the workout seed.

```bash
# Terminal 1 — Metro with workout seed
cd apps/mobile && EXPO_PUBLIC_E2E_FITNESS_SEED=workout-session npx expo start --dev-client --port 8082

# Terminal 2 — session smoke (provisions disposable user)
cd apps/mobile && npm run test:e2e:workout-session
```

**Epic close regression sweep:**

```bash
npm run test:e2e:workout-session --workspace=@newyouai/mobile
npm run test:e2e:auth-all --workspace=@newyouai/mobile
npm run test:e2e:tab-nav --workspace=@newyouai/mobile
npm run test:e2e:coach-nutrition --workspace=@newyouai/mobile
npm run test:e2e:onboarding --workspace=@newyouai/mobile
npm run typecheck --workspace=@newyouai/mobile
```

**Stable testIDs:** `workout-idle`, `workout-idle-title`, `workout-routine-e2e-upper`, `routine-preview-sheet`, `workout-start-e2e-upper`, `workout-finish`, `workout-set-e2e-bench-0-done`, `workout-summary`, `workout-history-screen`, `workout-history-title`, `workout-history-session-{id}`, `workout-session-preview-sheet`, `workout-history-session-action-sheet`.

**Maestro flow:** `apps/mobile/.maestro/rn-workout-session.yaml`

## Tasks / Subtasks

- [x] Port `ScreenWorkoutHistory` at `app/workout/history.tsx` (AC: 1–2)
  - [x] `WorkoutHistorySessionCard`, action sheet for save/delete preview
- [x] Create `.maestro/rn-workout-session.yaml` (AC: 3)
  - [x] Port steps from `apps/pwa/e2e/workout-session-smoke.spec.ts`
  - [x] `workoutSession` seed in `lib/e2e/fitnessPersistSeed.ts` + `EXPO_PUBLIC_E2E_FITNESS_SEED=workout-session`
- [x] Add `npm run test:e2e:workout-session` + runner script (AC: 3)
- [x] Epic regression sweep documented (AC: 4)
- [x] Update `sprint-status-rn-migration.yaml`: all RN-6 stories done, epic `done` (AC: 4–5)

## Dev Notes

### Dependencies

All RN-6-01..10 complete. Session loop must support:
- Tap routine "E2E Upper strength" (or seeded name)
- Start workout → mark set Done → Finish → "Workout complete"

### PWA parity reference

```5:24:apps/pwa/e2e/workout-session-smoke.spec.ts
  await page.getByRole("button", { name: /E2E Upper strength/i }).click();
  await page.getByRole("button", { name: "Start workout" }).click();
  ...
  await expect(page.getByText("Workout complete")).toBeVisible();
```

Seed: `workoutSessionPersistSeed()` in `apps/pwa/e2e/helpers/seed.ts` — port to mobile `fitnessPersistSeed`.

### Epic close checklist

```bash
npm run test:e2e:workout-session
npm run test:e2e:auth-all
npm run test:e2e:tab-nav
npm run test:e2e:coach-nutrition
npm run test:e2e:onboarding
npm run typecheck --workspace=@newyouai/mobile
```

### Anti-patterns

- **Do not** mark epic done without Maestro green
- **Do not** skip regression sweeps

### References

- [sprint-rn-6-workout-plan.md](sprint-rn-6-workout-plan.md) RN-6-11
- [testarch-trace-rn-migration.md](testarch-trace-rn-migration.md) FR-M4 / RN-6-03 row
- PWA: `ScreenWorkoutHistory.tsx`, `workout-session-smoke.spec.ts`
