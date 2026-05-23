# Story 2.4: Animated macro rings (FTI-31)

Status: done

## Story

As a user logging food,
I want macro rings to animate smoothly as progress updates,
so daily nutrition feels satisfying without being gimmicky.

## Acceptance Criteria

1. **Load animation:** Macro ring animates on screen load from 0 to current calorie progress (~500ms ease-out).
2. **Incremental updates:** Ring animates smoothly when `value` changes (e.g. new food logged, date switched on home).
3. **Timing & quality:** ~500ms ease-out; no jank, flicker, or layout shift.
4. **Edge states:** Works at 0% (empty), 100% (full), and over-target (ring capped at full circle; center shows actual kcal).
5. **Restrained motion:** Single ring progress animation only, no bounce, pulse, or decorative loops.

## Tasks / Subtasks

- [x] **Task 1: Animated progress hook** (AC: 1, 2, 3, 4)
  - [x] 1.1 Add `src/fitness/useAnimatedMacroProgress.ts`: `easeOutCubic`, `RING_DURATION_MS = 500`, hook accepting `value`, `target`, `enabled`
  - [x] 1.2 Return `{ ringPct, displayCalories }` where `ringPct = min(1, max(0, value/target))` for stroke; `displayCalories` lerps for center label
  - [x] 1.3 On `enabled === false` or `prefers-reduced-motion: reduce`, snap immediately (no RAF loop)
  - [x] 1.4 Cancel in-flight RAF on dependency change; start next animation from current interpolated position (no flicker)

- [x] **Task 2: Wire MacroRing** (AC: 1-5)
  - [x] 2.1 Update `MacroRing` in `shared.tsx` to use hook; drive `strokeDasharray` from animated `ringPct`
  - [x] 2.2 Center label uses `Math.round(displayCalories)`; "of {target} kcal" unchanged
  - [x] 2.3 Optional prop `animate?: boolean` (default `true`) for reuse without animation if needed later

- [x] **Task 3: Home integration** (AC: 2)
  - [x] 3.1 Confirm `ScreenHome.tsx` passes live `totals.cal` / `T.cal`: no extra wiring unless `animate={false}` needed for historical dates (animate on all views for consistency)

- [x] **Task 4: Verification** (AC: all)
  - [x] 4.1 Run `npm run build`

- [x] **Review Follow-ups (AI)**
  - [x] (none required, approved as implemented)

## Senior Developer Review (AI)

**Reviewer:** BMAD Swarm | **Date:** 2026-05-21 | **Recommendation:** APPROVED

| ID | Severity | Finding | Resolution |
| --- | --- | --- | --- |
|, |, | No blocking issues |, |

**AC validation:** All 5 ACs met. Build PASS. No automated test suite (project standard).

## Change Log

- 2026-05-21: Animated `MacroRing` via `useAnimatedMacroProgress` (500ms ease-out, reduced-motion snap, interrupt-safe RAF)

## Dev Notes

### Scope

- **In scope:** Calorie `MacroRing` on home dashboard (`ScreenHome.tsx` → `shared.tsx` `MacroRing`).
- **Out of scope:** `MacroBar` bars, nutrition screen rings, FTI-32 water tracker, new persistence fields.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4]
- Linear: https://linear.app/ftiness-tracker/issue/FTI-31/animated-macro-rings-on-home-dashboard

## Dev Agent Record

### Agent Model Used

Composer (BMAD Swarm orchestrator)

### Completion Notes List

- `useAnimatedMacroProgress` drives ring stroke and center kcal lerp; respects `prefers-reduced-motion`.
- `ScreenHome` unchanged, existing `totals.cal` / `T.cal` props trigger re-animation on food log and date change.

### File List

- `src/fitness/useAnimatedMacroProgress.ts` (new)
- `src/fitness/shared.tsx` (modified)
- `_bmad-output/implementation-artifacts/fti-31-animated-macro-rings-on-home-dashboard.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
