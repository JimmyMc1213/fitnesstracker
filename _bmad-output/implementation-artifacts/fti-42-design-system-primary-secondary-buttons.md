# Story 4.2: Design system, primary & secondary buttons (FTI-42)

Status: done

## Story

As a user,
I want every primary action to look the same (lime green) across Home, Workout, and coach surfaces,
so CTAs are obvious and on-brand.

## Acceptance Criteria

1. **Shared button components:** Given any screen needs a primary or secondary CTA, when implemented, then developers use `PrimaryButton` and `SecondaryButton` exported from `shared.tsx` (or colocated `Button.tsx` re-exported from shared), not ad-hoc inline `#ffffff` / `#0A84FF` fills for primary actions.

2. **Primary styling:** `PrimaryButton` uses background `var(--pos)` / `#4ade80`, text `#0a0a0a`, border-radius 12px, full-width when `block` prop set, min tap height 44px.

3. **Secondary styling:** `SecondaryButton` uses background `var(--card-2)`, border `var(--border)`, text `#fff` or muted white, **not** blue.

4. **Workout tab:** "Start an empty workout" uses `PrimaryButton` (lime). "+ New routine" link uses secondary/muted text styling, not `ACCENT_BLUE`.

5. **Home coach + stretch:** `TodaysCoachPlanCard` primary task CTA and nightly stretch inner CTA use `PrimaryButton`: no white blob (`#ffffff` fill removed from primary CTAs).

6. **Blue reserved for coach info:** Informational coach chips (e.g. Weekly summary "Next week" panel) may keep blue tint; **primary actions** on those surfaces still use lime when they are buttons.

7. **Settings preset pills:** Rest timer and water target selected state uses green border/fill tint (match `--pos`), not `#0A84FF` selected styling.

8. **Token consolidation:** `workoutUiTokens.ts` exports `PRIMARY_GREEN = "#4ade80"` (or references CSS var pattern documented in Dev Notes); migrate `ACCENT_GREEN` call sites for **primary** CTAs only, coach blue tokens remain for coach card accents.

9. **Scope guard:** No Home layout / habits IA (FTI-43/44), no Progress changes (FTI-45).

10. **Build gate:** `npm run build` and `npm test` pass.

## Tasks / Subtasks

- [ ] **Task 1: Button components** (AC: 1, 2, 3)
  - [ ] 1.1 Add `PrimaryButton` + `SecondaryButton` to `shared.tsx` (or `Button.tsx` + export).
  - [ ] 1.2 Props: `children`, `onClick`, `disabled`, `block`, `aria-label`, `className` optional.

- [ ] **Task 2: Workout screen sweep** (AC: 4)
  - [ ] 2.1 `ScreenWorkout.tsx`: empty workout CTA, finish session CTA where primary.
  - [ ] 2.2 `WorkoutRoutineEditor.tsx`, `RoutinePreviewSheet.tsx`, `WorkoutSessionPreviewSheet.tsx`: primary start/save → lime.
  - [ ] 2.3 Demote blue text links to secondary/muted.

- [ ] **Task 3: Home + coach card sweep** (AC: 5)
  - [ ] 3.1 `TodaysCoachPlanCard.tsx` primary CTA.
  - [ ] 3.2 `ScreenHome.tsx` nightly stretch faux-button div → real `PrimaryButton` or matching styles.

- [ ] **Task 4: Settings pills** (AC: 7)
  - [ ] 4.1 `SettingsSheet.tsx` rest timer + water preset selected styles → green.

- [ ] **Task 5: Verification** (AC: 10)
  - [ ] 5.1 Visual smoke: Home (coach CTA), Workout (start empty), Settings (pill select).
  - [ ] 5.2 `npm run build` + `npm test`.

## Dev Notes

### Depends on FTI-41

`--lime` token must be fixed before this story merges (FTI-41 Task 2).

### Primary vs coach blue

| Use | Color |
| --- | --- |
| Primary CTA (start, open, save, log) | Lime `#4ade80` |
| Secondary / text links | Muted white / card-2 |
| Destructive | `--danger` |
| Coach info panels / "Next week" chip | Blue tint OK (informational) |

### Key files

- `src/fitness/shared.tsx`
- `src/fitness/screens/ScreenWorkout.tsx`: `ACCENT_BLUE` on line ~686
- `src/fitness/TodaysCoachPlanCard.tsx`: `#ffffff` primary
- `src/fitness/workoutUiTokens.ts`

## Dev Agent Record

### Agent Model Used

(pending)

### Completion Notes List

(pending)

### File List

(pending)
