---
name: RN-10-05 Reminders + Training + Habits + Program panels
epic: RN-10
story: 05
status: ready-for-dev
swarm_order: 5
swarm_branch: epic-rn-10/settings-account
---

# Story 10.05: Reminders + Training + Habits + Program panels

Status: ready-for-dev

<!-- Ultimate context engine analysis completed — comprehensive developer guide for RN-10-05 -->

## Story

**As a** user  
**I want** to configure reminders, rest timer, equipment, habits, and program settings  
**So that** training and tracking preferences match PWA panels ST-09 through ST-13

## Acceptance Criteria

1. **Given** Reminders panel (ST-09), **When** I toggle workout/nutrition/morning/weekly prefs, **Then** `notificationPreferences` persists (same keys as PWA `notificationScheduler`)
2. **Given** notification permission denied, **When** Reminders panel opens, **Then** status row shows denied/undetermined without crash (`expo-notifications` getPermissionsAsync)
3. **Given** eligible Future You user, **When** Reminders panel opens, **Then** NewYou reminder mute toggle visible (`futureYouReminderSettingVisible` logic from PWA lines 222–242)
4. **Given** Rest timer panel (ST-10), **When** I pick duration, **Then** `restTimerDefaultSeconds` persists; workout session uses new default (RN-6)
5. **Given** Equipment panel (ST-11), **When** I change setup, **Then** `equipmentSetup` persists and `rebuildWorkoutTemplatesForEquipment` updates `workoutTemplates`
6. **Given** Habits panel (ST-12), **When** I add/edit/delete habit template, **Then** `habitTemplates` updates; delete shows confirm sheet
7. **Given** Program panel (ST-13), **When** I edit steps target, **Then** `stepsTarget` persists and hub Program trailing updates

## Tasks / Subtasks

- [ ] Create `RemindersPanel.tsx` (AC: 1–3)
  - [ ] Port `NotificationPreferencesPicker` from PWA
  - [ ] Wire toggles to `notificationPreferences` slice; use `DEFAULT_NOTIFICATION_PREFERENCES` from `@newyouai/core`
  - [ ] Permission row via `expo-notifications`
  - [ ] Future You mute toggle: `futureYou.remindersMuted` on fitness state
  - [ ] Reuse/port logic from `apps/mobile/lib/notificationPreferences.ts`
- [ ] Create `RestTimerPanel.tsx` (AC: 4)
  - [ ] Port `RestTimerDurationPicker` + `formatRestDuration` display
- [ ] Create `EquipmentPanel.tsx` (AC: 5)
  - [ ] Port `EquipmentSetupPicker`; labels from `EQUIPMENT_SETUP_LABELS`
  - [ ] On save call `rebuildWorkoutTemplatesForEquipment` (port from PWA `workoutTemplateBuilder.ts` or use core if extracted)
- [ ] Create `HabitsPanel.tsx` (AC: 6)
  - [ ] Habit list CRUD: name, icon picker (`drop`/`run`/`bolt`/`moon`), enabled flag
  - [ ] Delete confirm — reuse `WorkoutConfirmSheet` pattern or port `DeleteConfirmSheet`
  - [ ] `newHabitId()` uuid helper from PWA
- [ ] Create `ProgramPanel.tsx` (AC: 7)
  - [ ] Steps target editor (`stepsTarget` number)
  - [ ] Any program summary rows from PWA program section
- [ ] Wire `[panel].tsx` for all five panel ids
- [ ] Run typecheck + core tests if notification merge touched

## Dev Notes

### Current state

| Item | Today | This story |
|------|-------|------------|
| `packages/core/sync/notificationPreferences` | Normalizer + merge | Reminders UI reads/writes same shape |
| `apps/mobile/lib/notificationPreferences.ts` | Thin helpers | Extend or colocate picker component |
| RN-6 workout | Reads `restTimerDefaultSeconds` | Verify after rest timer edit |
| RN-5 home habits | Reads `habitTemplates` | Habits panel is source of truth for templates |
| RN-PUSH | Not started | **Do not schedule** notifications — persist toggles only |

### PWA parity reference

```523:557:apps/pwa/src/fitness/screens/ScreenSettings.tsx
// Hub: reminders, program, rest-timer, equipment, habits
```

```222:242:apps/pwa/src/fitness/screens/ScreenSettings.tsx
// futureYouReminderSettingVisible
```

Inventory ST-09..ST-13 in [pwa-codebase-inventory.md](../planning-artifacts/pwa-codebase-inventory.md).

### Implementation guidance

- **Reminders vs RN-PUSH:** This story saves preference shape only. `notificationScheduler.ts` scheduling lands RN-PUSH; keys must match for forward compatibility.
- **Equipment rebuild:** Changing equipment can invalidate workout templates — call same rebuild function PWA uses before persisting.
- **Habits icons:** Port `iconButton` helper from PWA `ScreenSettings.tsx` (lines 161–184) as RN Pressable grid.
- **Future You mute:** Toggle `futureYou.remindersMuted` on fitness state; RN-9 Home entry respects this.

### Anti-patterns

- **Do not** call `scheduleNotificationAsync` (RN-PUSH)
- **Do not** implement sign-out/delete (RN-10-06)
- **Do not** fork notification preference types — use `@newyouai/types` `NotificationPreferences`

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test --workspace=@newyouai/core   # if notificationPreferences touched
# Manual: change rest timer → start workout session → default rest matches
# Manual: add habit → Home daily habits card shows new habit
```

### References

- [sprint-rn-6-workout-plan.md](sprint-rn-6-workout-plan.md) — rest timer prefs deferred to RN-10
- [sprint-rn-9-future-you-plan.md](sprint-rn-9-future-you-plan.md) — FY reminder toggle
- PWA: `NotificationPreferencesPicker.tsx`, `RestTimerDurationPicker.tsx`, `EquipmentSetupPicker.tsx`, `notificationScheduler.ts`

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
