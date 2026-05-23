# Story 4.4: Daily habits on Home, remove Habits tab (FTI-44)

Status: done

## Story

As a user,
I want daily habits on Home with visible progress instead of a half-empty Habits tab,
so check-ins feel integrated with my coached day.

## Acceptance Criteria

1. **Habits tab removed:** Given bottom navigation in `FitnessApp.tsx`, when the app renders, then there is **no** Habits tab, nav items: Home, Nutrition, Workout, Progress (4 tabs).

2. **Home habits card:** Given today view on Home, when habits exist in state, then a **Daily habits** card renders below Fuel strip with:
   - Header: `Daily habits` + progress ` {done}/{total}` (tabular nums)
   - Thin horizontal progress bar (0-100% width from done/total)
   - Same habit rows as current `ScreenHabits` (icon, name, subtitle, toggle) with tighter vertical padding

3. **Subtitle copy:** Incomplete run habit shows FTI-41 user copy (`10,000 steps · Week N`), not dev strings.

4. **Toggle behavior preserved:** Tapping habit toggle updates `habits`, `habitsDoneByDay` identically to current `ScreenHabits.tsx` logic (extract shared handler if needed).

5. **Historical date view:** When viewing a past day via streak header, habits card shows completion state for **that** date key (read from `habitsDoneByDay[activeDateKey]`), or hide card on historical view if rebuild cost high; **preferred:** show read-only completion for that day.

6. **Settings unchanged:** Habits checklist customization remains in Settings (`habitTemplates` editor).

7. **ScreenHabits.tsx:** Delete file or keep as unused, prefer **delete** + remove import/route from `FitnessApp.tsx`. No dead routes.

8. **Deep links / navigate("habits"):** Grep and remove or redirect any `navigate("habits")` to Home.

9. **Scope guard:** No habit streak history, weekly habit view, or icon picker expansion (deferred).

10. **Build gate:** `npm run build` and `npm test` pass.

## Tasks / Subtasks

- [ ] **Task 1: `HomeDailyHabitsCard` component** (AC: 2, 3, 4)
  - [ ] 1.1 Create `src/fitness/HomeDailyHabitsCard.tsx`: extract toggle logic from `ScreenHabits.tsx`.
  - [ ] 1.2 Progress bar at top of card.

- [ ] **Task 2: Wire ScreenHome** (AC: 2, 5)
  - [ ] 2.1 Insert card after `HomeFuelStrip`, before weigh-in block.
  - [ ] 2.2 Pass `activeDateKey` for historical toggle/read-only behavior.

- [ ] **Task 3: Remove Habits tab** (AC: 1, 7, 8)
  - [ ] 3.1 Update `FitnessApp.tsx` tab config + screen map.
  - [ ] 3.2 Remove `ScreenHabits.tsx` if fully migrated.
  - [ ] 3.3 Update `TabId` type in `types.ts`: remove `"habits"` or keep for internal stretch-only if needed (grep usages).

- [ ] **Task 4: Verification** (AC: 10)
  - [ ] 4.1 Smoke: toggle habits on Home, verify persist, 4-tab nav, no empty Habits screen.

## Dev Notes

### Party-mode decision

Habits as a nav slot rejected, 4 toggles with dead space reads unfinished. Fold into Home until post–nutrition-rebuild scope review.

### Depends on

- FTI-41 (subtitle copy)
- FTI-43 (stack slot below fuel strip)

### Key files

- `src/fitness/FitnessApp.tsx`: tab bar ~190
- `src/fitness/screens/ScreenHabits.tsx`: migrate then delete
- `src/fitness/types.ts`: `TabId`

## Dev Agent Record

### Agent Model Used

(pending)

### Completion Notes List

(pending)

### File List

(pending)
