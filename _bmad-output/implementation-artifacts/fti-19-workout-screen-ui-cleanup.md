# Story 1.6: Workout screen UI cleanup (FTI-19)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user logging a workout,
I want a clear hierarchy and collapsible coach content,
so that exercises are the focus.

## Acceptance Criteria

1. **Collapsible coach card:** Four separate coach/info banners in the active (`lifting`) workout view are merged into **one** collapsible “Coach” card, **collapsed by default**. Expanding reveals all coach content previously split across separate cards/toggles.
2. **Sticky session header:** A compact session stats bar showing **sets logged** (`doneSets/totalSets`) and **total volume** (with correct `weightUnitLabel`) remains **visible while scrolling** the exercise list (sticky within the `.screen` scroll container, not `position: fixed` on `html`/`body`).
3. **Edit mode toggle:** A pencil control toggles **session edit mode**. When **off** (default): drag handles and per-exercise delete (trash) controls are **hidden**. When **on**: drag handles and delete controls are shown (existing `@dnd-kit` reorder behavior unchanged).
4. **Clean exercise cards:** Exercise cards prioritize name, target, and set logging. **Add note** and **Progress** appear as **subtle secondary actions** (not prominent rows/banners). Set grid and primary actions remain visually dominant.
5. **Color system:** **AI / coach / template-generated** copy uses **blue** accent (`#0A84FF` / `rgba(10,132,255,…)`). **User-authored exercise notes** use **dark gray** neutrals (not blue). Do not regress label chips that denote exercise metadata (may stay blue if they are system tags, not user notes).
6. **Typography scale:** Active session enforces: **session title 24px bold**; **section labels 10px uppercase** with `letterSpacing: "0.08em"` and `fontWeight: 600`; volume stat **24px bold** tabular nums; metadata lines **11px** at ~40% white opacity. Align existing 22px title/timer drift to 24px where they represent primary titles.

## Tasks / Subtasks

- [x] **Task 1: Collapsible coach card** (AC: 1, 5, 6)
  - [x] Add `WorkoutCoachCard.tsx` (or equivalent) under `src/fitness/`: single expand/collapse control, default `collapsed=true`
  - [x] **Merge into expanded body** (preserve content, remove duplicate cards):
    - Coach note block (`overloadTip` from `progressiveOverloadInsight` + optional `jimmyIntensityCoachingLine`)
    - “After this session” (`activeRoutine?.sessionTip`) when present
    - Template warm-up list (`activeRoutine.warmupItems`) + coach callout (`warmupTip`)
    - Generic mobility + warm-up lists (`MOBILITY_ITEMS`, `WARMUP_ITEMS` currently in `ScreenWorkout.tsx`)
  - [x] Remove standalone `showWarmup` toggle + separate coach/session/warmup `.card` stack in lifting phase (~lines 799-918 in `ScreenWorkout.tsx`)
  - [x] Collapsed header: 10px uppercase “Coach” label + chevron; expanded sections use blue labels for AI/coach blocks
  - [x] Keep `MOBILITY_ITEMS` / `WARMUP_ITEMS` constants in `ScreenWorkout` or move to `data.ts` only if reuse is needed, minimal move

- [x] **Task 2: Sticky session stats header** (AC: 2, 6)
  - [x] Extract stats UI from current session `.card` (~920-944) into `WorkoutSessionStickyHeader` (inline in `ScreenWorkout` is OK if <~80 lines)
  - [x] Apply `position: sticky`, `top: 0`, solid `var(--bg)` or `var(--card)` background, subtle bottom border, `z-index: 2` **inside** `.screen` (see `ScreenStretch.tsx` sticky pattern ~276)
  - [x] Place sticky bar **below** timer + Finish row and editable session title (or include title in sticky zone, prefer stats-only sticky to maximize exercise viewport)
  - [x] Verify scroll on iOS PWA: no double-scroll; tab bar safe-area unchanged

- [x] **Task 3: Session edit mode toggle** (AC: 3)
  - [x] Add `sessionEditMode` `useState(false)` in `ScreenWorkout` lifting branch
  - [x] Add `IconPencil` (or reuse minimal edit glyph) in `src/fitness/icons.tsx`
  - [x] Place pencil toggle in header row (near Finish or opposite timer); `aria-pressed` + label “Edit workout layout”
  - [x] In `SortableExerciseList` `renderItem`: render `ExerciseDragHandle` only when `sessionEditMode`; render trash `IconTrash` only when `sessionEditMode`
  - [x] When edit mode off, list remains reorderable only if product requires, **default off means no drag affordance** (listeners only on handle today)

- [x] **Task 4: Exercise card secondary actions** (AC: 4, 5)
  - [x] Update `ExerciseNoteRow.tsx`: user note text/empty state uses **dark gray** (`rgba(255,255,255,0.45-0.65)`), border `var(--border)`; reserve blue for “Add note” hint only if desired, or keep CTA muted gray per AC
  - [x] Add compact **Progress** secondary action on each exercise card: show `exercisePersonalBests` entry for `exercise.name` when present (e.g. “PR 185×8” via `formatSetWeight` + unit label); tap opens small read-only detail or inline expand, **no new persistence**
  - [x] Layout: single footer row with muted text buttons (`Add note` | `Progress`) below set grid, `fontSize: 12`, low contrast; hide Progress when no PR data (or show “No history yet” on tap only)
  - [x] Do **not** change `WorkoutRoutineEditor` (FTI-17 scope)

- [x] **Task 5: Typography & color audit** (AC: 5, 6)
  - [x] Session title input: `fontSize: 24`, `fontWeight: 700`
  - [x] Audit lifting-phase labels (Set / weight / reps headers already 10px uppercase, keep)
  - [x] Replace ad-hoc coach greens for “After this session” inside unified coach card with blue AI styling for consistency, unless copy is explicitly post-session user reminder (then neutral gray subsection)
  - [x] Document shared constants at top of `ScreenWorkout.tsx` or tiny `workoutUiTokens.ts` if reused: `COACH_BLUE`, `USER_NOTE_GRAY`, `TITLE_SIZE`, `LABEL_SIZE`

- [x] **Task 6: Verification** (AC: all)
  - [x] Manual: start lifting session → coach card collapsed; expand shows all prior coach blocks; sticky stats stay visible while scrolling 3+ exercises
  - [x] Manual: edit mode off → no handles/trash; on → handles/trash return; reorder still works when on
  - [x] Run `npm run build` (project quality gate, no unit tests)

## Dev Notes

### Primary implementation target

- **`src/fitness/screens/ScreenWorkout.tsx`**, lifting phase UI (~737-1390): coach banners, session stats card, exercise `renderItem`, warmup toggle
- **New/extracted:** `WorkoutCoachCard.tsx`, optional `WorkoutSessionStickyHeader.tsx`
- **Touch:** `ExerciseNoteRow.tsx`, `icons.tsx` (pencil), possibly `unitPreferences.ts` formatters for Progress display

### Current UI map (lifting phase), what to merge/remove

| Current block | Location (approx.) | Fate |
| --- | --- | --- |
| “Show warm-up checklist” toggle | 799-813 | Absorbed into coach card expand |
| Session warm-up + Coach callout cards | 817-847 | Inside coach card |
| Mobility + Warm-up generic cards | 850-891 | Inside coach card |
| Coach note card (`overloadTip`) | 895-909 | Inside coach card |
| “After this session” green card | 911-918 | Inside coach card (restyle) |
| Session stats card | 920-944 | **Sticky header** (not coach) |
| Always-visible drag + trash | 974-1023 | Gated by edit mode |

Coach content sources:

```411:414:src/fitness/screens/ScreenWorkout.tsx
  const overloadTip =
    isJimmySummerPlanTemplates(state.workoutTemplates) && phase === "lifting"
      ? `${progressiveOverloadInsight(w)}\n\n${jimmyIntensityCoachingLine(localDateKey(new Date()))}`
      : progressiveOverloadInsight(w);
```

### Architecture & constraints

- **No React Router;** `AppState` via `setState` only, `sessionEditMode` is **local UI state** (do not persist).
- **No new AppState fields** unless Progress needs persistence (it should read `state.exercisePersonalBests` only).
- **DnD:** `@dnd-kit/core` ^6.3.1, `@dnd-kit/sortable` ^10.0.0, keep `SortableExerciseList`; FTI-18 will enhance drag **feel** later; this story only toggles visibility.
- **Sticky scroll:** Per `_bmad-output/project-context.md`: scrolling stays inside `.screen`; avoid `position: fixed` on root shell. Reference `ScreenStretch.tsx` sticky header pattern.
- **Quality gate:** `npm run build` only (`tsc -b && vite build`). No Vitest/Playwright.
- **Scope discipline:** Do not implement FTI-17 (routine editor), FTI-18 (drag lift animation), FTI-20+ in this story.

### Color & typography spec

| Element | Spec |
| --- | --- |
| AI / coach body text | Blue accent labels; body `rgba(255,255,255,0.72-0.88)` on `rgba(10,132,255,0.06-0.08)` card bg |
| User exercise notes | Dark gray text `rgba(255,255,255,0.55-0.72)`, neutral border, update `ExerciseNoteRow` |
| Session title | 24px, 700, `#fff` |
| Section labels | 10px, 600, uppercase, `letterSpacing: 0.08em` |
| Volume number | 24px, 700, tabular-nums |
| Secondary actions | 12px, 500, ~45% white |

Existing blue constant in file: `ACCENT_BLUE = "#0A84FF"`.

### Previous story learnings (same epic)

- **FTI-16:** Weigh-in rebuilt with sheet pattern; gate is build-only; minimal diff discipline.
- **FTI-25:** `formatSetWeight` / `weightUnitLabel`: use for volume and Progress display.
- **FTI-14-27:** Onboarding/templates supply `warmupItems`, `warmupTip`, `sessionTip` on `WorkoutRoutineTemplate`: coach card must handle **missing** optional fields gracefully.

### “Progress” secondary action (clarification for dev)

Epics AC says “add note / progress as subtle secondary actions.” There is **no** existing Progress button on live workout cards. Implement Progress as a **read-only** affordance using `state.exercisePersonalBests[exercise.name]` (see `workoutSummary.ts` / `ExercisePersonalBest`). If no PR: hide button or show disabled “Progress” that explains “Log sets to build history” on tap. Do **not** block story on new history API.

### Project Structure Notes

- Align with `src/fitness/screens/Screen*.tsx` + top-level feature components (`WeighInSheet.tsx` pattern).
- Icons: add to `icons.tsx`, match `size` / `stroke` props of existing icons.
- No Tailwind, no new component libraries.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-16-Workout-screen-UI-cleanup-FTI-19]
- [Source: _bmad-output/planning-artifacts/architecture.md#Conventions-agents-must-follow]
- [Source: _bmad-output/project-context.md]
- [Source: _bmad-output/planning-artifacts/prd.md#FTI-19]
- linear: FTI-19
- story_key: fti-19-workout-screen-ui-cleanup
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-19/workout-screen-ui-cleanup

## Dev Agent Record

### Agent Model Used

Composer (bmad-story-dev autonomous)

### Debug Log References

### Completion Notes List

- Merged four lifting-phase coach/warmup banners into `WorkoutCoachCard` (collapsed by default); “After this session” uses neutral gray subsection per AC.
- `WorkoutSessionStickyHeader` sticky stats bar (`position: sticky`, `var(--bg)`, z-index 2) below title row; session title/timer at 24px via `workoutUiTokens`.
- `sessionEditMode` local state + `IconPencil` gates drag handles and trash; reset on workout finish.
- Exercise footer: muted `Add note` | `Progress` below set grid; PR from `exercisePersonalBests` with inline expand.
- Quality gate: `npm run build` passed (no unit tests).

### File List

- src/fitness/workoutUiTokens.ts (new)
- src/fitness/WorkoutCoachCard.tsx (new)
- src/fitness/WorkoutSessionStickyHeader.tsx (new)
- src/fitness/screens/ScreenWorkout.tsx (modified)
- src/fitness/ExerciseNoteRow.tsx (modified)
- src/fitness/icons.tsx (modified)
- src/fitness/screens/WorkoutRoutineEditor.tsx (modified, `variant="editor"` only)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)

## Senior Developer Review (AI)

- Fixed Progress PR lookup via `normalizeExerciseKey` (was using raw exercise name).
- Restored routine editor note row with `ExerciseNoteRow` `variant="editor"`.
- Sticky header uses `weightUnitLabel()` for volume unit label.
- Set grid column headers use shared `labelStyle` (10px / 0.08em / 600).
- Quality gate: `npm run build` passed.

## Review Follow-ups (AI)

- [x] F1: `normalizeExerciseKey` in `formatExercisePr`
- [x] F3: `ExerciseNoteRow` variant prop (`compact` | `editor`)
- [x] F4: `weightUnitLabel` in `WorkoutSessionStickyHeader`
- [x] F5: `labelStyle` on set/weight/reps headers
