# Sprint RN-8 — Progress & check-ins

**Planned:** 2026-06-12  
**Last updated:** 2026-06-12 (swarm-ready — all 7 story files created)  
**Epic:** `epic-rn-8`  
**Swarm branch:** `epic-rn-8/progress-check-ins`  
**Goal:** Replace the `(tabs)/progress` placeholder and `(modals)/sunday-check-in` stub with PWA-parity Progress tab — body weight chart, weigh-in with progress photos, workout calendar, PR board, avg calories, goal range, progress pics gallery, full Sunday 4-step check-in flow, Sunday history overlay, and Maestro `rn-progress.yaml` + `rn-sunday-check-in.yaml`.

**PRD:** [`prd-rn-migration.md`](../planning-artifacts/prd-rn-migration.md) FR-M6 (Progress), FR-M8 (Sunday check-in)  
**Architecture:** [`architecture-rn-migration.md`](../planning-artifacts/architecture-rn-migration.md) §3 `(tabs)/progress`, `(modals)/sunday-check-in`  
**Epic spec:** [`epics-rn-migration.md`](../planning-artifacts/epics-rn-migration.md) RN-8 (7 stories)  
**PWA reference:** `ScreenProgress.tsx`, `SundayWeeklyCheckInFlow.tsx`, `WeighInSheet.tsx`, `progressPics.ts`, `weightProgress.ts`, `personalRecordsBoard.ts`, `averageCalTracker.ts`, `sundayCheckIn.ts`  
**Tracking:** [`sprint-status-rn-migration.yaml`](sprint-status-rn-migration.yaml)

---

## Sprint goal (one sentence)

An onboarded user opens Progress to log weight (with optional progress photo), sees weight trend, workout calendar, PRs, avg calories, and goal progress; completes the Sunday 4-step check-in from Home or modal; reviews Sunday history on Progress; and Maestro progress + Sunday flows pass on simulator.

---

## BMad swarm alignment

| Field | Value |
|-------|--------|
| Swarm mode | `epic-rn-8` |
| Branch | `epic-rn-8/progress-check-ins` |
| Start story | **RN-8-01** (`rn-8-01-progress-core-extract-weight-chart.md`) |
| Story files | Create under `implementation-artifacts/rn-8-*.md` |
| Gate (every story) | `npm run typecheck --workspace=@newyouai/mobile` |
| Gate (logic stories) | `npm run test --workspace=@newyouai/core` when touching `packages/core` |
| Gate (epic close) | `rn-progress.yaml` + `rn-sunday-check-in.yaml` + `npm run test:e2e:auth-all` + `npm run test:e2e:tab-nav` + `npm run test:e2e:coach-nutrition` + `npm run test:e2e:onboarding` + `npm run test:e2e:workout-session` + `npm run test:e2e:nutrition-log` green |

**Kickoff:** `/bmad-swarm epic-rn-8` or `dev this story rn-8-01-progress-core-extract-weight-chart.md`

**Swarm order (strict):**

```
RN-8-01 → RN-8-02 → RN-8-03 → RN-8-04 → RN-8-05 → RN-8-06 → RN-8-07 → epic-rn-8-retrospective
```

---

## Starting point

| Item | Status | Notes |
|------|--------|-------|
| RN-0 … RN-7 | **Done** | Foundation through nutrition OS complete |
| `(tabs)/progress` | **Placeholder** | `TabPlaceholderScreen`; `testID="tab-progress"` |
| `(modals)/sunday-check-in` | **Stub** | Close button + "ships in RN-8" copy; `testID="modal-sunday-check-in"` |
| Home weigh-in sheet | **Done (RN-5)** | `WeighInSheet` — weight only; progress photo stub copy |
| Home Sunday card | **Done (RN-5)** | `useSundayCheckInHome` + card; routes to modal stub |
| `FitnessProvider` / weight slice | **Done (RN-5)** | `weightLog`, `progressGoal`, `progressPics`, `sundayCheckInHistory` in persist |
| `packages/core/training` | **Partial** | `trainingCalendar.ts` extracted; used by coach + workout |
| `packages/core/sync` | **Partial** | `sundayCheckInHistoryMerge.ts` extracted |
| PWA progress logic | **PWA-only** | `weightProgress`, `personalRecordsBoard`, `averageCalTracker`, `progressPics`, `sundayCheckIn` still in `apps/pwa` |
| Mobile `sundayCheckInHome.ts` | **Partial** | Card data only; not full PWA `sundayCheckIn.ts` commitment flow |
| Maestro progress/Sunday | **Missing** | No PWA Playwright baseline — new flows in RN-8-07 |
| Charts | **RN pattern** | `react-native-svg` (MacroRing); port PWA `LineChart` as `WeightLineChart` |

---

## Execute in this order

| # | Story | Story file | PWA section | PR target | Status |
|---|-------|------------|-------------|-----------|--------|
| 1 | **RN-8-01** | `rn-8-01-progress-core-extract-weight-chart.md` | Core extract + P-01 weight chart | 1 PR | ready-for-dev |
| 2 | **RN-8-02** | `rn-8-02-weigh-in-progress-photo.md` | P-06 weigh-in + photos | 1 PR | ready-for-dev |
| 3 | **RN-8-03** | `rn-8-03-workout-calendar-pr-board.md` | P-02, P-03 | 1 PR | ready-for-dev |
| 4 | **RN-8-04** | `rn-8-04-avg-calories-goal-targets.md` | Avg cal + goal range + targets | 1 PR | ready-for-dev |
| 5 | **RN-8-05** | `rn-8-05-progress-pics-gallery.md` | P-04 gallery | 1 PR | ready-for-dev |
| 6 | **RN-8-06** | `rn-8-06-sunday-check-in-flow.md` | SC-01..04 + S-05 | 1 PR | ready-for-dev |
| 7 | **RN-8-07** | `rn-8-07-sunday-history-maestro-e2e.md` | P-05 + Maestro | 1 PR | ready-for-dev |
| 8 | Retro | `epic-rn-8-retrospective` | — | — | optional |

---

## RN-8-01 — Progress core extract + weight chart tab shell

**Story file:** `rn-8-01-progress-core-extract-weight-chart.md`

**Deliverables:**

- Extract to `packages/core/src/progress/` (PWA re-exports unchanged):
  - `weightProgress.ts` + colocated Vitest (from `apps/pwa/src/fitness/weightProgress.ts`)
- Replace `(tabs)/progress.tsx` placeholder with `ProgressScreen` shell:
  - `ScreenHeader` pattern (match Nutrition/Workout tabs)
  - Body weight card: today display, delta vs start, unit-aware formatting
  - `WeightLineChart` via `react-native-svg` (port PWA `LineChart` behavior — min 2 entries for trend)
  - "Log weight" / "Update weight" CTA opens weigh-in (sheet lands in RN-8-02; stub modal OK until then)
  - Empty state: "Log two weigh-ins to unlock the trend line"
- Preserve `testID="tab-progress"`

**PWA ref:** `ScreenProgress.tsx` body weight block (lines 134–228), `weightProgress.ts`  
**Core ref:** Port existing PWA Vitest before UI beyond chart shell

**Story gate:** typecheck + `npm run test --workspace=@newyouai/core` green

---

## RN-8-02 — Weigh-in sheet progress photo + Progress tab entry

**Story file:** `rn-8-02-weigh-in-progress-photo.md`

**Deliverables:**

- Extract `progressPics.ts` (+ gallery item helpers) to `packages/core/src/progress/` with Vitest
- Extend shared `WeighInSheet` (Home + Progress):
  - Optional progress photo via `expo-image-picker` (camera + library)
  - Persist `progressPics` entries linked to `dateKey` / `weightLog` (PWA shape)
  - Remove "ships in RN-8" stub copy
- Wire Progress tab weigh-in CTA to same sheet component
- Home weigh-in card unchanged except photo affordance now live

**PWA ref:** `WeighInSheet.tsx` photo block, `progressPics.ts`  
**Do not:** Full gallery UI (RN-8-05); duplicate weigh-in form on Progress only sheet (reuse component)

**Story gate:** typecheck + core tests when `progressPics` extracted

---

## RN-8-03 — Workout calendar + personal records board

**Story file:** `rn-8-03-workout-calendar-pr-board.md`

**Deliverables:**

- Extract `personalRecordsBoard.ts` to `packages/core/src/progress/` + Vitest
- Port `WorkoutCalendarCard` — week grid from `workoutHistory` + `trainingCalendar` (core already has calendar helpers)
- Port `PersonalRecordsSection` — PR list from `personalRecordsBoard` compute
- Section labels: "Workouts", "Personal records" (PWA copy)

**PWA ref:** `WorkoutCalendarCard.tsx`, `PersonalRecordsSection.tsx`, `personalRecordsBoard.ts`  
**Depends:** RN-6 `workoutHistory` shape in fitness slice

**Story gate:** typecheck + core tests green

---

## RN-8-04 — Average calories + goal range + fuel updates + targets

**Story file:** `rn-8-04-avg-calories-goal-targets.md`

**Deliverables:**

- Extract `averageCalTracker.ts` to `packages/core/src/progress/` + Vitest
- Port `AverageCalTrackerCard` — 7-day avg vs target from `nutritionItemsByDay` (RN-7 data)
- Goal range card: `progressGoal` bar, % to range, maintain/cut copy
- Fuel updates list: `adjustmentHistory` slice (up to 6 rows)
- Targets grid: calories / protein / carbs / fat from `nutritionTargets` (read-only; settings edit RN-10)

**PWA ref:** `AverageCalTrackerCard.tsx`, `ScreenProgress.tsx` goal range + adjustment + targets blocks  
**Depends:** RN-7 nutrition totals helpers in core

**Story gate:** typecheck + core tests green

---

## RN-8-05 — Progress pics section + fullscreen gallery

**Story file:** `rn-8-05-progress-pics-gallery.md`

**Deliverables:**

- `ProgressPicsSection` on Progress tab — preview thumbnails, lock affordance when `progressPicsLock`
- Fullscreen `ScreenProgressPicsGallery` (stack push or modal — match PWA overlay behavior)
- Gallery: date labels, weight context, delete entry (PWA parity)
- Tab bar hide when gallery open (mirror workout editor pattern if fullscreen)

**PWA ref:** `ProgressPicsSection.tsx`, `ScreenProgressPicsGallery.tsx`  
**Depends:** RN-8-02 `progressPics` persist shape

**Story gate:** typecheck green

---

## RN-8-06 — Sunday weekly check-in 4-step flow

**Story file:** `rn-8-06-sunday-check-in-flow.md`

**Deliverables:**

- Extract to `packages/core/src/progress/` (PWA re-exports):
  - `sundayCheckIn.ts` + Vitest
  - `sundayCheckInCoachContent.ts` (if not folded into sundayCheckIn)
  - Replace / merge mobile `lib/sundayCheckInHome.ts` with core exports
- Replace `(modals)/sunday-check-in.tsx` stub with `SundayWeeklyCheckInFlow` RN port:
  - Steps: Overview → Body weight → Coach read → Commitments (SC-01..04)
  - Step navigation, commitment multi-select + custom entries, lock-in CTA
  - `commitSundayCheckIn` → `sundayReviewCompletedKey`, `weekFocusCommitments`, history append
- Home Sunday card `onReview` opens live flow (existing route)
- Dev preview Sunday URL / E2E flag for non-Sunday Maestro (mirror PWA `DEV_PREVIEW_SUNDAY`)

**PWA ref:** `SundayWeeklyCheckInFlow.tsx`, `sundayCheckIn.ts`, `useSundayWeeklyCheckIn.ts`  
**Do not:** Sunday history full page (RN-8-07)

**Story gate:** typecheck + `npm run test --workspace=@newyouai/core` green

---

## RN-8-07 — Sunday history + Maestro E2E + epic polish

**Story file:** `rn-8-07-sunday-history-maestro-e2e.md`

**Deliverables:**

- `SundayCheckInHistorySection` on Progress tab + `ScreenSundayCheckInHistory` fullscreen overlay
- `.maestro/rn-progress.yaml`:
  - Open Progress tab → log weight → chart updates (second entry)
  - Goal range / targets visible when onboarding complete
- `.maestro/rn-sunday-check-in.yaml`:
  - Dev preview Sunday or seeded `sundayReviewCompletedKey` path
  - Home card → modal → complete commitments → card shows completed
- `npm run test:e2e:progress` + `npm run test:e2e:sunday-check-in` scripts
- `npm run test:e2e:epic-rn8-close` orchestration script
- Remove placeholder copy from progress tab + sunday modal
- Epic regression sweep: auth-all + tab-nav + coach-nutrition + onboarding + workout-session + nutrition-log

**PWA ref:** `SundayCheckInHistorySection.tsx`, `ScreenSundayCheckInHistory.tsx`, `sundayCheckInHistory.ts`  
**Test arch:** [`testarch-trace-rn-migration.md`](testarch-trace-rn-migration.md) FR-M6 + FR-M8 rows

**Story gate:** Maestro green + regression suite green

---

## Scope locks

| In scope | Out of scope |
|----------|--------------|
| Full Progress tab FR-M6 (P-01 … P-06) | Cloud sync / hydration restore (RN-OFFLINE) |
| Sunday 4-step flow FR-M8 (SC-01 … SC-04) | Settings panels — goal, fuel targets edit (RN-10) |
| Extract progress pure logic to `packages/core` | Future You gallery (RN-9) |
| Progress photo capture on weigh-in | AI transformation / FY upload |
| Sunday history overlay on Progress | Push reminders for Sunday (RN-PUSH) |
| Maestro `rn-progress.yaml` + `rn-sunday-check-in.yaml` | Playwright (PWA maintenance only) |
| Reuse Home `WeighInSheet` (extend, don't fork) | Duplicate Home-only weigh-in coach card on Progress |
| Coach `progress` task routing (existing) | Stretch/mobility session player (RN-5 preview only) |
| Workout calendar + PR board UI | Workout session / editor changes (RN-6 done) |

---

## Maestro runbook (swarm / local)

**Prerequisites:** JDK 17+, dev client on simulator, signed-in onboarded user, fitness seed with `progressGoal` + empty or seeded `weightLog`

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Terminal 1 — optional Sunday dev preview for non-Sunday runs
cd apps/mobile && EXPO_PUBLIC_E2E_DEV_PREVIEW_SUNDAY=true EXPO_PUBLIC_E2E_FITNESS_SEED=progress npx expo start --dev-client --port 8082

# Terminal 2 — regression + epic gate
npm run test:e2e:auth-all
npm run test:e2e:tab-nav
npm run test:e2e:onboarding
npm run test:e2e:coach-nutrition
npm run test:e2e:workout-session
npm run test:e2e:nutrition-log
npm run test:e2e:progress          # add in RN-8-07
npm run test:e2e:sunday-check-in   # add in RN-8-07
```

**Progress testing:** Seed must include `onboardingComplete`, `progressGoal`, `nutritionTargets`, optional pre-seeded `weightLog` for chart case. Port patterns from PWA `e2e/helpers/seed.ts` → `fitnessPersistSeed.ts`.

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

### Epic close (RN-8-07)

- [ ] `rn-progress.yaml` green (weight log + chart unlock)
- [ ] `rn-sunday-check-in.yaml` green (4-step flow + completion)
- [ ] `npm run test:e2e:auth-all` green
- [ ] `npm run test:e2e:tab-nav` green
- [ ] `npm run test:e2e:coach-nutrition` green
- [ ] `npm run test:e2e:onboarding` green
- [ ] `npm run test:e2e:workout-session` green
- [ ] `npm run test:e2e:nutrition-log` green
- [ ] Manual: progress photo attaches to weigh-in entry
- [ ] Manual: PR board reflects completed workout from RN-6 history
- [ ] `epic-rn-8` → `done` in `sprint-status-rn-migration.yaml`

---

## Dev workflow (swarm)

1. Checkout / create branch `epic-rn-8/progress-check-ins`
2. Run `/bmad-create-story` for RN-8-01 if story file missing, then swarm or `dev this story rn-8-01-*.md` in order
3. One focused PR per story (epic bundle OK if swarm defaults)
4. `npm run typecheck --workspace=@newyouai/mobile` before story done
5. Update `sprint-status-rn-migration.yaml` story → `done`
6. RN-8-07: run progress + sunday Maestro + full regression + mark epic `done`

---

## Definition of done (epic)

1. Progress tab shows live dashboard (not placeholder) with weight chart when ≥2 entries.
2. User logs weight from Progress and Home with optional progress photo.
3. Workout calendar and PR board render from fitness slice workout data.
4. Average calories, goal range bar, fuel updates, and targets grid match PWA.
5. Progress pics preview opens fullscreen gallery with delete support.
6. User completes Sunday 4-step check-in from Home card or modal route.
7. Sunday history accessible from Progress tab overlay.
8. Maestro progress + Sunday + full regression suite green.

---

## Unblocks

| Downstream | Needs from RN-8 |
|------------|-----------------|
| RN-9 Future You | Progress photo patterns; separate FY pipeline |
| RN-10 Settings | Goal / fuel target panels edit same `nutritionTargets` keys |
| RN-OFFLINE | `weightLog`, `progressPics`, `sundayCheckInHistory` merge shapes |
| RN-PARITY | FR-M6 + FR-M8 trace rows + Maestro evidence |
| RN-5 (follow-on) | Sunday card opens real flow; weigh-in photo live on Home |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Progress logic not in core yet | RN-8-01 blocks chart semantics — strict swarm order |
| `ScreenProgress` monolith port | Vertical slice stories 01→07; don't big-bang port 350 lines |
| Sunday flow only on Sundays | `EXPO_PUBLIC_E2E_DEV_PREVIEW_SUNDAY` + Maestro env (PWA parity) |
| Partial mobile `sundayCheckInHome.ts` | RN-8-06 merges into core `sundayCheckIn.ts`; delete duplicate logic |
| Image picker permissions | Request camera/photo library in RN-8-02; document simulator limits |
| Chart layout on narrow phones | Test weight chart on iPhone SE simulator in RN-8-01 |
| RN-5 still in review | RN-8 can start on branch; merge RN-5 or rebase before epic close |
| No PWA E2E baseline | RN-8-07 authors Maestro from inventory + manual PWA walkthrough |

---

## Next action

1. `/bmad-create-story RN-8-01` → story file `rn-8-01-progress-core-extract-weight-chart.md`
2. Create branch `epic-rn-8/progress-check-ins`
3. `/bmad-swarm epic-rn-8` or `dev this story rn-8-01-progress-core-extract-weight-chart.md`
