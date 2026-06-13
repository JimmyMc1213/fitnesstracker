# Sprint RN-6 — Workout Domain

**Planned:** 2026-06-12  
**Last updated:** 2026-06-12 (swarm-ready — all 11 story files created)  
**Epic:** `epic-rn-6`  
**Swarm branch:** `epic-rn-6/workout-domain`  
**Goal:** Replace the `(tabs)/workout` placeholder with PWA-parity workout domain — idle dashboard, full lifting session loop (start → log sets → reorder → finish → summary), routine management, history, and Maestro `rn-workout-session.yaml`.

**PRD:** [`prd-rn-migration.md`](../planning-artifacts/prd-rn-migration.md) FR-M4 (Workout)  
**Architecture:** [`architecture-rn-migration.md`](../planning-artifacts/architecture-rn-migration.md) §3 `(tabs)/workout`, `(app)/workout/history`  
**Epic spec:** [`epics-rn-migration.md`](../planning-artifacts/epics-rn-migration.md) RN-6 (11 stories)  
**PWA reference:** `apps/pwa/src/fitness/screens/ScreenWorkout.tsx`, `workout/*`, `finishWorkout.ts`, `workoutAutofill.ts`  
**Tracking:** [`sprint-status-rn-migration.yaml`](sprint-status-rn-migration.yaml)

---

## Sprint goal (one sentence)

An onboarded user opens Workout, starts today's session from the idle dashboard, logs sets with autofill and keypad, reorders exercises via drag, finishes to a summary sheet, and can browse history and edit routines — with Maestro `rn-workout-session.yaml` passing on simulator.

---

## BMad swarm alignment

| Field | Value |
|-------|--------|
| Swarm mode | `epic-rn-6` |
| Branch | `epic-rn-6/workout-domain` |
| Start story | **RN-6-01** (`rn-6-01-workout-core-extract-phase-shell.md`) |
| Story files | Create under `implementation-artifacts/rn-6-*.md` |
| Gate (every story) | `npm run typecheck --workspace=@newyouai/mobile` |
| Gate (logic stories) | `npm run test --workspace=@newyouai/core` when touching `packages/core` |
| Gate (epic close) | `rn-workout-session.yaml` + `npm run test:e2e:auth-all` + `npm run test:e2e:tab-nav` + `npm run test:e2e:coach-nutrition` + `npm run test:e2e:onboarding` green |

**Kickoff:** `/bmad-swarm epic-rn-6` or `dev this story rn-6-01-workout-core-extract-phase-shell.md`

**Swarm order (strict):**

```
RN-6-01 → RN-6-02 → RN-6-03 → RN-6-04 → RN-6-05 → RN-6-06 → RN-6-07
  → RN-6-08 → RN-6-09 → RN-6-10 → RN-6-11 → epic-rn-6-retrospective
```

---

## Starting point

| Item | Status | Notes |
|------|--------|-------|
| RN-0 / RN-1 / RN-2 / RN-3 / RN-4 / RN-5 | **Done or review** | Foundation, packages, auth, shell, onboarding, home |
| `(tabs)/workout` | **Placeholder** | `TabPlaceholderScreen`; `testID="tab-workout"` |
| `FitnessProvider` / `useFitnessState` | **Done (RN-5)** | Workout slice readable/writable via same persist adapter |
| Workout logic in `packages/core` | **Missing** | `workoutAutofill`, `finishWorkout`, `workoutPreviousSets` still PWA-only |
| Coach `start_workout` routing | **Done (RN-5)** | `coachTaskActions.ts` → `/(tabs)/workout` |
| PWA `ScreenWorkout.tsx` | **1,150+ lines** | FTI-53 phase-1 extractions exist under `workout/*` |
| DnD reorder | **PWA `@dnd-kit`** | RN: `react-native-draggable-flatlist` (add in RN-6-04) |
| Workout history route | **Not scaffolded** | Architecture: `(app)/workout/history` stack push |
| Maestro workout flow | **Missing** | Port `workout-session-smoke.spec.ts` → `rn-workout-session.yaml` |
| Tab bar hide on editor | **Deferred RN-3** | Hide tab bar during routine editor / active session overlays |
| Mobility active session | **Preview only (RN-5)** | Full stretch player out of scope here |

---

## Execute in this order

| # | Story | Story file | PWA section | PR target | Status |
|---|-------|------------|-------------|-----------|--------|
| 1 | **RN-6-01** | `rn-6-01-workout-core-extract-phase-shell.md` | Core extract + phase shell | 1 PR | ready-for-dev |
| 2 | **RN-6-02** | `rn-6-02-idle-dashboard-routines.md` | W-01 idle dashboard | 1 PR | ready-for-dev |
| 3 | **RN-6-03** | `rn-6-03-session-start-header-finish-summary.md` | W-02 start/finish, S-06 summary | 1 PR | ready-for-dev |
| 4 | **RN-6-04** | `rn-6-04-draggable-exercise-reorder.md` | W-02 DnD | 1 PR | ready-for-dev |
| 5 | **RN-6-05** | `rn-6-05-exercise-card-set-logging-autofill.md` | W-02 set fields | 1 PR | ready-for-dev |
| 6 | **RN-6-06** | `rn-6-06-numeric-keypad-context.md` | W-08 keypad | 1 PR | ready-for-dev |
| 7 | **RN-6-07** | `rn-6-07-rest-timer-coach-session-notes.md` | W-06 rest, coach card | 1 PR | ready-for-dev |
| 8 | **RN-6-08** | `rn-6-08-exercise-swap-set-kind-notes.md` | W-07 swap, set kind | 1 PR | ready-for-dev |
| 9 | **RN-6-09** | `rn-6-09-confirm-sheets-bundle.md` | W-09 confirm sheets | 1 PR | ready-for-dev |
| 10 | **RN-6-10** | `rn-6-10-routine-editor-weekly-builder.md` | W-03/W-04 editor | 1 PR | ready-for-dev |
| 11 | **RN-6-11** | `rn-6-11-workout-history-maestro-e2e.md` | W-05 history + Maestro | 1 PR | ready-for-dev |
| 12 | Retro | `epic-rn-6-retrospective` | — | — | optional |

---

## RN-6-01 — Workout core extract + phase shell

**Story file:** `rn-6-01-workout-core-extract-phase-shell.md`

**Deliverables:**

- Extract to `packages/core` (PWA re-exports unchanged):
  - `workoutAutofill.ts` + tests
  - `workoutPreviousSets.ts` / `buildSetCompletionPatch` + tests
  - `finishWorkout.ts` + tests (or `packages/core/src/workout/finishWorkout.ts`)
  - `exerciseSessionNotes.ts` helpers used by session coach notes
- `WorkoutScreen` replaces placeholder: idle vs lifting phase routing from `state.workout.sessionPhase`
- Wire `useFitnessState` workout slice patches (`setState` pattern from RN-5)
- Scaffold `(app)/workout/history` route (empty shell OK — content RN-6-11)
- Tab bar hide when `sessionPhase === "lifting"` or routine editor open (parity RN-3 deferral)
- Keep `testID="tab-workout"` on root scroll/safe area

**PWA ref:** `ScreenWorkout.tsx` phase switch, `buildAppState.ts` workout defaults  
**Core ref:** Port existing Vitest from PWA before any UI beyond shell

**Story gate:** typecheck + `npm run test --workspace=@newyouai/core` green

---

## RN-6-02 — Idle dashboard + routine cards

**Story file:** `rn-6-02-idle-dashboard-routines.md`

**Deliverables:**

- `WorkoutIdleDashboard` RN port — today's workout card, routine list, training-day logic via `isTrainingDay`
- Header actions: Templates browse entry, History navigation → `(app)/workout/history`
- Start workout CTA from routine card + coach brief preview (`buildPreWorkoutCoachBrief`)
- Routine action sheet shell (rename, duplicate, delete — full wiring RN-6-10)
- Seed-aware: routines from onboarding `workoutTemplates` in fitness slice

**PWA ref:** `workout/WorkoutIdleDashboard.tsx`, `preWorkoutCoachBrief.ts`  
**Data from RN-4:** `workoutTemplates`, `trainingSchedule`, `splitId`

**Story gate:** typecheck

---

## RN-6-03 — Session start + header + finish + summary

**Story file:** `rn-6-03-session-start-header-finish-summary.md`

**Deliverables:**

- Start session from idle: clone exercises, set `sessionPhase: "lifting"`, stamp `sessionStartedAtMs`
- `WorkoutSessionHeader` + sticky header RN port (title, elapsed clock, finish button)
- Finish workout → `finishWorkout()` persist → `WorkoutSummarySheet` bottom sheet/modal
- Summary copy parity: "Workout complete", session title, duration, PR highlights stub
- End session returns to idle; clears active session coach notes
- Maestro seed helper started (workout templates + history for autofill smoke)

**PWA ref:** `WorkoutSessionHeader.tsx`, `finishWorkout.ts`, global `WorkoutSummarySheet`  
**Maestro target:** partial flow through finish (full yaml in RN-6-11)

**Story gate:** typecheck + core `finishWorkout` tests

---

## RN-6-04 — Draggable exercise reorder

**Story file:** `rn-6-04-draggable-exercise-reorder.md`

**Deliverables:**

- Add `react-native-draggable-flatlist` (or approved equivalent)
- Port `SortableExerciseList` behavior: long-press drag, haptic on reorder, persist `exercises` order in session
- Update template order confirm sheet hook point (full sheet RN-6-09)
- 60fps scroll target on exercise list during active session
- **Epic key story** per `epics-rn-migration.md`

**PWA ref:** `SortableExerciseList.tsx`, `@dnd-kit` usage in `ScreenWorkout.tsx`  
**Deps:** RN-6-03 active session list host

**Story gate:** typecheck + manual drag reorder on simulator

---

## RN-6-05 — Exercise card + set logging + autofill

**Story file:** `rn-6-05-exercise-card-set-logging-autofill.md`

**Deliverables:**

- `WorkoutExerciseCard` RN port — exercise name, set rows, target prescription display
- `WorkoutSetField` — reps/weight fields tap → keypad (RN-6-06)
- Set complete toggle via `buildSetCompletionPatch` / `canCompleteSet`
- Autofill from history: `autofillExerciseSets`, "Last session: 135×10" copy
- Add exercise entry → `RoutineExerciseSearchSheet` stub or full port (minimal search OK if RN-6-08 expands)
- Warmup groups optional (`WorkoutWarmupGroups`) — include if low cost

**PWA ref:** `workout/WorkoutExerciseCard.tsx`, `workout/WorkoutSetField.tsx`, `workoutAutofill.ts`  
**Core ref:** extracted autofill module

**Story gate:** typecheck + core autofill tests

---

## RN-6-06 — Numeric keypad + context

**Story file:** `rn-6-06-numeric-keypad-context.md`

**Deliverables:**

- `WorkoutKeypadProvider` + `useWorkoutKeypad` RN context
- `WorkoutNumericKeypad` RN port — digits, decimal, backspace, done; `workoutKeypadLogic.ts` in core or mobile lib
- Focus management: active field scroll-into-view (RN `ScrollView`/`FlatList` equivalent of `scrollWorkoutFieldIntoView`)
- Keypad docked bottom; lifting screen adjusts padding when open
- `testID`s: `workout-keypad`, `workout-keypad-done`

**PWA ref:** `workout/WorkoutKeypadContext.tsx`, `workout/WorkoutNumericKeypad.tsx`, `workoutKeypadLogic.ts`

**Story gate:** typecheck + keypad logic unit tests

---

## RN-6-07 — Rest timer + coach card + session notes

**Story file:** `rn-6-07-rest-timer-coach-session-notes.md`

**Deliverables:**

- `RestTimerSheet` RN port — countdown, pause, skip, background tick via `AppState` / interval
- `WorkoutCoachCard` — pre-workout brief + in-session expandable coach strip
- Per-exercise session notes from `buildSessionCoachNotesByExerciseId` (FTI-54 rule-based; no LLM in RN-6)
- Rest duration from `restTimerPreferences` / exercise prescription
- Coach blue tokens from `workoutUiTokens` / theme

**PWA ref:** `RestTimerSheet.tsx`, `WorkoutCoachCard.tsx`, `exerciseSessionNotes.ts`, `preWorkoutCoachBrief.ts`  
**Core ref:** `getFirstSessionCoachNote`, progressive overload helpers already in core

**Story gate:** typecheck

---

## RN-6-08 — Exercise swap + set kind + notes sheets

**Story file:** `rn-6-08-exercise-swap-set-kind-notes.md`

**Deliverables:**

- `ExerciseSwapSheet` — swap exercise mid-session, regenerate sets + coach note for new exercise
- `SetKindPickerSheet` — warm-up / working / drop set kinds
- `ExerciseNotesEditSheet` — per-exercise notes persist via `exerciseNotes` helpers
- `ExerciseActionSheet` / `WorkoutRoutineActionSheet` RN action sheets
- `RoutineExerciseSearchSheet` if not completed in RN-6-05

**PWA ref:** `ExerciseSwapSheet.tsx`, `workout/SetKindPickerSheet.tsx`, `ExerciseNotesEditSheet.tsx`

**Story gate:** typecheck

---

## RN-6-09 — Confirm sheets bundle

**Story file:** `rn-6-09-confirm-sheets-bundle.md`

**Deliverables:**

- Port confirm sheets (bottom sheet or modal pattern consistent with RN app):
  - `CancelWorkoutConfirmSheet`
  - `EmptyFinishConfirmSheet`
  - `DeleteExerciseConfirmSheet`
  - `ReplaceActiveWorkoutConfirmSheet`
  - `SaveWorkoutConfirmSheet` / `SaveHistoryWorkoutSheet`
  - `UpdateTemplateOrderConfirmSheet`
  - `RenameRoutineSheet`
- Shared destructive confirm pattern; no behavior drift from PWA

**PWA ref:** `workout/*ConfirmSheet.tsx`, `workout/RenameRoutineSheet.tsx`

**Story gate:** typecheck

---

## RN-6-10 — Routine editor + templates + weekly builder

**Story file:** `rn-6-10-routine-editor-weekly-builder.md`

**Deliverables:**

- `WorkoutRoutineEditor` full-screen RN port — add/remove/reorder exercises in template
- `WorkoutStarterTemplatesSheet` — starter template browse + apply
- `WeeklyRoutineBuilderFlow` + `CreateWeeklyRoutineSheet` — weekly plan builder from onboarding parity
- `applyWeeklyRoutineToState` / `buildWeeklyRoutine` wired through fitness state
- Tab bar hidden during editor (wired from RN-6-01)
- Duplicate/delete routine from idle dashboard action sheet

**PWA ref:** `WorkoutRoutineEditor.tsx`, `WeeklyRoutineBuilderFlow.tsx`, `buildWeeklyRoutine.ts`  
**Mobile lib:** `lib/workout/workoutSplitByDays.ts` already exists — align imports

**Story gate:** typecheck + core weekly routine tests if extracted

---

## RN-6-11 — Workout history + Maestro E2E + epic polish

**Story file:** `rn-6-11-workout-history-maestro-e2e.md`

**Deliverables:**

- `ScreenWorkoutHistory` RN port at `(app)/workout/history` — session cards, preview, save-as-template entry
- `.maestro/rn-workout-session.yaml` — port PWA `workout-session-smoke.spec.ts`:
  - Workout tab → start routine → start workout → mark set done → finish → summary visible
- `npm run test:e2e:workout-session` script in `apps/mobile`
- Maestro persist seed: port `workoutSessionPersistSeed` from PWA e2e helpers
- Epic regression sweep: auth-all + tab-nav + coach-nutrition + onboarding
- Remove placeholder copy from workout tab; verify all Maestro `testID`s

**PWA ref:** `ScreenWorkoutHistory.tsx`, `apps/pwa/e2e/workout-session-smoke.spec.ts`, `e2e/helpers/seed.ts`  
**Test arch:** [`testarch-trace-rn-migration.md`](testarch-trace-rn-migration.md) FR-M4 row

**Story gate:** Maestro green + regression suite green

---

## Scope locks

| In scope | Out of scope |
|----------|--------------|
| Full Workout tab FR-M4 (idle + active session + history) | Nutrition log / barcode (RN-7) |
| Extract workout pure logic to `packages/core` | Cloud sync / hydration (RN-OFFLINE) |
| Draggable exercise reorder (native DnD) | LLM coach notes (FTI-55 / PWA-only flag) |
| Rest timer + rule-based session coach notes | Full mobility/stretch session player (RN-5 preview only; follow-on epic) |
| Routine editor + weekly builder + templates | Post-workout fuel quick-log UI (RN-7; coach routes there today) |
| All workout confirm sheets | Settings rest-timer prefs panel content (RN-10) |
| Workout history overlay/stack | Progress tab calendar/PR board (RN-8) |
| Tab bar hide during editor/active session | Universal links to workout routes (RN-STORE) |
| Maestro `rn-workout-session.yaml` | Playwright (PWA maintenance only) |
| Coach `start_workout` lands on real idle dashboard | Personal records board UI (RN-8) |

---

## Maestro runbook (swarm / local)

**Prerequisites:** JDK 17+, dev client on simulator, onboarded user with workout templates seeded

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Terminal 1
cd apps/mobile && npx expo start --dev-client --port 8082

# Terminal 2 — regression + epic gate
npm run test:e2e:auth-all
npm run test:e2e:tab-nav
npm run test:e2e:onboarding
npm run test:e2e:coach-nutrition
npm run test:e2e:workout-session    # add in RN-6-11
```

**Workout testing:** Seed must include `workoutTemplates` with named routine (e.g. "E2E Upper strength"), `workoutHistory` entry for autofill line, `sessionPhase: "idle"`. Reuse pattern from PWA `workoutSessionPersistSeed()`.

---

## Quality gates

### Per story (blocking)

```bash
npm run typecheck --workspace=@newyouai/mobile
```

When touching `packages/core`:

```bash
npm run test --workspace=@newyouai/core
```

When porting PWA workout tests:

```bash
npm run test --workspace=@newyouai/pwa   # until tests move to core
```

### Epic close (RN-6-11)

- [ ] `rn-workout-session.yaml` green (start → log set → finish → summary)
- [ ] `npm run test:e2e:auth-all` green
- [ ] `npm run test:e2e:tab-nav` green
- [ ] `npm run test:e2e:coach-nutrition` green
- [ ] `npm run test:e2e:onboarding` green
- [ ] Manual: coach `start_workout` opens idle dashboard with today's routine
- [ ] Manual: drag reorder persists through finish
- [ ] Manual: rest timer fires after set complete
- [ ] Manual: routine editor saves template back to idle list
- [ ] `epic-rn-6` → `done` in `sprint-status-rn-migration.yaml`

---

## Dev workflow (swarm)

1. Checkout / create branch `epic-rn-6/workout-domain`
2. Run `/bmad-create-story` for RN-6-01 if story file missing, then swarm or `dev this story rn-6-01-*.md` in order
3. One focused PR per story (epic bundle OK if swarm defaults)
4. `npm run typecheck --workspace=@newyouai/mobile` before story done
5. Update `sprint-status-rn-migration.yaml` story → `done`
6. RN-6-11: run workout-session + full Maestro regression + mark epic `done`

---

## Definition of done (epic)

1. Workout tab shows idle dashboard (not placeholder) with routines and start CTAs.
2. User completes full session loop: start → log at least one set → finish → summary.
3. Exercise reorder works via native drag; order persists through session.
4. Keypad, rest timer, coach card, and rule-based per-exercise notes render in session.
5. Swap, set kind, notes, and all confirm sheets match PWA behavior.
6. Routine editor and weekly builder update templates in fitness slice.
7. Workout history accessible from header; session preview works.
8. Maestro workout-session + auth-all + tab-nav + coach-nutrition + onboarding green.

---

## Unblocks

| Downstream | Needs from RN-6 |
|------------|-----------------|
| RN-7 Nutrition | Post-workout review task context; workout completion events |
| RN-8 Progress | `workoutHistory`, training calendar data shape |
| RN-10 Settings | Rest timer prefs panel reads same preference keys |
| RN-PARITY | FR-M4 trace row + `rn-workout-session.yaml` evidence |
| RN-5 (follow-on) | Mobility preview "Start stretch" can deep-link when stretch session exists |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Workout logic not in core yet | RN-6-01 blocks all session UI — strict swarm order |
| `ScreenWorkout` monolith port | Vertical slice stories 02→03→05; don't big-bang port 1,150 lines |
| DnD library choice | RN-6-04 spike `react-native-draggable-flatlist`; fallback manual reorder buttons behind dev flag only |
| Keypad + scroll + rest timer interplay | RN-6-06 before RN-6-07; test on small iPhone simulator |
| Tab bar hide regressions | Re-run `rn-tab-navigation.yaml` every story after RN-6-01 |
| Maestro seed complexity | Port `workoutSessionPersistSeed` verbatim from PWA helpers |
| RN-5 still in review | RN-6 can start on branch; merge RN-5 or rebase before epic close |
| Large overlay count (25+) | Confirm sheets bundled RN-6-09; defer edge sheets only if truly unused |

---

## Next action

1. **`/bmad-create-story`** for **RN-6-01** through **RN-6-11** (or create on demand per swarm story)
2. **`/bmad-swarm epic-rn-6`** — starts at **RN-6-01**

Or: `dev this story rn-6-01-workout-core-extract-phase-shell.md`
