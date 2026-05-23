# Story 4.6: Settings section IA + notification copy (FTI-46)

Status: done

## Story

As a user opening Settings,
I want clearly grouped sections and confident reminder copy,
so I can find options without scrolling a wall of undifferentiated controls.

## Acceptance Criteria

1. **Section order with headers:** Settings scroll content uses this order with existing `SectionLabel` components:
   1. **Account** — Sync & backup (email/password, signed-in state)
   2. **You** — First name (home greeting)
   3. **Units** — Unit preference picker
   4. **Training** — Default rest timer, Equipment setup, Goal range (when `progressGoal` present)
   5. **Nutrition** — Fuel targets (cal/macros), Hydration target *(Nutrition tab rebuild out of scope — settings targets stay)*
   6. **Reminders** — Notification preferences picker only
   7. **Habits checklist** — Template editor (rename, 4 icons, add/remove)
   8. **Program** — Block start date, Steps target

2. **No duplicate reminder disclaimers:** Given Reminders section, when rendered, then the long duplicate paragraph in `SettingsSheet.tsx` (~387–390) about "Reminders appear while Fitcoach is open" is **removed** — single explanation lives in `NotificationPreferencesPicker`.

3. **Notification copy rewrite:** Given `NotificationPreferencesPicker.tsx` footer hint, when shown, then copy reads: `Reminders work while Fitcoach is open. Background notifications coming soon.` — **no** "Closed-app reminders require a future update."

4. **Habit icons:** Keep 4 icons (`drop`, `run`, `bolt`, `moon`) — no expansion this sprint.

5. **Visual separators:** Optional subtle spacing between major sections (`marginTop: 24` on section labels after first) — no new components required.

6. **Scope guard:** No nutrition tab UI, no habit nav (FTI-44), no primary button sweep beyond pills already in FTI-42.

7. **Build gate:** `npm run build` and `npm test` pass.

## Tasks / Subtasks

- [ ] **Task 1: Reorder Settings blocks** (AC: 1, 5)
  - [ ] 1.1 Refactor `SettingsSheet.tsx` JSX order to match AC #1.
  - [ ] 1.2 Move "You" / displayName up from current position (~498) to after Account.
  - [ ] 1.3 Group Training blocks (rest, equipment, goal range).

- [ ] **Task 2: Reminder copy dedupe** (AC: 2, 3)
  - [ ] 2.1 Remove redundant Settings body copy under Reminders.
  - [ ] 2.2 Update `NotificationPreferencesPicker.tsx` footer paragraph (~226–229).

- [ ] **Task 3: Settings habits copy** (AC: 4)
  - [ ] 3.1 Update helper text if it references "Habits tab" → "Home daily habits card".

- [ ] **Task 4: Verification** (AC: 7)
  - [ ] 4.1 Scroll smoke: all sections present, sync still works, notification picker unchanged functionally.

## Dev Notes

### Current structure issues

Settings is one long scroll — Account, Units, Rest, Reminders, Hydration, Equipment, Goal, You, Fuel, Habits, Program interleaved non-intuitively.

### Depends on

- FTI-44 (habits tab removed — update Settings copy references)

## Dev Agent Record

### Agent Model Used

(pending)

### Completion Notes List

(pending)

### File List

(pending)
