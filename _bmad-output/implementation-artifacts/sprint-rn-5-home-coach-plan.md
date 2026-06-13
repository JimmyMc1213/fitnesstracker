# Sprint RN-5 — Home & Coach

**Planned:** 2026-06-12  
**Last updated:** 2026-06-12 (swarm-ready — all 7 story files created)  
**Epic:** `epic-rn-5`  
**Swarm branch:** `epic-rn-5/home-coach`  
**Goal:** Replace the `(tabs)/home` placeholder with a PWA-parity home dashboard — coach plan, fuel carousel, habits, weigh-in, Sunday entry, mobility preview, and Future You header modes — wired to the local fitness slice from RN-4 onboarding.

**PRD:** [`prd-rn-migration.md`](../planning-artifacts/prd-rn-migration.md) FR-M3 (Home dashboard)  
**Architecture:** [`architecture-rn-migration.md`](../planning-artifacts/architecture-rn-migration.md) §3 `(tabs)/home`, stretch deep link  
**Epic spec:** [`epics-rn-migration.md`](../planning-artifacts/epics-rn-migration.md) RN-5  
**PWA reference:** `apps/pwa/src/fitness/screens/ScreenHome.tsx` and home component tree  
**Tracking:** [`sprint-status-rn-migration.yaml`](sprint-status-rn-migration.yaml)

---

## Sprint goal (one sentence)

An onboarded user lands on Home and sees the PWA-parity dashboard — personalized greeting, coach plan with task CTAs, animated fuel/macro carousel, daily habits, weigh-in flows, Sunday entry card, mobility preview entry, and Future You header modes; Maestro `rn-coach-nutrition.yaml` passes on simulator.

---

## BMad swarm alignment

| Field | Value |
|-------|--------|
| Swarm mode | `epic-rn-5` |
| Branch | `epic-rn-5/home-coach` |
| Start story | **RN-5-01** (`rn-5-01-fitness-state-home-shell.md`) |
| Story files | Create under `implementation-artifacts/rn-5-*.md` |
| Gate (every story) | `npm run typecheck --workspace=@newyouai/mobile` |
| Gate (logic stories) | `npm run test --workspace=@newyouai/core` when touching `packages/core` |
| Gate (epic close) | `rn-coach-nutrition.yaml` + `npm run test:e2e:auth-all` + `npm run test:e2e:tab-nav` + `npm run test:e2e:onboarding` green |

**Kickoff:** `/bmad-swarm epic-rn-5` or `dev this story rn-5-01-fitness-state-home-shell.md`

**Swarm order (strict):**

```
RN-5-01 → RN-5-02 → RN-5-03 → RN-5-04 → RN-5-05 → RN-5-06 → RN-5-07 → epic-rn-5-retrospective
```

---

## Starting point

| Item | Status | Notes |
|------|--------|-------|
| RN-0 / RN-1 / RN-2 / RN-3 / RN-4 | **Done** | Foundation, packages, auth, shell, onboarding v2 |
| `(tabs)/home` | **Placeholder** | Sign-out + dev links; `testID="tab-home"` |
| Fitness slice persist | **Partial** | `finishOnboarding` writes `FITNESS_LOCAL_STORAGE_KEY`; no RN read hook yet |
| `packages/core` coach engine | **Done** | `buildCoachContext`, `getHomeCoachPlan`, weigh-in reaction helpers |
| `homeGreeting.ts` | **PWA only** | Extract to `packages/core` in RN-5-01 (PWA re-export) |
| `coachTaskActions.ts` | **PWA only** | Port to mobile `lib/coachTaskActions.ts` in RN-5-02 |
| Home UI components | **Missing** | All `Home*` / `TodaysCoachPlanCard` / `WeighInSheet` RN ports |
| Sunday check-in modal | **Shell** | `(modals)/sunday-check-in` from RN-3; flow logic RN-8 |
| Mobility stretch session | **Missing** | Preview shell in RN-5-06; full session RN-6+ or dedicated stretch epic |
| Maestro coach flow | **Missing** | Port `coach-task-nutrition.spec.ts` → `rn-coach-nutrition.yaml` |

---

## Execute in this order

| # | Story | Story file | PWA section | PR target | Status |
|---|-------|------------|-------------|-----------|--------|
| 1 | **RN-5-01** | `rn-5-01-fitness-state-home-shell.md` | Shell + header | 1 PR | ready-for-dev |
| 2 | **RN-5-02** | `rn-5-02-coach-plan-card-task-routing.md` | H-05 coach plan | 1 PR | ready-for-dev |
| 3 | **RN-5-03** | `rn-5-03-fuel-carousel-macro-rings.md` | H-07 macro rings | 1 PR | ready-for-dev |
| 4 | **RN-5-04** | `rn-5-04-daily-habits-week-focus.md` | H-06 habits | 1 PR | ready-for-dev |
| 5 | **RN-5-05** | `rn-5-05-weigh-in-sheet-reaction.md` | H-01 weigh-in | 1 PR | ready-for-dev |
| 6 | **RN-5-06** | `rn-5-06-sunday-mobility-future-you-entry.md` | H-02/H-04/FY entry | 1 PR | ready-for-dev |
| 7 | **RN-5-07** | `rn-5-07-maestro-coach-nutrition-e2e.md` | Maestro + polish | 1 PR | ready-for-dev |
| 8 | Retro | `epic-rn-5-retrospective` | — | — | optional |

---

## RN-5-01 — Fitness state + home shell

**Story file:** `rn-5-01-fitness-state-home-shell.md`

**Deliverables:**

- `FitnessProvider` + `useFitnessState` — load/save `PersistedFitnessSlice` via `@newyouai/core` + AsyncStorage adapter
- Hydrate on app launch; optimistic `setState` patches persist slice (mirror PWA `setState` pattern)
- Replace home placeholder: scrollable `ScreenHome` layout with `ScreenHeader` (eyebrow, greeting, settings gear)
- Extract `homeGreeting.ts` → `packages/core/src/coach/homeGreeting.ts`; PWA re-exports unchanged API
- Date navigation: `viewDateKey`, "Back to today", historical header title format
- Remove dev sign-out-centric placeholder copy; keep `testID="tab-home"` on root scroll view
- Wire settings gear → `/(tabs)/settings`

**PWA ref:** `ScreenHome.tsx` header block, `homeGreeting.ts`, `buildAppState.ts` hydration pattern  
**Core ref:** `loadPersistedSlice`, `savePersistedSlice`, `FITNESS_LOCAL_STORAGE_KEY`

**Story gate:** typecheck + core tests if greeting extracted

---

## RN-5-02 — Coach plan card + task routing

**Story file:** `rn-5-02-coach-plan-card-task-routing.md`

**Deliverables:**

- `TodaysCoachPlanCard` RN component (coach green tokens, primary CTA, task list)
- `buildCoachContext` + `getHomeCoachPlan` wired for today view only
- Port `coachTaskActions.ts` → `apps/mobile/lib/coachTaskActions.ts` using `expo-router` (`router.push` to tabs/modals)
- Coach/training slide in `HomeDashboardCarousel` (slide 2): headline, subline, start workout CTA, rest-day focus tags
- `testID` pattern: `coach-plan-card`, `coach-task-{kind}`

**PWA ref:** `TodaysCoachPlanCard.tsx`, `HomeDashboardCarousel.tsx` coach slide, `coachTaskActions.ts`  
**Core ref:** `getHomeCoachPlan`, `resolveCoachTaskNavigation` logic (port navigation side to mobile)

**Story gate:** typecheck + `coachEngine.test.ts` green

---

## RN-5-03 — Fuel carousel + animated macro rings

**Story file:** `rn-5-03-fuel-carousel-macro-rings.md`

**Deliverables:**

- `HomeDashboardCarousel` RN port with horizontal paging (2 slides)
- Slide 1 — Fuel: calorie `MacroRing` with **Reanimated** progress animation (parity with PWA `useAnimatedMacroProgress`)
- Macro bars for protein/carbs/fat; kcal remaining copy; `[+ Log]` navigates to nutrition tab (no quick-log sheet — removed in PWA S7)
- `effectiveNutritionTotalsForDateKey` from core or shared util
- Carousel height + dot indicators matching PWA `CAROUSEL_CARD_HEIGHT`

**PWA ref:** `HomeDashboardCarousel.tsx` fuel slide, `shared.tsx` `MacroRing`, `useAnimatedMacroProgress`  
**Deps:** RN-5-01 state, RN-5-02 carousel host (or build carousel shell in RN-5-02 and fuel slide here)

**Story gate:** typecheck

---

## RN-5-04 — Daily habits + week focus

**Story file:** `rn-5-04-daily-habits-week-focus.md`

**Deliverables:**

- `HomeDailyHabitsCard` RN port — toggle habits, mobility habit opens preview (handler stub until RN-5-06)
- `HomeWeekFocusCard` RN port — week commitments from onboarding templates
- Habit toggle persists `habitsDoneByDay`; mobility habits non-toggleable (`isMobilityHabit`)
- `dailyHabitTemplatesFromState`, `habitsForDateKey`, `buildHabitsForDateKey` from core/data layer
- Read-only mode when viewing historical dates

**PWA ref:** `HomeDailyHabitsCard.tsx`, `HomeWeekFocusCard.tsx`, `mobilityHabit.ts`  
**Data from RN-4:** `habitTemplates`, `weekFocusCommitments` seeded in `finishOnboarding`

**Story gate:** typecheck + core habit tests if touched

---

## RN-5-05 — Weigh-in card + sheet + coach reaction

**Story file:** `rn-5-05-weigh-in-sheet-reaction.md`

**Deliverables:**

- Morning weigh-in full card (today, no entry yet) → opens `WeighInSheet` modal/bottom sheet
- `WeighInSheet` RN port: weight entry, optional progress photo stub (full camera RN-8), unit-aware display
- Inline weigh-in status on habits card when entry exists (density mode per FTI-43)
- `WeighInCoachReaction` compact block when `getWeighInReactionForDisplay` returns adjustment
- Persist `weightLog` in fitness slice

**PWA ref:** `WeighInSheet.tsx`, `WeighInCoachReaction.tsx`, `ScreenHome.tsx` weigh-in blocks  
**Core ref:** `getWeighInReaction`, `getWeighInReactionForDisplay`

**Story gate:** typecheck

---

## RN-5-06 — Sunday card + mobility preview + Future You entry

**Story file:** `rn-5-06-sunday-mobility-future-you-entry.md`

**Deliverables:**

- `HomeSundayCheckInCard` — show on Sundays when check-in data available; `onReview` → `(modals)/sunday-check-in`
- Minimal `useSundayCheckInHome` hook (port availability logic from PWA `useSundayWeeklyCheckIn` — card only, not full flow)
- Mobility preview entry: `MobilityPreviewSheet` shell from coach plan / habits / carousel stretch CTA
- `HomeNewYouHeaderButton` + `FutureYouSkipperReminderPill` per `futureYouHomeEntryModel`
- Deep link `/(tabs)/home?mobility=1` opens preview (architecture §3 stretch mapping)
- Full active stretch session UI **out of scope** — preview shell with "Stretch ships in RN-6" or minimal placeholder

**PWA ref:** `HomeSundayCheckInCard.tsx`, `MobilityRoutineFlow.tsx` preview mode, `futureYouHomeEntryModel.ts`  
**Deps:** RN-3 sunday modal shell, RN-4 `futureYou` draft shape

**Story gate:** typecheck

---

## RN-5-07 — Maestro coach-nutrition + integration polish

**Story file:** `rn-5-07-maestro-coach-nutrition-e2e.md`

**Deliverables:**

- `.maestro/rn-coach-nutrition.yaml` — port PWA `coach-task-nutrition.spec.ts`: home → tap "Log fuel" → nutrition tab + log-food modal
- Seed fitness slice for Maestro (onboarded user with coach plan containing fuel task)
- `npm run test:e2e:coach-nutrition` script in `apps/mobile`
- Remove remaining placeholder/dev UI from home; verify all `testID`s for Maestro targets
- Epic regression sweep: auth-all + tab-nav + onboarding

**PWA ref:** `apps/pwa/e2e/coach-task-nutrition.spec.ts`, `e2e/helpers/seed.ts`  
**Test arch:** [`testarch-trace-rn-migration.md`](testarch-trace-rn-migration.md) FR-M3 row

**Story gate:** Maestro green + regression suite green

---

## Scope locks

| In scope | Out of scope |
|----------|--------------|
| Full Home tab UI (PWA `ScreenHome` parity) | Workout session / editor (RN-6) |
| Local fitness slice read/write on Home | Cloud sync / hydration restore (RN-OFFLINE) |
| Coach engine wiring (`packages/core`) | Full Sunday check-in flow logic (RN-8) |
| Weigh-in sheet + weight log persist | Progress photos camera/gallery (RN-8) |
| Mobility **preview** shell + deep link | Full stretch session player (RN-6 or later) |
| Future You **header entry** modes on Home | Future You gallery/upload MVP (RN-9) |
| Maestro `rn-coach-nutrition.yaml` | Nutrition log food search/barcode (RN-7) |
| Animated macro ring (Reanimated) | Water tracker card on Home (RN-7; was on PWA home) |
| Settings gear navigation | Settings panel content (RN-10) |
| Streak weekly header compact variant | Full `StreakWeeklyHeader` on Home if removed in FTI-33 density pass |

---

## Maestro runbook (swarm / local)

**Prerequisites:** JDK 17+, dev client on simulator, onboarding-complete test user or Maestro seed

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Terminal 1
cd apps/mobile && npx expo start --dev-client --port 8082

# Terminal 2 — regression + epic gate
npm run test:e2e:auth-all
npm run test:e2e:tab-nav
npm run test:e2e:onboarding
npm run test:e2e:coach-nutrition    # add in RN-5-07
```

**Home testing:** User must have `onboardingComplete: true` and fitness slice with `nutritionTargets` + coach-visible state. Reuse onboarding Maestro subflow or dedicated persist seed JSON.

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

### Epic close (RN-5-07)

- [ ] `rn-coach-nutrition.yaml` green (coach fuel task → nutrition + log-food modal)
- [ ] `npm run test:e2e:auth-all` green (no auth regression)
- [ ] `npm run test:e2e:tab-nav` green (no shell regression)
- [ ] `npm run test:e2e:onboarding` green (no onboarding regression)
- [ ] Manual: post-onboarding user sees coach plan, fuel carousel, habits on Home
- [ ] Manual: weigh-in card → sheet → reaction on log
- [ ] Manual: Sunday card appears on Sunday test date (or mocked hook)
- [ ] `epic-rn-5` → `done` in `sprint-status-rn-migration.yaml`

---

## Dev workflow (swarm)

1. Checkout / create branch `epic-rn-5/home-coach`
2. Run `/bmad-create-story` for RN-5-01 if story file missing, then swarm or `dev this story rn-5-01-*.md` in order
3. One focused PR per story (epic bundle OK if swarm defaults)
4. `npm run typecheck --workspace=@newyouai/mobile` before story done
5. Update `sprint-status-rn-migration.yaml` story → `done`
6. RN-5-07: run coach-nutrition + auth-all + tab-nav + onboarding Maestro sweep + mark epic `done`

---

## Definition of done (epic)

1. Onboarded user lands on Home (not placeholder) with personalized greeting.
2. Today's coach plan renders with engine copy; task CTAs navigate to correct tabs/modals.
3. Fuel carousel shows animated macro ring and macro bars from live nutrition totals.
4. Daily habits toggle (except mobility); week focus card shows when commitments exist.
5. Weigh-in card opens sheet; logged weight shows reaction when coach adjustment applies.
6. Sunday entry card routes to sunday modal; mobility preview opens from coach/habits/deep link.
7. Future You header button / reminder pill follow `futureYouHomeEntryModel` rules.
8. Maestro coach-nutrition + auth-all + tab-nav + onboarding green.

---

## Unblocks

| Downstream | Needs from RN-5 |
|------------|-----------------|
| RN-6 Workout | Coach `start_workout` task routing; mobility preview handoff |
| RN-7 Nutrition | Coach → nutrition navigation; fuel carousel `[+ Log]` entry |
| RN-8 Progress | Weigh-in data shape; Sunday card entry point |
| RN-9 Future You | Header upload entry; reminder pill dismiss persist |
| RN-OFFLINE | `useFitnessState` adapter injection point for cloud merge |
| RN-PARITY | FR-M3 trace row + `rn-coach-nutrition.yaml` evidence |

---

## Risks

| Risk | Mitigation |
|------|------------|
| No fitness read hook yet | RN-5-01 blocks all UI stories — strict swarm order |
| Carousel + many components = large RN-5-02/03 | Split coach slide (RN-5-02) vs fuel slide (RN-5-03) |
| Reanimated macro ring complexity | Port PWA animation curve first; static ring fallback behind `__DEV__` flag only if blocked |
| Sunday logic duplication | Card-only hook; full flow stays RN-8 |
| Mobility session scope creep | Preview shell only; document RN-6 handoff |
| Maestro seed for coach plan | Port `fuelQuickLogPersistSeed` pattern from PWA e2e helpers |
| Home sign-out removed | Auth sign-out remains in Settings (RN-10) or dev menu |

---

## Next action

**`/bmad-swarm epic-rn-5`** — starts at **RN-5-01**.

Or: `dev this story rn-5-01-fitness-state-home-shell.md`
