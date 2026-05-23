# Story 4.3: Home density — greeting, weigh-in inline, streak legend (FTI-43)

Status: ready-for-dev

## Story

As a user landing on Home,
I want a personal greeting, less card clutter, and a clear streak calendar legend,
so Home feels coached but not overwhelming.

## Acceptance Criteria

1. **First name in onboarding:** Given a new user in `OnboardingFlow`, when they pass the Units step, then a **"What should we call you?"** step collects first name into `displayName` (optional skip → empty string). Step inserted after Units (adjust `STEP_LABELS` + step index wiring).

2. **Greeting shows name:** Given `displayName` is `"Jimmy McCarthy"`, when Home today view renders, then header title is `"Good morning, Jimmy"` (first token only — existing `homeGreetingTitle` behavior).

3. **Logged weigh-in inline:** Given today has a weigh-in logged and it is **not** a scheduled check-in promo scenario, when Home renders, then weigh-in shows as **one inline row** under the greeting area (or directly below header): checkmark + weight + "Weigh-in logged" — **not** a full card. Tapping navigates to Progress.

4. **Weigh-in full card when needed:** Given scheduled weigh-in day (`ctx.scheduledWeighInDay`) and **no** entry yet, when Home renders, then show the existing prominent weigh-in card (unchanged CTA intent).

5. **Home stack order (today):** ScreenHeader → Today's Plan → StreakWeeklyHeader (compact) → Fuel strip → *(Daily habits card added in FTI-44 — leave hook or placeholder gap)* → Weigh-in inline/card → Weigh-in coach reaction → Nightly stretch → Weekly summary (collapsed).

6. **Streak legend:** Given compact streak week row on Home, when rendered, then a one-line muted legend appears below the week dots: `Ring = workout + fuel progress that day` (10–11px, `rgba(255,255,255,0.35)`).

7. **Weekly summary:** Remains `defaultCollapsed` on Home — no change unless header needs tighter padding (optional polish only).

8. **FTI-29 completion:** Settings "First name" field remains as edit path; onboarding is now the primary capture (closes FTI-29 gap noted in retro).

9. **Scope guard:** No habits card content (FTI-44), no button token sweep (FTI-42 should land first or merge before release).

10. **Build gate:** `npm run build` and `npm test` pass.

## Tasks / Subtasks

- [ ] **Task 1: Onboarding name step** (AC: 1, 2, 8)
  - [ ] 1.1 Add step UI in `OnboardingFlow.tsx` with text input + Skip.
  - [ ] 1.2 Persist `displayName` on onboarding complete (already in state pipeline).
  - [ ] 1.3 Update `totalSteps` / back navigation.

- [ ] **Task 2: Inline weigh-in row component** (AC: 3, 4)
  - [ ] 2.1 Create `HomeWeighInInline.tsx` — single tappable row.
  - [ ] 2.2 `ScreenHome.tsx` logic: if `dayEntry && !(scheduledWeighInDay && !dayEntry)` → inline; elif scheduled + no entry → full card; elif historical view → existing behavior.

- [ ] **Task 3: Streak legend** (AC: 6)
  - [ ] 3.1 Add optional `showLegend?: boolean` to `StreakWeeklyHeader` or render legend in `ScreenHome` below header when `variant="compact"`.

- [ ] **Task 4: Stack reorder verify** (AC: 5, 7)
  - [ ] 4.1 Confirm order matches AC after FTI-44 merges (coordinate slot for habits card).

- [ ] **Task 5: Verification** (AC: 10)
  - [ ] 5.1 Smoke: new onboarding name, logged vs unlogged weigh-in, legend visible.

## Dev Notes

### Partial impl

- `homeGreeting.ts` already supports name — onboarding never collected it (FTI-29 story claimed onboarding set `displayName` — incorrect).
- Weigh-in full card exists in `ScreenHome.tsx` ~159–208.

### Depends on

- FTI-42 for primary button on any new CTAs (stretch card if touched).

## Dev Agent Record

### Agent Model Used

(pending)

### Completion Notes List

(pending)

### File List

(pending)
