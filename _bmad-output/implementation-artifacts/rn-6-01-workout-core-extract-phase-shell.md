---
name: RN-6-01 Workout core extract + phase shell
epic: RN-6
story: 01
status: ready-for-dev
swarm_order: 1
swarm_branch: epic-rn-6/workout-domain
---

# Story 6.01: Workout core extract + phase shell

Status: ready-for-dev

## Story

**As a** developer  
**I want** workout pure logic in `packages/core` and a phase-routing Workout screen shell  
**So that** RN session UI stories share one tested foundation and idle/lifting routing works

## Acceptance Criteria

1. **Given** PWA workout modules, **When** extracted to `packages/core`, **Then** PWA re-exports unchanged API and existing Vitest passes
2. **Given** onboarded user, **When** I open Workout tab, **Then** placeholder is replaced with shell that reads `state.workout.sessionPhase`
3. **Given** `sessionPhase === "idle"`, **When** shell renders, **Then** idle slot is shown (content RN-6-02)
4. **Given** `sessionPhase === "lifting"`, **When** shell renders, **Then** lifting slot is shown (content RN-6-03+)
5. **Given** active lifting session or routine editor flag, **When** tab layout renders, **Then** tab bar is hidden (RN-3 deferral)
6. **Given** Maestro tab-nav, **When** `npm run test:e2e:tab-nav` runs, **Then** Workout tab still reachable with `testID="tab-workout"`

## Tasks / Subtasks

- [ ] Extract to `packages/core/src/workout/` (AC: 1)
  - [ ] `workoutAutofill.ts` + colocated test (from `apps/pwa/src/fitness/workoutAutofill.ts`)
  - [ ] `workoutPreviousSets.ts` + test (`buildSetCompletionPatch`, `canCompleteSet`)
  - [ ] `finishWorkout.ts` + test (from `apps/pwa/src/fitness/finishWorkout.ts`)
  - [ ] `exerciseSessionNotes.ts` + test (session coach note builders)
  - [ ] Export from `packages/core/src/index.ts`; PWA files become thin re-exports
- [ ] Replace `(tabs)/workout.tsx` placeholder (AC: 2–4)
  - [ ] `useFitnessState` for read/patch of `state.workout`
  - [ ] Phase switch: idle vs lifting child components (stubs OK with visible dev labels)
  - [ ] Preserve `testID="tab-workout"` on root `SafeAreaView` / scroll container
- [ ] Scaffold `(app)/workout/history.tsx` empty shell (AC: 2)
  - [ ] Stack route reachable via `router.push`; title "History"; content RN-6-11
- [ ] Tab bar hide hook (AC: 5)
  - [ ] Context or fitness-derived flag: hide when `sessionPhase === "lifting"` OR `routineEditorOpen`
  - [ ] Wire into `TabBarDock` or `(tabs)/_layout.tsx` `tabBarStyle: { display: 'none' }`
- [ ] Run gates (AC: 1, 6)

## Dev Notes

### Current state

| File | Today | This story |
|------|-------|------------|
| `apps/mobile/app/(tabs)/workout.tsx` | `TabPlaceholderScreen` | Phase shell |
| `packages/core` | merge helpers, `workoutTarget`, templates | Add autofill/finish/previousSets/sessionNotes |
| `apps/pwa/src/fitness/workoutAutofill.ts` | Source of truth | Re-export from core |
| `FitnessProvider` | RN-5 done | Use `setFitnessState` for workout patches |

**Blocks RN-6-02..11** — no session UI until core extract lands.

### PWA parity reference

```80:85:apps/pwa/src/fitness/screens/ScreenWorkout.tsx
export function ScreenWorkout({ state, setState, onRoutineEditorOpenChange }: ScreenProps) {
  // sessionPhase drives idle dashboard vs WorkoutLiftingScreen
```

```22:25:apps/pwa/src/fitness/finishWorkout.ts
export function finishWorkout(state: AppState, endedAtMs = Date.now()): FinishWorkoutResult | null {
  const w = state.workout;
  if (w.sessionPhase !== "lifting") return null;
```

### Architecture compliance

- Route: `(tabs)/workout` per `architecture-rn-migration.md` §3
- History route: `(app)/workout/history` stack push (not modal)
- Branding: **NewYou** / **New You AI** only — no Gymmy in user-facing copy

### Anti-patterns

- **Do not** port full `ScreenWorkout` monolith in one PR
- **Do not** add `react-native-draggable-flatlist` yet (RN-6-04)
- **Do not** wire cloud sync (RN-OFFLINE)
- **Do not** break `npm run test:e2e:tab-nav`

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run test --workspace=@newyouai/pwa   # until PWA tests move with re-exports
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:tab-nav
```

### References

- [sprint-rn-6-workout-plan.md](sprint-rn-6-workout-plan.md) RN-6-01
- PWA: `ScreenWorkout.tsx`, `finishWorkout.ts`, `workoutAutofill.ts`, `workoutPreviousSets.ts`, `exerciseSessionNotes.ts`
- Mobile: `context/FitnessContext.tsx`, `app/(tabs)/workout.tsx`
