---
name: RN-PUSH-02 expo-notifications local adapter
epic: RN-PUSH
story: 02
status: ready-for-dev
swarm_order: 2
swarm_branch: epic-rn-push/local-notifications
---

# Story PUSH-02: expo-notifications local adapter

Status: ready-for-dev

<!-- Ultimate context engine analysis completed — depends on RN-PUSH-01 core scheduler exports -->

## Story

**As an** onboarded user with notification permission granted  
**I want** workout and nutrition reminders scheduled as native local notifications  
**So that** I receive PWA-parity reminders even when NewYou is not in the foreground

## Acceptance Criteria

1. **Given** permission granted + workout reminder enabled on a training day, **When** `syncLocalNotifications(state)` runs, **Then** a daily notification is scheduled with identifier `fitcoach-workout` at `workoutReminderTime` (local timezone) and title/body from core payload builders
2. **Given** permission granted + nutrition check-in enabled, **When** `syncLocalNotifications(state)` runs, **Then** a daily notification is scheduled with identifier `fitcoach-nutrition` at `nutritionCheckInTime`
3. **Given** toggle off or permission not granted, **When** sync runs, **Then** corresponding scheduled notification is cancelled (no orphan triggers)
4. **Given** workout already completed today or nutrition logged today, **When** sync runs, **Then** that day's reminder is cancelled/skipped (reschedule on next state change)
5. **Given** app in foreground when a notification fires, **When** handler runs, **Then** banner/alert presents per platform defaults (configure `setNotificationHandler`)
6. **Given** `app.config.ts`, **When** dev client rebuilds, **Then** iOS includes user-facing notification permission copy via `expo-notifications` plugin config

## Tasks / Subtasks

- [ ] Create `apps/mobile/lib/localNotifications.ts` (AC: 1–4)
  - [ ] Constants: `WORKOUT_NOTIFICATION_ID = "fitcoach-workout"`, `NUTRITION_NOTIFICATION_ID = "fitcoach-nutrition"`
  - [ ] `cancelFitcoachNotification(id)` — `cancelScheduledNotificationAsync`
  - [ ] `cancelAllFitcoachReminders()` — cancel both IDs
  - [ ] `scheduleWorkoutReminder(state, permissionGranted)` — skip if !enabled || !permission || !training day logic via core `shouldFire*` pre-check OR cancel when ineligible
  - [ ] `scheduleNutritionReminder(state, permissionGranted)` — skip if !enabled || !permission || nutrition logged
  - [ ] `syncLocalNotifications(state, permissionGranted)` — orchestrates cancel + schedule for both kinds
  - [ ] Trigger: `SchedulableTriggerInputTypes.DAILY` (or calendar daily) at parsed HH:mm from prefs
  - [ ] Content: `{ title, body, data: { tag } }` from `@newyouai/core` payload builders
- [ ] Configure notification handler in app entry (AC: 5)
  - [ ] In `app/_layout.tsx` or `lib/localNotifications.ts` init: `Notifications.setNotificationHandler({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false })`
  - [ ] Lazy-import `expo-notifications` (match `notificationPermission.ts` pattern)
- [ ] Update `app.config.ts` (AC: 6)
  - [ ] Expand `expo-notifications` plugin entry with iOS permission string, e.g. `"New You AI sends workout and nutrition reminders you choose in Settings."`
  - [ ] Optional: `icon` / `color` for Android parity (iOS uses app icon)
- [ ] Colocated unit tests where practical (mock dynamic import of expo-notifications)
- [ ] Run gates

## Dev Notes

### Previous story intelligence (RN-PUSH-01)

- All eligibility logic lives in `@newyouai/core` — **do not duplicate** `isAtOrPastHHmm`, training day, or nutrition-logged checks in the adapter
- Use `buildWorkoutNotificationPayload` / `buildNutritionNotificationPayload` for copy at schedule time
- `computeNotificationPatches` is for foreground reconcile (RN-PUSH-03) — adapter focuses on **scheduled** triggers

### Current state

| File | Today | This story |
|------|-------|------------|
| `apps/mobile/lib/notificationPermission.ts` | get/request permission | Consumed by sync entry |
| `apps/mobile/package.json` | `expo-notifications ~56.0.0` | Use existing dep |
| `apps/mobile/app.config.ts` | Bare `"expo-notifications"` plugin | Add permission copy |
| `apps/pwa/.../registerNotificationServiceWorker.ts` | Web show path | **Not ported** — replaced by schedule |

### Scheduling strategy (RN vs PWA)

| PWA | RN (this story) |
|-----|-----------------|
| Poll every 60s while tab visible | `scheduleNotificationAsync` daily trigger |
| Fire via `showFitcoachNotification` | Pre-schedule; cancel when ineligible |
| Copy at fire time | Copy at schedule time — RN-PUSH-03 will reschedule on state changes |

For **daily repeating** triggers: on each `syncLocalNotifications`, cancel existing ID then reschedule with fresh body from current state.

### Training-day nuance

Workout reminder only applies on training days. Options (pick one, document in PR):

- **A (recommended):** Schedule daily at workout time; on sync, if today is not a training day, cancel workout ID until next sync on a training day
- **B:** Only call `scheduleWorkoutReminder` when `isTrainingDay(now, templates, daysPerWeek)` is true for "today" — may miss tomorrow's schedule until next app open

Prefer **A + full sync on app foreground** (RN-PUSH-03) for reliability.

### Architecture compliance

- Keep `expo-notifications` imports **mobile-only** — never in `packages/core`
- Match notification tags/IDs to PWA: `fitcoach-workout`, `fitcoach-nutrition`
- Dev client rebuild required after `app.config.ts` plugin changes — note in PR description

### File structure requirements

```
apps/mobile/lib/
  localNotifications.ts
  localNotifications.test.ts   # optional mocks
app.config.ts                  # plugin permission string
app/_layout.tsx                # setNotificationHandler init
```

### Anti-patterns

- **Do not** schedule morning/weekly review — PWA scheduler never fires them
- **Do not** implement Future You OS push (`futureYou.remindersMuted` is in-app UI only)
- **Do not** upload APNs tokens / server push (post-MVP)
- **Do not** add NotificationSchedulerProvider yet (RN-PUSH-03) — export sync function callable from provider later

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test --workspace=@newyouai/core   # RN-PUSH-01 must stay green
```

**Layer 1:** Optional mocked unit tests for ID/trigger parsing  
**Layer 2 (Maestro):** None

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Schedule/cancel workout + nutrition local notifications | Provider lifecycle / debounce (RN-PUSH-03) |
| Notification handler foreground presentation | Onboarding permission on continue (RN-PUSH-03) |
| iOS permission string in app.config | UAT checklist (RN-PUSH-04) |
| `syncLocalNotifications` exported API | Stale UI copy removal (RN-PUSH-04) |

### References

- [sprint-rn-push-plan.md](sprint-rn-push-plan.md) RN-PUSH-02
- [research/pwa-to-react-native-migration-research.md](../planning-artifacts/research/pwa-to-react-native-migration-research.md) §7
- Expo: `scheduleNotificationAsync`, `cancelScheduledNotificationAsync`, daily trigger
- PWA tags: `registerNotificationServiceWorker.ts` `FitcoachNotificationTag`
- Depends: **RN-PUSH-01** core exports

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
