---
name: RN-PUSH-01 Scheduler core extract + Vitest
epic: RN-PUSH
story: 01
status: ready-for-dev
swarm_order: 1
swarm_branch: epic-rn-push/local-notifications
---

# Story PUSH-01: Scheduler core extract + Vitest

Status: ready-for-dev

<!-- Ultimate context engine analysis completed — comprehensive developer guide for RN-PUSH kickoff -->

## Story

**As a** developer  
**I want** PWA `notificationScheduler` pure logic extracted to `packages/core` with Vitest coverage  
**So that** RN-PUSH-02..04 can schedule native notifications and PWA can share the same eligibility + copy rules

## Acceptance Criteria

1. **Given** PWA `notificationScheduler.ts`, **When** pure functions live in `packages/core/src/notifications/`, **Then** PWA file re-exports core and existing PWA `notificationScheduler.test.ts` still pass (or delegate to core tests)
2. **Given** `permissionGranted: false`, **When** `shouldFireWorkoutReminder` / `shouldFireNutritionReminder` run, **Then** both return `false` without reading DOM or `window`
3. **Given** workout completed today or `lastFiredWorkoutReminderDateKey === todayKey`, **When** `shouldFireWorkoutReminder` runs on a training day after reminder time, **Then** returns `false`
4. **Given** nutrition logged for today or `lastFiredNutritionReminderDateKey === todayKey`, **When** `shouldFireNutritionReminder` runs after reminder time, **Then** returns `false`
5. **Given** granted permission + enabled toggles + eligible state, **When** payload builders run, **Then** titles/tags match PWA (`Workout day`, `Nutrition check-in`, `fitcoach-workout`, `fitcoach-nutrition`) and bodies use `getNotificationBody` from core `coachEngine`
6. **Given** current state + `permissionGranted`, **When** `computeNotificationPatches(state, now, permissionGranted)` runs, **Then** returns optional `workoutPayload`, `nutritionPayload`, and `notificationPreferences` patch with `lastFired*` date keys — **no side effects**

## Tasks / Subtasks

- [ ] Create `packages/core/src/notifications/notificationScheduler.ts` (AC: 2–6)
  - [ ] `NotificationPayload` type: `{ title, body, tag: FitcoachNotificationTag, icon?: string }`
  - [ ] `FitcoachNotificationTag = "fitcoach-workout" | "fitcoach-nutrition"`
  - [ ] `isAtOrPastHHmm(now, hhmm)` — use `normalizeTimeHHmm` from `../sync/notificationPreferences`
  - [ ] `hasNutritionLoggedForDateKey(state, dateKey)` — port from PWA using `effectiveNutritionTotalsForDateKey`
  - [ ] `shouldFireWorkoutReminder(now, state, permissionGranted: boolean)`
  - [ ] `shouldFireNutritionReminder(now, state, permissionGranted: boolean)`
  - [ ] `buildWorkoutNotificationPayload(state, now?)`, `buildNutritionNotificationPayload(state, now?)`
  - [ ] Re-export `isTrainingDay` from `../training/trainingCalendar` (match PWA public API)
  - [ ] `computeNotificationPatches(state, now, permissionGranted)` — pure merge of shouldFire + payload + prefs patch
- [ ] Colocated Vitest `notificationScheduler.test.ts` (AC: 2–5)
  - [ ] Port cases from `apps/pwa/src/fitness/notificationScheduler.test.ts`
  - [ ] Use `minimalAppState` from `../coach/testFixtures/appStateFixtures` (already in core)
  - [ ] Cover `isTrainingDay`, workout/nutrition shouldFire edge cases, payload copy assertions
  - [ ] Add `computeNotificationPatches` unit tests (both fire, neither fire, partial)
- [ ] Export from `packages/core/src/index.ts`
- [ ] PWA thin shim (AC: 1)
  - [ ] `apps/pwa/src/fitness/notificationScheduler.ts` — import pure functions from `@newyouai/core`
  - [ ] Keep async `checkAndFireDueNotifications(state, setState)` in PWA only — calls core `computeNotificationPatches` + `showFitcoachNotification`
  - [ ] Map `getNotificationPermission() === "granted"` into `permissionGranted` arg
- [ ] Run gates

## Dev Notes

### Current state

| File | Today | This story |
|------|-------|------------|
| `apps/pwa/src/fitness/notificationScheduler.ts` | 146 lines; sync permission via DOM | Core pure logic + PWA fire wrapper |
| `packages/core/coach/coachEngine.ts` | Done | `buildCoachContext`, `getNotificationBody` — already used by scheduler |
| `packages/core/training/trainingCalendar.ts` | Done | `isTrainingDay` |
| `packages/core/sync/notificationPreferences.ts` | Done | `normalizeTimeHHmm`, defaults |
| `apps/mobile` | No scheduler | Consumes core in RN-PUSH-02..03 |

**Blocks RN-PUSH-02..04** — no `expo-notifications`, no React providers in this story.

### PWA parity reference

```52:73:apps/pwa/src/fitness/notificationScheduler.ts
export function shouldFireWorkoutReminder(now: Date, state: AppState): boolean {
  // workoutReminderEnabled, permission, completed today, lastFired, time, isTrainingDay
}
export function shouldFireNutritionReminder(now: Date, state: AppState): boolean {
  // nutritionCheckInEnabled, permission, logged today, lastFired, time
}
```

```107:145:apps/pwa/src/fitness/notificationScheduler.ts
export async function checkAndFireDueNotifications(state, setState) {
  // fire showFitcoachNotification + patch lastFired* keys
}
```

**Scope:** PWA scheduler fires **workout + nutrition only**. Morning/weekly toggles exist in UI but have no scheduler handlers — do not add them.

### Architecture compliance

- Core must remain **framework-agnostic** — no React, `window`, `Notification`, or `expo-notifications`
- Permission is an explicit boolean parameter — never import mobile `notificationPermission.ts` into core
- Use `@newyouai/types` `AppState` / `NotificationPreferences` — do not fork types
- Icon field optional in core (native ignores web favicon path)

### File structure requirements

```
packages/core/src/notifications/
  notificationScheduler.ts
  notificationScheduler.test.ts
```

### Recommended pure API

```typescript
export type NotificationPatchResult = {
  workoutPayload?: NotificationPayload;
  nutritionPayload?: NotificationPayload;
  notificationPreferences?: Partial<
    Pick<NotificationPreferences, "lastFiredWorkoutReminderDateKey" | "lastFiredNutritionReminderDateKey">
  >;
};

export function computeNotificationPatches(
  state: AppState,
  now: Date,
  permissionGranted: boolean,
): NotificationPatchResult;
```

PWA wrapper applies payloads via `showFitcoachNotification`; RN-PUSH-02 schedules via expo.

### Anti-patterns

- **Do not** import `expo-notifications` in core or PWA scheduler extract
- **Do not** add morning/weekly review firing — out of epic scope
- **Do not** touch onboarding/settings UI (RN-PUSH-03)
- **Do not** break coachEngine ↔ scheduler cycle — core already has coachEngine separate from notifications folder

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run test --workspace=@newyouai/pwa    # notificationScheduler.test.ts if kept in PWA
npm run typecheck --workspace=@newyouai/mobile
```

**Layer 1 (required):** Vitest in `packages/core`  
**Layer 2 (Maestro):** None — logic-only story

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Pure scheduler + `computeNotificationPatches` | expo-notifications adapter (RN-PUSH-02) |
| Vitest port from PWA | NotificationSchedulerProvider (RN-PUSH-03) |
| PWA re-export + async fire wrapper | Permission prompt wiring (RN-PUSH-03) |
| `isTrainingDay` re-export | UAT / copy polish (RN-PUSH-04) |

### References

- [sprint-rn-push-plan.md](sprint-rn-push-plan.md) RN-PUSH-01
- [prd-rn-migration.md](../planning-artifacts/prd-rn-migration.md) FR-M12
- [testarch-trace-rn-migration.md](testarch-trace-rn-migration.md) FR-M12 → `notificationScheduler.test.ts`
- PWA: `notificationScheduler.ts`, `notificationScheduler.test.ts`, `testFixtures/appStateFixtures.ts`
- Core: `coachEngine.ts`, `trainingCalendar.ts`, `sync/notificationPreferences.ts`

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
