# Story 4.5: Progress polish — goal-aware delta, empty states (FTI-45)

Status: done

## Story

As a user tracking body weight on Progress,
I want delta colors that match my goal and no empty placeholder cards,
so the tab feels intentional and accurate.

## Acceptance Criteria

1. **Goal-aware delta color:** Given `onboardingProfile.goal` and weight delta vs first log (`deltaLbs`), when Progress body-weight header renders, then color follows:
   - **cut:** delta ≤ 0 → `var(--pos)` (green), delta > 0 → `var(--neg)` (red)
   - **bulk:** delta ≥ 0 → green, delta < 0 → red
   - **maintain:** |delta| ≤ 1 lb → neutral gray `rgba(255,255,255,0.45)`; beyond → amber `#fbbf24`

2. **Delta label:** Subcopy under delta changes from `vs first log` to **`vs start`**.

3. **Pure helper + tests:** Extract `weightDeltaSentiment(goal: NutritionGoal, deltaLbs: number): "positive" | "negative" | "neutral" | "caution"` in e.g. `weightProgress.ts` with Vitest covering cut/bulk/maintain branches.

4. **Fuel updates hidden when empty:** Given `state.adjustmentHistory.length === 0`, when Progress renders, then **no** "Fuel updates" section label or card appears — section omitted entirely.

5. **Workout calendar empty state:** Given `WorkoutCalendarCard` has zero workout days in viewed month, when grid renders, then grid remains visible **and** a centered overlay/message inside the card reads: `No workouts yet — finish a session in Workout to light up your calendar` plus a subtle inline SVG dumbbell icon (no external asset pipeline).

6. **Lifting calendar:** Existing empty copy retained; optional minor alignment with workout calendar tone — not required if already adequate.

7. **Scope guard:** No Nutrition tab changes, no Settings IA (FTI-46).

8. **Build gate:** `npm run build` and `npm test` pass (new tests in AC 3).

## Tasks / Subtasks

- [ ] **Task 1: `weightProgress.ts` + tests** (AC: 1, 2, 3)
  - [ ] 1.1 Implement sentiment helper + `deltaColorForSentiment()`.
  - [ ] 1.2 `weightProgress.test.ts` — matrix for cut/bulk/maintain.
  - [ ] 1.3 Wire `ScreenProgress.tsx` delta row (~352–375).

- [ ] **Task 2: Hide empty Fuel updates** (AC: 4)
  - [ ] 2.1 Conditional render around SectionLabel + card (~475–512).

- [ ] **Task 3: Workout calendar empty overlay** (AC: 5)
  - [ ] 3.1 Update `WorkoutCalendarCard.tsx` — relative container + centered empty message when `workoutDays.size === 0`.

- [ ] **Task 4: Verification** (AC: 8)
  - [ ] 4.1 Smoke: bulk user with +delta shows green; cut with +delta shows red; empty adjustment history; empty month calendar.

## Dev Notes

### Goal source

`state.onboardingProfile?.goal` — type `NutritionGoal` = `"bulk" | "cut" | "maintain"`. Default `"maintain"` when profile missing.

### Key files

- `src/fitness/screens/ScreenProgress.tsx` — `deltaLbs <= 0 ? var(--pos) : var(--neg)` bug for bulk users
- `src/fitness/WorkoutCalendarCard.tsx` — empty month message exists but grid looks bare

## Dev Agent Record

### Agent Model Used

(pending)

### Completion Notes List

(pending)

### File List

(pending)
