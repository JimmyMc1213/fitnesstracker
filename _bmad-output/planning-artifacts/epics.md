# Fitcoach — Epics & Stories

**Project:** fitnesstracker  
**Last updated:** 2026-05-23  
**Sprint tracking:** `_bmad-output/implementation-artifacts/sprint-status.yaml`

**Positioning:** Fitcoach is the all-in-one fitness app that coaches you through every workout, meal, and check-in — so you never need another app to hit your goals.

---

## Overview

**Sprint 1 (done):** Multi-user Fitcoach — onboarding foundation, full onboarding flow, progress/weigh-in, workout UX polish, session tools, and progress insights.

**Sprint 2 (done):** Coaching-led polish — personalized home identity, onboarding session-time estimates, notification setup, macro ring animation, and water intake tracking.

**Sprint 3 (done):** Coaching orchestration — `coachEngine`, Today's Coach Plan, in-session coach, fuel quick-log, weigh-in reactions, notification copy, weekly review narrative. Vitest harness (69+ tests).

**Sprint 4 (done):** UI polish & IA from screenshot audit — dev copy scrub, design-system buttons, Home density, habits folded into Home, Progress empty states, Settings IA.

**Sprint 5 (done):** Quality foundation & nutrition OS — Playwright E2E smoke, `coachEngine` refactor, Nutrition tab rebuild, Home Fuel strip alignment, week-boundary rules.

**Prerequisite (done):** [FTI-15](https://linear.app/ftiness-tracker/issue/FTI-15/save-workouts-and-workout-history) — `story_key: fti-15-save-workouts-and-workout-history`

**Deferred (backlog):** [FTI-13](https://linear.app/ftiness-tracker/issue/FTI-13/ai-coach-note-per-exercise-on-workout-start) — AI session coaching; Sprint 6 product decision (Epic 3 gate met).

---

## Epic 1: FTI implementation sprint

**Epic key (sprint-status):** `epic-fti-sprint-1`

**Goal:** Ship the Fitcoach multi-user experience end-to-end: personalized onboarding (with unit/experience/equipment inputs), reliable workout logging and history, a simplified weigh-in and progress surface, polished workout/edit UX (including drag-and-drop), session tools (rest timer, swap), and motivation features (PR board, streak, weekly summary)—all persisting through the existing Supabase JSONB sync pipeline.

---

### Story 1.1: Unit preference (FTI-25)

As a user, I want to choose lbs/kg (and ft+in/cm) during onboarding and in settings, so that all weight and measurement values match my preference.

**Acceptance criteria:**

- Unit preference screen in onboarding
- Options: lbs/kg for weight, ft+in/cm for height
- Selection saves to Supabase (persist slice / profile fields)
- All weight values throughout app respect the preference
- Setting accessible and changeable in profile/settings
- Conversion logic handles switching units without data loss

**Dev Notes:**

- linear: FTI-25
- story_key: fti-25-unit-preference-lbskg-in-onboarding-and-settings
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-25/unit-preference-lbskg-in-onboarding-and-settings

---

### Story 1.2: Experience level (FTI-26)

As a new user, I want to select my training experience level during onboarding, so that generated workout templates use appropriate starting weights and rep ranges.

**Acceptance criteria:**

- Experience level screen in onboarding
- Three options: Beginner, Intermediate, Advanced
- Selection saves to Supabase
- Workout templates generated during onboarding use experience level for starting weights and rep ranges
- Beginner: higher reps, lower weights; Advanced: lower reps, heavier weights

**Dev Notes:**

- linear: FTI-26
- story_key: fti-26-experience-level-selection-in-onboarding
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-26/experience-level-selection-in-onboarding
- depends_on: Story 1.1 (units for display; can parallelize profile field wiring)

---

### Story 1.3: Equipment selection (FTI-27)

As a new user, I want to select available equipment during onboarding, so that suggested exercises match what I can perform.

**Acceptance criteria:**

- Equipment selection screen in onboarding
- At least 4 options covering main equipment setups (Full gym, Home gym, Dumbbells only, Bodyweight only)
- Selection saves to Supabase
- Workout templates generated during onboarding only include exercises compatible with selected equipment
- Changeable in settings post-onboarding

**Dev Notes:**

- linear: FTI-27
- story_key: fti-27-equipment-selection-in-onboarding
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-27/equipment-selection-in-onboarding

---

### Story 1.4: New user onboarding — workout template + nutrition (FTI-14)

As a new user, I want a guided onboarding flow that sets my workout split and nutrition targets, so that I land on the home dashboard fully configured.

**Acceptance criteria:**

- Onboarding only triggers for new accounts with no existing data
- Screens: Goal (Bulk/Cut/Maintain) → Stats (height, weight, age, gender) → Activity level → Workout days per week (maps to split template) → Review & edit template → Nutrition summary (TDEE/macros, overridable)
- TDEE and macros calculated from stats + activity level
- Pre-built exercise templates loaded; user can edit order, swap exercises, adjust sets/reps before confirm
- Nutrition targets save and populate home dashboard macro rings
- Smooth forward/back navigation with progress indicator
- Existing/legacy accounts skip onboarding entirely

**Dev Notes:**

- linear: FTI-14
- story_key: fti-14-new-user-onboarding-workout-template-selection-nutrition-setup
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-14/new-user-onboarding-workout-template-selection-nutrition-setup
- partial_impl: `src/fitness/OnboardingFlow.tsx` — extend after Stories 1.1–1.3
- depends_on: Stories 1.1, 1.2, 1.3

---

### Story 1.5: Rebuild weigh-in (FTI-16)

As a user, I want simple weight logging with an optional progress photo, so that I can track trend without a 7-day average cut workflow.

**Acceptance criteria:**

- Weigh-in button accessible from progress page
- User inputs weight (respects unit preference from Story 1.1)
- Optional photo upload attached to log entry
- Entry saves to Supabase with timestamp
- Progress page shows weight trend line from all entries
- All 7-day average calculation logic removed from codebase

**Dev Notes:**

- linear: FTI-16
- story_key: fti-16-rebuild-weigh-in-simple-logging-with-optional-progress-photo
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-16/rebuild-weigh-in-simple-logging-with-optional-progress-photo

---

### Story 1.6: Workout screen UI cleanup (FTI-19)

As a user logging a workout, I want a clear hierarchy and collapsible coach content, so that exercises are the focus.

**Acceptance criteria:**

- Four banners merged into one collapsible coach card (collapsed by default)
- Sticky session header (sets logged, total volume) always visible while scrolling
- Edit mode toggle (pencil) shows/hides drag handles and delete icons
- Exercise card clean by default; add note / progress as subtle secondary actions
- Color system: blue for AI content, dark gray for user notes
- Typography scale enforced (title 24px bold, section labels 10px uppercase, etc.)

**Dev Notes:**

- linear: FTI-19
- story_key: fti-19-workout-screen-ui-cleanup
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-19/workout-screen-ui-cleanup

---

### Story 1.7: Clean up edit workout UI (FTI-17)

As a user editing a routine, I want labeled fields and consistent spacing, so that edit mode feels polished and safe.

**Acceptance criteria:**

- Set/rep fields clearly labeled
- Coach note no longer truncates awkwardly — expand or show full
- Add note and Progress rows removed from edit mode
- Drag handle tap target minimum 44px
- Delete routine visually demoted; confirmation dialog before execute
- Save button color matches design system (lime green or white/black)
- Consistent padding (16px inside cards, 12px gap between cards)

**Dev Notes:**

- linear: FTI-17
- story_key: fti-17-clean-up-edit-workout-ui
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-17/clean-up-edit-workout-ui

---

### Story 1.8: Drag and drop lift effect (FTI-18)

As a user reordering exercises, I want smooth drag feedback, so that reordering feels native on mobile.

**Acceptance criteria:**

- Dragged exercise scales up slightly and feels elevated on grab
- Exercise tracks finger position in real time with no lag
- Other exercises shift smoothly, not hard cut
- Drop animates cleanly into new position
- Use `@dnd-kit/sortable` (already in stack) if current implementation lacks proper tracking

**Dev Notes:**

- linear: FTI-18
- story_key: fti-18-drag-and-drop-lift-effect-on-exercise-reorder
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-18/drag-and-drop-lift-effect-on-exercise-reorder

---

### Story 1.9: Rest timer between sets (FTI-20)

As a user between sets, I want an automatic rest countdown, so that I stay on pace without a separate timer app.

**Acceptance criteria:**

- Timer auto-starts when a set is marked complete
- Countdown visible on the exercise card
- Default 60 second rest period
- User can dismiss timer early
- Haptic feedback or visual alert on timer completion
- Rest duration configurable (at least globally, ideally per exercise)

**Dev Notes:**

- linear: FTI-20
- story_key: fti-20-rest-timer-between-sets
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-20/rest-timer-between-sets

---

### Story 1.10: Swap exercise mid-workout (FTI-21)

As a user during a session, I want to swap one exercise for another, so that I can adapt when equipment is unavailable.

**Acceptance criteria:**

- Swap option accessible on each exercise card during a workout
- Opens exercise search/browse
- Selecting replacement swaps only that exercise
- Other exercises and logged sets unaffected
- Swapped exercise inherits set/rep targets from original
- Swap does not persist to the template — session only

**Dev Notes:**

- linear: FTI-21
- story_key: fti-21-swap-exercise-mid-workout
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-21/swap-exercise-mid-workout

---

### Story 1.11: Personal records board (FTI-22)

As a user, I want to see all my PRs in one place, so that I can celebrate progress across exercises.

**Acceptance criteria:**

- PR board accessible from progress tab
- Lists all exercises with logged history
- Shows best weight, best reps, and date per exercise
- Tap to expand full PR history per exercise
- PRs auto-detected when a set beats previous best weight or reps
- New PRs highlighted on finished workout summary screen

**Dev Notes:**

- linear: FTI-22
- story_key: fti-22-personal-records-board
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-22/personal-records-board

---

### Story 1.12: Streak tracker (FTI-23)

As a user, I want a visible streak for workouts or nutrition goals, so that consistency feels rewarding.

**Acceptance criteria:**

- Streak count visible on home dashboard
- Streak increments when a workout is completed or nutrition goal is hit for the day
- Streak resets on a missed day
- Streak stored in Supabase per user
- Visual indicator feels motivating (not a plain number only)

**Dev Notes:**

- linear: FTI-23
- story_key: fti-23-streak-tracker
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-23/streak-tracker

---

### Story 1.13: Weekly summary card (FTI-24)

As a user, I want a weekly recap card, so that I see workouts, volume, and nutrition consistency at a glance.

**Acceptance criteria:**

- Weekly summary card visible on home or progress tab
- Shows workouts completed vs planned for the week
- Shows total volume lifted for the week
- Shows days nutrition targets were hit
- Resets each Monday
- Data pulls from Supabase workout and nutrition logs

**Dev Notes:**

- linear: FTI-24
- story_key: fti-24-weekly-summary-card
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-24/weekly-summary-card

---

## Epic 2: FTI Sprint 2 — coaching-led OS polish

**Epic key (sprint-status):** `epic-fti-sprint-2`

**Goal:** Make Fitcoach feel like a coached all-in-one OS from the first home screen visit — personalized greeting and plan context, thoughtful onboarding (session time + notifications), satisfying daily tracking (animated macros, water), all persisting through Supabase.

**Sprint execution order:** FTI-29 → 30 → 28 → 31 → 32

---

### Story 2.1: Personalized home greeting (FTI-29)

As a user who completed onboarding, I want a personalized home greeting that references my plan, so the app feels coached and personal from day one.

**Acceptance criteria:**

- Greeting uses user's first name from profile (time-of-day aware: morning/afternoon/evening)
- Subline references selected split and current week (e.g. "Week 1 of your 5-day PPLUL split")
- Falls back gracefully if name or split data is missing
- Partial impl exists in `ScreenHome.tsx` ("Morning, {name}") — extend with subline and full time-of-day variants

**Dev Notes:**

- linear: FTI-29
- story_key: fti-29-personalized-home-screen-greeting-post-onboarding
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-29/personalized-home-screen-greeting-post-onboarding

---

### Story 2.2: Estimated session time in onboarding (FTI-30)

As a new user reviewing my split, I want to see estimated session duration per workout day, so I know what I'm committing to before confirming.

**Acceptance criteria:**

- Estimated session time displayed per workout day on split review screen (e.g. "Push — ~55 min")
- Calculation based on exercise count, sets, and average rest time
- Displayed as subtle secondary label, not main focus
- Updates if user edits exercises or sets during review step

**Dev Notes:**

- linear: FTI-30
- story_key: fti-30-estimated-session-time-shown-per-split-in-onboarding
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-30/estimated-session-time-shown-per-split-in-onboarding

---

### Story 2.3: Notification setup in onboarding (FTI-28)

As a new user, I want to configure workout and check-in reminders during onboarding, so the app keeps me accountable.

**Acceptance criteria:**

- Notification setup screen near end of onboarding
- Workout reminder toggle with time picker; daily nutrition check-in toggle with time picker
- OS notification permission requested at this step
- Preferences saved to Supabase; notifications fire at correct times
- Changeable in settings post-onboarding

**Dev Notes:**

- linear: FTI-28
- story_key: fti-28-notification-setup-screen-in-onboarding
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-28/notification-setup-screen-in-onboarding
- note: PWA Web Notifications on iOS have constraints; document platform limits in story if native wrapper not yet in place

---

### Story 2.4: Animated macro rings (FTI-31)

As a user logging food, I want macro rings to animate smoothly as progress updates, so daily nutrition feels satisfying without being gimmicky.

**Acceptance criteria:**

- Macro rings animate on screen load from 0 to current value
- Rings animate incrementally when new food is logged
- Animation ~500ms ease-out; no jank or flicker
- Works in empty (0%) and full/over (100%+) states
- Restrained motion — progress reinforcement, not "app store bait"

**Dev Notes:**

- linear: FTI-31
- story_key: fti-31-animated-macro-rings-on-home-dashboard
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-31/animated-macro-rings-on-home-dashboard

---

### Story 2.5: Water intake tracking (FTI-32)

As a user, I want to log daily water intake against a target on the home dashboard, so hydration is part of my coached daily check-in.

**Acceptance criteria:**

- Water tracker visible on home dashboard
- Quick-add buttons (8oz, 16oz) plus custom amount input
- Daily target configurable in settings (default 64oz / 2L)
- Progress visual (bar or ring) showing current vs target
- Resets daily at midnight; logs saved to Supabase with timestamp

**Dev Notes:**

- linear: FTI-32
- story_key: fti-32-water-intake-tracking
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-32/water-intake-tracking
- persistence: follow standard pipeline (`types.ts` → `persistFitnessSlice` → `buildAppState` → merge)

---

## Epic 4: FTI Sprint 4 — UI polish & IA

**Epic key (sprint-status):** `epic-fti-sprint-4`

**Goal:** Close the gap between "coaching engine shipped" and "app feels finished" — fix screenshot-audit bugs, unify primary CTAs (lime green), reduce Home scroll weight, fold habits into Home, polish Progress empty states, and regroup Settings. Nutrition tab rebuild remains deferred.

**Sprint execution order:** FTI-41 → 42 → 43 → 44 → 45 → 46

**Scope locks:** No `ScreenNutrition` rebuild; Home Fuel strip unchanged; FTI-13 AI coach deferred; Habits nav tab removed.

---

### Story 4.1: UI bug sweep (FTI-41)

As a user, I want no developer debug copy or Settings parse errors, so the app feels production-ready.

**Acceptance criteria:**

- Steps habit subtitle: `10,000 steps · Week N` (no anchor/program week dev strings)
- Scrub user-visible `dailyPlan.ts` titles
- Fix `--lime: #ffffff` → `#4ade80` in `index.css`
- Sanitize displayName/habit names; safe JSON.parse on persist

**Dev Notes:**

- story_key: fti-41-ui-bug-sweep-dev-copy-token-fix

---

### Story 4.2: Design system buttons (FTI-42)

As a user, I want consistent lime-green primary CTAs across the app.

**Acceptance criteria:**

- Shared `PrimaryButton` / `SecondaryButton`
- Workout "Start empty workout", Home coach CTAs, stretch card — lime not white/blue
- Settings preset pills selected state — green not blue

**Dev Notes:**

- story_key: fti-42-design-system-primary-secondary-buttons
- depends_on: FTI-41 (`--lime` token)

---

### Story 4.3: Home density (FTI-43)

As a user, I want a personal greeting, lighter weigh-in UI, and streak legend on Home.

**Acceptance criteria:**

- Onboarding first-name step after Units
- Logged weigh-in → inline row; scheduled missing → full card
- Streak legend under week dots

**Dev Notes:**

- story_key: fti-43-home-density-greeting-weigh-in-legend

---

### Story 4.4: Daily habits on Home (FTI-44)

As a user, I want habits on Home with a progress bar instead of a dead Habits tab.

**Acceptance criteria:**

- Remove Habits from bottom nav (4 tabs)
- `HomeDailyHabitsCard` with progress bar + toggles
- Delete `ScreenHabits.tsx`

**Dev Notes:**

- story_key: fti-44-daily-habits-on-home-remove-habits-tab
- depends_on: FTI-41, FTI-43

---

### Story 4.5: Progress polish (FTI-45)

As a user, I want weight delta colors that match my bulk/cut/maintain goal and no empty Fuel updates card.

**Acceptance criteria:**

- Goal-aware delta color + "vs start" label
- Vitest for sentiment helper
- Hide Fuel updates when empty; workout calendar empty overlay

**Dev Notes:**

- story_key: fti-45-progress-goal-aware-delta-empty-states

---

### Story 4.6: Settings IA (FTI-46)

As a user, I want grouped Settings sections and confident notification copy.

**Acceptance criteria:**

- Section order: Account → You → Units → Training → Nutrition → Reminders → Habits → Program
- Rewrite notification footer; remove duplicate disclaimer

**Dev Notes:**

- story_key: fti-46-settings-section-ia-notification-copy
- depends_on: FTI-44 (habits tab copy references)

---

## Epic 5: FTI Sprint 5 — quality foundation & nutrition OS

**Epic key (sprint-status):** `epic-fti-sprint-5`

**Goal:** Close Sprint 3 retro debt (E2E coverage, `coachEngine` cohesion) and ship the Nutrition tab rebuild deferred from Sprint 4 — making fuel logging a coached first-class surface aligned with Home quick-log.

**Sprint execution order:** FTI-47 → 48 → 49 → 50 → 51 (Linear: FTI-41 → 42 → 43 → 44 → 45)

**Scope locks:** No FTI-13 LLM integration; no native wrapper; no `ScreenWorkout.tsx` full decomposition; no new Home cards beyond Fuel strip alignment.

---

### Story 5.1: Playwright E2E harness (FTI-47)

As a developer, I want Playwright smoke tests for coach navigation flows, so Home → Nutrition and fuel quick-log regressions are caught automatically.

**Acceptance criteria:**

- Playwright initialized with `npm run test:e2e` script
- Smoke: Home coach task navigates to Nutrition tab
- Smoke: Home fuel quick-log sheet opens and logs a preset
- Tests run headless in CI-compatible mode; dev server bootstrapped in config
- `npm run build` + `npm test` still pass (Vitest unchanged)

**Dev Notes:**

- story_key: fti-47-playwright-e2e-harness-coach-navigation-smoke
- linear: FTI-41
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-41/playwright-e2e-harness-coach-navigation-smoke
- MoSCoW: Must — sprint opener (mirrors FTI-40 pattern)
- blocks: FTI-49, FTI-50 (Linear FTI-43, FTI-44)

---

### Story 5.2: coachEngine refactor (FTI-48)

As a developer, I want shared date/training helpers extracted from `coachEngine.ts`, so the notification scheduler cycle is broken before further coach expansion.

**Acceptance criteria:**

- Extract `isTrainingDay` and week-boundary helpers to a pure module (e.g. `trainingCalendar.ts`)
- Break circular import between `coachEngine.ts` and `notificationScheduler.ts`
- All 76+ existing Vitest tests pass with zero behavior change
- No new UI surfaces

**Dev Notes:**

- story_key: fti-48-coachengine-refactor-shared-date-training-helpers
- linear: FTI-42
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-42/coachengine-refactor-shared-datetraining-helpers
- MoSCoW: Must
- depends_on: FTI-47 (Linear FTI-41)
- blocks: FTI-49 (Linear FTI-43)

---

### Story 5.3: Nutrition tab rebuild (FTI-49)

As a user, I want a polished Nutrition tab with hero macro rings and streamlined today logging, so fuel tracking feels as coached as workouts.

**Acceptance criteria:**

- `ScreenNutrition.tsx` rebuilt: animated MacroRing hero at top (reuse FTI-31 patterns)
- Today log list with quick-add presets; Saved tab preserved
- Water tracker card integrated below rings
- Lime `PrimaryButton` for add/save actions; dark theme consistent with Sprint 4
- Coach macro-pace rationale visible when applicable (from `macroPace.ts`)

**Dev Notes:**

- story_key: fti-49-nutrition-tab-rebuild-hero-rings-coached-today-log
- linear: FTI-43
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-43/nutrition-tab-rebuild-hero-rings-coached-today-log
- MoSCoW: Must — deferred from Sprint 4 party-mode
- depends_on: FTI-48 (Linear FTI-42)

---

### Story 5.4: Home Fuel strip alignment (FTI-50)

As a user, I want Home fuel quick-log to match the rebuilt Nutrition tab patterns, so logging from Home and Nutrition feels consistent.

**Acceptance criteria:**

- `HomeFuelStrip` + `HomeFuelQuickLogSheet` visual/interaction alignment with FTI-49 Nutrition patterns
- Preset list, macro pace copy, and ring progress indicators consistent
- No duplicate logging paths or persist schema changes
- Playwright smoke from FTI-47 still passes

**Dev Notes:**

- story_key: fti-50-home-fuel-strip-alignment-post-nutrition-rebuild
- linear: FTI-44
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-44/home-fuel-strip-alignment-post-nutrition-rebuild
- MoSCoW: Should
- depends_on: FTI-49 (Linear FTI-43)

---

### Story 5.5: Week boundary rules (FTI-51)

As a user, I want streak and weekly summary to use documented, consistent week boundaries, so progress metrics don't contradict each other.

**Acceptance criteria:**

- Document week-start rules (streak vs weekly summary) in `_bmad-output/project-context.md` or architecture doc
- Fix any Sun/Mon inconsistency between `dailyStreak.ts` and `weeklySummary.ts`
- Vitest for extracted boundary helpers
- No UI redesign

**Dev Notes:**

- story_key: fti-51-week-boundary-rules-streak-vs-weekly-summary
- linear: FTI-45
- linear_url: https://linear.app/ftiness-tracker/issue/FTI-45/week-boundary-rules-streak-vs-weekly-summary
- MoSCoW: Could — Sprint 3 retro carryover
- depends_on: FTI-48 (Linear FTI-42)
