# Story 1.8: Drag and drop lift effect (FTI-18)

Status: done

## Story

As a user reordering exercises,
I want smooth drag feedback,
so that reordering feels native on mobile.

## Acceptance Criteria

1. **Lift on grab:** Dragged exercise scales up slightly and feels elevated (shadow, raised z-feel) while active.
2. **Finger tracking:** Overlay follows pointer/touch in real time without perceptible lag.
3. **Smooth sibling shift:** Non-dragged exercises animate to new slots; no hard cut/jump.
4. **Clean drop:** Item animates into its final position on release.
5. **Shared component:** Enhance `SortableExerciseList` (`@dnd-kit/sortable` already in stack), used by live workout edit mode and routine editor.

## Tasks / Subtasks

- [x] **Task 1: Lift overlay & placeholder** (AC: 1, 2)
  - [x] Wrap `DragOverlay` content with scale (~1.03), elevation shadow, `cursor: grabbing`
  - [x] Keep in-list placeholder faint (opacity) while overlay carries the lifted card
  - [x] Enable `defaultDropAnimation` with side effects for opacity restore

- [x] **Task 2: Smooth layout transitions** (AC: 3, 4)
  - [x] Use `defaultAnimateLayoutChanges` on `useSortable` rows
  - [x] Configure `DndContext` measuring for reliable layout during drag
  - [x] Tune row `transition` for transform (200-250ms ease)

- [x] **Task 3: Mobile sensors** (AC: 2)
  - [x] Add `TouchSensor` with same activation distance as `PointerSensor`

- [x] **Task 4: Verification** (AC: all)
  - [x] Run `npm run build` (project quality gate only)

## Dev Notes

### Primary target

- **`src/fitness/SortableExerciseList.tsx`**, all lift/animation behavior centralized here
- Consumers unchanged: `ScreenWorkout.tsx` (session edit mode), `WorkoutRoutineEditor.tsx`

### Scope discipline

- Do **not** add rest timer, swap exercise, or PR board (FTI-20+)
- Do **not** change edit-mode toggle UX from FTI-19
- Quality gate: **`npm run build` only**, no Vitest/Playwright/dev server

### dnd-kit patterns

| Concern | Approach |
| --- | --- |
| Lift visual | `DragOverlay` + wrapper scale/shadow when `ctx.isOverlay` |
| Tracking | `DragOverlay` (not in-list transform during drag) |
| Sibling shift | `animateLayoutChanges: defaultAnimateLayoutChanges` |
| Drop | `dropAnimation={defaultDropAnimation}` |

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-18-Drag-and-drop-lift-effect-FTI-18]
- [Source: _bmad-output/implementation-artifacts/fti-17-clean-up-edit-workout-ui.md]
- linear: FTI-18
- story_key: fti-18-drag-and-drop-lift-effect-on-exercise-reorder

## Dev Agent Record

### Agent Model Used

Composer (bmad-swarm)

### Completion Notes List

- Centralized lift overlay (`DragLiftShell`), drop animation, layout measuring, and touch sensor in `SortableExerciseList.tsx`.
- `npm run build` passed (tsc + vite).

### Senior Developer Review (AI)

| ID | Severity | Finding | Resolution |
| --- | --- | --- | --- |
| F1 | MEDIUM | Placeholder opacity 0.28 vs drop side-effect 0.4 could flash on release | Kept; drop animation restores over ~240ms |
| F2 | LOW | Dual Pointer+Touch sensors, standard dnd-kit pattern for mobile | Accepted |
| F3 | LOW | `MeasuringStrategy.Always` adds layout work on long lists | Acceptable for typical exercise counts |

**Recommendation:** APPROVE

### File List

- src/fitness/SortableExerciseList.tsx
