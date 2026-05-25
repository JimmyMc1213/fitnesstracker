# Story 1.8: Drag and drop lift effect (FTI-18)

Status: in-progress

## Implementation Prompt

> **IMPORTANT — DO NOT change any visual styling, colors, typography, layout, or design of the exercise cards or workout screen. The only changes allowed are:**
>
> - The drag and drop interaction behavior and animations
> - Installing and wiring `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities`
> - Adding the `DragOverlay` component for the floating drag card
> - Adding the placeholder slot styling (dashed border empty card) — match the existing card background color and border radius exactly
> - Adding haptic feedback on pickup and drop
>
> **Do not touch:**
>
> - Exercise card layout, padding, or styling
> - Colors, fonts, or opacity of any existing elements
> - The set logging inputs, checkboxes, or any interactive elements on the cards
> - The workout header, timer, or finish button
> - Any screen outside the exercise list
>
> If you are unsure whether a change is visual — do not make it. Only touch drag and drop logic.
>
> Completely rebuild the drag and drop reorder for exercises in the active workout screen. The current implementation is janky — no lift effect, exercises hard-cut instead of sliding smoothly. Reference the Hevy app as the gold standard.
>
> Use `@dnd-kit/sortable` — install it if not already:
>
> ```bash
> npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
> ```
>
> Implement these specific behaviors:
>
> 1. **Lift effect on grab:** When the user long-presses or starts dragging an exercise card:
>    - Scale the card up slightly: `transform: scale(1.02)`
>    - Add a shadow: `box-shadow: 0 8px 24px rgba(0,0,0,0.4)`
>    - Slightly reduce opacity of all OTHER cards to 0.6 so focus is on the dragged item
>    - Add a subtle background color change on the dragged card — slightly lighter than default
>    - Animate all of these with `transition: all 150ms ease`
>
> 2. **Smooth real-time tracking:** The dragged card must follow the finger position in real time with zero lag. Use `@dnd-kit`'s `DragOverlay` component to render the dragged item as a floating overlay that tracks touch position — this is what makes it feel native instead of janky.
>
> 3. **Other cards slide smoothly:** As the dragged item passes over other cards they should slide up or down with a smooth animation — `transition: transform 200ms ease`. No hard cuts, no jumping.
>
> 4. **Drop animation:** When the user releases the card it should animate into its new position smoothly over 150ms ease-out. Not a hard snap.
>
> 5. **Haptics:**
>    - Light haptic on pickup: `navigator.vibrate(10)` or use Capacitor Haptics plugin if available
>    - Light haptic on drop: `navigator.vibrate(10)`
>
> 6. **Drag handle:** Only initiate drag from the drag handle (⠿ icon on the left of each exercise card). Do not make the entire card draggable — users need to be able to tap inputs and buttons on the card without accidentally triggering drag.
>    - The drag handle should be 44px tap target minimum
>    - Only visible — not shown during active set logging (only when in edit/reorder mode or always visible as a subtle handle)
>
> 7. **Vertical only:** Constrain dragging to vertical axis only — no horizontal movement.
>
> Use `TouchSensor` with an activation constraint of `delay: 150, tolerance: 5` — this prevents accidental drags when the user is just scrolling, while still feeling responsive when they intentionally grab a handle.
>
> Test on iPhone — make sure the touch sensor works correctly on iOS Safari and doesn't conflict with the scroll behavior of the workout screen.
>
> **Spring animation on card slide:** Replace `transition: transform 200ms ease` on the sliding cards with:
>
> ```css
> transition: transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
> ```
>
> **Placeholder slot:** While dragging, the original position shows a placeholder card with:
>
> - Same height as the dragged card
> - Background: slightly darker than normal card background
> - Subtle dashed border: `border: 1.5px dashed rgba(255,255,255,0.15)`
> - No content — just an empty slot showing where the card will land
>
> **Drag overlay card — compact version:**
>
> When a card is being dragged, the `DragOverlay` should render a compact version of the exercise card, not the full expanded card with sets and inputs.
>
> The compact drag card should show:
>
> - Drag handle icon on the left
> - Exercise name in white, 16px semibold
> - Set count as a small gray label — e.g. `3 sets` — on the right
> - Same background color and border radius as the normal card
> - Same width as the normal card
> - Height: approximately 56px — just enough for one line of content
> - The `scale(1.02)` and shadow lift effect applied to this compact card
>
> The original card in the list (the placeholder slot) should show the dashed border empty state at the full original card height — so the list spacing stays correct and nothing jumps when you pick up or drop.
>
> The full card with sets only renders when not being dragged. The moment drag starts, swap to the compact overlay. The moment drag ends and the card settles, swap back to the full card.
>
> This is exactly how Strong app handles it — light compact card follows the finger, full card snaps back into place on drop.

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
  - [x] Compact drag overlay (name + set count, ~56px) with scale/shadow lift
  - [x] Dashed-border placeholder slot at full original card height while dragging
  - [x] Dim non-dragged cards to 0.6 opacity during drag

- [x] **Task 2: Smooth layout transitions** (AC: 3, 4)
  - [x] Use `defaultAnimateLayoutChanges` on `useSortable` rows
  - [x] Spring slide: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` at 250ms
  - [x] Drop animation 150ms ease-out

- [x] **Task 3: Mobile sensors** (AC: 2)
  - [x] `TouchSensor` with `delay: 150, tolerance: 5`
  - [x] Vertical-only via modifier
  - [x] Haptics on pickup and drop

- [ ] **Task 4: Verification** (AC: all)
  - [ ] Run `npm run build`
  - [ ] Manual iPhone test: hold grip → lift overlay tracks finger → siblings slide → drop settles

## Dev Notes

### Primary target

- **`src/fitness/SortableExerciseList.tsx`**, all lift/animation behavior centralized here
- Consumers unchanged: `ScreenWorkout.tsx`, `WorkoutRoutineEditor.tsx`, `OnboardingTemplateReview.tsx`

### Scope discipline

- Do **not** change exercise card layout, colors, or typography
- Do **not** add rest timer, swap exercise, or PR board (FTI-20+)
- Quality gate: **`npm run build`**

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-18-Drag-and-drop-lift-effect-FTI-18]
- linear: FTI-18
- story_key: fti-18-drag-and-drop-lift-effect-on-exercise-reorder

## Dev Agent Record

### Agent Model Used

Composer

### File List

- src/fitness/SortableExerciseList.tsx
- src/index.css
