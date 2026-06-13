---
name: RN-PUSH-03 Reschedule lifecycle + permission wiring
epic: RN-PUSH
story: 03
status: ready-for-dev
swarm_order: 3
swarm_branch: epic-rn-push/local-notifications
---

# Story PUSH-03: Reschedule lifecycle + permission wiring

Status: ready-for-dev

<!-- Ultimate context engine analysis completed — wires RN-PUSH-01 core + RN-PUSH-02 adapter into app lifecycle -->

## Story

**As an** onboarded user who enables reminders in onboarding or Settings  
**I want** the OS permission prompt and automatic rescheduling when my prefs or fitness activity change  
**So that** reminders stay accurate without manual app restarts

## Acceptance Criteria

1. **Given** user completes onboarding step 25 with any reminder enabled and taps "Set up notifications", **When** continue runs, **Then** `requestNotificationPermission()` is invoked before persisting prefs and `syncLocalNotifications` runs after grant
2. **Given** onboarded user on tabs with `onboardingComplete: true` and permission `granted`, **When** fitness state or `notificationPreferences` change, **Then** debounced `syncLocalNotifications` runs within ~500ms
3. **Given** permission changes to `denied`, **When** provider detects change, **Then** all fitcoach scheduled notifications are cancelled
4. **Given** app returns to foreground (`AppState` `active`), **When** onboarded + granted, **Then** optional reconcile runs: `computeNotificationPatches` + present immediate local notification if due + patch `lastFired*` in fitness state (PWA visibility parity)
5. **Given** Settings ST-09 "Enable notifications" pressed and permission granted, **When** permission updates, **Then** reschedule runs without requiring app restart
6. **Given** a notification is presented (scheduled or reconcile), **When** fire succeeds, **Then** `lastFiredWorkoutReminderDateKey` / `lastFiredNutritionReminderDateKey` update in persisted fitness slice for today

## Tasks / Subtasks

- [ ] Create `apps/mobile/context/NotificationSchedulerContext.tsx` (AC: 2–6)
  - [ ] `NotificationSchedulerProvider` — child of `FitnessProvider`, sibling/inside `FitnessSyncProvider` OK
  - [ ] Read `state`, `setFitnessState` from `useFitnessState()`
  - [ ] Track permission via `getNotificationPermission()` on mount + when app foregrounds
  - [ ] `useEffect` when `state?.onboardingComplete` + permission: call `syncLocalNotifications(state, granted)`
  - [ ] Debounced effect on deps: `notificationPreferences`, `workoutsCompletedByDay`, `nutritionItemsByDay`, `nutritionManualByDay`, `workoutTemplates`, `onboardingProfile?.workoutDaysPerWeek`
  - [ ] On permission revoked: `cancelAllFitcoachReminders()`
- [ ] Wire provider in `app/_layout.tsx` (AC: 2)
  - [ ] `<NotificationSchedulerProvider>` wraps nav inside `FitnessProvider` (after fitness hydrate)
- [ ] Foreground reconcile (AC: 4, 6)
  - [ ] Subscribe `AppState.addEventListener("change", active => ...)`
  - [ ] Call core `computeNotificationPatches(state, now, granted)`
  - [ ] If payload present: `scheduleNotificationAsync` immediate or `presentNotificationAsync` pattern + apply prefs patch via `setFitnessState`
  - [ ] Mutex ref to prevent overlapping reconcile (mirror PWA `schedulerRunningRef`)
- [ ] Onboarding OB-25 permission (AC: 1)
  - [ ] In `apps/mobile/app/(onboarding)/index.tsx` step 25 continue path: when `anyNotificationEnabled(notificationPrefs)`, await `requestNotificationPermission()` before `goNext`
  - [ ] Do **not** prompt on step 24 prompt alone — only when user opts in on step 25 continue (matches "Set up notifications" CTA)
- [ ] Settings permission → reschedule (AC: 5)
  - [ ] Ensure `RemindersPanel` / `NotificationPreferencesPicker` `onPermissionChange` triggers reschedule (export hook `useNotificationSchedulerSync()` or context callback)
- [ ] Notification response listener (AC: 6)
  - [ ] `Notifications.addNotificationReceivedListener` or `addNotificationResponseReceivedListener` — patch `lastFired*` when workout/nutrition notification delivered
- [ ] Run gates + manual smoke on simulator

## Dev Notes

### Previous story intelligence

| Story | Provides |
|-------|----------|
| RN-PUSH-01 | `computeNotificationPatches`, `shouldFire*`, payload builders |
| RN-PUSH-02 | `syncLocalNotifications`, `cancelAllFitcoachReminders`, handler config |

### Current state

| File | Today | This story |
|------|-------|------------|
| `app/_layout.tsx` | `AuthProvider` → `FitnessProvider` → `FitnessSyncProvider` | Add `NotificationSchedulerProvider` |
| `(onboarding)/index.tsx` step 25 | Persists prefs only; no permission request on continue | Request permission when reminders enabled |
| `RemindersPanel.tsx` | Permission row + picker | Reschedule after grant |
| `NotificationPreferencesPicker.tsx` | "Enable notifications" button in settings variant | Wire to reschedule callback |
| PWA `FitnessApp.tsx` L273–302 | 60s interval + visibility | RN: debounced sync + AppState active reconcile |

### Provider placement

```tsx
<AuthProvider>
  <FitnessProvider>
    <FitnessSyncProvider>
      <NotificationSchedulerProvider>
        {/* RootLayoutNav */}
      </NotificationSchedulerProvider>
    </FitnessSyncProvider>
  </FitnessProvider>
</AuthProvider>
```

Do **not** reschedule during onboarding wizard before `onboardingComplete` — prefs are draft until success (RN-4). Provider should no-op until `state.onboardingComplete === true`.

### Onboarding nuance

Step 25 `NotificationPreferencesPicker` uses `variant="onboarding"` — **no** permission button in onboarding variant today. Permission must happen on **Continue** when `remindersEnabled`, not on each toggle.

Skip path (`skipReminders`) resets to `ONBOARDING_NOTIFICATION_DEFAULTS` — no permission prompt.

### Debounce recommendation

Use `useDebouncedCallback` or manual `setTimeout` 500ms — avoid rescheduling on every keystroke in time fields; depend on committed `notificationPreferences` object from fitness state.

### Anti-patterns

- **Do not** rebuild reminders UI — RN-10 owns ST-09
- **Do not** duplicate auth or cloud sync logic
- **Do not** remove "coming soon" copy here — RN-PUSH-04
- **Do not** schedule during `(onboarding)` route if `onboardingComplete` still false

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test --workspace=@newyouai/core
```

**Layer 1:** Core tests from RN-PUSH-01  
**Layer 2 (Maestro):** None — OS permission dialog not automatable  
**Manual smoke:** Enable reminders in Settings → grant on simulator → verify scheduled count via debug log or `getAllScheduledNotificationsAsync` in dev

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Provider + debounced sync + permission wiring | UAT doc (RN-PUSH-04) |
| OB-25 continue permission prompt | Remove stale picker copy (RN-PUSH-04) |
| Foreground reconcile + lastFired patches | Server push token registry |
| Settings grant → reschedule | Maestro flow |

### References

- [sprint-rn-push-plan.md](sprint-rn-push-plan.md) RN-PUSH-03
- PWA: `FitnessApp.tsx` scheduler loop, `OnboardingFlow.tsx` `handleNotificationPromptChoice`
- Mobile: `app/_layout.tsx`, `(onboarding)/index.tsx` step 25, `RemindersPanel.tsx`
- Depends: **RN-PUSH-01**, **RN-PUSH-02**

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
